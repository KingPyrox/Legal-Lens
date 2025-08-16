# OpenAI Cost Optimization Guide

## 💰 Cost-Effective OpenAI Usage

Since you have OpenAI API access, here's how to use it efficiently while minimizing costs.

## 📊 OpenAI Pricing (as of 2024)

| Model | Input (per 1K tokens) | Output (per 1K tokens) | Use Case |
|-------|---------------------|----------------------|----------|
| GPT-3.5-Turbo | $0.0010 | $0.0020 | Development, basic analysis |
| GPT-4-Turbo | $0.0100 | $0.0300 | Production, complex analysis |
| GPT-4o | $0.0050 | $0.0150 | Balanced cost/quality |

## 🎯 Development Strategy

### Phase 1: Development (GPT-3.5-Turbo)
```env
OPENAI_MODEL="gpt-3.5-turbo"
OPENAI_MAX_TOKENS=800
OPENAI_TEMPERATURE=0.1
```
**Cost**: ~$0.02-0.05 per document analysis

### Phase 2: Testing (GPT-4o)
```env
OPENAI_MODEL="gpt-4o" 
OPENAI_MAX_TOKENS=1200
```
**Cost**: ~$0.15-0.30 per document analysis

### Phase 3: Production (GPT-4-Turbo)
```env
OPENAI_MODEL="gpt-4-turbo-preview"
OPENAI_MAX_TOKENS=1500
```
**Cost**: ~$0.30-0.60 per document analysis

## 🔧 Cost Optimization Techniques

### 1. Smart Caching
```typescript
// Cache identical requests
const cacheKey = `analysis:${sha256(documentText)}:${model}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

// Cache for 7 days
await redis.setex(cacheKey, 604800, JSON.stringify(result));
```

### 2. Token Optimization
```typescript
// Limit input text length
const maxInputTokens = 8000; // Leave room for response
const truncatedText = truncateToTokens(documentText, maxInputTokens);

// Use concise prompts
const prompt = `Extract clauses from this contract. Return JSON only.
Contract: ${truncatedText}`;
```

### 3. Batch Processing
```typescript
// Process multiple clauses in one request
const prompt = `Analyze these clauses and return risk scores:
${clauses.map((c, i) => `${i+1}. ${c.text}`).join('\n')}`;
```

### 4. Progressive Enhancement
```typescript
// Start with cheap model, upgrade if needed
async function analyzeDocument(text: string, userId: string) {
  const userTier = await getUserTier(userId);
  
  if (userTier === 'free') {
    return analyzeWithGPT35(text);
  } else if (userTier === 'pro') {
    return analyzeWithGPT4o(text);
  } else {
    return analyzeWithGPT4Turbo(text);
  }
}
```

## 📈 Usage Monitoring

### Track API Costs
```typescript
// Log every API call
const usage = {
  model,
  inputTokens: response.usage.prompt_tokens,
  outputTokens: response.usage.completion_tokens,
  cost: calculateCost(response.usage, model),
  userId,
  timestamp: new Date()
};

await db.apiUsage.create({ data: usage });
```

### Daily Spending Alerts
```typescript
// Check daily spending
const dailySpend = await getDailySpending(new Date());
if (dailySpend > process.env.DAILY_SPENDING_LIMIT) {
  await sendAlert('Daily OpenAI spending limit exceeded');
  throw new Error('Daily API limit exceeded');
}
```

## 🎮 Development Workflow

### 1. Start with Mock Data
```typescript
if (process.env.NODE_ENV === 'development' && !process.env.OPENAI_API_KEY) {
  return getMockAnalysis(documentText);
}
```

### 2. Use GPT-3.5 for Iteration
```bash
# Quick testing with cheap model
OPENAI_MODEL=gpt-3.5-turbo npm run dev
```

### 3. Test with GPT-4 Before Deploy
```bash
# Final testing with production model
OPENAI_MODEL=gpt-4-turbo-preview npm run test:integration
```

## 💡 Prompt Engineering for Cost Efficiency

### Optimized Clause Extraction Prompt
```typescript
const CLAUSE_EXTRACTION_PROMPT = `Extract legal clauses from this contract. Return only valid JSON array.

Format: [{"type":"ClauseType","text":"exact text","start":123,"end":456,"page":1}]

Types: ${CLAUSE_TYPES.join(', ')}

Contract:
{text}`;
```

### Optimized Risk Assessment Prompt
```typescript
const RISK_ASSESSMENT_PROMPT = `Rate this clause risk: LOW/MEDIUM/HIGH/CRITICAL

Clause: {clauseText}
Type: {clauseType}
Jurisdiction: {jurisdiction}

Return JSON: {"risk":"LEVEL","reason":"brief explanation"}`;
```

## 📊 Expected Costs

### Development Phase (100 documents)
- GPT-3.5-Turbo: ~$2-5 total
- Daily limit: $1-2

### Testing Phase (50 documents)
- GPT-4o: ~$8-15 total
- Weekly testing budget: $10

### Production (1000 users, 10 docs/month each)
- GPT-4-Turbo: ~$3000-6000/month
- Revenue needed: $10,000+/month (30-50% margin)

## 🚦 Safety Limits

### Environment Variables
```env
# Daily spending limits
DAILY_SPENDING_LIMIT=5.00           # Development
WEEKLY_SPENDING_LIMIT=25.00         # Testing
MONTHLY_SPENDING_LIMIT=100.00       # Pre-revenue

# Rate limits
MAX_REQUESTS_PER_MINUTE=20
MAX_REQUESTS_PER_HOUR=100
MAX_REQUESTS_PER_DAY=500
```

### Code Implementation
```typescript
const rateLimiter = new RateLimiter({
  tokensPerInterval: 20,
  interval: 'minute'
});

await rateLimiter.removeTokens(1);
```

## 🔄 Fallback Strategy

```typescript
async function analyzeWithFallback(text: string) {
  try {
    // Try OpenAI first
    return await analyzeWithOpenAI(text);
  } catch (error) {
    if (error.code === 'rate_limit' || error.code === 'quota_exceeded') {
      // Fallback to local processing
      return await analyzeWithLocalLLM(text);
    }
    throw error;
  }
}
```

## 📝 Quick Setup

1. **Copy the OpenAI environment**:
   ```bash
   cp .env.openai .env
   ```

2. **Add your OpenAI API key**:
   ```env
   OPENAI_API_KEY=sk-your-key-here
   ```

3. **Start with development settings**:
   ```env
   OPENAI_MODEL=gpt-3.5-turbo
   DAILY_SPENDING_LIMIT=2.00
   ```

4. **Monitor usage**:
   ```bash
   npm run dev
   # Check logs for API usage
   ```

## 🎯 Recommended Budget

- **Development**: $10/month (plenty for testing)
- **MVP Launch**: $50/month (limited users)
- **Growth**: Scale with revenue (30-50% of revenue)

Start conservative and increase spending as you validate the product and gain paying customers!