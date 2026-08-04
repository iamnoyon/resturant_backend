import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { PaymentService } from './payment.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  private frontendUrl: string;

  constructor(
    private readonly paymentService: PaymentService,
    private readonly configService: ConfigService,
  ) {
    this.frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3001',
    );
  }

  @Post('initiate')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  initiate(@Body() dto: InitiatePaymentDto, @CurrentUser() currentUser: any) {
    return this.paymentService.initiate(currentUser, dto.packageId);
  }

  @Get('status/:tranId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  status(@Param('tranId') tranId: string) {
    return this.paymentService.getPaymentStatus(tranId);
  }

  @Post('success')
  success(@Body() body: any, @Res() res: Response) {
    const tranId = body?.tran_id;
    if (!tranId) {
      return res.redirect(`${this.frontendUrl}/dashboard?payment=error`);
    }
    this.paymentService.handleSuccess(tranId, body?.val_id);
    return res.redirect(`${this.frontendUrl}/profile?tran_id=${tranId}`);
  }

  @Post('cancel')
  cancel(@Body() body: any, @Res() res: Response) {
    const tranId = body?.tran_id;
    if (!tranId) {
      return res.redirect(`${this.frontendUrl}/dashboard?payment=error`);
    }
    this.paymentService.handleCancel(tranId);
    return res.redirect(`${this.frontendUrl}/profile?tran_id=${tranId}`);
  }

  @Post('fail')
  fail(@Body() body: any, @Res() res: Response) {
    const tranId = body?.tran_id;
    if (!tranId) {
      return res.redirect(`${this.frontendUrl}/dashboard?payment=error`);
    }
    this.paymentService.handleFail(tranId);
    return res.redirect(`${this.frontendUrl}/profile?tran_id=${tranId}`);
  }
}
