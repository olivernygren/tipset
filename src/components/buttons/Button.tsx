import React from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';
import { EmphasisTypography } from '../typography/Typography';
import { SpinnerGap } from '@phosphor-icons/react';

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
}

const Button = ({ 
  variant = "primary", onClick, children, disabled, disabledInvisible, fullWidth, color = "primary", textColor = theme.colors.white, size = 'm', icon, loading, endIcon,
}: ButtonProps) => {
  // const getBackgroundColor = (hover?: boolean, active?: boolean) => {
  //   if (variant === 'secondary') {
  //     return 'transparent';
  //   }
  //   if (hover) {
  //     if (color === 'primary') {
  //       return theme.colors.primaryDark;
  //     }
  //     return theme.colors[color];
  //   }
  //   if (active) {
  //     if (color === 'primary') {
  //       return theme.colors.primaryDarker;
  //     }
  //     return theme.colors[color];
  //   }
  //   if (disabled) {
  //     return theme.colors.silver;
  //   }
  //   if (color) {
  //     return theme.colors[color];
  //   }
  //   if (variant === 'primary') {
  //     return theme.colors.primary;
  //   }
  //   return 'transparent';
  // };

  // const getBorderColor = (hover?: boolean, active?: boolean) => {
  //   if (hover) {
  //     if (color === 'primary') {
  //       return theme.colors.primaryDark;
  //     }
  //     return theme.colors[color];
  //   }
  //   if (active) {
  //     if (color === 'primary') {
  //       return theme.colors.primaryDarker;
  //     }
  //     return theme.colors[color];
  //   }
  //   if (disabled) {
  //     return theme.colors.silver;
  //   }
  //   if (color) {
  //     return theme.colors[color];
  //   }
  //   return theme.colors.primary;
  // };

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
      // initial={{ 
      //   scale: 1,
      //   backgroundColor: getBackgroundColor(false, false),
      //   borderColor: getBorderColor(false, false)
      // }}
      // whileHover={{ 
      //   scale: disabled ? 1 : 1.02, 
      //   backgroundColor: getBackgroundColor(true, false), 
      //   borderColor: getBorderColor(true, false)
      // }}
      // whileTap={{ 
      //   scale: disabled ? 1 : 0.99,
      //   backgroundColor: getBackgroundColor(false, true), 
      //   borderColor: getBorderColor(false, true)
      // }}
    >
      {icon}
      {loading ? (
        <RotationalSpinner>
          <SpinnerGap size={24} color={variant === 'primary' ? theme.colors.white : theme.colors.primary} />
        </RotationalSpinner>
      ) : (
        <EmphasisTypography variant='m' color={variant === 'secondary' ? theme.colors.primary : textColor} align='center'>
          {children}
        </EmphasisTypography>
      )}
      {endIcon}
    </StyledButton>
  )
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
    return theme.colors.silver;
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
    return theme.colors.silver;
  }
  if (color) {
    return theme.colors[color];
  }
  return theme.colors.primary;
};

const StyledButton = styled.button<ButtonProps>`
  width: ${({ fullWidth }) => fullWidth ? '100%' : 'fit-content'};
  padding: ${({ size }) => size === 's' ? `${theme.spacing.xs} ${theme.spacing.xs}` : size === 'm' ? `${theme.spacing.xs} ${theme.spacing.s}` : `${theme.spacing.s} ${theme.spacing.m}`};
  border-radius: ${theme.borderRadius.m};
  background-color: ${({ color, variant, disabled }) => getBackgroundColor(variant, color, disabled)};
  border-color: ${({ color, disabled }) => getBorderColor(color, disabled)};
  border-width: 2px;
  border-style: solid;
  cursor: ${({ disabledInvisible }) => disabledInvisible ? 'not-allowed' : 'pointer'};
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.xxs};
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ color, variant, disabled }) => getBackgroundColor(variant, color, disabled)};
    border-color: ${({ color, disabled }) => getBorderColor(color, disabled)};
    transform: ${({ disabled }) => disabled ? 'none' : 'scale(1.02)'};
  }

  &:active {
    background-color: ${({ color, variant, disabled }) => getBackgroundColor(variant, color, disabled)};
    border-color: ${({ color, disabled }) => getBorderColor(color, disabled)};
    transform: ${({ disabled }) => disabled ? 'none' : 'scale(0.99)'};
  }

  &:disabled {
    background-color: ${theme.colors.silver} !important; 
    border-color: ${theme.colors.silver} !important; 
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