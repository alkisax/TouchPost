import { Document, Types } from 'mongoose';
export interface IOrganization extends Document {
    _id: Types.ObjectId;
    name: string;
    slug: string;
    stripeConnectedAccountId?: string;
    stripeOnboardingComplete?: boolean;
    hasPaid: boolean;
    adFreeUntil?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface OrganizationView {
    id: string;
    name: string;
    slug: string;
    hasPaid: boolean;
    adFreeUntil?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateOrganization {
    name: string;
    slug?: string;
}
export interface UpdateOrganization {
    name?: string;
}
