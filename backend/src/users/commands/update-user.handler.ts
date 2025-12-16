import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateUserCommand } from './update-user.command';
import { GcpService } from '../../gcp/gcp.service';

export interface UpdatedProfile {
  id: string;
  email?: string;
  first_name: string | null;
  last_name: string | null;
}

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(private readonly gcpService: GcpService) {}

  async execute(command: UpdateUserCommand): Promise<UpdatedProfile> {
    const { userId, firstName, lastName, email } = command;

    // Build dynamic update query
    const updates: string[] = ['updated_at = NOW()'];
    const params: any[] = [];
    let paramIndex = 1;

    if (firstName !== undefined) {
      updates.push(`first_name = $${paramIndex++}`);
      params.push(firstName);
    }
    if (lastName !== undefined) {
      updates.push(`last_name = $${paramIndex++}`);
      params.push(lastName);
    }
    if (email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      params.push(email);
    }

    params.push(userId);

    const profile = await this.gcpService.queryOne<UpdatedProfile>(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id, email, first_name, last_name`,
      params
    );

    if (!profile) {
      throw new Error('User not found');
    }

    return profile;
  }
}
