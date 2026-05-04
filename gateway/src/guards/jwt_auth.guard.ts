import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { CanActivate } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import path from 'node:path';
import fs from 'node:fs';

@Injectable()
export class JwtAuthGuard implements CanActivate {

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        // Extract token from 'Authorization: Bearer <token>' header
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Bearer token not found');
        }

        const token = authHeader.split(' ')[1];

        try {
            // Verify token using the configured public key and RS256 algorithm
            // Attach decoded payload to request object for downstream use
            const publicKey = fs.readFileSync(path.join(process.cwd(), 'src/rs256key/public.pem'));
            const decoded = jwt.verify(token, publicKey);
            request.payload = decoded.payload;

            return true;
        } catch (error) {
            // Handle invalid or expired tokens
            console.log(error);
            throw new UnauthorizedException('Invalid token');
        }
    }
}   