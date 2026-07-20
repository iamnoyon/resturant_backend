import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { Product } from '../product/entities/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PaginationQueryDto, PaginatedResult } from '../common/dto/pagination.dto';
import { BillStatus } from '../common/enums/bill-status.enum';
export declare class OrderService {
    private orderRepository;
    private productRepository;
    constructor(orderRepository: Repository<Order>, productRepository: Repository<Product>);
    create(createOrderDto: CreateOrderDto, currentUser: any): Promise<{
        success: boolean;
        message: string;
        data: Order;
    }>;
    findAll(query: PaginationQueryDto, currentUser: any): Promise<PaginatedResult<any>>;
    findOne(id: number, currentUser: any): Promise<{
        success: boolean;
        data: Order;
    }>;
    update(id: number, updateOrderDto: UpdateOrderDto, currentUser: any): Promise<{
        success: boolean;
        message: string;
        data: Order;
    }>;
    remove(id: number, currentUser: any): Promise<{
        success: boolean;
        message: string;
    }>;
    updateBillStatus(id: number, billStatus: BillStatus, currentUser: any): Promise<{
        success: boolean;
        message: string;
        data: Order;
    }>;
}
