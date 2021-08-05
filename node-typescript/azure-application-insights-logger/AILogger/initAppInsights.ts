import * as appInsights from "applicationinsights";

export function initAppInsights(instrKey: string, samplingPercentage?: number) {
  if (appInsights.defaultClient) {
    return appInsights.defaultClient;
  }

  const internalLogging = process.env.NODE_ENV !== "production";

  appInsights
    .setup(instrKey)
    .setInternalLogging(false, internalLogging)
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(false)
    .setAutoCollectPerformance(true)
    .setAutoCollectExceptions(false)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true, true)
    .setUseDiskRetryCaching(true)
    .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C)
    .start();

  appInsights.defaultClient.addTelemetryProcessor((envelope, contextObjects) => {
    if (envelope.data.baseType === "MessageData") {
      envelope.sampleRate = 5;
    }

    if (envelope.data.baseType === "RemoteDependencyData") {
      envelope.sampleRate = 5;
    }

    return true;
  });

  if (typeof samplingPercentage === "number") {
    appInsights.defaultClient.config.samplingPercentage = samplingPercentage;
  }

  return appInsights.defaultClient;
}
