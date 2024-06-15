import React from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';
import { EmphasisTypography } from '../typography/Typography';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  onClick: () => void;
  children: any;
  disabled?: boolean;
  fullWidth?: boolean;
  color?: string;
}

const Button = ({ variant = 'primary', onClick, children, disabled, fullWidth, color }: ButtonProps) => {
  return (
    <StyledButton
      variant={variant || 'primary'}
      onClick={onClick}
      disabled={disabled}
      fullWidth={fullWidth}
      color={color}
    >
      <EmphasisTypography variant='m' color={variant === 'primary' ? theme.colors.white : color}>
        {children}
      </EmphasisTypography>
    </StyledButton>
  )
}

const StyledButton = styled.button<ButtonProps>`
  width: ${({ fullWidth }) => fullWidth ? '100%' : 'fit-content'};
  padding: ${theme.spacing.xs} ${theme.spacing.s};
  border-radius: ${theme.borderRadius.m};
  background-color: ${({ color, variant }) => variant === 'primary' ? (color || theme.colors.primary) : 'transparent'};
  border-color: ${({ color, variant }) => variant === 'secondary' ? (color || theme.colors.primary) : 'none'};
  border-width: ${({ variant }) => variant === 'secondary' ? '2px' : 0};
  border-style: ${({ variant }) => variant === 'secondary' ? 'solid' : 'none'};
  cursor: pointer;
  box-sizing: border-box;

  &:hover {
    background-color: ${({ color, variant }) => variant === 'primary' ? (color || theme.colors.primaryDark) : 'transparent'};
    border-color: ${({ color, variant }) => variant === 'secondary' ? (theme.colors.primaryDark) : 'none'};
  }

  &:active {
    background-color: ${({ color, variant }) => variant === 'primary' ? (color || theme.colors.primaryLight) : 'transparent'};
    border-color: ${({ color, variant }) => variant === 'secondary' ? (theme.colors.primaryLight) : 'none'};
  }

  &:disabled {
    background-color: ${theme.colors.silver};
    border-color: ${theme.colors.silver};
    cursor: not-allowed;
  }
`;

export default Button;