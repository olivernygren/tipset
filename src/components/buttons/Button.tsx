import React from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';
import { EmphasisTypography } from '../typography/Typography';
import { motion } from 'framer-motion';
import { SpinnerGap } from '@phosphor-icons/react';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  children: any;
  disabled?: boolean;
  fullWidth?: boolean;
  color?: string;
  size?: 's' | 'm' | 'l';
  icon?: React.ReactNode;
  loading?: boolean;
}

const Button = ({ variant = 'primary', onClick, children, disabled, fullWidth, color = theme.colors.primary, size = 'm', icon, loading }: ButtonProps) => {
  return (
    <StyledButton
      variant={variant || 'primary'}
      onClick={() => {
        if (onClick) {
          onClick();
        }
      }}
      disabled={disabled || loading}
      fullWidth={fullWidth}
      color={color}
      size={size}
      whileHover={{ 
        scale: 1.03, 
        backgroundColor: variant === 'primary' ? theme.colors.primaryDark : 'transparent', 
        borderColor: variant === 'secondary' ? theme.colors.primaryDark : 'none' 
      }}
      whileTap={{ 
        backgroundColor: variant === 'primary' ? theme.colors.primaryDarker : 'transparent', 
        borderColor: variant === 'secondary' ? theme.colors.primaryDarker : 'none' 
      }}
    >
      {icon}
      {loading ? (
        <RotationalSpinner>
          <SpinnerGap size={24} color={variant === 'primary' ? theme.colors.white : theme.colors.primary} />
        </RotationalSpinner>
      ) : (
        <EmphasisTypography variant='m' color={variant === 'primary' ? theme.colors.white : color} align='center'>
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

  &:disabled {
    background-color: ${theme.colors.silver};
    border-color: ${theme.colors.silver};
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