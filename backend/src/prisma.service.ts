import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    // Prisma 7 exige un adaptateur passé au constructeur
    // PrismaPg crée la connexion PostgreSQL via l'URL dans .env
    // Sans cet adaptateur, Prisma ne sait pas comment se connecter
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });

    // On passe l'adaptateur à PrismaClient via super()
    // super() appelle le constructeur parent (PrismaClient)
    super({ adapter });
  }

  async onModuleInit() {
    // Se connecte à PostgreSQL au démarrage de NestJS
    await this.$connect();
  }
}