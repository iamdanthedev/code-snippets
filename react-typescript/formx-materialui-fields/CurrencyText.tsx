import React from "react";
import { merge } from "lodash";
import { InputAdornment } from "@material-ui/core";
import { Text, TextProps } from "./Text";

type Props = TextProps & {
  currency?: string; // kr. by default
};

export function CurrencyText(props: Props) {
  const { currency = "kr.", TextFieldProps = {} } = props;

  const { fullWidth } = TextFieldProps;

  const myInputProps = {
    endAdornment: <InputAdornment position="end">{currency}</InputAdornment>,
    type: "number",
    inputProps: {
      style: { textAlign: "right" } as React.CSSProperties
    },
    style: { width: fullWidth ? undefined : 90 } as React.CSSProperties
  };

  // const _InputProps = merge(myInputProps, InputProps);

  return (
    <Text {...props} TextFieldProps={{ ...TextFieldProps, InputProps: myInputProps }} />
  );
}
