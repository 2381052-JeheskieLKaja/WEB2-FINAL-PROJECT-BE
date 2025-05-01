import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  nama: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
