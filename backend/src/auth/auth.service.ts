import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(data: {
    email: string;
    password: string;
    nom: string;
    prenom: string;
    region?: string;
  }) {
    const exists = await this.usersService.findByEmail(data.email);
    if (exists) throw new ConflictException('Email déjà utilisé');

    const hashed = await bcrypt.hash(data.password, 10);
    const user = await this.usersService.create({
      ...data,
      password: hashed,
    });

    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return { token, user: { id: user.id, email: user.email, nom: user.nom, prenom: user.prenom } };
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Email ou mot de passe incorrect');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Email ou mot de passe incorrect');

    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return { token, user: { id: user.id, email: user.email, nom: user.nom, prenom: user.prenom } };
  }
}