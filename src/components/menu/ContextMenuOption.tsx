import React from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';
import { EmphasisTypography } from '../typography/Typography';

interface ContextMenuOptionProps {
  icon?: React.ReactNode;
  onClick: () => void;
  label: string;
  color?: string;
}

const ContextMenuOption = ({
  icon, label, onClick, color = theme.colors.primary,
}: ContextMenuOptionProps) => (
  <StyledContextMenuOption>
    <Content>
      {icon}
      <EmphasisTypography onClick={onClick} color={color}>{label}</EmphasisTypography>
    </Content>
  </StyledContextMenuOption>
);

const StyledContextMenuOption = styled.div`
  width: 100%;
  padding: ${theme.spacing.xs} ${theme.spacing.s};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  box-sizing: border-box;
  transition: background-color 0.15s ease;
  
  &:hover {
    background-color: ${theme.colors.silverBleach};
  }

  :not(:first-of-type) {
    border-top: 1px solid ${theme.colors.silverLight};
  }
`;

const Content = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  width: 100%;
  box-sizing: border-box;
  transition: transform 0.2s;
`;

export default ContextMenuOption;
