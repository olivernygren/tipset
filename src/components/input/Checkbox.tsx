import React from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';

interface CheckboxProps {
  checked: boolean;
  onChange: (wasChecked: boolean) => void;
  disabled?: boolean;
  label?: string;
}

const Checkbox = ({
  checked, onChange, disabled, label,
}: CheckboxProps) => (
  <CheckboxLabel>
    <CheckboxInput
      type="checkbox"
      checked={checked}
      onChange={() => onChange(!checked)}
      disabled={disabled}
    />
    {label && (
      <CheckboxText>{label}</CheckboxText>
    )}
  </CheckboxLabel>
);

const CheckboxInput = styled.input`
  appearance: none;
  width: 20px;
  height: 20px;
  border: 2px solid ${theme.colors.silver};
  border-radius: 3px;
  outline: none;
  cursor: pointer;
  margin-right: 8px;

  &:checked {
    background-color: ${theme.colors.primary};
    border-color: ${theme.colors.primary};
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  font-family: ${theme.fontFamily}, sans-serif;
`;

const CheckboxText = styled.span`
  font-size: 14px;
`;

export default Checkbox;
