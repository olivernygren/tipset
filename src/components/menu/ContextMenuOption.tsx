import React, { useState } from 'react'
import styled from 'styled-components';
import { theme } from '../../theme';
import { EmphasisTypography } from '../typography/Typography';
import { motion } from 'framer-motion';

interface ContextMenuOptionProps {
  icon?: React.ReactNode;
  onClick: () => void;
  label: string;
  color?: string;
}

const ContextMenuOption = ({ icon, label, onClick, color = theme.colors.primary }: ContextMenuOptionProps) => {
  const [optionHovered, setOptionHovered] = useState<boolean>(false);

  return (
    <StyledContextMenuOption
      onHoverStart={() => setOptionHovered(true)}
      onHoverEnd={() => setOptionHovered(false)}
    >
      <Content isHovered={optionHovered}>
        {icon}
        <EmphasisTypography onClick={onClick} color={color}>{label}</EmphasisTypography>
      </Content>
    </StyledContextMenuOption>
  )
}

const StyledContextMenuOption = styled(motion.div)`
  width: 100%;
  padding: ${theme.spacing.xs} ${theme.spacing.s};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  box-sizing: border-box;

  :not(:first-of-type) {
    border-top: 1px solid ${theme.colors.silverLight};
  }
`;

const Content = styled.div<{ isHovered: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  width: 100%;
  box-sizing: border-box;
  transform: ${({ isHovered }) => isHovered ? 'scale(1.03)' : 'scale(1)'};
  transition: transform 0.2s;
`;

export default ContextMenuOption;