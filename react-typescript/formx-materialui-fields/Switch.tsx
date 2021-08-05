import React from "react";
import MuiSwitch, { SwitchProps as MuiSwitchProps } from "@material-ui/core/Switch";
import { FormControlLabel, FormControlLabelProps } from "@material-ui/core";
import FormField from "@modules/formx-react/FormField";

export type SwitchProps = {
  name: string;
  disabled?: boolean;
  label?: string;
  SwitchProps?: Partial<MuiSwitchProps>;
  FormControlLabelProps?: Partial<FormControlLabelProps>;
};

export const Switch: React.FC<SwitchProps> = props => {
  return (
    <FormField name={props.name}>
      {field => (
        <FormControlLabel
          control={
            <MuiSwitch
              disabled={field.disabled || props.disabled}
              checked={Boolean(field.fieldProps.value)}
              onChange={ev => field.fieldProps.onChange(ev.target.checked)}
              {...props.SwitchProps}
            />
          }
          label={props.label}
        />
      )}
    </FormField>
  );
};

export default Switch;
