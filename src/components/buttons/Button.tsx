import React from 'react';
import styled, { css } from 'styled-components';
import { theme } from '../../theme';
import { EmphasisTypography } from '../typography/Typography';
import { motion } from 'framer-motion';
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
  loading?: boolean;
}

const Button = ({ 
  variant = "primary", onClick, children, disabled, disabledInvisible, fullWidth, color = "primary", textColor = theme.colors.white, size = 'm', icon, loading
}: ButtonProps) => {
  const getBackgroundColor = (hover?: boolean, active?: boolean) => {
    if (variant === 'secondary') {
      return 'transparent';
    }
    if (hover) {
      return theme.colors[color] || theme.colors.primaryDark;
    }
    if (active) {
      return theme.colors[color] || theme.colors.primaryDarker;
    }
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

  const getBorderColor = () => {
    if (disabled) {
      return theme.colors.silver;
    }
    if (color) {
      return theme.colors[color];
    }
    return theme.colors.primary;
  }

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
      initial={{ 
        scale: 1,
        backgroundColor: getBackgroundColor(),
        borderColor: getBorderColor()
      }}
      whileHover={{ 
        scale: disabled ? 1 : 1.03, 
        backgroundColor: getBackgroundColor(), 
        borderColor: getBorderColor()
      }}
      whileTap={{ 
        backgroundColor: getBackgroundColor(), 
        borderColor: getBorderColor()
      }}
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
    </StyledButton>
  )
}

const StyledButton = styled(motion.button)<ButtonProps>`
  width: ${({ fullWidth }) => fullWidth ? '100%' : 'fit-content'};
  padding: ${({ size }) => size === 's' ? `${theme.spacing.xs} ${theme.spacing.xs}` : size === 'm' ? `${theme.spacing.xs} ${theme.spacing.s}` : `${theme.spacing.s} ${theme.spacing.m}`};
  border-radius: ${theme.borderRadius.m};
  /* background-color: ${({ color, variant, disabled }) => disabled ? theme.colors.silverLight : variant === 'primary' ? (color || theme.colors.primary) : 'transparent'}; */
  /* border-color: ${({ color, variant }) => variant === 'primary' ? theme.colors.primary : variant === 'secondary' ? (color || theme.colors.primary) : color}; */
  border-width: 2px;
  border-style: solid;
  cursor: ${({ disabledInvisible }) => disabledInvisible ? 'not-allowed' : 'pointer'};
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.xxs};

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