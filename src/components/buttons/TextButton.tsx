import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { SpinnerGap } from '@phosphor-icons/react';
import { theme } from '../../theme';
import { EmphasisTypography } from '../typography/Typography';
import { ButtonProps } from './Button';

interface TextButtonProps extends ButtonProps {
  noPadding?: boolean;
  title?: string;
}

const TextButton = ({
  variant = 'primary', onClick, children, disabled, fullWidth, color = 'primary', size = 'm', icon, loading, noPadding, title, endIcon,
}: TextButtonProps) => (
  <StyledButton
    title={title}
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
      scale: disabled ? 1 : 1.02,
    }}
  >
    {icon}
    {loading ? (
      <RotationalSpinner>
        <SpinnerGap size={24} color={theme.colors[color] || theme.colors.primary} />
      </RotationalSpinner>
    ) : (
      <EmphasisTypography variant="m" color={disabled ? theme.colors.silver : (theme.colors[color] || theme.colors.primary)} align="center">
        {children}
      </EmphasisTypography>
    )}
    {endIcon}
  </StyledButton>
);

const getPadding = (size: 's' | 'm' | 'l' | undefined, noPadding?: boolean) => {
  if (noPadding) {
    return '0';
  }

  if (size === 's') {
    return `${theme.spacing.xs} ${theme.spacing.xs}`;
  }

  if (size === 'm') {
    return `${theme.spacing.xs} ${theme.spacing.s}`;
  }

  return `${theme.spacing.s} ${theme.spacing.m}`;
};

const StyledButton = styled(motion.button)<TextButtonProps>`
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'fit-content')};
  padding: ${({ size, noPadding }) => getPadding(size, noPadding)};
  border-radius: ${theme.borderRadius.m};
  background-color: transparent !important;
  border-color: ${({ color, variant }) => (variant === 'secondary' ? (color || theme.colors.primary) : 'unset')};
  border-width: ${({ variant }) => (variant === 'secondary' ? '2px' : 0)};
  border-style: ${({ variant }) => (variant === 'secondary' ? 'solid' : 'none')};
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
