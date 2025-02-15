import React from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';

interface ToggleProps {
  isSelected: boolean;
  size: 's' | 'm';
  onToggle: () => void;
}

const Toggle: React.FC<ToggleProps> = ({ isSelected, size, onToggle }) => (
  <ToggleContainer size={size} isSelected={isSelected} onClick={onToggle}>
    <div className="toggle-handle" />
  </ToggleContainer>
);

const getTransformValue = (isSelected: boolean, size: 's' | 'm') => {
  if (!isSelected) return 'translateX(0)';
  return size === 's' ? 'translateX(calc(24px - 2px))' : 'translateX(calc(32px - 6px))';
};

const ToggleContainer = styled.div<{ size: 's' | 'm'; isSelected: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: ${theme.spacing.xxxs};
  box-sizing: border-box;
  border: 1px solid ${theme.colors.silverLight};
  cursor: pointer;
  width: ${({ size }) => (size === 's' ? '48px' : '64px')};
  height: ${({ size }) => (size === 's' ? '24px' : '36px')};
  background-color: ${({ isSelected }) => (isSelected ? theme.colors.primary : theme.colors.silverLighter)};
  border-radius: 100px;
  position: relative;
  transition: background-color 0.2s;

  .toggle-handle {
    position: absolute;
    width: ${({ size }) => (size === 's' ? '16px' : '28px')};
    height: ${({ size }) => (size === 's' ? '16px' : '28px')};
    background-color: white;
    border-radius: 50%;
    transition: transform 0.2s;
    transform: ${({ isSelected, size }) => getTransformValue(isSelected, size)};
    box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.1);
  }
`;

export default Toggle;
