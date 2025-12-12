import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy } from 'passport-http';
import { ConfigService } from '@nestjs/config';

/**
 * Basic Authentication Strategy
 * Validates API credentials for trusted external systems
 */
@Injectable()
export class BasicAuthStrategy extends PassportStrategy(BasicStrategy) {
  constructor(private configService: ConfigService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    // Get credentials from environment variables
    const validUsername = this.configService.get<string>('OPENAPI_USERNAME') || '3partner';
    const validPassword = this.configService.get<string>('OPENAPI_PASSWORD') || '3partnerPassword';

    if (username === validUsername && password === validPassword) {
      return { username, type: 'openapi' };
    }

    throw new UnauthorizedException('Invalid API credentials');
  }
}

