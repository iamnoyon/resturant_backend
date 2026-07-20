import { BillStatus } from '../../common/enums/bill-status.enum';
export declare class CreateOrderDto {
    tableId: number;
    products: {
        productId: number;
        quantity: number;
    }[];
    totalBill: number;
    discount: number;
    subTotal: number;
    billStatus: BillStatus;
}
