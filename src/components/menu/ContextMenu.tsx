import React from 'react'
import styled from 'styled-components';
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

const ContextMenu = ({ children, positionY, positionX, offsetX, offsetY }: ContextMenuProps) => {
  return (
    <StyledContextMenu
      positionY={positionY}
      positionX={positionX}
      offsetX={offsetX}
      offsetY={offsetY}
    >
      {children}
    </StyledContextMenu>
  )
}

const StyledContextMenu = styled.div<StyledContextMenuProps>`
  background-color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.m};
  border: 1px solid ${theme.colors.silver};
  position: absolute;
  z-index: 20;
  min-width: 200px;
  width: fit-content;
  overflow: hidden;
  top: ${({ positionY, offsetY }) => positionY === 'top' ? `${-offsetY}px` : 'unset'};
  bottom: ${({ positionY, offsetY }) => positionY === 'bottom' ? `${-offsetY}px` : 'unset'};
  left: ${({ positionX, offsetX }) => positionX === 'left' ? `${-offsetX}px` : 'unset'};
  right: ${({ positionX, offsetX }) => positionX === 'right' ? `${-offsetX}px` : 'unset'};

  display: flex;
  flex-direction: column;
`;

export default ContextMenu;