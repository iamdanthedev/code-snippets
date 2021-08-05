import { TelemetryClient } from "applicationinsights";
import { inject, injectable } from "inversify";
import { IAILoggerConfig, IAILoggerConfigType } from "./IAILoggerConfig";
import { initAppInsights } from "./initAppInsights";

@injectable()
export class AppInsightsClientProvider {
  readonly client: TelemetryClient = null;

  constructor(@inject(IAILoggerConfigType) private config: IAILoggerConfig) {
    this.client = initAppInsights(config.instrumentationKey);
  }
}
