import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Patch,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('jobs')
@ApiBearerAuth()
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  // Document Processing Endpoints
  @Post('document-processing')
  async addDocumentProcessingJob(
    @Body() data: {
      documentId: string;
      orgId: string;
      userId: string;
      fileName: string;
      fileKey: string;
      priority?: number;
    }
  ) {
    const { priority = 0, ...jobData } = data;
    const job = await this.jobsService.addDocumentProcessingJob(jobData, priority);
    return { jobId: job.id, status: 'queued' };
  }

  @Get('document-processing')
  async getDocumentProcessingJobs(@Query('status') status?: string) {
    const jobs = await this.jobsService.getDocumentProcessingJobs(status as any);
    return jobs.map(job => ({
      id: job.id,
      data: job.data,
      progress: job.progress(),
      status: job.opts.delay ? 'delayed' : 'waiting',
      createdAt: job.timestamp,
    }));
  }

  // AI Analysis Endpoints
  @Post('ai-analysis')
  async addAIAnalysisJob(
    @Body() data: {
      documentId: string;
      analysisId: string;
      analysisType: string;
      options?: Record<string, any>;
      priority?: number;
    }
  ) {
    const { priority = 0, ...jobData } = data;
    const job = await this.jobsService.addAIAnalysisJob(jobData, priority);
    return { jobId: job.id, status: 'queued' };
  }

  @Get('ai-analysis')
  async getAIAnalysisJobs(@Query('status') status?: string) {
    const jobs = await this.jobsService.getAIAnalysisJobs(status as any);
    return jobs.map(job => ({
      id: job.id,
      data: job.data,
      progress: job.progress(),
      status: job.opts.delay ? 'delayed' : 'waiting',
      createdAt: job.timestamp,
    }));
  }

  // PDF Generation Endpoints
  @Post('pdf-generation')
  async addPDFGenerationJob(
    @Body() data: {
      analysisId: string;
      templateType: string;
      orgId: string;
      priority?: number;
    }
  ) {
    const { priority = 0, ...jobData } = data;
    const job = await this.jobsService.addPDFGenerationJob(jobData, priority);
    return { jobId: job.id, status: 'queued' };
  }

  @Get('pdf-generation')
  async getPDFGenerationJobs(@Query('status') status?: string) {
    const jobs = await this.jobsService.getPDFGenerationJobs(status as any);
    return jobs.map(job => ({
      id: job.id,
      data: job.data,
      progress: job.progress(),
      status: job.opts.delay ? 'delayed' : 'waiting',
      createdAt: job.timestamp,
    }));
  }

  // Notification Endpoints
  @Post('notifications')
  async addNotificationJob(
    @Body() data: {
      type: 'email' | 'in-app';
      userId: string;
      subject: string;
      message: string;
      metadata?: Record<string, any>;
      delay?: number;
    }
  ) {
    const { delay = 0, ...jobData } = data;
    const job = await this.jobsService.addNotificationJob(jobData, delay);
    return { jobId: job.id, status: 'queued' };
  }

  @Get('notifications')
  async getNotificationJobs(@Query('status') status?: string) {
    const jobs = await this.jobsService.getNotificationJobs(status as any);
    return jobs.map(job => ({
      id: job.id,
      data: job.data,
      progress: job.progress(),
      status: job.opts.delay ? 'delayed' : 'waiting',
      createdAt: job.timestamp,
    }));
  }

  // General Job Management
  @Get('stats')
  async getAllQueuesStats() {
    return this.jobsService.getAllQueuesStats();
  }

  @Get('stats/:queueName')
  async getQueueStats(@Param('queueName') queueName: string) {
    return this.jobsService.getQueueStats(queueName);
  }

  @Get(':queueName/:jobId')
  async getJobById(
    @Param('queueName') queueName: string,
    @Param('jobId') jobId: string
  ) {
    const job = await this.jobsService.getJobById(queueName, jobId);
    if (!job) {
      return { error: 'Job not found' };
    }
    
    return {
      id: job.id,
      data: job.data,
      progress: job.progress(),
      status: await job.getState(),
      createdAt: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
      failedReason: job.failedReason,
    };
  }

  @Delete(':queueName/:jobId')
  async removeJob(
    @Param('queueName') queueName: string,
    @Param('jobId') jobId: string
  ) {
    await this.jobsService.removeJob(queueName, jobId);
    return { message: 'Job removed successfully' };
  }

  @Patch(':queueName/:jobId/retry')
  async retryJob(
    @Param('queueName') queueName: string,
    @Param('jobId') jobId: string
  ) {
    await this.jobsService.retryJob(queueName, jobId);
    return { message: 'Job retry initiated' };
  }

  // Database tracking endpoints
  @Get('database/jobs')
  async getJobsFromDatabase(
    @Query('orgId') orgId?: string,
    @Query('type') type?: string,
    @Query('status') status?: string
  ) {
    return this.jobsService.getJobsFromDatabase(orgId, type, status);
  }
}