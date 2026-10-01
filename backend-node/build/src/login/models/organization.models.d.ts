import mongoose from 'mongoose';
import type { IOrganization } from '../types/organization.types';
export declare const OrganizationModel: mongoose.Model<IOrganization, {}, {}, {}, mongoose.Document<unknown, {}, IOrganization, {}, mongoose.DefaultSchemaOptions> & IOrganization & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IOrganization>;
