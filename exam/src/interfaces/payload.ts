export interface TokenPayload {
    accountId: string;
    userId: string;
    role?: string;
}

export interface BodyTokenPayload {
    payload: TokenPayload;
}