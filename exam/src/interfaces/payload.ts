export interface TokenPayload {
    accountId: string;
    userId: string;
}

export interface BodyTokenPayload {
    payload: TokenPayload;
}