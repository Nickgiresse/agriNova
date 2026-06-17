import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CulturesService {
  
  // NestJS injecte PrismaService automatiquement
  constructor(private prisma: PrismaService) {}

  // Crée une nouvelle culture dans la BD
  // userId vient du token JWT — l'utilisateur connecté
  async creer(userId: string, data: {
    nom: string;
    statut: string;
    datePlantation: string;
    surface: number;
  }) {
    return this.prisma.culture.create({
      data: {
        nom: data.nom,
        statut: data.statut,
        // new Date() convertit "2024-01-15" en date PostgreSQL
        datePlantation: new Date(data.datePlantation),
        surface: data.surface,
        // userId relie la culture à l'utilisateur connecté
        userId: userId,
      },
    });
  }

  // Récupère toutes les cultures de l'utilisateur connecté
  // Un utilisateur ne voit QUE ses propres cultures
  async trouverTout(userId: string) {
    return this.prisma.culture.findMany({
      where: { userId }, // filtre par userId
      // orderBy trie du plus récent au plus ancien
      orderBy: { createdAt: 'desc' },
    });
  }

  // Récupère une seule culture par son id
  // Vérifie que la culture appartient bien à l'utilisateur
  async trouverUn(id: string, userId: string) {
    const culture = await this.prisma.culture.findFirst({
      where: {
        id,       // l'id de la culture
        userId,   // ET appartient à cet utilisateur
      },
    });

    // Si la culture n'existe pas ou n'appartient pas
    // à l'utilisateur → erreur 404
    if (!culture) {
      throw new NotFoundException('Culture non trouvée');
    }

    return culture;
  }

  // Modifie une culture existante
  // Partial<> signifie que tous les champs sont optionnels
  async modifier(id: string, userId: string, data: Partial<{
    nom: string;
    statut: string;
    datePlantation: string;
    surface: number;
  }>) {
    // Vérifie d'abord que la culture existe et appartient à l'utilisateur
    await this.trouverUn(id, userId);

    return this.prisma.culture.update({
      where: { id },
      data: {
        // On ne met à jour que les champs fournis
        // grâce à l'opérateur spread ...
        ...data,
        // Si datePlantation est fournie, on la convertit en Date
        ...(data.datePlantation && {
          datePlantation: new Date(data.datePlantation),
        }),
      },
    });
  }

  // Supprime une culture
  async supprimer(id: string, userId: string) {
    // Vérifie d'abord que la culture appartient à l'utilisateur
    await this.trouverUn(id, userId);

    await this.prisma.culture.delete({
      where: { id },
    });

    // Retourne un message de confirmation
    return { message: 'Culture supprimée avec succès' };
  }
}