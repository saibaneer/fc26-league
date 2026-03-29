import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const pin = request.headers['x-admin-pin'];
    const adminPin = this.config.get<string>('ADMIN_PIN');

    if (!adminPin) return true; // no PIN set = open access
    if (pin === adminPin) return true;

    throw new UnauthorizedException('Invalid admin PIN');
  }
}
