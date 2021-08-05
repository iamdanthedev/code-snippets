import * as Domain from "~/Domain/types";
import { UserRef } from "~/Domain/ref";
import { FavouriteListRepository, UserRepository } from "~/Domain/repository";
import * as Gen from "../types";
import { InvalidUserInputError } from "~/common/errors";
import {
  ISubscriptionEmitter,
  ISubscriptionEmitterType
} from "~/MessageHandlers/interface/ISubscriptionEmitter";
import { NotificationService } from "~/AppService";

class OpResult {
  constructor(public callList: Domain.FavouriteList) {}
}

const Query: Gen.Query.Resolvers<Domain.User> = {
  callListById: async (_, args, { container }) => {
    const { id } = args;
    const favouriteListRepository = container.get(FavouriteListRepository);
    const list = await favouriteListRepository.findById(id);

    return new OpResult(list);
  }
};

const Mutation: Gen.Mutation.Resolvers<Domain.User> = {
  createCallList: async (_, args, { container, userProfile }) => {
    const { type, data } = args;
    const favouriteListRepository = container.get(FavouriteListRepository);

    let list: Domain.FavouriteList;

    if (type === Gen.CallListType.CallList) {
      list = Domain.FavouriteList.createCallList(
        data.Name,
        UserRef.FromUserContext(userProfile),
        data.Nodes
      );
    }

    if (type === Gen.CallListType.ContactList) {
      list = Domain.FavouriteList.createContactList(
        data.Name,
        UserRef.FromUserContext(userProfile),
        data.Nodes
      );
    }

    if (!list) {
      throw new InvalidUserInputError("invalid call list type");
    }

    const result = await favouriteListRepository.insertOne(list);

    return new OpResult(result);
  },

  addToCallList: async (_, args, { container }) => {
    const { callListId, node: nodeRef } = args;
    const favouriteListRepository = container.get(FavouriteListRepository);

    const list = await favouriteListRepository.findById(callListId);
    list.Nodes = [...list.Nodes, nodeRef].uniqueBy(x => x.NodeID.toHexString());
    const result = await favouriteListRepository.updateOne(callListId, list);
    return new OpResult(result);
  },

  removeFromCallList: async (_, args, { container }) => {
    const { callListId, nodeId } = args;
    const favouriteListRepository = container.get(FavouriteListRepository);

    const list = await favouriteListRepository.findById(callListId);
    list.Nodes.remove(x => x.NodeID.equals(nodeId));
    const result = await favouriteListRepository.updateOne(callListId, list);

    return new OpResult(result);
  },

  renameCallList: async (_, args, { container }) => {
    const { callListId, newName } = args;
    const favouriteListRepository = container.get(FavouriteListRepository);

    const list = await favouriteListRepository.findById(callListId);
    list.Name = newName;
    const result = await favouriteListRepository.updateOne(callListId, list);
    return new OpResult(result);
  },

  leaveCallList: async (_, args, { container, userProfile }) => {
    const { callListId } = args;
    const favouriteListRepository = container.get(FavouriteListRepository);

    const list = await favouriteListRepository.findById(callListId);
    list.Members.remove(x => x.PersonId.equals(userProfile._id));
    if (list.Members.length === 0) {
      list.Deleted = true;
    }
    const result = await favouriteListRepository.updateOne(callListId, list);
    return new OpResult(result);
  },

  setCallListMembers: async (_, args, { container, userProfile }) => {
    const { callListId, userIds } = args;
    const favouriteListRepository = container.get(FavouriteListRepository);
    const userRepository = container.get(UserRepository);

    const list = await favouriteListRepository.findById(callListId);

    const userRefs = await userRepository.getUserRefs(userIds);
    const finalMembers = [UserRef.FromUserContext(userProfile), ...userRefs].uniqueBy(x =>
      x.PersonId.toHexString()
    );
    const oldMembers = list.Members;

    list.Members = finalMembers;
    const result = await favouriteListRepository.updateOne(callListId, list);

    const assignedMembers = finalMembers.filter(
      x => !oldMembers.any(y => y.PersonId.equals(x.PersonId))
    );

    const deassignedMembers = oldMembers.filter(
      x => !finalMembers.any(y => y.PersonId.equals(x.PersonId))
    );

    const affectedMembers = [...assignedMembers, ...deassignedMembers].uniqueBy(x =>
      x.PersonId.toHexString()
    );

    if (affectedMembers.length > 0) {
      const emitter = container.get<ISubscriptionEmitter>(ISubscriptionEmitterType);

      const promises = affectedMembers.map(member =>
        emitter.myProfileUpdated(
          {
            updated: [
              list.ListType === Domain.FavouriteListType.ContactList
                ? "contactLists"
                : "callLists"
            ]
          },
          { userId: member.PersonId }
        )
      );

      await Promise.all(promises);
    }

    if (assignedMembers.length > 0) {
      const notificationService = container.get(NotificationService);
      assignedMembers.forEach(member => {
        const message = `${userProfile.displayName} shared a call list ${list.Name} with you`;
        notificationService.notify(member.PersonId, message, null, {
          sms: false,
          web: true
        });
      });
    }

    if (deassignedMembers.length > 0) {
      const notificationService = container.get(NotificationService);
      deassignedMembers.forEach(member => {
        const message = `${userProfile.displayName} hid a call list ${list.Name} from you`;
        notificationService.notify(member.PersonId, message, null, {
          sms: false,
          web: true
        });
      });
    }

    return new OpResult(result);
  }
};

export default {
  Query,
  Mutation
};
