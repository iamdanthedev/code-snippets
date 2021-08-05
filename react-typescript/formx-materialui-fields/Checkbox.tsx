import React from "react";
import { CheckboxProps as MuiCheckboxProps } from "@material-ui/core/Checkbox";
import { Checkbox as MuiCheckbox, FormControlLabel } from "@material-ui/core";
import FormField from "@modules/formx-react/FormField";

export type CheckboxProps = {
  name: string;
  label?: string;
  CheckboxProps?: MuiCheckboxProps;
  FormControlLabelProps?: Partial<React.ComponentProps<typeof FormControlLabel>>;
};

export const Checkbox: React.FC<CheckboxProps> = props => {
  return (
    <FormField name={props.name}>
      {field => {
        if (props.label) {
          return (
            <FormControlLabel
              control={
                <MuiCheckbox
                  disabled={field.disabled}
                  checked={Boolean(field.fieldProps.value)}
                  onChange={ev => field.fieldProps.onChange(ev.target.checked)}
                  {...props.CheckboxProps}
                />
              }
              label={props.label}
              {...props.FormControlLabelProps}
            />
          );
        } else {
          return (
            <MuiCheckbox
              disabled={field.disabled}
              checked={Boolean(field.fieldProps.value)}
              onChange={ev => field.fieldProps.onChange(ev.target.checked)}
              {...props.CheckboxProps}
            />
          );
        }
      }}
    </FormField>
  );
};

export default Checkbox;
