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
exports.CreateBusinessDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const subscription_status_enum_1 = require("../../common/enums/subscription-status.enum");
class CreateBusinessDto {
    businessName;
    businessLogo;
    division;
    district;
    thana;
    area;
    subscription;
    subStartDate;
    subEndDate;
    static _OPENAPI_METADATA_FACTORY() {
        return { businessName: { required: true, type: () => String }, businessLogo: { required: false, type: () => String }, division: { required: false, type: () => String }, district: { required: false, type: () => String }, thana: { required: false, type: () => String }, area: { required: false, type: () => String }, subscription: { required: false, enum: require("../../common/enums/subscription-status.enum").SubscriptionStatus }, subStartDate: { required: false, type: () => String }, subEndDate: { required: false, type: () => String } };
    }
}
exports.CreateBusinessDto = CreateBusinessDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Spice Garden Restaurant',
        description: 'Business/restaurant name',
    }),
    __metadata("design:type", String)
], CreateBusinessDto.prototype, "businessName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'https://example.com/logo.png',
        description: 'Business logo URL',
    }),
    __metadata("design:type", String)
], CreateBusinessDto.prototype, "businessLogo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Dhaka', description: 'Division name' }),
    __metadata("design:type", String)
], CreateBusinessDto.prototype, "division", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Dhaka', description: 'District name' }),
    __metadata("design:type", String)
], CreateBusinessDto.prototype, "district", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Gulshan',
        description: 'Thana/upazila name',
    }),
    __metadata("design:type", String)
], CreateBusinessDto.prototype, "thana", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Road 12, House 5',
        description: 'Area/address detail',
    }),
    __metadata("design:type", String)
], CreateBusinessDto.prototype, "area", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'active',
        description: 'Subscription status',
        enum: ['active', 'inactive'],
    }),
    __metadata("design:type", String)
], CreateBusinessDto.prototype, "subscription", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '2025-01-01',
        description: 'Subscription start date',
    }),
    __metadata("design:type", String)
], CreateBusinessDto.prototype, "subStartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '2026-01-01',
        description: 'Subscription end date',
    }),
    __metadata("design:type", String)
], CreateBusinessDto.prototype, "subEndDate", void 0);
//# sourceMappingURL=create-business.dto.js.map