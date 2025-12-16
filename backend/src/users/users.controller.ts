import { Controller, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { AuthGuard } from '@nestjs/passport';
import { UpdateUserCommand } from './commands/update-user.command';

@Controller('users')
export class UsersController {
  constructor(private readonly commandBus: CommandBus) {}

  @UseGuards(AuthGuard('jwt'))
  @Patch('profile')
  async updateProfile(@Request() req, @Body() body: { firstName?: string; lastName?: string; email?: string }) {
    return this.commandBus.execute(
      new UpdateUserCommand(req.user.id, body.firstName, body.lastName, body.email),
    );
  }
}
