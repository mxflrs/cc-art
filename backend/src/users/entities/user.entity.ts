export class User {
  id: number;
  email: string;
  password_hash: string; // Hashed password
  first_name: string;
  last_name: string;
  created_at: Date;
}
