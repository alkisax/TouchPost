"use strict";
// backend/src/login/models/users.models.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const userSchema = new Schema({
    username: {
        type: String,
        required: [true, 'username is required'],
        unique: true,
        trim: true,
    },
    name: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        unique: true,
        sparse: true, // επιτρέπει πολλα null
        trim: true,
        lowercase: true,
    },
    globalRoles: {
        type: [String],
        enum: ['SUPERADMIN'],
        default: [],
        required: true,
        index: true,
    },
    hashedPassword: {
        type: String,
        required: [true, 'password is required'],
    },
}, {
    collection: 'Users',
    timestamps: true,
});
exports.UserModel = mongoose_1.default.model('User', userSchema);
//# sourceMappingURL=users.models.js.map