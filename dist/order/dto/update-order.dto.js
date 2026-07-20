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
exports.UpdateOrderDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const bill_status_enum_1 = require("../../common/enums/bill-status.enum");
class UpdateOrderDto {
    tableId;
    products;
    totalBill;
    discount;
    subTotal;
    billStatus;
}
exports.UpdateOrderDto = UpdateOrderDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 2, description: 'Table ID reference' }),
    __metadata("design:type", Number)
], UpdateOrderDto.prototype, "tableId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: [{ productId: 1, quantity: 2 }],
        description: 'Array of products with quantities',
    }),
    __metadata("design:type", Array)
], UpdateOrderDto.prototype, "products", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 600.0, description: 'Total bill amount' }),
    __metadata("design:type", Number)
], UpdateOrderDto.prototype, "totalBill", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 30.0, description: 'Discount amount' }),
    __metadata("design:type", Number)
], UpdateOrderDto.prototype, "discount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 570.0,
        description: 'Sub-total after discount',
    }),
    __metadata("design:type", Number)
], UpdateOrderDto.prototype, "subTotal", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'paid',
        description: 'Bill payment status',
        enum: ['unpaid', 'paid'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(bill_status_enum_1.BillStatus),
    __metadata("design:type", String)
], UpdateOrderDto.prototype, "billStatus", void 0);
//# sourceMappingURL=update-order.dto.js.map