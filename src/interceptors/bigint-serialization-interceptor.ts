import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable()
export class BigIntSerializationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (data === undefined) return undefined;
        return JSON.parse(
          JSON.stringify(data, (_, value) =>
            typeof value === "bigint" ? value.toString() : value,
          ),
        );
      }),
    );
  }
}
