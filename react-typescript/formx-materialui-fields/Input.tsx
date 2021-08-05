import React from "react";
import { Field, FormStore } from "@modules/formx";
import InputField, { InputProps as MuiInputProps } from "@material-ui/core/Input";
import FormField, { FieldOptions } from "@modules/formx-react/FormField";

export type InputProps = {
  name: string;
  InputProps?: Partial<MuiInputProps>;
  fieldOptions?: FieldOptions<any>;
  Component?: React.ComponentType<MuiInputProps>;
  readonly?: boolean;
  readonlyRenderer?: (
    field: Field<any>,
    store: FormStore<any>
  ) => React.ReactElement<any>;
};

export const Input: React.FC<InputProps> = props => {
  const { InputProps: inputProps, Component = InputField } = props;

  return (
    <FormField name={props.name} fieldOptions={props.fieldOptions}>
      {(field, store) => {
        const _value =
          typeof field.value === "number"
            ? field.value.toString()
            : typeof field.value === "string"
            ? field.value
            : "";

        if (props.readonly) {
          return props.readonlyRenderer ? (
            props.readonlyRenderer(field, store)
          ) : (
            <span>{_value}</span>
          );
        }

        return (
          <Component
            {...field.fieldProps}
            error={field.invalid}
            value={_value}
            fullWidth
            data-error={field.invalid ? field.error : undefined}
            id={props.name}
            {...inputProps}
          />
        );
      }}
    </FormField>
  );
};

export default Input;
