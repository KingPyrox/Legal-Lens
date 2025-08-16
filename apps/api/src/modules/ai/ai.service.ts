import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { PrismaService } from '../database/prisma.service';
import { PROMPT_TEMPLATES, MOCK_RESPONSES } from '@legal-lens/prompts';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private readonly openai: OpenAI;
  private readonly isOpenAIEnabled: boolean;
  private readonly enableMockMode: boolean;
  private readonly dailySpendingLimit: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const apiKey = this.configService.get('OPENAI_API_KEY');
    this.isOpenAIEnabled = !!apiKey;
    this.enableMockMode = this.configService.get('ENABLE_MOCK_AI') === 'true';
    this.dailySpendingLimit = parseFloat(this.configService.get('DAILY_SPENDING_LIMIT') || '5.00');

    if (this.isOpenAIEnabled) {
      this.openai = new OpenAI({
        apiKey,
      });
      this.logger.log('OpenAI service initialized');
    } else {
      this.logger.warn('OpenAI API key not found, using mock responses');
    }
  }

  async extractClauses(documentText: string, documentId: string) {
    if (this.enableMockMode || !this.isOpenAIEnabled) {
      this.logger.log('Using mock clause extraction');
      return MOCK_RESPONSES.clauseExtraction;
    }

    // Check daily spending limit
    await this.checkSpendingLimit();

    const prompt = PROMPT_TEMPLATES.clauseExtraction.replace('{contractText}', documentText);
    
    try {
      const startTime = Date.now();
      const response = await this.openai.chat.completions.create({
        model: this.configService.get('OPENAI_MODEL') || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a legal document analyzer. Extract clauses and return valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: parseInt(this.configService.get('OPENAI_MAX_TOKENS') || '1000'),
        temperature: parseFloat(this.configService.get('OPENAI_TEMPERATURE') || '0.1'),
      });

      const duration = Date.now() - startTime;
      
      // Log usage for cost tracking
      await this.logAPIUsage({
        type: 'clause_extraction',
        model: response.model,
        inputTokens: response.usage?.prompt_tokens || 0,
        outputTokens: response.usage?.completion_tokens || 0,
        cost: this.calculateCost(response.usage, response.model),
        duration,
        documentId,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response content from OpenAI');
      }

      return JSON.parse(content);
    } catch (error) {
      this.logger.error('OpenAI clause extraction failed:', error);
      // Fallback to mock data on error
      return MOCK_RESPONSES.clauseExtraction;
    }
  }

  async assessRisk(clauseText: string, clauseType: string, jurisdiction?: string) {
    if (this.enableMockMode || !this.isOpenAIEnabled) {
      this.logger.log('Using mock risk assessment');
      return MOCK_RESPONSES.riskAssessment[clauseType] || {
        risk: 'MEDIUM',
        rationale: 'Mock risk assessment for development',
        kbRuleIds: ['MOCK-001'],
      };
    }

    await this.checkSpendingLimit();

    const prompt = PROMPT_TEMPLATES.riskScoring
      .replace('{clauseText}', clauseText)
      .replace('{clauseType}', clauseType)
      .replace('{jurisdiction}', jurisdiction || 'US');

    try {
      const response = await this.openai.chat.completions.create({
        model: this.configService.get('OPENAI_MODEL') || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a legal risk assessment engine. Return valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 300,
        temperature: 0.1,
      });

      await this.logAPIUsage({
        type: 'risk_assessment',
        model: response.model,
        inputTokens: response.usage?.prompt_tokens || 0,
        outputTokens: response.usage?.completion_tokens || 0,
        cost: this.calculateCost(response.usage, response.model),
        duration: 0,
      });

      const content = response.choices[0]?.message?.content;
      return JSON.parse(content);
    } catch (error) {
      this.logger.error('OpenAI risk assessment failed:', error);
      return {
        risk: 'MEDIUM',
        rationale: 'Risk assessment temporarily unavailable',
        kbRuleIds: ['ERROR-001'],
      };
    }
  }

  async generateSuggestions(clauseText: string, riskLevel: string, clauseType: string) {
    if (this.enableMockMode || !this.isOpenAIEnabled) {
      this.logger.log('Using mock suggestions');
      return MOCK_RESPONSES.suggestions[clauseType] || {
        summary: 'Mock suggestion for development',
        whyItMatters: 'This is a mock response for testing',
        ask: 'Test negotiation tactic',
        rewriteOption: 'Mock rewrite option',
        fallbackOption: 'Mock fallback option',
      };
    }

    await this.checkSpendingLimit();

    const prompt = PROMPT_TEMPLATES.suggestions
      .replace('{clauseText}', clauseText)
      .replace('{riskLevel}', riskLevel)
      .replace('{clauseType}', clauseType);

    try {
      const response = await this.openai.chat.completions.create({
        model: this.configService.get('OPENAI_MODEL') || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a legal negotiation advisor. Return valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.2,
      });

      await this.logAPIUsage({
        type: 'suggestions',
        model: response.model,
        inputTokens: response.usage?.prompt_tokens || 0,
        outputTokens: response.usage?.completion_tokens || 0,
        cost: this.calculateCost(response.usage, response.model),
        duration: 0,
      });

      const content = response.choices[0]?.message?.content;
      return JSON.parse(content);
    } catch (error) {
      this.logger.error('OpenAI suggestions failed:', error);
      return {
        summary: 'Suggestions temporarily unavailable',
        whyItMatters: 'Please try again later',
        ask: 'Contact support if this persists',
        rewriteOption: 'Manual review recommended',
        fallbackOption: 'Consult legal counsel',
      };
    }
  }

  private async checkSpendingLimit() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailySpending = await this.getDailySpending(today);
    
    if (dailySpending >= this.dailySpendingLimit) {
      this.logger.error(`Daily spending limit exceeded: $${dailySpending.toFixed(2)}`);
      throw new Error('Daily API spending limit exceeded. Please try again tomorrow.');
    }
  }

  private async getDailySpending(date: Date): Promise<number> {
    const tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const usage = await this.prisma.auditLog.findMany({
      where: {
        action: 'api_usage',
        createdAt: {
          gte: date,
          lt: tomorrow,
        },
      },
    });

    return usage.reduce((total, log) => {
      const cost = (log.metaJson as any)?.cost || 0;
      return total + cost;
    }, 0);
  }

  private async logAPIUsage(usage: {
    type: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    cost: number;
    duration: number;
    documentId?: string;
  }) {
    try {
      await this.prisma.auditLog.create({
        data: {
          orgId: 'system', // System-level logging
          action: 'api_usage',
          targetType: 'openai',
          metaJson: usage,
        },
      });

      this.logger.log(`OpenAI usage: ${usage.type}, Cost: $${usage.cost.toFixed(4)}, Tokens: ${usage.inputTokens + usage.outputTokens}`);
    } catch (error) {
      this.logger.error('Failed to log API usage:', error);
    }
  }

  private calculateCost(usage: any, model: string): number {
    if (!usage) return 0;

    const { prompt_tokens = 0, completion_tokens = 0 } = usage;
    
    // Pricing per 1K tokens (as of 2024)
    const pricing = {
      'gpt-3.5-turbo': { input: 0.001, output: 0.002 },
      'gpt-4-turbo-preview': { input: 0.01, output: 0.03 },
      'gpt-4o': { input: 0.005, output: 0.015 },
    };

    const modelPricing = pricing[model] || pricing['gpt-3.5-turbo'];
    
    const inputCost = (prompt_tokens / 1000) * modelPricing.input;
    const outputCost = (completion_tokens / 1000) * modelPricing.output;
    
    return inputCost + outputCost;
  }

  async getUsageStats(orgId: string, days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const usage = await this.prisma.auditLog.findMany({
      where: {
        orgId,
        action: 'api_usage',
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const totalCost = usage.reduce((sum, log) => {
      const cost = (log.metaJson as any)?.cost || 0;
      return sum + cost;
    }, 0);

    const totalTokens = usage.reduce((sum, log) => {
      const meta = log.metaJson as any;
      return sum + (meta?.inputTokens || 0) + (meta?.outputTokens || 0);
    }, 0);

    return {
      totalCost,
      totalTokens,
      requestCount: usage.length,
      averageCost: usage.length > 0 ? totalCost / usage.length : 0,
      dailyBreakdown: this.groupUsageByDay(usage),
    };
  }

  private groupUsageByDay(usage: any[]) {
    const grouped = {};
    
    usage.forEach(log => {
      const date = log.createdAt.toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = { cost: 0, requests: 0, tokens: 0 };
      }
      
      const meta = log.metaJson as any;
      grouped[date].cost += meta?.cost || 0;
      grouped[date].requests += 1;
      grouped[date].tokens += (meta?.inputTokens || 0) + (meta?.outputTokens || 0);
    });

    return grouped;
  }
}