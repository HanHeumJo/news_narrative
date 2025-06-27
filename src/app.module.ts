import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { NewsModule } from './news/news.module';
import { CommentsModule } from './comment/comment.module';
import { MemberModule } from './member/member.module';
import { OpenaiModule } from './openai/openai.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
        dbName: config.get<string>('MONGO_DB'),
      }),
      inject: [ConfigService],
    }),
    AdminModule,
    AuthModule,
    NewsModule, // 뉴스 기능 모듈
    CommentsModule, // 댓글 기능 모듈
    MemberModule, OpenaiModule
  ],
})
export class AppModule {}
