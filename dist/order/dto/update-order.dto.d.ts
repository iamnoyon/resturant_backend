import { BillStatus } from '../../common/enums/bill-status.enum';
export declare class UpdateOrderDto {
    tableId?: number;
    productIds?: number[];
    totalBill?: number;
    discount?: number;
    subTotal?: number;
    billStatus?: BillStatus;
}
