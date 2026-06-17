import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email }
    });
  }

  async create(data: {
    email: string;
    password: string;
    nom: string;
    prenom: string;
    region?: string;
  }) {
    return this.prisma.user.create({ data });
  }
}