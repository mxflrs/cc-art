import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { User } from './entities/user.entity';
import { CreateUserHandler } from './commands/create-user.handler';
import { GetUserByEmailHandler } from './queries/get-user-by-email.handler';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    CqrsModule,
  ],
  providers: [CreateUserHandler, GetUserByEmailHandler],
  exports: [TypeOrmModule], // Export TypeOrmModule to use repository in AuthModule
})
export class UsersModule {}
