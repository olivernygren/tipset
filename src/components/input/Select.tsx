import React from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';
import { CaretDown } from '@phosphor-icons/react';

export interface OptionItem {
  value: string;
  label: string;
  additionalOptions?: Object;
}

export interface OptionGroup {
  label: string;
  options: Array<OptionItem>;
}

interface SelectProps {
  options: Array<OptionItem>;
  optionGroups?: Array<OptionGroup>;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  compact?: boolean;
}

interface StyledSelectProps {
  fullWidth?: boolean;
  disabled?: boolean;
  compact?: boolean;
}

const Select = ({ options, optionGroups, value, onChange, placeholder, disabled, fullWidth, compact }: SelectProps) => {
  return (
    <SelectWrapper
      disabled={disabled}
      fullWidth={fullWidth}
      compact={compact}
    >
      <StyledSelect
        defaultValue={'Välj'}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.currentTarget.value)}
      >
        {optionGroups ? optionGroups.map((optionGroup) => (
          <optgroup key={optionGroup.label} label={optionGroup.label}>
            {optionGroup.options.map((option) => (
              <StyledOption key={option.value} value={option.value}>{option.label}</StyledOption>
            ))}
          </optgroup>
        )) : (
          <>
            {options.map((option) => (
              <StyledOption key={option.value} value={option.value}>{option.label}</StyledOption>
            ))}
          </>
        )}
      </StyledSelect>
      <CaretDown size={16} weight='bold' />
    </SelectWrapper>
  )
};

const SelectWrapper = styled.div<StyledSelectProps>`
  display: inline-flex;
  gap: ${theme.spacing.xxs};
  justify-content: flex-end;
  align-items: center;
  min-width: 200px;
  min-height: ${({ compact }) => compact ? '36px' : '44px'};
  width: ${({ fullWidth }) => fullWidth ? '100%' : 'fit-content'};
  padding-right: ${theme.spacing.xxs};
  position: relative;

  border-radius: ${theme.borderRadius.s};
  border: 1px solid #ccc;
  box-sizing: border-box;

  &:focus-within {
    outline: none;
    border-color: ${theme.colors.primary};
  }

  &:disabled {
    background-color: ${theme.colors.silverLighter};
    cursor: not-allowed;
  }
`;

const StyledSelect = styled.select`
  position: absolute;
  inset: 0 0 0 8px;
  cursor: pointer;
  font-family: 'Readex Pro', sans-serif;
  font-size: 16px;
  border: none;
  background: transparent;
  outline: none;
  -webkit-appearance: none; /* Removes default chrome and safari style */
  -moz-appearance: none; /* Removes default firefox style */
`;

const StyledOption = styled.option`

`;

export default Select;