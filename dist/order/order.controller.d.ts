import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { BillStatus } from '../common/enums/bill-status.enum';
export declare class OrderController {
    private readonly orderService;
    constructor(orderService: OrderService);
    create(createOrderDto: CreateOrderDto, currentUser: any): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/order.entity").Order;
    }>;
    findAll(query: PaginationQueryDto, currentUser: any): Promise<import("../common/dto/pagination.dto").PaginatedResult<any>>;
    findOne(id: string, currentUser: any): Promise<{
        success: boolean;
        data: import("./entities/order.entity").Order;
    }>;
    update(id: string, updateOrderDto: UpdateOrderDto, currentUser: any): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/order.entity").Order;
    }>;
    remove(id: string, currentUser: any): Promise<{
        success: boolean;
        message: string;
    }>;
    updateBillStatus(id: string, billStatus: BillStatus, currentUser: any): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/order.entity").Order;
    }>;
}
