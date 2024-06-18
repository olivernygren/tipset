import React from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';
import { EmphasisTypography } from '../typography/Typography';
import { motion } from 'framer-motion';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  children: any;
  disabled?: boolean;
  fullWidth?: boolean;
  color?: string;
  size?: 's' | 'm' | 'l';
  icon?: React.ReactNode;
}

const Button = ({ variant = 'primary', onClick, children, disabled, fullWidth, color = theme.colors.primary, size = 'm', icon }: ButtonProps) => {
  return (
    <StyledButton
      variant={variant || 'primary'}
      onClick={() => {
        if (onClick) {
          onClick();
        }
      }}
      disabled={disabled}
      fullWidth={fullWidth}
      color={color}
      size={size}
      whileHover={{ 
        scale: 1.05, 
        backgroundColor: variant === 'primary' ? theme.colors.primaryDark : 'transparent', 
        borderColor: variant === 'secondary' ? theme.colors.primaryDark : 'none' 
      }}
      whileTap={{ 
        backgroundColor: variant === 'primary' ? theme.colors.primaryDarker : 'transparent', 
        borderColor: variant === 'secondary' ? theme.colors.primaryDarker : 'none' 
      }}
    >
      {icon}
      <EmphasisTypography variant='m' color={variant === 'primary' ? theme.colors.white : color} align='center'>
        {children}
      </EmphasisTypography>
    </StyledButton>
  )
}

const StyledButton = styled(motion.button)<ButtonProps>`
  width: ${({ fullWidth }) => fullWidth ? '100%' : 'fit-content'};
  padding: ${({ size }) => size === 's' ? `${theme.spacing.xs} ${theme.spacing.xs}` : size === 'm' ? `${theme.spacing.xs} ${theme.spacing.s}` : `${theme.spacing.s} ${theme.spacing.m}`};
  border-radius: ${theme.borderRadius.m};
  background-color: ${({ color, variant }) => variant === 'primary' ? (color || theme.colors.primary) : 'transparent'};
  border-color: ${({ color, variant }) => variant === 'secondary' ? (color || theme.colors.primary) : 'none'};
  border-width: ${({ variant }) => variant === 'secondary' ? '2px' : 0};
  border-style: ${({ variant }) => variant === 'secondary' ? 'solid' : 'none'};
  cursor: pointer;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.xxs};

  /* &:hover {
    background-color: ${({ color, variant }) => variant === 'primary' ? (color || theme.colors.primaryDark) : 'transparent'};
    border-color: ${({ color, variant }) => variant === 'secondary' ? (theme.colors.primaryDark) : 'none'};
  }

  &:active {
    background-color: ${({ color, variant }) => variant === 'primary' ? (color || theme.colors.primaryLight) : 'transparent'};
    border-color: ${({ color, variant }) => variant === 'secondary' ? (theme.colors.primaryLight) : 'none'};
  } */

  &:disabled {
    background-color: ${theme.colors.silver};
    border-color: ${theme.colors.silver};
    cursor: not-allowed;
  }
`;

export default Button;