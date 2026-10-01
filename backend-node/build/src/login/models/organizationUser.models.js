"use strict";
// backend/src/login/models/organizationUser.models.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationUserModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const organizationUserSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    organizationId: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true,
    },
    role: {
        type: String,
        enum: ['ADMIN', 'STAFF'],
        required: true,
        index: true,
    },
}, {
    collection: 'OrganizationUsers',
    timestamps: true,
});
// Ένας user μπορεί να έχει μόνο μία σχέση με το ίδιο organization
organizationUserSchema.index({ userId: 1 }, { unique: true });
exports.OrganizationUserModel = mongoose_1.default.model('OrganizationUser', organizationUserSchema);
//# sourceMappingURL=organizationUser.models.js.map