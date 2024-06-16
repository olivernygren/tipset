import React from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';

interface InputProps {
  type?: 'text' | 'password';
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  maxWidth?: string;
  maxLength?: number;
  placeholder?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  textAlign?: 'left' | 'center' | 'right';
  fontSize?: string;
  fontWeight?: string;
}

interface StyledInputProps {
  maxWidth?: string;
  fullWidth?: boolean;
  textAlign?: 'left' | 'center' | 'right';
  fontSize?: string;
  fontWeight?: string;
}

const Input = ({ value, onChange, type, maxLength, maxWidth, placeholder, disabled, fullWidth, textAlign, fontSize, fontWeight, name }: InputProps) => {
  return (
    <StyledInput
      name={name}
      type={type || 'text'}
      value={value}
      onChange={onChange}
      maxLength={maxLength}
      maxWidth={maxWidth}
      placeholder={placeholder}
      disabled={disabled}
      fullWidth={fullWidth}
      textAlign={textAlign}
      fontSize={fontSize}
      fontWeight={fontWeight}
    />
  )
}

const StyledInput = styled.input<StyledInputProps>`
  width: ${({ fullWidth }) => fullWidth ? '100%' : 'auto'};
  max-width: ${({ maxWidth }) => maxWidth || 'unset'};
  padding: ${theme.spacing.xxs} ${theme.spacing.xs};
  text-align: ${({ textAlign }) => textAlign || 'left'};
  font-size: ${({ fontSize }) => fontSize || '16px'} !important;
  font-weight: ${({ fontWeight }) => fontWeight || 'normal'};
  border: 1px solid #ccc;
  border-radius: ${theme.borderRadius.s};
  font-size: 16px;
  font-family: 'Readex Pro', sans-serif;
  outline: none;
  transition: border-color 0.1s;
  box-sizing: border-box;
  color: ${theme.colors.textDefault};

  &:focus {
    border-color: ${theme.colors.primary};
  }

  &::placeholder {
    color: ${theme.colors.textLighter};
  }

  &:disabled {
    background-color: ${theme.colors.silverLighter};
    color: ${theme.colors.textLight};
    cursor: not-allowed;
  }
`;

export default Input;