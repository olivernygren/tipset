import React from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';
import { Section } from '../section/Section';
import { EmphasisTypography, NormalTypography } from '../typography/Typography';

interface TextareaProps {
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
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
}

interface StyledTextareaProps {
  maxWidth?: string;
  fullWidth?: boolean;
  textAlign?: 'left' | 'center' | 'right';
  fontSize?: string;
  fontWeight?: string;
  compact?: boolean;
  customPadding?: string;
  noBorder?: boolean;
  customHeight?: string;
}

const Textarea = ({
  value, onChange, maxLength, maxWidth, placeholder, disabled, label, fullWidth, textAlign, fontSize, fontWeight, name, compact, customPadding, noBorder, maxLengthInvisible, autoFocus, customHeight,
}: TextareaProps) => (
  <Section gap="xxxs">
    {label && (
      <LabelContainer>
        <EmphasisTypography variant="s">{label}</EmphasisTypography>
      </LabelContainer>
    )}
    <StyledTextarea
      name={name}
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
  </Section>
);

const StyledTextarea = styled.textarea<StyledTextareaProps>`
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  max-width: ${({ maxWidth }) => maxWidth || 'unset'};
  padding: ${({ customPadding }) => customPadding || `${theme.spacing.xxs} ${theme.spacing.xs}`};
  text-align: ${({ textAlign }) => textAlign || 'left'};
  font-size: ${({ fontSize }) => fontSize || '16px'} !important;
  font-weight: ${({ fontWeight }) => fontWeight || 'normal'};
  border: ${({ noBorder }) => (noBorder ? 'none' : `1px solid ${theme.colors.silver}`)};
  border-radius: ${theme.borderRadius.s};
  font-size: 16px;
  font-family: 'Readex Pro', sans-serif;
  outline: none;
  transition: border-color 0.1s;
  box-sizing: border-box;
  color: ${theme.colors.textDefault};
  min-height: ${({ customHeight }) => customHeight || '96px'};
  resize: none;

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

export default Textarea;
