import React from 'react';
import styled from 'styled-components';
import { FixtureOutcomeEnum } from '../../utils/Fixture';
import { theme } from '../../theme';
import { EmphasisTypography } from '../typography/Typography';

interface FormIconProps {
  outcome: FixtureOutcomeEnum;
}

const FormIcon = ({ outcome }: FormIconProps) => (
  <StyledFormIcon outcome={outcome}>
    <EmphasisTypography variant="s" color={theme.colors.white}>{outcome}</EmphasisTypography>
  </StyledFormIcon>
);

const getBackgroundColor = (outcome: FixtureOutcomeEnum) => {
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
  background-color: ${({ outcome }) => getBackgroundColor(outcome)};
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default FormIcon;
