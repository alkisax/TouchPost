export declare const deleteSelfAdminService: {
    deleteAdminAccountCascade: (userId: string, password?: string) => Promise<void>;
    deleteSelfAccount: (userId: string, password: string) => Promise<void>;
};
