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
  const getTextColor = () => {
    switch (color) {
      case 'gold':
        return theme.colors.goldDarker;
      case 'primary':
        return theme.colors.primaryDark;
      case 'red':
        return theme.colors.redDark;
      case 'silver':
        return theme.colors.silverDark;
      default:
        return theme.colors[`${color}Darker`];
    }
  };

  const getBackgroundColor = () => {
    switch (color) {
      case 'gold':
        return theme.colors.goldFade;
      case 'primary':
        return theme.colors.primaryFade;
      case 'red':
        return theme.colors.redFade;
      case 'silver':
        return theme.colors.silverBleach;
      default:
        return theme.colors[`${color}Fade`];
    }
  };

  const getBorderColor = () => {
    switch (color) {
      case 'gold':
        return theme.colors.goldLight;
      case 'primary':
        return theme.colors.primaryLighter;
      case 'red':
        return theme.colors.redLighter;
      case 'silver':
        return theme.colors.silverLight;
      default:
        return theme.colors[`${color}Light`];
    }
  };

  return (
    <Container bgColor={getBackgroundColor()} borderColor={getBorderColor()}>
      <IconContainer>
        {icon || <Info size={24} color={getTextColor()} weight="fill" />}
      </IconContainer>
      <TextContainer hasDescription={!!description}>
        <HeadingsTypography variant="h6" color={getTextColor()}>{title}</HeadingsTypography>
        <NormalTypography color={getTextColor()}>{description}</NormalTypography>
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

const TextContainer = styled.div<{ hasDescription?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xxxs};
  margin-top: ${({ hasDescription }) => (hasDescription ? '2px' : 0)};
`;

const IconContainer = styled.div`
  min-width: 24px;
`;

export default InfoDialogue;
