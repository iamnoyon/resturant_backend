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
exports.PaginationQueryDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
class PaginationQueryDto {
    page;
    limit;
    search;
    categoryId;
    sortBy;
    sortOrder;
    static _OPENAPI_METADATA_FACTORY() {
        return { page: { required: false, type: () => Number }, limit: { required: false, type: () => Number }, search: { required: false, type: () => String }, categoryId: { required: false, type: () => Number }, sortBy: { required: false, type: () => String }, sortOrder: { required: false, enum: ["DESC", "ASC"] } };
    }
}
exports.PaginationQueryDto = PaginationQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 1,
        description: 'Page number (starts from 1)',
        default: 1,
    }),
    __metadata("design:type", Number)
], PaginationQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 10,
        description: 'Number of items per page',
        default: 10,
    }),
    __metadata("design:type", Number)
], PaginationQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'beverage', description: 'Search term' }),
    __metadata("design:type", String)
], PaginationQueryDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1, description: 'Filter by category ID' }),
    __metadata("design:type", Number)
], PaginationQueryDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'createdAt',
        description: 'Field to sort by',
    }),
    __metadata("design:type", String)
], PaginationQueryDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'DESC',
        description: 'Sort order',
        enum: ['ASC', 'DESC'],
        default: 'DESC',
    }),
    __metadata("design:type", String)
], PaginationQueryDto.prototype, "sortOrder", void 0);
//# sourceMappingURL=pagination.dto.js.map