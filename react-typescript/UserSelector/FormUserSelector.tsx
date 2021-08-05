import React from "react";
import cns from "classnames";
import {
  FormControl,
  Input,
  InputLabel,
  FormHelperText,
  withStyles
} from "@material-ui/core";
import { InputProps } from "@material-ui/core/Input";
import { UserFragment } from "@graphql";
import locale from "@locale";
import { Classes, ThemeType } from "@theme";
import { store } from "@store";
import { RegularButton } from "@components";
import FormUserSelectorInput from "./FormUserSelectorInput";

type Props = {
  classes: Classes<typeof styles>;
  className?: string;
  clearable?: boolean;
  disabled?: boolean;
  error?: boolean;
  fullWidth?: boolean;
  helperText?: string;
  InputProps?: Partial<InputProps>;
  label: string;
  required?: boolean;
  value: UserFragment;
  onChange: (user: UserFragment | null) => void;
};

class FormUserSelector extends React.Component<Props> {
  handleClick = () => {
    if (this.props.value) {
      return;
    }

    store()
      .ui.selectUser({ includeActiveUser: true })
      .then(res => {
        if (!res) {
          return;
        }

        this.props.onChange && this.props.onChange(res);
      });
  };

  render() {
    const { classes, value } = this.props;

    if (!value) {
      return (
        <RegularButton
          variant="outlined"
          size="small"
          onClick={this.handleClick}
          style={{ borderRadius: 16 }}
        >
          {locale.Select} {this.props.label}
        </RegularButton>
      );
    }

    return (
      <FormControl
        className={cns(this.props.className, classes.root)}
        disabled={this.props.disabled}
        error={Boolean(this.props.error)}
        fullWidth={this.props.fullWidth}
        required={this.props.required}
      >
        <InputLabel shrink={Boolean(value)}>{this.props.label}</InputLabel>

        <Input
          classes={{}}
          name="FormUserSelector"
          inputComponent={FormUserSelectorInput}
          inputProps={{
            onClick: () => this.handleClick(),
            onClear: () => this.props.onChange(null)
          }}
          value={value}
          {...this.props.InputProps}
        />

        {this.props.helperText && (
          <FormHelperText>{this.props.helperText}</FormHelperText>
        )}
      </FormControl>
    );
  }
}

const styles = (theme: ThemeType) => ({
  root: {
    cursor: "pointer",
    display: "inline-flex"
  }
});

export default withStyles(styles as any)(FormUserSelector);
