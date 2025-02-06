/* eslint-disable no-nested-ternary */
import React from 'react';
import styled from 'styled-components';
import { SpinnerGap } from '@phosphor-icons/react';
import { theme } from '../../theme';
import { EmphasisTypography } from '../typography/Typography';

export interface ButtonProps {
  variant?: 'primary' | 'secondary';
  onClick?: (e?: any) => void;
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

export interface StyledButtonProps {
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  disabledInvisible?: boolean;
  fullWidth?: boolean;
  color: keyof typeof theme.colors;
  textColor?: string;
  size?: 's' | 'm' | 'l';
}

type ButtonState = 'normal' | 'hover' | 'active';

const Button = ({
  variant = 'primary', onClick, children, disabled, disabledInvisible, fullWidth, color = 'primary', textColor = theme.colors.white, size = 'm', icon, loading, endIcon, id,
}: ButtonProps) => {
  const getButtonTextColor = () => {
    if (variant === 'secondary') {
      if (disabled) {
        return theme.colors.silverLight;
      }
      if (color !== 'primary') {
        return color;
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
      {loading ? (
        <RotationalSpinner>
          <SpinnerGap size={24} color={variant === 'primary' ? theme.colors.white : theme.colors.primary} />
        </RotationalSpinner>
      ) : (
        <>
          {icon}
          <EmphasisTypography id={id} variant="m" color={getButtonTextColor()} align="center">
            {children}
          </EmphasisTypography>
          {endIcon}
        </>
      )}
    </StyledButton>
  );
};

const getBackgroundColor = (variant: 'primary' | 'secondary' | undefined, color: keyof typeof theme.colors, state: ButtonState, disabled?: boolean) => {
  if (variant === 'secondary') {
    if (state === 'hover' || state === 'active') {
      return theme.colors.silverBleach;
    }
    return 'transparent';
  }
  if (state === 'hover') {
    // @ts-ignore
    return theme.colors[`${color}Dark`];
  }
  if (state === 'active') {
    if (color === 'primary') {
      return theme.colors.primaryDarker;
    }
    return theme.colors[color];
  }
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

const getBorderColor = (color: keyof typeof theme.colors, state: ButtonState, disabled?: boolean, variant?: 'primary' | 'secondary') => {
  if (state === 'hover' && variant === 'primary') {
    if (variant === 'primary') {
      // @ts-ignore
      return theme.colors[`${color}Dark`];
    }
    return theme.colors[color];
  }
  if (state === 'active' && variant === 'primary') {
    if (color === 'primary') {
      return theme.colors[`${color}Darker`];
    }
    return theme.colors[color];
  }
  if (disabled) {
    return theme.colors.silverLight;
  }
  if (color) {
    if (color === 'primary' && variant === 'secondary') {
      return theme.colors.silverLight;
    }
    return theme.colors[color];
  }
  return theme.colors.silverLight;
};

const StyledButton = styled.button<StyledButtonProps>`
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'fit-content')};
  padding: ${({ size }) => (size === 's' ? `0 ${theme.spacing.xs}` : size === 'm' ? `0 ${theme.spacing.s}` : `0 ${theme.spacing.m}`)};
  height: ${({ size }) => (size === 's' ? '40px' : size === 'm' ? '48px' : '56px')};
  /* border-radius: ${({ size }) => (size === 's' ? '12px' : '14px')}; */
  border-radius: 100px;
  background-color: ${({ color, variant, disabled }) => getBackgroundColor(variant, color, 'normal', disabled)};
  border-color: ${({ color, disabled, variant }) => getBorderColor(color, 'normal', disabled, variant)};
  border-width: 1.5px;
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
    background-color: ${({ color, variant, disabled }) => getBackgroundColor(variant, color, 'hover', disabled)};
    border-color: ${({ color, disabled, variant }) => getBorderColor(color, 'hover', disabled, variant)};
    /* transform: ${({ disabled, disabledInvisible }) => (disabled || disabledInvisible ? 'none' : 'scale(1.02)')}; */
  }

  &:active {
    background-color: ${({ color, variant, disabled }) => getBackgroundColor(variant, color, 'active', disabled)};
    border-color: ${({ color, disabled, variant }) => getBorderColor(color, 'active', disabled, variant)};
    transform: ${({ disabled, disabledInvisible }) => (disabled || disabledInvisible ? 'none' : 'scale(0.97)')};
  }

  &:disabled {
    background-color: ${({ color, variant, disabled }) => getBackgroundColor(variant, color, 'normal', disabled)};
    border-color: ${({ color, disabled, variant }) => getBorderColor(color, 'normal', disabled, variant)};
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
