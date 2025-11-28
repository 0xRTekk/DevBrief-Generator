import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BriefsController } from './presentation/briefs.controller';
import { GenerateBriefsService } from './application/services/generate-briefs.service';
import { BriefsPromptFactory } from './domain/services/briefs-prompt.factory';
import { BriefsParser } from './domain/services/briefs-parser.service';
import { BriefsFileWriter } from './infrastructure/storage/briefs-file-writer.service';
import { OpenAiProvider } from './infrastructure/ai/openai.provider';
import { SupabaseBriefsRepository } from './infrastructure/persistence/supabase-briefs.repository';

@Module({
  imports: [ConfigModule],
  controllers: [BriefsController],
  providers: [
    GenerateBriefsService,
    BriefsPromptFactory,
    BriefsParser,
    BriefsFileWriter,
    OpenAiProvider,
    SupabaseBriefsRepository,
  ],
})
export class BriefsModule {}
