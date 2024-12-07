import {
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Injectable,
  Logger,
} from '@nestjs/common';
import { catchError, Observable, tap } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP_REQUEST');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Extract request and response objects
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    // Generate a unique request ID
    const requestId = uuidv4();

    // Record current timestamp
    const now = Date.now();
    const white = '\x1b[35m';
    const reset = '\x1b[0m';
    // Determine if in production
    const isProduction =
      process.env.DB_HOST?.toLowerCase()?.includes('stage') ||
      process.env.NODE_ENV === 'local';

    // Construct log message
    const logMessage =
      `METHOD - ${req.method} | URL - ${req.url} | ` +
      (!isProduction
        ? ''
        : `QUERY - ${JSON.stringify(req.query)} | PARAMS - ${JSON.stringify(req.params)} | BODY - ${JSON.stringify(req.body)} `) +
      `${this.getColorizedStatusCode(res.statusCode)} ${Date.now() - now} ms`;

    // Handle the observable
    return next.handle().pipe(
      tap((data) => {
        // Log request details on success
        if (req.url) {
          this.logger.log(
            `${white}REQUEST ID - ${requestId} | URL - ${req.url}\n${reset}HEADERS - ${JSON.stringify(req.headers)}`,
          );
          this.logger.log(`${logMessage} | RESPONSE - ${JSON.stringify(data)}`);
        }
      }),
      catchError((error) => {
        // Log request details on error and rethrow the error
        if (req.url) {
          this.logger.log(
            `REQUEST ID - ${requestId} | URL - ${req.url}\nHEADERS - ${JSON.stringify(req.headers)}`,
          );
          this.logger.log(logMessage);
        }
        throw error;
      }),
    );
  }

  private getColorizedStatusCode(statusCode: number): string {
    // ANSI escape codes for colorization
    const yellow = '\x1b[36m';
    const reset = '\x1b[0m';

    return `${yellow}${statusCode}${reset}`;
  }
}
