import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

// PrismaService doit être importé dans chaque module qui l'utilise
import { PrismaService } from '../prisma.service';

@Module({
  // providers = les services disponibles dans ce module
  providers: [
    UsersService,  // la logique métier des utilisateurs
    PrismaService, // la connexion à la base de données
  ],
  // exports = ce que les autres modules peuvent utiliser
  exports: [UsersService],
})
export class UsersModule {}