import React from 'react';
import { TeamMatchOutcomeEnum } from '../../utils/Game';
import styled from 'styled-components';
import { theme } from '../../theme';
import { EmphasisTypography } from '../typography/Typography';

interface FormIconProps {
  outcome: TeamMatchOutcomeEnum;
}

const FormIcon = ({ outcome }: FormIconProps) => {
  return (
    <StyledFormIcon outcome={outcome}>
      <EmphasisTypography variant='s' color={theme.colors.white}>{outcome}</EmphasisTypography>
    </StyledFormIcon>
  )
};

const getBackgroundColor = (outcome: TeamMatchOutcomeEnum) => {
  switch (outcome) {
    case TeamMatchOutcomeEnum.WIN:
      return '#56BD47';
    case TeamMatchOutcomeEnum.DRAW:
      return '#EEC803';
    case TeamMatchOutcomeEnum.LOSS:
      return '#DC1414';
    default:
      return theme.colors.silver;
  }
}

const StyledFormIcon = styled.div<FormIconProps>`
  height: 20px;
  width: 20px;
  border-radius: 6px;
  background-color: ${({ outcome }) => getBackgroundColor(outcome)};
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default FormIcon;