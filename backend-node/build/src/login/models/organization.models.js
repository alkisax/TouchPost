"use strict";
// backend/src/login/models/organization.models.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const organizationSchema = new Schema({
    name: {
        type: String,
        required: [true, 'organization name is required'],
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },
    stripeConnectedAccountId: {
        type: String,
        required: false,
    },
    stripeOnboardingComplete: {
        type: Boolean,
        required: false,
        default: false,
    },
    hasPaid: {
        type: Boolean,
        default: false,
        required: true,
    },
    adFreeUntil: {
        type: Date,
    },
}, {
    collection: 'Organizations',
    timestamps: true,
});
exports.OrganizationModel = mongoose_1.default.model('Organization', organizationSchema);
//# sourceMappingURL=organization.models.js.map