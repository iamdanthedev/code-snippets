import { inject, injectable, optional } from "inversify";
import { Request, Response } from "express";
import debug from "debug";
import { SeverityLevel } from "applicationinsights/out/Declarations/Contracts/Generated";
import { IAILogger } from "./IAILogger";
import { AppInsightsClientProvider } from "./AppInsightsClientProvider";
import { IOperationContext, IOperationContextType } from "~/common/interface";

const log = debug("app:AILogger");

type Props = Record<string, any>;

@injectable()
export class AILogger implements IAILogger {
  constructor(
    @inject(AppInsightsClientProvider) private clientProvider: AppInsightsClientProvider,
    @inject(IOperationContextType) @optional() private opCtx: IOperationContext | null
  ) {}

  get client() {
    return this.clientProvider.client;
  }

  traceInfo(message: string, properties?: Props) {
    log("traceInfo", message, properties);

    if (!this.client) {
      return;
    }

    this.client.trackTrace({
      message,
      properties,
      tagOverrides: this.getTagOverrides()
    });
  }

  traceError(error: Error, message?: string, properties?: Props) {
    log("traceError", message, properties);

    console.error(error);

    if (!this.client) {
      return;
    }

    this.client.trackException({
      exception: error,
      properties: {
        message,
        ...properties
      },
      tagOverrides: this.getTagOverrides()
    });
  }

  traceWarning(message: string, properties?: Props) {
    log("traceWarning", message, properties);

    if (!this.client) {
      return;
    }

    this.client.trackTrace({
      message,
      properties,
      severity: SeverityLevel.Error,
      tagOverrides: this.getTagOverrides()
    });
  }

  trackEvent(name: string, properties?: Props) {
    // log("trackEvent %s %o", name, properties);

    if (!this.client) {
      return;
    }

    this.client.trackEvent({
      name,
      properties,
      tagOverrides: this.getTagOverrides()
    });
  }

  trackRequest(req: Request, res: Response, error?: any, properties?: Props) {
    // log("trackRequest", req.url);

    if (!this.client) {
      return;
    }

    this.client.trackNodeHttpRequest({
      request: req,
      response: res,
      error,
      properties
    });
  }

  trackMetric(name: string, value: number) {
    log("trackMetric", name, value);

    if (!this.client) {
      return;
    }

    this.client.trackMetric({
      name,
      time: new Date(),
      value
    });
  }

  private getTagOverrides() {
    if (!this.opCtx) {
      return null;
    }

    return {
      ["ai.operation.id"]: this.opCtx.operationId,
      ["ai.operation.parentId"]: this.opCtx.parentOperationId
    };
  }
}
