import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class Token {
  @ApiProperty()
  @IsNotEmpty()
  access_token: string;

  @ApiProperty()
  @IsNotEmpty()
  refresh_token: string;
}

export class RefreshToken {
  @ApiProperty()
  @IsString()
  refresh_token: string;
}

export class PlanFixToken {
  @ApiProperty()
  @IsString()
  token: string;
}
