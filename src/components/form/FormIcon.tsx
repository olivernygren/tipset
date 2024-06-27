import React from 'react';
import { FixtureOutcomeEnum } from '../../utils/Fixture';
import styled from 'styled-components';
import { theme } from '../../theme';
import { EmphasisTypography } from '../typography/Typography';

interface FormIconProps {
  outcome: FixtureOutcomeEnum;
}

const FormIcon = ({ outcome }: FormIconProps) => {
  return (
    <StyledFormIcon outcome={outcome}>
      <EmphasisTypography variant='s' color={theme.colors.white}>{outcome}</EmphasisTypography>
    </StyledFormIcon>
  )
};

const getBackgroundColor = (outcome: FixtureOutcomeEnum) => {
  switch (outcome) {
    case FixtureOutcomeEnum.WIN:
      return '#56BD47';
    case FixtureOutcomeEnum.DRAW:
      return '#EEC803';
    case FixtureOutcomeEnum.LOSS:
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