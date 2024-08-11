import React from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { sv } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import styled from 'styled-components';
import { Calendar } from '@phosphor-icons/react';
import { Section } from '../section/Section';
import { EmphasisTypography } from '../typography/Typography';
import { theme } from '../../theme';

interface CustomDatePickerProps {
  selectedDate: Date;
  onChange: (date: Date | null) => void;
  includeTime?: boolean;
  label?: string;
  inline?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

const CustomDatePicker = ({
  selectedDate, onChange, includeTime = true, label, inline, disabled, fullWidth,
}: CustomDatePickerProps) => {
  registerLocale('sv', sv);

  return (
    <Section gap="xxs">
      {label && (
        <EmphasisTypography variant="s">{label}</EmphasisTypography>
      )}
      <DatePickerWrapper fullWidth={fullWidth}>
        <DatePicker
          selected={selectedDate}
          onSelect={(date) => onChange(date)}
          onChange={(date) => onChange(date)}
          showTimeSelect={includeTime}
          dateFormat={includeTime ? 'yyyy-MM-dd HH:mm' : 'yyyy-MM-dd'}
          locale="sv"
          calendarStartDay={1}
          timeIntervals={5}
          timeCaption="Tid"
          timeFormat="HH:mm"
          inline={inline}
          disabled={disabled}
          disabledKeyboardNavigation
          minDate={new Date()}
        />
        <Calendar size={24} color={theme.colors.silverDark} />
      </DatePickerWrapper>
    </Section>
  );
};

const DatePickerWrapper = styled.div<{ fullWidth?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'fit-content')};
  border: 1px solid #ccc;
  border-radius: ${theme.borderRadius.s};
  padding-right: ${theme.spacing.xs};
  box-sizing: border-box;

  .react-datepicker-wrapper {
    width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  }

  .react-datepicker__input-container {
    width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};

    > input {
      padding: ${theme.spacing.xxs} ${theme.spacing.xs};
      border-radius: ${theme.borderRadius.s};
      font-size: 16px;
      border: none;
      font-family: 'Readex Pro', sans-serif;
      outline: none;
      transition: border-color 0.1s;
      box-sizing: border-box;
      color: ${theme.colors.textDefault};
      height: 48px;
      width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
    }
  }

  .react-datepicker {
    font-family: 'Readex Pro', sans-serif !important;
    font-size: 14px;
    background-color: ${theme.colors.white};
    border: 1px solid ${theme.colors.silver};
    border-radius: ${theme.borderRadius.s};
    display: inline-flex;
    min-height: 273px;

    .react-datepicker__header {
      background-color: ${theme.colors.silverLight};
      border: none;
      border-bottom: 1px solid ${theme.colors.silver};
    }

    .react-datepicker__day-names > div {
      color: ${theme.colors.silverDarker};
    }

    .react-datepicker__time-container {
      border-left: 1px solid ${theme.colors.silver};
    }

    .react-datepicker__current-month,
    .react-datepicker-time__header,
    .react-datepicker-year-header {
      color: ${theme.colors.textDefault};
    }
    .react-datepicker__day {
      color: ${theme.colors.textDefault};
      &--selected {
        color: ${theme.colors.white};
        background-color: ${theme.colors.primary};
        border-radius: 4px;
      }
      &--disabled {
        color: ${theme.colors.silver};
      }
    }

    .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list {
      min-height: 235px;

      li.react-datepicker__time-list-item {
        color: ${theme.colors.textDefault};
        height: 20px;
        margin: 0 4px;

        &--selected {
          color: ${theme.colors.white};
          background-color: ${theme.colors.primary};
          border-radius: 4px;
        }
      }
    }
    .react-datepicker__navigation {
      background-color: ${theme.colors.primaryLight};
      width: 20px;
      height: 20px;
      border-radius: 50%;
      margin: ${theme.spacing.xxs} ${theme.spacing.xs};
    }

    .react-datepicker__navigation-icon {
      border-color: ${theme.colors.white};
      height: 6px;
      position: absolute;
      top: 8px;
      width: 6px;
      left: -4px;
    }

    .react-datepicker__navigation-icon::before {
      border-color: ${theme.colors.white};
      height: 5px;
      top: -2px;
      width: 5px;
      left: 9px;
    }

    .react-datepicker__navigation-icon--next::before {
      left: 9px;
    }

    .react-datepicker__navigation-icon--previous::before {
      left: 11px;
      right: unset;
    }

    .react-datepicker__triangle {
      &::before {
        border-bottom-color: ${theme.colors.silverLight};
      }
      &::after {
        border-bottom-color: ${theme.colors.silverLighter};
      }
    }
  }
`;

export default CustomDatePicker;
