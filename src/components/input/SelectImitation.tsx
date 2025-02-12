import { CaretDown } from '@phosphor-icons/react';
import React from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';
import { NormalTypography } from '../typography/Typography';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';

interface SelectImitationProps {
  // options: Array<OptionItem>;
  // optionGroups?: Array<OptionGroup>;
  value: string;
  onClick: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  compact?: boolean;
  maxWidth?: string;
  placeholder?: string;
  dropdownIcon?: React.ReactNode;
  borderless?: boolean;
  bgColor?: string;
  textColor?: string;
}

interface StyledSelectImitationProps {
  fullWidth?: boolean;
  disabled?: boolean;
  compact?: boolean;
  maxWidth?: string;
  borderless?: boolean;
  bgColor?: string;
  textColor?: string;
}

const SelectImitation = ({
  value, onClick, disabled, fullWidth, compact, maxWidth, placeholder, dropdownIcon, borderless, bgColor, textColor,
}: SelectImitationProps) => {
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const getTextColor = (isPlaceholder?: boolean) => {
    if (textColor && !isPlaceholder) {
      return textColor;
    }

    if (disabled) {
      return isPlaceholder ? theme.colors.silver : theme.colors.silverDark;
    }

    return isPlaceholder ? theme.colors.silverDark : theme.colors.textDefault;
  };

  return (
    <StyledSelectImitation
      disabled={disabled}
      fullWidth={fullWidth}
      compact={compact}
      maxWidth={maxWidth}
      onClick={!disabled ? onClick : () => {}}
      borderless={borderless}
      bgColor={bgColor}
    >
      {placeholder && !value && (
        <NormalTypography variant={isMobile ? 's' : 'm'} color={getTextColor(true)}>
          {placeholder}
        </NormalTypography>
      )}
      {value && (
        <NormalTypography variant={isMobile ? 's' : 'm'} color={getTextColor()}>
          {value}
        </NormalTypography>
      )}
      {dropdownIcon || <CaretDown size={16} weight="bold" color={getTextColor(Boolean(placeholder && !value))} />}
    </StyledSelectImitation>
  );
};

const getBackgroundColor = (bgColor: string | undefined, disabled?: boolean) => {
  if (bgColor) {
    return bgColor;
  }

  if (disabled) {
    return theme.colors.silverLighter;
  }

  return theme.colors.white;
};

const StyledSelectImitation = styled.div<StyledSelectImitationProps>`
  background-color: ${({ disabled, bgColor }) => getBackgroundColor(bgColor, disabled)};
  ${({ borderless, disabled }) => !borderless && `border: 1px solid ${disabled ? theme.colors.silverLight : theme.colors.silver};`};
  border-radius: ${theme.borderRadius.m};
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing.xxs};
  box-sizing: border-box;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  padding: ${({ borderless }) => `${theme.spacing.xxs} ${borderless ? 0 : theme.spacing.xs}`};
  max-width: ${({ maxWidth }) => maxWidth || 'unset'};
  min-height: ${({ compact }) => (compact ? '40px' : '48px')};
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'fit-content')};
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};
`;

export default SelectImitation;
