import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { Storage, Bucket } from '@google-cloud/storage';

@Injectable()
export class GcpService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;
  private storage: Storage | null = null;
  private bucket: Bucket | null = null;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    // Initialize PostgreSQL connection pool (Cloud SQL or local)
    const connectionString = this.configService.get<string>('DATABASE_URL');
    if (!connectionString) {
      throw new Error('DATABASE_URL must be provided');
    }

    this.pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Initialize Google Cloud Storage (optional - only if bucket configured)
    const bucketName = this.configService.get<string>('GCS_BUCKET_NAME');
    if (bucketName) {
      this.storage = new Storage();
      this.bucket = this.storage.bucket(bucketName);
    }
  }

  async onModuleDestroy() {
    await this.pool?.end();
  }

  // Database helpers
  async query<T = any>(text: string, params?: any[]): Promise<T[]> {
    const result = await this.pool.query(text, params);
    return result.rows as T[];
  }

  async queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
    const result = await this.pool.query(text, params);
    return (result.rows[0] as T) || null;
  }

  async execute(text: string, params?: any[]): Promise<number> {
    const result = await this.pool.query(text, params);
    return result.rowCount || 0;
  }

  getPool(): Pool {
    return this.pool;
  }

  // Storage helpers
  getBucket(): Bucket | null {
    return this.bucket;
  }

  async uploadFile(
    buffer: Buffer,
    destination: string,
    contentType: string,
  ): Promise<string> {
    if (!this.bucket) {
      throw new Error('Cloud Storage not configured');
    }
    const file = this.bucket.file(destination);
    await file.save(buffer, {
      contentType,
      public: true,
    });
    return `https://storage.googleapis.com/${this.bucket.name}/${destination}`;
  }

  async deleteFile(filePath: string): Promise<void> {
    if (!this.bucket) return;
    try {
      await this.bucket.file(filePath).delete();
    } catch {
      // File may not exist, ignore error
    }
  }
}
