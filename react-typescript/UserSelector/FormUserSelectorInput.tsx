import React from "react";
import { withStyles } from "@material-ui/core";
import { Classes, ThemeType } from "@theme";
import { AvatarChip } from "@components";
import { UserFragment } from "@graphql";

type FormUserSelectorProps = {
  classes: Classes<typeof styles>;
  clearable?: boolean;
  onClick: () => void;
  onClear?: () => void;
  value: UserFragment | null;
};

const FormUserSelectorInput: React.FC<FormUserSelectorProps> = props => {
  const { value } = props;

  if (!value) {
    return (
      <div className={props.classes.root} onClick={props.onClick as any}>
        &nbsp;
      </div>
    );
  }

  return (
    <AvatarChip
      size="normal"
      name={value.Name}
      ChipProps={{ onDelete: props.onClear }}
      src={value.AvatarPic}
    />
  );
};

const styles = (theme: ThemeType) => ({
  root: {
    padding: "6px 0 5px",
    width: "100%"
  }
});

export default withStyles(styles)(FormUserSelectorInput);
