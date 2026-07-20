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
exports.CreateOrderDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const bill_status_enum_1 = require("../../common/enums/bill-status.enum");
class CreateOrderDto {
    tableId;
    products;
    totalBill;
    discount;
    subTotal;
    billStatus;
}
exports.CreateOrderDto = CreateOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'Table ID reference' }),
    __metadata("design:type", Number)
], CreateOrderDto.prototype, "tableId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: [{ productId: 1, quantity: 2 }],
        description: 'Array of products with quantities',
    }),
    __metadata("design:type", Array)
], CreateOrderDto.prototype, "products", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 500.0,
        description: 'Total bill amount before discount',
    }),
    __metadata("design:type", Number)
], CreateOrderDto.prototype, "totalBill", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 50.0, description: 'Discount amount' }),
    __metadata("design:type", Number)
], CreateOrderDto.prototype, "discount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 450.0, description: 'Sub-total after discount' }),
    __metadata("design:type", Number)
], CreateOrderDto.prototype, "subTotal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'unpaid',
        description: 'Bill payment status',
        enum: ['unpaid', 'paid'],
    }),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "billStatus", void 0);
//# sourceMappingURL=create-order.dto.js.map