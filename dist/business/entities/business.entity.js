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
exports.Business = void 0;
const openapi = require("@nestjs/swagger");
const typeorm_1 = require("typeorm");
const subscription_status_enum_1 = require("../../common/enums/subscription-status.enum");
let Business = class Business {
    id;
    adminId;
    businessName;
    businessLogo;
    division;
    district;
    thana;
    area;
    subscription;
    subStartDate;
    subEndDate;
    createdAt;
    updatedAt;
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, adminId: { required: true, type: () => Number }, businessName: { required: true, type: () => String }, businessLogo: { required: true, type: () => String }, division: { required: true, type: () => String }, district: { required: true, type: () => String }, thana: { required: true, type: () => String }, area: { required: true, type: () => String }, subscription: { required: true, enum: require("../../common/enums/subscription-status.enum").SubscriptionStatus }, subStartDate: { required: true, type: () => Date, nullable: true }, subEndDate: { required: true, type: () => Date, nullable: true }, createdAt: { required: true, type: () => Date }, updatedAt: { required: true, type: () => Date } };
    }
};
exports.Business = Business;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Business.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Business.prototype, "adminId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Business.prototype, "businessName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Business.prototype, "businessLogo", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Business.prototype, "division", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Business.prototype, "district", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Business.prototype, "thana", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Business.prototype, "area", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: subscription_status_enum_1.SubscriptionStatus, default: subscription_status_enum_1.SubscriptionStatus.INACTIVE }),
    __metadata("design:type", String)
], Business.prototype, "subscription", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true, name: 'sub_start_date' }),
    __metadata("design:type", Object)
], Business.prototype, "subStartDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true, name: 'sub_end_date' }),
    __metadata("design:type", Object)
], Business.prototype, "subEndDate", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Business.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Business.prototype, "updatedAt", void 0);
exports.Business = Business = __decorate([
    (0, typeorm_1.Entity)('businesses')
], Business);
//# sourceMappingURL=business.entity.js.map