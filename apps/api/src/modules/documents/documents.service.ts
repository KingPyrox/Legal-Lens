import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.document.create({
      data,
    });
  }

  async findAll(orgId: string) {
    return this.prisma.document.findMany({
      where: { orgId },
    });
  }

  async findOne(id: string) {
    return this.prisma.document.findUnique({
      where: { id },
      include: {
        pages: true,
        analyses: true,
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.document.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.document.delete({
      where: { id },
    });
  }
}