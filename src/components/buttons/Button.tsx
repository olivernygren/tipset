/* eslint-disable no-nested-ternary */
import React from 'react';
import styled from 'styled-components';
import { SpinnerGap } from '@phosphor-icons/react';
import { theme } from '../../theme';
import { EmphasisTypography } from '../typography/Typography';

export interface ButtonProps {
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  children: any;
  disabled?: boolean;
  disabledInvisible?: boolean;
  fullWidth?: boolean;
  color?: keyof typeof theme.colors;
  textColor?: string;
  size?: 's' | 'm' | 'l';
  icon?: React.ReactNode;
  endIcon?: React.ReactNode;
  loading?: boolean;
  id?: string;
}

const Button = ({
  variant = 'primary', onClick, children, disabled, disabledInvisible, fullWidth, color = 'primary', textColor = theme.colors.white, size = 'm', icon, loading, endIcon, id,
}: ButtonProps) => {
  const getButtonTextColor = () => {
    if (variant === 'secondary') {
      if (disabled) {
        return theme.colors.silverLight;
      }
      return theme.colors.primary;
    }
    return textColor;
  };

  return (
    <StyledButton
      variant={variant || 'primary'}
      onClick={() => {
        if (onClick && !disabled && !disabledInvisible) {
          onClick();
        }
      }}
      disabled={disabled}
      disabledInvisible={disabledInvisible || loading}
      fullWidth={fullWidth}
      color={color}
      size={size}
    >
      {icon}
      {loading ? (
        <RotationalSpinner>
          <SpinnerGap size={24} color={variant === 'primary' ? theme.colors.white : theme.colors.primary} />
        </RotationalSpinner>
      ) : (
        <EmphasisTypography id={id} variant="m" color={getButtonTextColor()} align="center">
          {children}
        </EmphasisTypography>
      )}
      {endIcon}
    </StyledButton>
  );
};

const getBackgroundColor = (variant: 'primary' | 'secondary' | undefined, color: keyof typeof theme.colors | undefined, disabled?: boolean) => {
  if (variant === 'secondary') {
    return 'transparent';
  }
  // if (hover) {
  //   if (color === 'primary') {
  //     return theme.colors.primaryDark;
  //   }
  //   return theme.colors[color];
  // }
  // if (active) {
  //   if (color === 'primary') {
  //     return theme.colors.primaryDarker;
  //   }
  //   return theme.colors[color];
  // }
  if (disabled) {
    return theme.colors.silverLight;
  }
  if (color) {
    return theme.colors[color];
  }
  if (variant === 'primary') {
    return theme.colors.primary;
  }
  return 'transparent';
};

const getBorderColor = (color: keyof typeof theme.colors | undefined, disabled?: boolean) => {
  // if (hover) {
  //   if (color === 'primary') {
  //     return theme.colors.primaryDark;
  //   }
  //   return theme.colors[color];
  // }
  // if (active) {
  //   if (color === 'primary') {
  //     return theme.colors.primaryDarker;
  //   }
  //   return theme.colors[color];
  // }
  if (disabled) {
    return theme.colors.silverLight;
  }
  if (color) {
    return theme.colors[color];
  }
  return theme.colors.primary;
};

const StyledButton = styled.button<ButtonProps>`
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'fit-content')};
  padding: ${({ size }) => (size === 's' ? `0 ${theme.spacing.xs}` : size === 'm' ? `0 ${theme.spacing.s}` : `0 ${theme.spacing.m}`)};
  height: ${({ size }) => (size === 's' ? '40px' : size === 'm' ? '48px' : '56px')};
  border-radius: 100px;
  background-color: ${({ color, variant, disabled }) => getBackgroundColor(variant, color, disabled)};
  border-color: ${({ color, disabled }) => getBorderColor(color, disabled)};
  border-width: 2px;
  border-style: solid;
  cursor: ${({ disabledInvisible }) => (disabledInvisible ? 'not-allowed' : 'pointer')};
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.xxs};
  transition: all 0.2s ease;

  ${EmphasisTypography} {
    white-space: nowrap;
  }

  &:hover {
    background-color: ${({ color, variant, disabled }) => getBackgroundColor(variant, color, disabled)};
    border-color: ${({ color, disabled }) => getBorderColor(color, disabled)};
    transform: ${({ disabled }) => (disabled ? 'none' : 'scale(1.02)')};
  }

  &:active {
    background-color: ${({ color, variant, disabled }) => getBackgroundColor(variant, color, disabled)};
    border-color: ${({ color, disabled }) => getBorderColor(color, disabled)};
    transform: ${({ disabled }) => (disabled ? 'none' : 'scale(0.98)')};
  }

  &:disabled {
    background-color: ${({ color, variant, disabled }) => getBackgroundColor(variant, color, disabled)};
    border-color: ${({ color, disabled }) => getBorderColor(color, disabled)};
    cursor: not-allowed;
  }
`;

const RotationalSpinner = styled.div`
  animation: spin 1s linear infinite;
  height: 24px;
  width: 24px;

  @keyframes spin {
    100% {
      transform: rotate(360deg);
    }
  }
`;

export default Button;
