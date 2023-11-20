import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class PFTask {
  @IsString()
  @ApiProperty()
  ID: string;
}

export class PFStatusFull {
  @IsString()
  @ApiProperty()
  id: number;

  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiProperty()
  color: string;

  @IsBoolean()
  @ApiProperty()
  isActive: boolean;

  @IsBoolean()
  @ApiProperty()
  hasDeadline: boolean;

  @IsBoolean()
  @ApiProperty()
  separated: boolean;
}

export class PFUser {
  @IsString()
  @ApiProperty({
    example: 'user:186',
    description: 'ИД пользователя, либо user, либо contact',
  })
  id: string;

  @IsString()
  @ApiProperty({ description: 'Имя пользователя' })
  name: string;
}

export class PFFullTask {
  @IsString()
  @ApiProperty()
  id: number;

  @ApiProperty({
    type: PFStatusFull,
  })
  status: PFStatusFull;

  @IsString()
  @ApiProperty({
    type: PFUser,
  })
  assigner: PFUser;

  @IsString()
  @ApiProperty({
    type: PFTask,
  })
  project: {
    id: number;
  };
}
