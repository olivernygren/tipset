import React from 'react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { theme } from '../../theme';

type IconButtonColors = {
  normal: string;
  hover?: string;
  active?: string;
  disabled?: string;
};
interface ButtonProps {
  icon: React.ReactNode;
  onClick: (event?: any) => void;
  backgroundColor?: IconButtonColors;
  disabled?: boolean;
  colors: IconButtonColors;
  shape?: 'circle' | 'square';
  title?: string;
  showBorder?: boolean;
  borderColor?: string;
}

interface StyledButtonProps {
  backgroundColor?: IconButtonColors;
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
    // whileHover={{
    //   // scale: disabled ? 1 : 1.05,
    //   backgroundColor: backgroundColor?.hover || 'transparent',
    // }}
    // whileTap={{
    //   backgroundColor: backgroundColor?.active || 'transparent',
    //   scale: disabled ? 1 : 0.96,
    // }}
  >
    {icon}
  </StyledButton>
);

const StyledButton = styled(motion.button)<StyledButtonProps>`
  border: none;
  background-color: ${({ backgroundColor }) => backgroundColor?.normal || 'transparent'};
  cursor: pointer;
  padding: ${({ showBorder, backgroundColor }) => (showBorder || backgroundColor ? theme.spacing.xxs : theme.spacing.xxxs)};
  border-radius: ${({ shape }) => (shape === 'circle' ? '50%' : theme.borderRadius.s)};
  height: fit-content;
  display: flex;
  justify-content: center;
  align-items: center;
  border: ${({ showBorder, borderColor }) => (showBorder ? `1px solid ${borderColor || theme.colors.silverLight}` : 'none')};
  transition: background-color 0.15s ease;

  &:hover {
    ${({ disabled, colors, backgroundColor }) => !disabled && css`
      background-color: ${backgroundColor?.hover || 'transparent'};

      svg {
        fill: ${colors.hover};
      }
    `}
  }

  &:active {
    background-color: ${({ backgroundColor }) => backgroundColor?.active || 'transparent'};
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
