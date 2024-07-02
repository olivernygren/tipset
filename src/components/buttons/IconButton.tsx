import React from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';
import { motion } from 'framer-motion';

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
  };
  shape?: 'circle' | 'square';
}

interface StyledButtonProps {
  backgroundColor?: string;
  disabled?: boolean;
  colors: {
    normal: string;
    hover?: string;
    active?: string;
    disabled?: string;
  };
  shape?: 'circle' | 'square';
}

const IconButton = ({ icon, backgroundColor, onClick, disabled, colors, shape = 'circle' }: ButtonProps) => {
  return (
    <StyledButton
      onClick={onClick}
      disabled={disabled}
      backgroundColor={backgroundColor}
      colors={colors}
      shape={shape}
      whileHover={{ 
        scale: 1.05, 
        backgroundColor: backgroundColor ? backgroundColor : 'rgba(0, 0, 0, 0)', 
      }}
      whileTap={{ 
        backgroundColor: backgroundColor ? backgroundColor : 'rgba(0, 0, 0, 0)', 
      }}
    >
      {icon}
    </StyledButton>
  )
}

const StyledButton = styled(motion.button)<StyledButtonProps>`
  border: none;
  background-color: ${({ backgroundColor }) => backgroundColor || 'transparent'};
  cursor: pointer;
  padding: ${theme.spacing.xxxs};
  border-radius: ${({ shape }) => shape === 'circle' ? '50%' : theme.borderRadius.s};
  height: fit-content;
  display: flex;
  justify-content: center;
  align-items: center;

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