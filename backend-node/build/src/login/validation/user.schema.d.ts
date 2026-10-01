import { z } from 'zod';
export declare const createUserSchema: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodEmail>;
    globalRoles: z.ZodOptional<z.ZodArray<z.ZodEnum<{
        SUPERADMIN: "SUPERADMIN";
    }>>>;
}, z.core.$strip>;
export declare const updateUserSchema: z.ZodObject<{
    username: z.ZodOptional<z.ZodString>;
    password: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodEmail>;
    globalRoles: z.ZodOptional<z.ZodArray<z.ZodEnum<{
        SUPERADMIN: "SUPERADMIN";
    }>>>;
}, z.core.$strip>;
export declare const deleteSelfAdminSchema: z.ZodObject<{
    password: z.ZodString;
}, z.core.$strict>;
export declare const updateRoleSchema: z.ZodObject<{
    role: z.ZodEnum<{
        ADMIN: "ADMIN";
        STAFF: "STAFF";
        USER: "USER";
    }>;
}, z.core.$strict>;
