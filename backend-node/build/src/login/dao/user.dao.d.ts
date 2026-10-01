import type { IUser, UserView, CreateUserHash, UpdateUser, GlobalRole, UpdateUserProfile } from "../types/user.types";
export declare const userDAO: {
    toUserDAO: (user: IUser) => UserView;
    create: (userData: CreateUserHash) => Promise<UserView>;
    readAll: () => Promise<UserView[]>;
    readById: (userId: string) => Promise<UserView>;
    readByUsername: (username: string) => Promise<IUser | null>;
    readByEmail: (email: string) => Promise<IUser | null>;
    update: (userId: string, userData: UpdateUser) => Promise<UserView>;
    updateProfile: (userId: string, userData: UpdateUserProfile) => Promise<UserView>;
    updateGlobalRolesById: (userId: string, globalRoles: GlobalRole[]) => Promise<UserView>;
    deleteById: (userId: string) => Promise<UserView>;
};
