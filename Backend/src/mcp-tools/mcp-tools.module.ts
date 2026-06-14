import { Module } from '@nestjs/common';
import { DatabaseStatsTool } from './database-stats.tool';

@Module({
  providers: [DatabaseStatsTool],
})
export class McpToolsModule {}
