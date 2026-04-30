import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { CanActivate } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

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
      const decoded = this.jwtService.verify(token);
      
      // Attach decoded payload to request object for downstream use
      request.user = decoded;
      
      return true;
    } catch (error) {
      // Handle invalid or expired tokens
      console.log(error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}   