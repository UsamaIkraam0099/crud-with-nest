import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Others
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { BookmarkModule } from './bookmark/bookmark.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    PrismaModule,
    BookmarkModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
})
export class AppModule {}
