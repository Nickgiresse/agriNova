import { Module } from '@nestjs/common';
import { CulturesService } from './cultures.service';
import { CulturesController } from './cultures.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [CulturesController],
  providers: [
    CulturesService,  // logique métier des cultures
    PrismaService,    // connexion à la base de données
  ],
})
export class CulturesModule {}