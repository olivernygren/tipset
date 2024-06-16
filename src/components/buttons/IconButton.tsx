import React from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';

interface ButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  backgroundColor?: string;
  disabled?: boolean;
  colors: {
    normal: string;
    hover?: string;
    active?: string;
    disabled?: string;
  }
}

interface StyledButtonProps {
  backgroundColor?: string;
  disabled?: boolean;
  colors: {
    normal: string;
    hover?: string;
    active?: string;
    disabled?: string;
  }
}

const IconButton = ({ icon, backgroundColor, onClick, disabled, colors }: ButtonProps) => {
  return (
    <StyledButton
      onClick={onClick}
      disabled={disabled}
      backgroundColor={backgroundColor}
      colors={colors}
    >
      {icon}
    </StyledButton>
  )
}

const StyledButton = styled.button<StyledButtonProps>`
  border: none;
  background-color: ${({ backgroundColor }) => backgroundColor || 'transparent'};
  cursor: pointer;
  padding: ${theme.spacing.xs};
  border-radius: 50%;

  svg {
    fill: ${({ colors }) => colors.normal};
  }

  &:hover {
    svg {
      fill: ${({ colors }) => colors.hover};
    }
  }

  &:active {
    svg {
      fill: ${({ colors }) => colors.active};
    }
  }

  &:disabled {
    cursor: not-allowed;

    svg {
      fill: ${({ colors }) => colors.disabled};
    }
  }
`;

export default IconButton;