import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('initiate')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  initiate(@Body() dto: InitiatePaymentDto, @CurrentUser() currentUser: any) {
    return this.paymentService.initiate(currentUser, dto.packageId);
  }

  @Post('success')
  success(@Body() body: any) {
    const tranId = body?.tran_id;
    if (!tranId) return { success: false, message: 'Missing transaction ID' };
    return this.paymentService.handleSuccess(tranId, body?.val_id);
  }

  @Post('cancel')
  cancel(@Body() body: any) {
    const tranId = body?.tran_id;
    if (!tranId) return { success: false, message: 'Missing transaction ID' };
    return this.paymentService.handleCancel(tranId);
  }

  @Post('fail')
  fail(@Body() body: any) {
    const tranId = body?.tran_id;
    if (!tranId) return { success: false, message: 'Missing transaction ID' };
    return this.paymentService.handleFail(tranId);
  }
}
