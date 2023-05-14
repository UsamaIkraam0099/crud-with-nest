import { User } from '@prisma/client';
import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';

// Others
import { JwtGuard } from '../auth/guard';
import { GetUser } from './../auth/decorator';
import { UserService } from './user.service';
import { EditUserDto } from './dto';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }

  @Patch('editMe')
  edituser(@GetUser('id') userId: number, @Body() dto: EditUserDto) {
    return this.userService.editUser(userId, dto);
  }
}
