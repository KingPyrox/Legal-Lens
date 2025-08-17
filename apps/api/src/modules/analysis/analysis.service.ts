import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AnalysisService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.analysis.create({
      data,
    });
  }

  async findAll(orgId: string) {
    return this.prisma.analysis.findMany({
      where: { 
        document: {
          orgId,
        },
      },
      include: {
        document: true,
      },
    });
  }

  async findByDocument(documentId: string) {
    return this.prisma.analysis.findMany({
      where: { documentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.analysis.findUnique({
      where: { id },
      include: {
        document: true,
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.analysis.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.analysis.delete({
      where: { id },
    });
  }

  async updateStatus(id: string, status: any) {
    return this.prisma.analysis.update({
      where: { id },
      data: { status },
    });
  }

  async getAnalyticsSummary(orgId: string) {
    const totalAnalyses = await this.prisma.analysis.count({
      where: {
        document: {
          orgId,
        },
      },
    });

    const completedAnalyses = await this.prisma.analysis.count({
      where: {
        document: {
          orgId,
        },
        status: 'COMPLETED',
      },
    });

    const pendingAnalyses = await this.prisma.analysis.count({
      where: {
        document: {
          orgId,
        },
        status: 'QUEUED',
      },
    });

    return {
      total: totalAnalyses,
      completed: completedAnalyses,
      pending: pendingAnalyses,
    };
  }
}