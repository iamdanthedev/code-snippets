import React from "react";
import { merge } from "lodash";
import { InputAdornment } from "@material-ui/core";
import { Input, InputProps } from "./Input";
import { Currency } from "../typography/Currency";

export type CurrencyInputProps = InputProps & {
  currency?: string; // kr. by default
};

export const CurrencyInput: React.FC<CurrencyInputProps> = props => {
  const { currency, InputProps: inputProps = {}, ...rest } = props;

  const myInputProps: Partial<InputProps["InputProps"]> = {
    endAdornment: <InputAdornment position="end">{currency}</InputAdornment>,
    type: "number",
    inputProps: {
      style: { textAlign: "right" }
    },
    style: { width: inputProps.fullWidth ? undefined : 90 }
  };

  const _inputProps = merge({}, myInputProps, inputProps);

  return (
    <Input
      {...rest}
      InputProps={_inputProps}
      readonlyRenderer={field => (
        <Currency value={field.value} currency={props.currency} />
      )}
    />
  );
};

CurrencyInput.defaultProps = {
  currency: "kr."
};
