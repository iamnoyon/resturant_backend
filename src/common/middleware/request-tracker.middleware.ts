import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { HealthService } from '../../health/health.service';

@Injectable()
export class RequestTrackerMiddleware implements NestMiddleware {
  constructor(private readonly healthService: HealthService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    this.healthService.incrementActiveRequests();

    res.on('finish', () => {
      const duration = Date.now() - start;
      this.healthService.decrementActiveRequests();
      this.healthService.incrementRequestCount();
      this.healthService.addResponseTime(duration);

      if (res.statusCode >= 400) {
        this.healthService.incrementErrorCount();
      }
    });

    next();
  }
}
