import { action, computed, observable, toJS } from "mobx";
import debug from "debug";
import { Store } from "@store";
import { stringNormalize } from "~/common/stringNormalize";
import locale from "@locale";
import { SetCallListMembrs } from "@graphql";

const log = debug("app:store:UserSelectorStore");

type OnSelectCallback = (userId: string) => void;
type OnCancelCallback = () => void;

type OpenUserSelectorOptions = {
  includeActiveUser?: boolean;
  includeEmpty?: boolean;
  listId?: string;
  multi?: boolean;
  onCancel?: OnCancelCallback;
  onSelect: OnSelectCallback;
  excludeNonAdUsers?: boolean;
  removeDisabled?: boolean;
  selectedUsers?: string[];
};

export class UserSelectorStore {
  @observable private _isUserSelectorOpen = false;
  @observable private options: OpenUserSelectorOptions | null = null;
  @observable private _selectedUsers = [];

  @observable showDisabled = false;

  constructor(public readonly rootStore: Store) {}

  /**
   * USER SELECTOR DIALOG
   */
  @computed get isUserSelectorOpen() {
    return this._isUserSelectorOpen;
  }

  @computed get userList() {
    const { cache, user } = this.rootStore;

    let allUsers = this.options?.removeDisabled
      ? cache.allUsers.filter(x => x.Enabled)
      : cache.allUsers;

    if (this.options?.excludeNonAdUsers) {
      allUsers = allUsers.filter(x => !!x.AzureId);
    }

    const users = allUsers
      .filter(
        item =>
          (this.options && this.options.includeActiveUser) ||
          item._id !== user.myProfile._id
      )
      .map(u => ({
        enabled: u.Enabled,
        label: u.Name,
        value: u._id,
        search: stringNormalize(`${u.Name}${u.Email}${u.Teams.join("")}`).toLowerCase(),
        teams: u.Teams,
        style: { opacity: u.Enabled ? 1 : 0.5, paddingLeft: 8 }
      }));

    if (this.options && toJS(this.options).includeEmpty) {
      users.unshift({
        enabled: true,
        value: null,
        label: locale.Nobody,
        teams: [""],
        search: locale.Nobody,
        style: null
      });
    }

    return [""]
      .concat(cache.teams.map(x => x.Name))
      .sortBy(x => x)
      .map(team => ({
        team,
        users: users.sortBy(x => x.label).filter(u => u.teams.includes(team))
      }));
  }

  @computed get selectedUsers() {
    return this._selectedUsers;
  }

  @computed get multi() {
    return Boolean(this.options && this.options.multi);
  }

  @action.bound updateSelectedUsers = user => {
    if (this._selectedUsers.includes(user)) {
      const idxEl = this._selectedUsers.indexOf(user);
      this._selectedUsers.splice(idxEl, 1);
    } else {
      this._selectedUsers.push(user);
    }
  };

  @action.bound open(options: OpenUserSelectorOptions) {
    this.options = options;
    this._isUserSelectorOpen = true;
    this._selectedUsers = options.selectedUsers;
  }

  @action.bound close() {
    this._isUserSelectorOpen = false;

    this.options.onCancel && this.options.onCancel();
    this.options = null;
  }

  @action.bound submit() {
    // todo: activate spinner
    SetCallListMembrs.func({
      callListId: this.options.listId,
      userIds: this.selectedUsers
    })
      .then(data => {
        this.close();
      })
      .catch(e => {
        this.rootStore.snackbars.error(`Cannot add item to call list\nReason: ${e}`);
      });
  }

  @action.bound select(userId: string) {
    log("select", this.options.onSelect, userId);
    if (!this.options.onSelect) {
      return;
    }

    this.options.onSelect(userId);

    if (!this.options.multi) {
      this.close();
    }
  }
}
