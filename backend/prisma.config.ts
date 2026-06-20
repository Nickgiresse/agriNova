import { defineConfig } from 'prisma/config';
import * as dotenv from 'dotenv';

// Charge les variables depuis le fichier .env
// pour que process.env.DATABASE_URL soit disponible
dotenv.config();

export default defineConfig({
  // Chemin vers le fichier schema.prisma
  schema: './prisma/schema.prisma',

  // Dans Prisma 7, l'URL de connexion va dans "datasource"
  // et non plus dans schema.prisma
  // C'est la propriété correcte selon les types officiels
  datasource: {
    url: process.env.DATABASE_URL,
  },
});