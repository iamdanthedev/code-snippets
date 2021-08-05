import { SMSDeliveryStatus } from "../types";

export const failSMSStatuses = [
  SMSDeliveryStatus.Rejected,
  SMSDeliveryStatus.Expired,
  SMSDeliveryStatus.Error
];

export const successSMSStatuses = [SMSDeliveryStatus.Delivered];

export function isSMSOk(status: SMSDeliveryStatus) {
  return successSMSStatuses.includes(status);
}

export function isSMSFailed(status: SMSDeliveryStatus) {
  return failSMSStatuses.includes(status);
}
