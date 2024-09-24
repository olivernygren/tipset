import React from 'react';
import styled, { css } from 'styled-components';
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
  borderColor?: string;
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
  borderColor?: string;
}

const IconButton = ({
  icon, backgroundColor, onClick, disabled, colors, shape = 'circle', title, showBorder, borderColor,
}: ButtonProps) => (
  <StyledButton
    onClick={onClick}
    disabled={disabled}
    backgroundColor={backgroundColor}
    colors={colors}
    shape={shape}
    title={title}
    showBorder={showBorder}
    borderColor={borderColor}
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
  padding: ${({ showBorder, backgroundColor }) => (showBorder || backgroundColor ? theme.spacing.xxs : theme.spacing.xxxs)};
  border-radius: ${({ shape }) => (shape === 'circle' ? '50%' : theme.borderRadius.s)};
  height: fit-content;
  display: flex;
  justify-content: center;
  align-items: center;
  border: ${({ showBorder, borderColor }) => (showBorder ? `1px solid ${borderColor || theme.colors.silverLight}` : 'none')};

  &:hover {
    ${({ disabled, colors }) => !disabled && css`
      svg {
        fill: ${colors.hover};
      }
    `}
  }

  &:active {
    svg {
      fill: ${({ colors }) => colors.active};
    }
  }

  &:disabled {
    cursor: not-allowed;

    ${({ backgroundColor, colors, showBorder }) => {
    if (backgroundColor) {
      return `
        background-color: ${colors.disabled || theme.colors.silverLight};
      `;
    }

    if (showBorder) {
      return `
        border: 1px solid ${colors.disabled || theme.colors.silver};
        svg {
          fill: ${colors.disabled};
        }
      `;
    }

    return `
      background-color: transparent;
    `;
  }}
  }

  svg {
    fill: ${({ colors, disabled }) => (disabled ? colors.disabled : colors.normal)};
  }
`;

export default IconButton;
