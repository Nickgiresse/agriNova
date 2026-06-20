import {
  Controller, Get, Post, Patch,
  Delete, Body, Param, UseGuards, Request
} from '@nestjs/common';
import { CulturesService } from './cultures.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// Toutes les routes commencent par /cultures
// @UseGuards sur le controller = TOUTES les routes sont protégées
// L'utilisateur doit être connecté pour accéder à n'importe quelle route
@UseGuards(JwtAuthGuard)
@Controller('cultures')
export class CulturesController {
  constructor(private culturesService: CulturesService) {}

  // POST /cultures — créer une nouvelle culture
  // req.user.userId vient du token JWT décodé par JwtStrategy
  @Post()
  creer(@Request() req: any, @Body() body: {
    nom: string;
    statut: string;
    datePlantation: string;
    surface: number;
  }) {
    // On passe l'userId du token pour lier la culture à l'utilisateur
    return this.culturesService.creer(req.user.userId, body);
  }

  // GET /cultures — lister toutes les cultures de l'utilisateur
  @Get()
  trouverTout(@Request() req: any) {
    return this.culturesService.trouverTout(req.user.userId);
  }

  // GET /cultures/:id — voir une culture spécifique
  // @Param('id') récupère l'id depuis l'URL ex: /cultures/abc-123
  @Get(':id')
  trouverUn(@Request() req: any, @Param('id') id: string) {
    return this.culturesService.trouverUn(id, req.user.userId);
  }

  // PATCH /cultures/:id — modifier une culture
  // PATCH = modification partielle (pas besoin d'envoyer tous les champs)
  @Patch(':id')
  modifier(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: Partial<{
      nom: string;
      statut: string;
      datePlantation: string;
      surface: number;
    }>
  ) {
    return this.culturesService.modifier(id, req.user.userId, body);
  }

  // DELETE /cultures/:id — supprimer une culture
  @Delete(':id')
  supprimer(@Request() req: any, @Param('id') id: string) {
    return this.culturesService.supprimer(id, req.user.userId);
  }
}