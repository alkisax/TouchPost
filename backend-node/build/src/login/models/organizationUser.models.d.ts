import mongoose from 'mongoose';
import type { IOrganizationUser } from '../types/organizationUser.types';
export declare const OrganizationUserModel: mongoose.Model<IOrganizationUser, {}, {}, {}, mongoose.Document<unknown, {}, IOrganizationUser, {}, mongoose.DefaultSchemaOptions> & IOrganizationUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IOrganizationUser>;
