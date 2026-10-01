import { z } from 'zod';
export declare const createAdminSchema: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodEmail>;
    organizationName: z.ZodString;
}, z.core.$strict>;
export declare const createStaffSchema: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodEmail>;
}, z.core.$strict>;
export declare const updateAdminSchema: z.ZodObject<{
    password: z.ZodOptional<z.ZodString>;
    username: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodEmail>;
}, z.core.$strict>;
export declare const updateStaffSchema: z.ZodObject<{
    password: z.ZodOptional<z.ZodString>;
    username: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodEmail>;
}, z.core.$strict>;
export declare const updateUserAdStatusSchema: z.ZodObject<{
    hasPaid: z.ZodBoolean;
    adFreeUntil: z.ZodOptional<z.ZodNullable<z.ZodCoercedDate<unknown>>>;
}, z.core.$strict>;
