import React from "react";
import moment from "moment";
import FormField from "@modules/formx-react/FormField";
import { parseDate } from "./utils";
import DatePicker, { DatePickerProps } from "../DatePicker";

export type DateProps = {
  name: string;
  label?: string;
  DatePickerProps?: Partial<DatePickerProps>;
  utc?: boolean; // no offset in resulting value
  transformValue?: (v: moment.Moment) => Date;
  disabled?: boolean;
};

export function Date(props: DateProps) {
  const {
    name,
    label,
    DatePickerProps: datePickerProps,
    transformValue,
    utc = true
  } = props;

  const m = utc ? moment.utc : moment;

  if (utc && transformValue) {
    throw new Error("select one prop: utc or transformValue");
  }

  return (
    <FormField name={name}>
      {field => {
        const disabled = props.disabled || field.disabled;

        return (
          <DatePicker
            {...field.fieldProps}
            name={name}
            label={field.error || label}
            value={field.value ? m(field.value) : null}
            error={field.invalid && !field.disabled}
            fullWidth
            onChange={v => {
              if (!v) {
                field.value = null;
                return;
              }

              if (transformValue) {
                field.value = transformValue(v);
                return;
              }

              const date = utc ? v.clone().add(v.utcOffset(), "m") : v;
              field.value = date.toDate();
            }}
            onChangeRaw={function(this: any, e: React.ChangeEvent<HTMLInputElement>) {
              /**
               * @see https://github.com/Hacker0x01/react-datepicker/blob/69fad285969b744e326e220e3e65b76deb17f043/src/index.jsx:662
               *
               * Once user has typed in a date manually and if the input satisfies the format,
               * by default react-datepicker caches the string input in its state (state.inputValue)
               * and only renders the input values based on it
               *
               * Which means, that switching between V/D doesn't do anything to a manually altered field.
               *
               * So we set state.inputValue to null in case of successful input
               */
              const date = parseDate(e.target.value, this.props);

              if (date || !e.target.value) {
                this.setSelected(date, e, true);
                this.setState({ inputValue: null, lastPreSelectChange: "input" });
              } else {
                this.setState({
                  inputValue: e.target.value,
                  lastPreSelectChange: "input"
                });
              }

              e.preventDefault();
            }}
            {...datePickerProps}
            disabled={disabled}
          />
        );
      }}
    </FormField>
  );
}

export default Date;
