export interface AppError extends Error {
    statusCode: number;
}
export declare class NotFoundError extends Error implements AppError {
    statusCode: number;
    constructor(message: string);
}
export declare class ValidationError extends Error implements AppError {
    statusCode: number;
    constructor(message: string);
}
export declare class DatabaseError extends Error implements AppError {
    statusCode: number;
    constructor(message: string);
}
export declare class BadRequestError extends Error implements AppError {
    statusCode: number;
    constructor(message: string);
}
export declare class EmbeddingError extends Error {
    status: number;
    constructor(message: string);
}
