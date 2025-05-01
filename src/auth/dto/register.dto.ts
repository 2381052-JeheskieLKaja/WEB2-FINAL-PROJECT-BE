import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail, MinLength } from 'class-validator';

export class RegisterDTO {
  @ApiProperty({
    description: 'Username of the user',
    example: 'john_doe',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Email of the user',
    example: 'john@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Nama of the user',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  nama: string;

  @ApiProperty({
    description: 'Password of the user',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
