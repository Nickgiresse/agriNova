import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Route publique — pas besoin de token
  // Accessible par tout le monde
  @Post('register')
  register(@Body() body: {
    email: string;
    password: string;
    nom: string;
    prenom: string;
    region?: string;
  }) {
    return this.authService.register(body);
  }

  // Route publique — pas besoin de token
  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  // Route protégée — token JWT obligatoire
  // @UseGuards(JwtAuthGuard) vérifie automatiquement le token
  // Si le token est absent ou invalide → erreur 401 automatique
  // Si le token est valide → req.user contient { userId, email }
  @UseGuards(JwtAuthGuard)
  @Get('profil')
  getProfil(@Request() req: any) {
    // req.user est rempli automatiquement par JwtStrategy.validate()
    // Il contient ce qu'on a retourné dans jwt.strategy.ts
    return {
      message: 'Token valide — accès autorisé',
      utilisateur: req.user,
    };
  }
}