export interface TokenPayload {
    payload: {
        accountId: string;
        email: string;
        userId: string;
    };
    iat: number;
    exp: number;
}