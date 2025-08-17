import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.org.create({
      data,
    });
  }

  async findAll(userId: string) {
    return this.prisma.org.findMany({
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
    return this.prisma.org.findUnique({
      where: { id },
      include: {
        memberships: true,
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.org.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.org.delete({
      where: { id },
    });
  }
}