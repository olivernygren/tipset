import { Info } from '@phosphor-icons/react';
import React from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';
import { HeadingsTypography, NormalTypography } from '../typography/Typography';

type InfoDialogueColor = 'primary' | 'gold' | 'red' | 'silver';

interface InfoDialogueProps {
  color?: InfoDialogueColor;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

const InfoDialogue = ({
  color = 'gold', title, description, icon,
}: InfoDialogueProps) => {
  const textColor = theme.colors[`${color}Darker`];
  const bgColor = theme.colors[`${color}Fade`];
  const borderColor = theme.colors[`${color}Light`];

  return (
    <Container bgColor={bgColor} borderColor={borderColor}>
      {icon || <Info size={24} color={textColor} weight="fill" />}
      <TextContainer>
        <HeadingsTypography variant="h6" color={textColor}>{title}</HeadingsTypography>
        <NormalTypography color={textColor}>{description}</NormalTypography>
      </TextContainer>
    </Container>
  );
};

const Container = styled.div<{ bgColor: string, borderColor: string }>`
  display: flex;
  background-color: ${({ bgColor }) => bgColor};
  border: 1px solid ${({ borderColor }) => borderColor};
  border-radius: ${theme.borderRadius.m};
  gap: ${theme.spacing.xxs};
  padding: ${theme.spacing.xs};
  width: 100%;
  box-sizing: border-box;
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xxxs};
  margin-top: 2px;
`;

export default InfoDialogue;
