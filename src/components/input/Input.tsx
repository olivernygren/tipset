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
  maxLengthInvisible?: boolean;
  placeholder?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  textAlign?: 'left' | 'center' | 'right';
  fontSize?: string;
  fontWeight?: string;
  compact?: boolean;
  label?: string;
  customPadding?: string;
  noBorder?: boolean;
  autoFocus?: boolean;
  customHeight?: string;
  error?: boolean;
  helperText?: string;
  min?: number;
  max?: number;
}

interface StyledInputProps {
  maxWidth?: string;
  fullWidth?: boolean;
  textAlign?: 'left' | 'center' | 'right';
  fontSize?: string;
  fontWeight?: string;
  compact?: boolean;
  customPadding?: string;
  noBorder?: boolean;
  customHeight?: string;
  error?: boolean;
}

const Input = ({
  value, onChange, type, maxLength, maxWidth, placeholder, disabled, label, fullWidth, textAlign, fontSize, fontWeight, name, compact, customPadding, noBorder, maxLengthInvisible, autoFocus, customHeight, error, helperText, min, max,
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
      noBorder={noBorder}
      autoFocus={autoFocus}
      customHeight={customHeight}
      error={error}
      min={min}
      max={max}
    />
    {maxLength && !maxLengthInvisible && (
      <NormalTypography variant="s" color={theme.colors.textLight}>
        {value.length}
        {' '}
        /
        {maxLength}
        {' '}
        tecken
      </NormalTypography>
    )}
    {helperText && helperText.length > 0 && (
      <NormalTypography variant="xs" color={error ? theme.colors.redDark : theme.colors.textLight}>
        {helperText}
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
  font-weight: ${({ fontWeight }) => fontWeight || 500};
  border: ${({ noBorder, error }) => (noBorder ? 'none' : `1px solid ${error ? theme.colors.red : theme.colors.silverDark}`)};
  border-radius: ${theme.borderRadius.m};
  font-size: 16px;
  font-family: ${theme.fontFamily}, sans-serif;
  outline: none;
  transition: border-color 0.1s;
  box-sizing: border-box;
  color: ${theme.colors.textDefault};
  height: ${({ compact }) => (compact ? '40px' : '48px')};

  &:focus {
    border-color: ${({ error }) => (error ? theme.colors.redDark : theme.colors.primary)};
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
