import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@legal-lens/database';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Helper for transactions
  async transaction<T>(fn: (prisma: PrismaClient) => Promise<T>): Promise<T> {
    return this.$transaction(fn);
  }

  // Helper to check org access
  async hasOrgAccess(userId: string, orgId: string): Promise<boolean> {
    const membership = await this.membership.findUnique({
      where: {
        orgId_userId: {
          orgId,
          userId,
        },
      },
    });
    return !!membership;
  }

  // Helper to get user's role in org
  async getUserRole(userId: string, orgId: string) {
    const membership = await this.membership.findUnique({
      where: {
        orgId_userId: {
          orgId,
          userId,
        },
      },
      select: {
        role: true,
      },
    });
    return membership?.role;
  }
}