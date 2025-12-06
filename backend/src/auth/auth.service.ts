import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import * as bcrypt from 'bcrypt';
import { GetUserByEmailQuery } from '../users/queries/get-user-by-email.query';
import { CreateUserCommand } from '../users/commands/create-user.command';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user: User | null = await this.queryBus.execute(new GetUserByEmailQuery(email));
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(createUserDto: any) {
    const { email, password, firstName, lastName } = createUserDto;
    // Check if user exists
    const existingUser = await this.queryBus.execute(new GetUserByEmailQuery(email));
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }
    return this.commandBus.execute(new CreateUserCommand(email, password, firstName, lastName));
  }
}
