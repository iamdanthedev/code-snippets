import React from "react";
import { observer } from "mobx-react";
import {
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  FormControlLabel
} from "@material-ui/core";
import locale from "@locale";
import PrimaryButton from "@components/buttons/PrimaryButton";
import { UserSelectorStore } from "./UserSelectorStore";
import UserList from "./components/UserList";

type Props = {
  store: UserSelectorStore;
};

export const UserSelector = ({ store }: Props) => {
  return (
    <Dialog open={store.isUserSelectorOpen} onClose={store.close} data-test="UserList">
      <DialogContent>
        <UserList
          items={store.userList}
          onSelect={store.select}
          multi={store.multi}
          selectedUsers={store.selectedUsers}
          showDisabled={store.showDisabled}
        />
      </DialogContent>

      <DialogActions
        style={{ justifyContent: "center", paddingLeft: 24, paddingRight: 24 }}
      >
        <FormControlLabel
          label="Include disabled"
          control={<Checkbox onChange={(_, v) => (store.showDisabled = v)} />}
          style={{ marginRight: "auto" }}
        />

        {store.multi && (
          <PrimaryButton disabled={false} onClick={store.submit} type="submit">
            {locale.Save}
          </PrimaryButton>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default observer(UserSelector);
