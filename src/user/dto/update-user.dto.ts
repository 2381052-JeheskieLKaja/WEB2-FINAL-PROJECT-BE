import { IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsNotEmpty()
  nama?: string;

  @IsOptional()
  @MinLength(6)
  password?: string;
}
