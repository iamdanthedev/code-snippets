import React, { useState, useEffect } from "react";
import FormField from "@modules/formx-react/FormField";
import {
  RadioGroup,
  RadioGroupProps,
  FormControl,
  FormControlProps,
  FormLabel,
  FormLabelProps,
  FormHelperText,
  Radio,
  FormControlLabel,
  TextField,
  RadioProps,
  TextFieldProps as MuiTextFieldProps,
  makeStyles
} from "@material-ui/core";

type RadioGroupOptions = {
  error?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  label: string;
  value: string | boolean;
};

export type Props = {
  label?: string;
  name: string;
  GroupProps?: RadioGroupProps;
  RadioBtnProps?: RadioProps;
  LabelProps?: FormLabelProps;
  ControlProps?: FormControlProps;
  options: RadioGroupOptions[];
  helperText?: string;
  disabled?: boolean;
  customValue?: boolean;
  initCustomValue?: string;
  TextFieldProps?: MuiTextFieldProps;
  row?: boolean;
  onChange?: (e, v) => void;
};

const useStyles = makeStyles(() => ({
  labelRoot: {
    marginBottom: "10px"
  },

  group: {
    width: "auto",
    height: "auto",
    display: "flex",
    flexWrap: "nowrap",
    flexDirection: "row"
  }
}));

export const RadioButtonGroup = (props: Props) => {
  const {
    ControlProps,
    GroupProps,
    LabelProps,
    RadioBtnProps,
    TextFieldProps,
    customValue = false,
    disabled = false,
    helperText,
    initCustomValue,
    label,
    name,
    options,
    row
  } = props;
  const classes = useStyles({});
  const [custom, setCustom] = useState(undefined);

  useEffect(() => {
    if (customValue) {
      handleEmptyCustom(initCustomValue);
    }
  }, []);

  const handleEmptyCustom = topValue => {
    !options.map(x => x.value).includes(topValue) ? setCustom(topValue) : setCustom("");
  };

  return (
    <FormField name={name}>
      {field => {
        const _disabled = disabled || field.disabled;

        return (
          <FormControl {...ControlProps} error={field.invalid} disabled={_disabled}>
            {field.error || label ? (
              <FormLabel className={classes.labelRoot} {...LabelProps}>
                {field.error || label}
              </FormLabel>
            ) : null}

            <RadioGroup
              className={row ? classes.group : ""}
              value={field.fieldProps.value}
              onChange={(ev, value) => {
                props.onChange && props.onChange(ev, value);
                field.fieldProps?.onChange(value);
              }}
              {...GroupProps}
            >
              {customValue && (
                <FormControlLabel
                  value={custom}
                  label={
                    <TextField
                      name={field.name}
                      fullWidth
                      value={custom}
                      onChange={e => {
                        setCustom(e.target.value);
                        field.fieldProps?.onChange(e.target.value);
                      }}
                      {...TextFieldProps}
                    />
                  }
                  disabled={_disabled}
                  control={
                    <Radio
                      {...RadioBtnProps}
                      checked={field.value === custom}
                      value={custom}
                      onChange={() => field.fieldProps?.onChange(custom)}
                    />
                  }
                />
              )}
              {options?.map((option, i) => {
                if (option.hidden) {
                  return null;
                }
                return (
                  <FormControlLabel
                    key={i}
                    value={option.value}
                    control={<Radio {...RadioBtnProps} />}
                    label={option.label}
                    disabled={_disabled}
                  />
                );
              })}
            </RadioGroup>
            {helperText && <FormHelperText>{helperText}</FormHelperText>}
          </FormControl>
        );
      }}
    </FormField>
  );
};

export default RadioButtonGroup;
