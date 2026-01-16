import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserByEmailQuery } from './get-user-by-email.query';
import { DatabaseService } from '../../database/database.service';

export interface UserWithProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

@QueryHandler(GetUserByEmailQuery)
export class GetUserByEmailHandler implements IQueryHandler<GetUserByEmailQuery> {
  constructor(private readonly db: DatabaseService) {}

  async execute(query: GetUserByEmailQuery): Promise<UserWithProfile | null> {
    const user = await this.db.queryOne<UserWithProfile>(
      'SELECT id, email, first_name, last_name FROM users WHERE email = $1',
      [query.email]
    );

    return user;
  }
}
