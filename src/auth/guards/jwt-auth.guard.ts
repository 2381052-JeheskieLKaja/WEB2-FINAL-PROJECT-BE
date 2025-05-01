import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('masuk sini 1');
    const request = context.switchToHttp().getRequest();

    if (['/api/auth/login', '/api/auth/register'].includes(request.url)) {
      return true;
    }
    // udah jes lu lupa taro ini wkwk , udah beda error nya ini skrg error di relation database nya, coba login error gaksama test endpoont lain expected gak? //mksdnya gimana bang
    // ini error nya udah beda jes bukan error not authorized lagi, ini lebih ke error relation ke db, nih gua kasi liat

    const token = this.extractTokenFromHeader(request);
    console.log('masuk ada tokennya => ', token);

    // gak ada tokennya jes, dan harusny klo register gk usah pake guard
    // cara hapusnya gimana bang
    // hapus dari routernya register
    // wait gua ciba liat
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
