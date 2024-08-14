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
}

interface StyledSelectImitationProps {
  fullWidth?: boolean;
  disabled?: boolean;
  compact?: boolean;
  maxWidth?: string;
}

const SelectImitation = ({
  value, onClick, disabled, fullWidth, compact, maxWidth, placeholder, dropdownIcon,
}: SelectImitationProps) => {
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  return (
    <StyledSelectImitation
      disabled={disabled}
      fullWidth={fullWidth}
      compact={compact}
      maxWidth={maxWidth}
      onClick={onClick}
    >
      {placeholder && !value && (
        <NormalTypography variant={isMobile ? 's' : 'm'} color={disabled ? theme.colors.silver : theme.colors.silverDarker}>
          {placeholder}
        </NormalTypography>
      )}
      {value && (
        <NormalTypography variant={isMobile ? 's' : 'm'} color={disabled ? theme.colors.silver : theme.colors.textDefault}>
          {value}
        </NormalTypography>
      )}
      {dropdownIcon || <CaretDown size={16} weight="bold" color={disabled ? theme.colors.silverDark : theme.colors.textDefault} />}
    </StyledSelectImitation>
  );
};

const StyledSelectImitation = styled.div<StyledSelectImitationProps>`
  background-color: ${({ disabled }) => (disabled ? theme.colors.silverLighter : theme.colors.white)};
  border: 1px solid ${({ disabled }) => (disabled ? theme.colors.silverLight : theme.colors.silver)};
  border-radius: ${theme.borderRadius.s};
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing.s};
  box-sizing: border-box;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  padding: ${theme.spacing.xxs} ${theme.spacing.xs};
  max-width: ${({ maxWidth }) => maxWidth || 'unset'};
  min-height: ${({ compact }) => (compact ? '36px' : '44px')};
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'fit-content')};
`;

export default SelectImitation;
