import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDTO } from './dto/register.dto';
import { LoginUserDto } from '../user/dto/login-user.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDTO })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async register(@Body() registerDto: RegisterDTO) {
    await this.authService.register(registerDto);
    return { message: 'User registered successfully' };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginUserDto: LoginUserDto) {
    try {
      const user = await this.authService.validateUser(
        loginUserDto.email,
        loginUserDto.password,
      );
      console.log('ini usernyah ==> ', user);
      return this.authService.login(user);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}
