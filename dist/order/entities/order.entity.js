"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const openapi = require("@nestjs/swagger");
const typeorm_1 = require("typeorm");
const bill_status_enum_1 = require("../../common/enums/bill-status.enum");
const business_entity_1 = require("../../business/entities/business.entity");
const table_entity_1 = require("../../table/entities/table.entity");
let Order = class Order {
    id;
    orderId;
    tableId;
    table;
    products;
    totalBill;
    discount;
    subTotal;
    billStatus;
    businessId;
    business;
    waiterId;
    createdBy;
    updatedBy;
    createdAt;
    updatedAt;
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, orderId: { required: true, type: () => String }, tableId: { required: true, type: () => Number }, table: { required: true, type: () => require("../../table/entities/table.entity").Table }, products: { required: true, type: () => [({ productId: { required: true, type: () => Number }, quantity: { required: true, type: () => Number } })] }, totalBill: { required: true, type: () => Number }, discount: { required: true, type: () => Number }, subTotal: { required: true, type: () => Number }, billStatus: { required: true, enum: require("../../common/enums/bill-status.enum").BillStatus }, businessId: { required: true, type: () => Number }, business: { required: true, type: () => require("../../business/entities/business.entity").Business }, waiterId: { required: true, type: () => Number }, createdBy: { required: true, type: () => Number }, updatedBy: { required: true, type: () => Number }, createdAt: { required: true, type: () => Date }, updatedAt: { required: true, type: () => Date } };
    }
};
exports.Order = Order;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Order.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Order.prototype, "orderId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Order.prototype, "tableId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => table_entity_1.Table),
    (0, typeorm_1.JoinColumn)({ name: 'tableId' }),
    __metadata("design:type", table_entity_1.Table)
], Order.prototype, "table", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], Order.prototype, "products", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Order.prototype, "totalBill", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Order.prototype, "discount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Order.prototype, "subTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: bill_status_enum_1.BillStatus, default: bill_status_enum_1.BillStatus.UNPAID }),
    __metadata("design:type", String)
], Order.prototype, "billStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Order.prototype, "businessId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => business_entity_1.Business, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'businessId' }),
    __metadata("design:type", business_entity_1.Business)
], Order.prototype, "business", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Order.prototype, "waiterId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Order.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Order.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Order.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Order.prototype, "updatedAt", void 0);
exports.Order = Order = __decorate([
    (0, typeorm_1.Entity)('orders')
], Order);
//# sourceMappingURL=order.entity.js.map