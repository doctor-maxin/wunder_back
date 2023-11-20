import { Prisma } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsJSON, IsNumber, IsString } from 'class-validator';

export class CustomerFiltersDto {
  @ApiPropertyOptional()
  @IsNumber()
  skip?: number;

  @ApiPropertyOptional()
  @IsNumber()
  take?: number;
  cursor?: Prisma.CustomerWhereUniqueInput;
  where?: Prisma.CustomerWhereInput;
  orderBy?: Prisma.CustomerOrderByWithRelationInput;
  include?: Prisma.CustomerInclude;
}

export class CustomerQueryFilters {
  @ApiProperty()
  @IsNumber()
  limit: number;
  @ApiProperty()
  @IsNumber()
  skip: number;
  @ApiPropertyOptional({ description: 'Ключевое слово для поиска' })
  @IsString()
  query?: string;
}

export class CustomerListQuery {
  @ApiProperty({
    type: CustomerQueryFilters,
  })
  @IsJSON()
  filters: string;
}
