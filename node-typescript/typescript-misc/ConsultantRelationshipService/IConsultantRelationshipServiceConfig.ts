export const IConsultantRelationshipServiceConfigType =
  "IConsultantRelationshipServiceConfig";

export interface IConsultantRelationshipServiceConfig {
  warnIfNotContactedLongerThanDays: number;
  warnDueDays: number;
  warnDueHour: number;
  deassignConsultantAfterMonths: number;
  warnDeAssignConsultantBeforeDays: number;
  startDeassigningSince: Date | null;
}
