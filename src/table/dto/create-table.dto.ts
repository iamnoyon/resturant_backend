import { ApiProperty } from '@nestjs/swagger';

export class CreateTableDto {
  @ApiProperty({ example: 'Table-01', description: 'Table name or number' })
  tableName: string;

  @ApiProperty({ example: 4, description: 'Total number of seats' })
  totalSeat: number;
}
