import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserCommand } from './create-user.command';
import { User } from '../entities/user.entity';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async execute(command: CreateUserCommand): Promise<User> {
    const { email, password, firstName, lastName } = command;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });

    return this.userRepository.save(user);
  }
}
