import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.organization.create({
      data,
    });
  }

  async findAll(userId: string) {
    return this.prisma.organization.findMany({
      where: {
        memberships: {
          some: {
            userId,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.organization.findUnique({
      where: { id },
      include: {
        memberships: true,
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.organization.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.organization.delete({
      where: { id },
    });
  }
}