import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateUserHandler } from './commands/create-user.handler';
import { GetUserByEmailHandler } from './queries/get-user-by-email.handler';
import { UsersController } from './users.controller';
import { UpdateUserHandler } from './commands/update-user.handler';

@Module({
  imports: [CqrsModule],
  controllers: [UsersController],
  providers: [CreateUserHandler, GetUserByEmailHandler, UpdateUserHandler],
  exports: [],
})
export class UsersModule {}
