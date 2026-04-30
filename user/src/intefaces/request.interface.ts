import { IToken } from "./token.interface";

export interface RequestWithPayload extends Request {
    payload: IToken;
}
