export interface TokenPayload {
    payload: {
        accountId: string;
        email: string;
        userId: string;
        role: string;
    };
    iat: number;
    exp: number;
}