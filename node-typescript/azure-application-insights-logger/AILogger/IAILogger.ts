import { Request, Response } from "express";
import { TelemetryClient } from "applicationinsights";

export const IAILoggerType = Symbol("IAILogger");

export interface IAILogger {
  client: TelemetryClient;
  traceError(error: Error, message?: string, properties?: Record<string, any>);
  traceInfo(message: string, properties?: Record<string, any>);
  traceWarning(message: string, properties?: Record<string, any>);
  trackEvent(name: string, properties?: Record<string, any>);
  trackMetric(name: string, value: number);
  trackRequest(
    req: Request,
    res: Response,
    error?: any,
    properties?: Record<string, any>
  );
}
