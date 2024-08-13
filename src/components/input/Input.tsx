import React from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';
import { Section } from '../section/Section';
import { EmphasisTypography, NormalTypography } from '../typography/Typography';

interface InputProps {
  type?: 'text' | 'password' | 'number';
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
  compact?: boolean;
  label?: string;
  customPadding?: string;
}

interface StyledInputProps {
  maxWidth?: string;
  fullWidth?: boolean;
  textAlign?: 'left' | 'center' | 'right';
  fontSize?: string;
  fontWeight?: string;
  compact?: boolean;
  customPadding?: string;
}

const Input = ({
  value, onChange, type, maxLength, maxWidth, placeholder, disabled, label, fullWidth, textAlign, fontSize, fontWeight, name, compact, customPadding,
}: InputProps) => (
  <Section gap="xxxs">
    {label && (
      <LabelContainer>
        <EmphasisTypography variant="s">{label}</EmphasisTypography>
      </LabelContainer>
    )}
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
      compact={compact}
      customPadding={customPadding}
    />
    {maxLength && (
      <NormalTypography variant="s" color={theme.colors.textLight}>
        {value.length}
        {' '}
        /
        {maxLength}
        {' '}
        tecken
      </NormalTypography>
    )}
  </Section>
);

const StyledInput = styled.input<StyledInputProps>`
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  max-width: ${({ maxWidth }) => maxWidth || 'unset'};
  padding: ${({ customPadding }) => customPadding || `${theme.spacing.xxs} ${theme.spacing.xs}`};
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
  height: ${({ compact }) => (compact ? '40px' : '48px')};

  &:focus {
    border-color: ${theme.colors.primary};
  }

  &::placeholder {
    color: ${theme.colors.textLighter};
  }

  &:disabled {
    background-color: ${theme.colors.silverLighter} !important;
    color: ${theme.colors.silverDark} !important;
    cursor: not-allowed;
    opacity: 1 !important;
  }
`;

const LabelContainer = styled.div`
  margin-bottom: ${theme.spacing.xxxs};
`;

export default Input;
