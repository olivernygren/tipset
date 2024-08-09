import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
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
  };
  shape?: 'circle' | 'square';
  title?: string;
  showBorder?: boolean;
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
  showBorder?: boolean;
}

const IconButton = ({
  icon, backgroundColor, onClick, disabled, colors, shape = 'circle', title, showBorder,
}: ButtonProps) => (
  <StyledButton
    onClick={onClick}
    disabled={disabled}
    backgroundColor={backgroundColor}
    colors={colors}
    shape={shape}
    title={title}
    showBorder={showBorder}
    whileHover={{
      scale: 1.05,
      backgroundColor: backgroundColor || 'rgba(0, 0, 0, 0)',
    }}
    whileTap={{
      backgroundColor: backgroundColor || 'rgba(0, 0, 0, 0)',
    }}
  >
    {icon}
  </StyledButton>
);

const StyledButton = styled(motion.button)<StyledButtonProps>`
  border: none;
  background-color: ${({ backgroundColor }) => backgroundColor || 'transparent'};
  cursor: pointer;
  padding: ${({ showBorder }) => (showBorder ? theme.spacing.xxs : theme.spacing.xxxs)};
  border-radius: ${({ shape }) => (shape === 'circle' ? '50%' : theme.borderRadius.s)};
  height: fit-content;
  display: flex;
  justify-content: center;
  align-items: center;
  border: ${({ showBorder }) => (showBorder ? `1px solid ${theme.colors.silverLight}` : 'none')};

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
