import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SignInDto {
  @ApiProperty({ title: 'Логин' })
  @IsNotEmpty()
  @IsEmail()
  username: string;

  @ApiProperty({ title: 'Пароль' })
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class SignInAsUserDto {
  @ApiProperty({ title: 'Id пользователя' })
  @IsNotEmpty()
  @IsNumber()
  id: number;
}
