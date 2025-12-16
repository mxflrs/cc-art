import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from './create-user.command';
import { GcpService } from '../../gcp/gcp.service';
import * as bcrypt from 'bcrypt';

export interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  updated_at: string;
}

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(private readonly gcpService: GcpService) {}

  async execute(command: CreateUserCommand): Promise<UserProfile> {
    const { email, password, firstName, lastName } = command;
    
    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user in database
    const user = await this.gcpService.queryOne<UserProfile>(
      'INSERT INTO users (email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING id, email, first_name, last_name, created_at, updated_at',
      [email, passwordHash, firstName || null, lastName || null]
    );

    if (!user) {
      throw new Error('Failed to create user');
    }

    return user;
  }
}
