import React, { useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useClickOutside } from 'react-haiku';
import { theme } from '../../theme';

interface ContextMenuProps {
  children: React.ReactNode;
  positionY: 'top' | 'bottom';
  positionX: 'left' | 'right';
  offsetX: number;
  offsetY: number;
  overflow?: 'hidden' | 'visible';
  onClose: () => void;
}

interface StyledContextMenuProps {
  overflow: 'hidden' | 'visible';
  positionY: 'top' | 'bottom';
  positionX: 'left' | 'right';
  offsetX: number;
  offsetY: number;
}

const ContextMenu = ({
  children, positionY, positionX, offsetX, offsetY, overflow = 'hidden', onClose,
}: ContextMenuProps) => {
  const ref = useRef(null);

  useClickOutside(ref, onClose);

  return (
    <StyledContextMenu
      ref={ref}
      positionY={positionY}
      positionX={positionX}
      offsetX={offsetX}
      offsetY={offsetY}
      overflow={overflow}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
    >
      {children}
    </StyledContextMenu>
  );
};

const StyledContextMenu = styled(motion.div)<StyledContextMenuProps>`
  background-color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.m};
  border: 1px solid ${theme.colors.silverLight};
  position: absolute;
  z-index: 20;
  min-width: 200px;
  width: fit-content;
  overflow: ${({ overflow }) => overflow};
  top: ${({ positionY, offsetY }) => (positionY === 'top' ? `${-offsetY}px` : 'unset')};
  bottom: ${({ positionY, offsetY }) => (positionY === 'bottom' ? `${-offsetY}px` : 'unset')};
  left: ${({ positionX, offsetX }) => (positionX === 'left' ? `${-offsetX}px` : 'unset')};
  right: ${({ positionX, offsetX }) => (positionX === 'right' ? `${-offsetX}px` : 'unset')};

  display: flex;
  flex-direction: column;
`;

export default ContextMenu;
