import { ApiProperty } from '@nestjs/swagger';

export class CreateExpenseDto {
  @ApiProperty({
    example: 'Vegetable Purchase',
    description: 'Name of the expense',
  })
  expenseName: string;

  @ApiProperty({ example: 2500.0, description: 'Expense amount/value' })
  expenseValue: number;
}
