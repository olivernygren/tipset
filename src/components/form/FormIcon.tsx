import React from 'react';
import styled, { css } from 'styled-components';
import { FixtureOutcomeEnum } from '../../utils/Fixture';
import { theme } from '../../theme';
import { EmphasisTypography } from '../typography/Typography';

interface FormIconProps {
  outcome: FixtureOutcomeEnum;
  onClick?: () => void;
  showBorder?: boolean;
}

const FormIcon = ({ outcome, onClick, showBorder }: FormIconProps) => (
  <StyledFormIcon
    outcome={outcome}
    onClick={onClick}
    showBorder={showBorder}
  >
    <EmphasisTypography variant="s" color={theme.colors.white}>{outcome}</EmphasisTypography>
  </StyledFormIcon>
);

export const getOutcomeBackgroundColor = (outcome: FixtureOutcomeEnum) => {
  switch (outcome) {
    case FixtureOutcomeEnum.WIN:
      return theme.colors.primary;
    case FixtureOutcomeEnum.DRAW:
      return theme.colors.gold;
    case FixtureOutcomeEnum.LOSS:
      return theme.colors.red;
    default:
      return theme.colors.silver;
  }
};

const StyledFormIcon = styled.div<FormIconProps>`
  height: 20px;
  width: 20px;
  border-radius: 6px;
  background-color: ${({ outcome }) => getOutcomeBackgroundColor(outcome)};
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: ${({ onClick }) => (onClick ? 'pointer' : 'default')};
  transition: all 0.2s ease;
  border: ${({ showBorder }) => (showBorder ? `2px solid ${theme.colors.white}` : 'none')};
  box-shadow: ${({ showBorder }) => (showBorder ? `0 0 0 1px ${theme.colors.silver}` : 'none')};

  ${({ onClick }) => onClick && css`
    &:hover {
      transform: scale(1.05);
    }
  `}
`;

export default FormIcon;
