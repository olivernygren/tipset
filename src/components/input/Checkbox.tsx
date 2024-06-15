import React from 'react';
import styled from 'styled-components';

interface CheckboxProps {
  checked: boolean;
  onChange: (wasChecked: boolean) => void;
  disabled?: boolean;
  label?: string;
}

const Checkbox = ({ checked, onChange, disabled, label }: CheckboxProps) => {
  return (
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
};

const CheckboxInput = styled.input`
  /* appearance: none; */
  width: 16px;
  height: 16px;
  border: 2px solid #ccc;
  border-radius: 4px;
  outline: none;
  cursor: pointer;
  margin-right: 8px;

  &:checked {
    background-color: #007bff;
    border-color: #007bff;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const CheckboxText = styled.span`
  font-size: 14px;
`;

export default Checkbox;