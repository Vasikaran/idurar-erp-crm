import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateToken(token: string): Promise<any> {
    try {
      return await this.jwtService.verifyAsync(token);
    } catch (error) {
      console.error('Token validation failed:', error);
      return null;
    }
  }

  decodeToken(token: string): Promise<any> {
    return this.jwtService.decode(token);
  }
}
