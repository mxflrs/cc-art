import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { GcpService } from '../gcp/gcp.service';
import * as bcrypt from 'bcrypt';

interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly gcpService: GcpService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    // Find user by email
    const user = await this.gcpService.queryOne<UserRecord>(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      },
    };
  }

  async register(createUserDto: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) {
    const { email, password, firstName, lastName } = createUserDto;

    // Check if user already exists
    const existingUser = await this.gcpService.queryOne<{ id: string }>(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await this.gcpService.queryOne<UserRecord>(
      'INSERT INTO users (email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING *',
      [email, passwordHash, firstName || null, lastName || null]
    );

    return {
      id: user!.id,
      email: user!.email,
      firstName: user!.first_name,
      lastName: user!.last_name,
    };
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return {
        userId: payload.sub,
        email: payload.email,
      };
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async getProfile(userId: string) {
    const user = await this.gcpService.queryOne<UserRecord>(
      'SELECT id, email, first_name, last_name FROM users WHERE id = $1',
      [userId]
    );

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
    };
  }
}
