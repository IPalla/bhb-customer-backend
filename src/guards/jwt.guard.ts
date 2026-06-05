import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Reflector } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { Customer } from "src/model/models";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { IS_ADMIN_KEY } from "../decorators/admin.decorator";
import { IS_ADMIN_OR_JWT_KEY } from "../decorators/admin-or-jwt.decorator";

@Injectable()
export class JwtGuard implements CanActivate {
  private readonly adminApiKey: string;

  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private configService: ConfigService,
  ) {
    this.adminApiKey = this.configService.getOrThrow<string>("close.apiKey");
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const isAdmin = this.reflector.getAllAndOverride<boolean>(IS_ADMIN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isAdmin) {
      const key = request.headers["x-api-key"];
      if (key !== this.adminApiKey) {
        throw new UnauthorizedException("Invalid API key");
      }
      return true;
    }

    const adminOrJwt = this.reflector.getAllAndOverride<boolean>(
      IS_ADMIN_OR_JWT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (adminOrJwt) {
      const key = request.headers["x-api-key"];
      if (key === this.adminApiKey) {
        return true;
      }
    }

    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException(
        "Missing or invalid authorization header",
      );
    }

    const token = authHeader.split(" ")[1];

    try {
      const payload = await this.jwtService.verifyAsync(token);
      request.user = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException("Invalid token");
    }
  }
}

export interface RequestWithUser extends Request {
  user: {
    customer: Customer;
  };
}
