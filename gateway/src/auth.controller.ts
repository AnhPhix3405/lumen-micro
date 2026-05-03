import { Body, Controller, Post } from "@nestjs/common";
import axios from "axios";

@Controller("auth")
export class AuthController {
    constructor() { }

    @Post("login")
    async login(@Body() body: any) {
        const result = await axios.post("http://localhost:3001/login", body);
        if (result.status == 200) {
            return { message: "Login successful" }
        }
        else {
            return result;
        }
    }
}