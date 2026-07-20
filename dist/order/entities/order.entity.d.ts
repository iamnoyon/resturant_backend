import { BillStatus } from '../../common/enums/bill-status.enum';
import { Business } from '../../business/entities/business.entity';
import { Table } from '../../table/entities/table.entity';
export declare class Order {
    id: number;
    orderId: string;
    tableId: number;
    table: Table;
    products: {
        productId: number;
        quantity: number;
    }[];
    totalBill: number;
    discount: number;
    subTotal: number;
    billStatus: BillStatus;
    businessId: number;
    business: Business;
    createdBy: number;
    updatedBy: number;
    createdAt: Date;
    updatedAt: Date;
}
