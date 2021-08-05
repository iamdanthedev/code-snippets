import React, { Component } from "react";
import { Observer } from "mobx-react";
import VirtualList from "react-tiny-virtual-list";
import {
  Checkbox,
  Input,
  InputAdornment,
  ListItemText,
  MenuItem,
  withStyles
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";

import { stringNormalize } from "~/common";
import { Classes, ThemeType } from "@theme";
import Highlighter from "@components/Highlighter";
import UserAvatar from "@containers/UserAvatar";

type Props = {
  classes: Classes<typeof styles>;
  items: Array<{
    team: string;
    users: Array<{
      enabled: boolean;
      label: string;
      value: string;
      search: string;
      style?: React.CSSProperties;
    }>;
  }>;
  onSelect: (value: string) => any;
  multi: boolean;
  selectedUsers: string[];
  showDisabled: boolean;
};

type State = {
  search: string;
};

class UserList extends Component<Props, State> {
  state: State = { search: "" };

  render() {
    const { classes, items, onSelect, selectedUsers, multi } = this.props;
    const { search } = this.state;
    const normalized = stringNormalize(search.toLowerCase());
    const filteredItems = items
      .map(g => ({
        ...g,
        users: g.users
          .filter(u => u.search.includes(normalized))
          .filter(x => (this.props.showDisabled ? true : x.enabled))
      }))
      .filter(g => g.users.any());

    const height = // 96 - margin dialog - 48 padding; 32 - height of search - 50px - height of DialogActions -2 (I don't know from where it is)
      window.innerHeight > 1000
        ? window.innerHeight * 0.75
        : window.innerHeight - 96 - 48 - 32 - 50 - 2;

    return (
      <div className={classes.root}>
        <Input
          autoFocus
          fullWidth
          onChange={e => this.setState({ search: e.target.value })}
          placeholder="Search..."
          startAdornment={
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          }
          value={search}
        />

        <div>
          <VirtualList
            width="100%"
            height={height}
            className={classes.virtualList}
            itemCount={filteredItems.length}
            itemSize={index => (filteredItems[index].users.length + 1) * 48} // Also supports variable heights (array or function getter)
            renderItem={({ index, style }) => {
              const group = filteredItems[index];

              return (
                <div key={index} style={style}>
                  <div key={group.team}>
                    {group.team && (
                      <MenuItem style={{ pointerEvents: "none" }} key={group.team}>
                        <ListItemText classes={{ primary: classes.header }}>
                          <Highlighter search={search}>{group.team}</Highlighter>
                        </ListItemText>
                      </MenuItem>
                    )}

                    {group.users.map(item => (
                      <MenuItem
                        data-test="UserListItem"
                        data-test-id={item.label}
                        disableGutters
                        className={classes.item}
                        key={item.value}
                        value={item.value}
                        onClick={() => {
                          onSelect && onSelect(item.value);
                        }}
                      >
                        {multi && (
                          <Observer>
                            {() => (
                              <Checkbox
                                checked={selectedUsers.includes(item.value)}
                                className={classes.checkbox}
                              />
                            )}
                          </Observer>
                        )}

                        <UserAvatar id={item.value} size="mini" />

                        <ListItemText style={item.style}>
                          <Highlighter search={search}>{item.label}</Highlighter>
                        </ListItemText>
                      </MenuItem>
                    ))}
                  </div>
                </div>
              );
            }}
          />
        </div>
      </div>
    );
  }
}

const styles = (theme: ThemeType) => ({
  root: {
    minWidth: 300
  },
  header: {
    fontWeight: theme.fontWeight.xBold
  },
  virtualList: {
    paddingBottom: 0
  },
  checkbox: {
    margin: "-16px 0"
  },
  item: {
    height: ["auto", "!important"]
  }
});

export default withStyles(styles as any)(UserList);
