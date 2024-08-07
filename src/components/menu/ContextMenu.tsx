import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { theme } from '../../theme';

interface ContextMenuProps {
  children: React.ReactNode;
  positionY: 'top' | 'bottom';
  positionX: 'left' | 'right';
  offsetX: number;
  offsetY: number;
}

interface StyledContextMenuProps {
  positionY: 'top' | 'bottom';
  positionX: 'left' | 'right';
  offsetX: number;
  offsetY: number;
}

const ContextMenu = ({
  children, positionY, positionX, offsetX, offsetY,
}: ContextMenuProps) => (
  <StyledContextMenu
    positionY={positionY}
    positionX={positionX}
    offsetX={offsetX}
    offsetY={offsetY}
    initial={{ opacity: 0, scale: 0.92 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.92 }}
  >
    {children}
  </StyledContextMenu>
);

const StyledContextMenu = styled(motion.div)<StyledContextMenuProps>`
  background-color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.m};
  border: 1px solid ${theme.colors.silverLight};
  position: absolute;
  z-index: 20;
  min-width: 200px;
  width: fit-content;
  overflow: hidden;
  top: ${({ positionY, offsetY }) => (positionY === 'top' ? `${-offsetY}px` : 'unset')};
  bottom: ${({ positionY, offsetY }) => (positionY === 'bottom' ? `${-offsetY}px` : 'unset')};
  left: ${({ positionX, offsetX }) => (positionX === 'left' ? `${-offsetX}px` : 'unset')};
  right: ${({ positionX, offsetX }) => (positionX === 'right' ? `${-offsetX}px` : 'unset')};

  display: flex;
  flex-direction: column;
`;

export default ContextMenu;
