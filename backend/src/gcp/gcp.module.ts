import { Module, Global } from '@nestjs/common';
import { GcpService } from './gcp.service';

@Global()
@Module({
  providers: [GcpService],
  exports: [GcpService],
})
export class GcpModule {}
