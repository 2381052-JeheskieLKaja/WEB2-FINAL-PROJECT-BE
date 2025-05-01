import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { RegisterDTO } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { JwtPayloadDto } from './dto/jwt-payload.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<Partial<User>> {
    console.log('=== Authentication Debug ===');
    console.log('Input email:', email);
    console.log('Input password:', password);

    const user = await this.userService.findByEmail(email);

    console.log(user);
    console.log('User found:', user ? 'yes' : 'no');

    if (!user) {
      console.log('=== Authentication Failed: User not found ===');
      throw new UnauthorizedException('Invalid credentials');
    }

    console.log('Stored password hash:', user.password);
    console.log('Password length:', user.password.length);

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password comparison result:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('=== Authentication Failed: Password mismatch ===');
      throw new UnauthorizedException('Invalid credentials');
    }

    console.log('=== Authentication Successful ===');
    const { password: _, ...result } = user;
    return result;
  }

  async login(user: Partial<User>) {
    if (!user || !user.id) {
      console.log('Invalid user data in login:', user);
      throw new UnauthorizedException('Invalid user data');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      nama: user.nama,
    };

    console.log('payloadnya ==> ', payload);

    const token = this.jwtService.sign(payload);
    console.log('JWT generated successfully for user:', user.email);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        nama: user.nama,
      },
    };
  }

  async register(registerDto: RegisterDTO) {
    console.log('=== Registration Debug ===');
    console.log('Input data:', registerDto);

    try {
      // Validate input data
      if (!registerDto.email || !registerDto.password || !registerDto.nama) {
        throw new HttpException(
          'Missing required fields',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Create user
      const user = await this.userService.create(registerDto);
      console.log('User created successfully:', user);

      // Remove password from response
      const { password, ...result } = user;
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      if (error.message === 'User already exists') {
        throw new HttpException(
          'Email already registered',
          HttpStatus.CONFLICT,
        );
      }
      throw new HttpException(
        'Registration failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
