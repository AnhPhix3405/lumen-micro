import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import axios from "axios";
import { JwtAuthGuard } from "./guards/jwt_auth.guard";

@Controller("user")
export class UserController {
    constructor() { }
    @Post("follow")
    @UseGuards(JwtAuthGuard)
    async follow(@Body() body: any) {
        const result = await axios.post("http://localhost:3001/follow", body);
        return result;
    }
}