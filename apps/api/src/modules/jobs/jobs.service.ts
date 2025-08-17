import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue, Job } from 'bull';
import { PrismaService } from '../database/prisma.service';

export interface DocumentProcessingJobData {
  documentId: string;
  orgId: string;
  userId: string;
  fileName: string;
  fileKey: string;
}

export interface AIAnalysisJobData {
  documentId: string;
  analysisId: string;
  analysisType: string;
  options?: Record<string, any>;
}

export interface PDFGenerationJobData {
  analysisId: string;
  templateType: string;
  orgId: string;
}

export interface NotificationJobData {
  type: 'email' | 'in-app';
  userId: string;
  subject: string;
  message: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private prisma: PrismaService,
    @InjectQueue('document-processing') private documentQueue: Queue<DocumentProcessingJobData>,
    @InjectQueue('ai-analysis') private analysisQueue: Queue<AIAnalysisJobData>,
    @InjectQueue('pdf-generation') private pdfQueue: Queue<PDFGenerationJobData>,
    @InjectQueue('notifications') private notificationQueue: Queue<NotificationJobData>,
  ) {}

  // Document Processing Jobs
  async addDocumentProcessingJob(data: DocumentProcessingJobData, priority: number = 0): Promise<Job<DocumentProcessingJobData>> {
    return this.documentQueue.add('process-document', data, {
      priority,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }

  async getDocumentProcessingJobs(status?: 'waiting' | 'active' | 'completed' | 'failed') {
    if (status) {
      return this.documentQueue.getJobs([status]);
    }
    return this.documentQueue.getJobs(['waiting', 'active', 'completed', 'failed']);
  }

  // AI Analysis Jobs
  async addAIAnalysisJob(data: AIAnalysisJobData, priority: number = 0): Promise<Job<AIAnalysisJobData>> {
    return this.analysisQueue.add('analyze-document', data, {
      priority,
      attempts: 2,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    });
  }

  async getAIAnalysisJobs(status?: 'waiting' | 'active' | 'completed' | 'failed') {
    if (status) {
      return this.analysisQueue.getJobs([status]);
    }
    return this.analysisQueue.getJobs(['waiting', 'active', 'completed', 'failed']);
  }

  // PDF Generation Jobs
  async addPDFGenerationJob(data: PDFGenerationJobData, priority: number = 0): Promise<Job<PDFGenerationJobData>> {
    return this.pdfQueue.add('generate-pdf', data, {
      priority,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
  }

  async getPDFGenerationJobs(status?: 'waiting' | 'active' | 'completed' | 'failed') {
    if (status) {
      return this.pdfQueue.getJobs([status]);
    }
    return this.pdfQueue.getJobs(['waiting', 'active', 'completed', 'failed']);
  }

  // Notification Jobs
  async addNotificationJob(data: NotificationJobData, delay: number = 0): Promise<Job<NotificationJobData>> {
    return this.notificationQueue.add('send-notification', data, {
      delay,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
  }

  async getNotificationJobs(status?: 'waiting' | 'active' | 'completed' | 'failed') {
    if (status) {
      return this.notificationQueue.getJobs([status]);
    }
    return this.notificationQueue.getJobs(['waiting', 'active', 'completed', 'failed']);
  }

  // General Job Management
  async getJobById(queueName: string, jobId: string): Promise<Job | null> {
    const queue = this.getQueueByName(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }
    return queue.getJob(jobId);
  }

  async removeJob(queueName: string, jobId: string): Promise<void> {
    const job = await this.getJobById(queueName, jobId);
    if (job) {
      await job.remove();
    }
  }

  async retryJob(queueName: string, jobId: string): Promise<void> {
    const job = await this.getJobById(queueName, jobId);
    if (job) {
      await job.retry();
    }
  }

  async getQueueStats(queueName: string) {
    const queue = this.getQueueByName(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    const waiting = await queue.getWaiting();
    const active = await queue.getActive();
    const completed = await queue.getCompleted();
    const failed = await queue.getFailed();

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
    };
  }

  async getAllQueuesStats() {
    const queues = ['document-processing', 'ai-analysis', 'pdf-generation', 'notifications'];
    const stats = {};

    for (const queueName of queues) {
      stats[queueName] = await this.getQueueStats(queueName);
    }

    return stats;
  }

  private getQueueByName(queueName: string): Queue | null {
    switch (queueName) {
      case 'document-processing':
        return this.documentQueue;
      case 'ai-analysis':
        return this.analysisQueue;
      case 'pdf-generation':
        return this.pdfQueue;
      case 'notifications':
        return this.notificationQueue;
      default:
        return null;
    }
  }

  // Database tracking methods
  async trackJobInDatabase(jobId: string, type: string, state: any, data: any) {
    return this.prisma.job.create({
      data: {
        id: jobId,
        type,
        state,
        payloadJson: data,
      },
    });
  }

  async updateJobStatusInDatabase(jobId: string, state: any, result?: any, error?: string) {
    return this.prisma.job.update({
      where: { id: jobId },
      data: {
        state,
        lastError: error,
      },
    });
  }

  async getJobsFromDatabase(orgId?: string, type?: string, status?: string) {
    return this.prisma.job.findMany({
      where: {
        ...(orgId && { orgId }),
        ...(type && { type }),
        ...(status && { status }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}