import React from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';
import { EmphasisTypography } from '../typography/Typography';
import { motion } from 'framer-motion';
import { SpinnerGap } from '@phosphor-icons/react';
import { ButtonProps } from './Button';

interface TextButtonProps extends ButtonProps {
  noPadding?: boolean
}

const TextButton = ({ variant = 'primary', onClick, children, disabled, fullWidth, color = "primary", size = 'm', icon, loading, noPadding }: TextButtonProps) => {
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
      noPadding={noPadding}
      whileHover={{ 
        scale: 1.03,
      }}
    >
      {icon}
      {loading ? (
        <RotationalSpinner>
          <SpinnerGap size={24} color={color || theme.colors.primary} />
        </RotationalSpinner>
      ) : (
        <EmphasisTypography variant='m' color={color || theme.colors.primary} align='center'>
          {children}
        </EmphasisTypography>
      )}
    </StyledButton>
  )
}

const StyledButton = styled(motion.button)<TextButtonProps>`
  width: ${({ fullWidth }) => fullWidth ? '100%' : 'fit-content'};
  padding: ${({ size, noPadding }) => noPadding ? '0' : size === 's' ? `${theme.spacing.xs} ${theme.spacing.xs}` : size === 'm' ? `${theme.spacing.xs} ${theme.spacing.s}` : `${theme.spacing.s} ${theme.spacing.m}`};  border-radius: ${theme.borderRadius.m};
  background-color: transparent !important;
  border-color: ${({ color, variant }) => variant === 'secondary' ? (color || theme.colors.primary) : 'unset'};
  border-width: ${({ variant }) => variant === 'secondary' ? '2px' : 0};
  border-style: ${({ variant }) => variant === 'secondary' ? 'solid' : 'none'};
  cursor: pointer;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.xxs};

  &:disabled {
    background-color: transparent;
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

export default TextButton;