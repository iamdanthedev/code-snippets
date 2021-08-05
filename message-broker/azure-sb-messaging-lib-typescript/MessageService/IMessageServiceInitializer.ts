export const IMessageServiceInitializerType = Symbol("IMessageServiceInitializerType");

export interface IMessageServiceInitializer {
  init(): Promise<any>;
}
