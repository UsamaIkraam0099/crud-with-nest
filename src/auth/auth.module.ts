import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

// Others
import { AuthService } from './auth.service';
import { AuthController } from './aut.controller';
import { JwtStrategy } from './strategy';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
