import { SMSService } from "~/AppService";
import { isEmpty } from "lodash";
import { last } from "~/common";
import * as DomainTypes from "~/Domain/types";
import { isSMSFailed, isSMSOk } from "./utils";
import { SMSDeliveryStatus, SMSMessageResolver, Query } from "../types";
import { Subscription } from "../../subscription/smsMessageUpdated";
import { SMSMessageRepository, UserRepository } from "~/Domain/repository";

const SMSMessage: SMSMessageResolver<DomainTypes.SMSMessage> = {
  _id: p => p._id,
  SentByRef: p => p.SentBy,
  SentOn: p => p.SentOn,
  From: p => p.From,
  To: p => p.To,
  Message: p => p.Message,

  Status: p =>
    isEmpty(p.StatusHistory) ? SMSDeliveryStatus.Unknown : last(p.StatusHistory).Status,

  StatusUpdatedOn: p => (isEmpty(p.StatusHistory) ? null : last(p.StatusHistory).Date),

  IsStatusFinal: p => {
    if (isEmpty(p.StatusHistory)) {
      return false;
    }

    const status = last(p.StatusHistory);

    return ![SMSDeliveryStatus.Pending, SMSDeliveryStatus.Unknown].includes(
      status.Status
    );
  },

  IsOk: p => {
    if (isEmpty(p.StatusHistory)) {
      return false;
    }

    const status = last(p.StatusHistory);

    return isSMSOk(status.Status);
  },

  IsFailed: p => {
    if (isEmpty(p.StatusHistory)) {
      return false;
    }

    const status = last(p.StatusHistory);

    return isSMSFailed(status.Status);
  },

  SentBy: (p, _, { container }) => {
    const userRepository = container.get(UserRepository);

    if (!p.SentBy) {
      return null;
    }

    return userRepository.findById(p.SentBy.PersonId, {}, { allowNotFound: true });
  }
};

const smsMessageById: Query.SmsMessageByIdResolver = async (_, args, { container }) => {
  const { id, refetchStatus } = args;

  if (refetchStatus) {
    await container.get(SMSService).updateStatus(id);
  }

  const smsMessageRepository = container.get(SMSMessageRepository);
  return smsMessageRepository.findById(args.id);
};

export default {
  SMSMessage,
  Subscription,
  Query: {
    smsMessageById
  }
};
