import React from 'react';
import { css, styled } from 'styled-components';
import { theme } from '../../theme';
import { EmphasisTypography } from '../typography/Typography';

interface MockedStandingsRowProps {
  position: number;
  type: 'full' | 'bottom' | 'top';
}

const MockedStandingsRow = ({ position, type }: MockedStandingsRowProps) => (
  <StandingsRow>
    <FadeOverlay itemType={type} />
    <StandingsPosition>
      <EmphasisTypography variant="s" color={theme.colors.primaryDark}>{position}</EmphasisTypography>
    </StandingsPosition>
    <StandingsMockTeamBadge />
    <StandingMockTeamName />
    <StandingMockPoints />
  </StandingsRow>
);

const StandingsRow = styled.div`
  background-color: ${theme.colors.silverLighter};
  padding: ${theme.spacing.xxs};
  border-radius: ${theme.borderRadius.s};
  display: flex;
  gap: ${theme.spacing.xxs};
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  position: relative;
`;

const StandingsPosition = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${theme.colors.silverLight};
  border-radius: ${theme.borderRadius.xs};
  width: 24px;
  height: 24px;

  ${EmphasisTypography} {
    opacity: 0.4;
  }
`;

const StandingsMockTeamBadge = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${theme.colors.silverLight};
`;

const StandingMockTeamName = styled.div`
  width: 90px;
  height: 20px;
  border-radius: ${theme.borderRadius.s};
  background-color: ${theme.colors.silverLight};
`;

const StandingMockPoints = styled.div`
  width: 30px;
  height: 20px;
  border-radius: ${theme.borderRadius.s};
  background-color: ${theme.colors.silverLight};
  margin-left: auto;
`;

const FadeOverlay = styled.div<{ itemType: 'top' | 'bottom' | 'full' }>`
  position: absolute;
  inset: 0;
  z-index: 1;
  ${({ itemType }) => itemType !== 'full' && css`

  background: linear-gradient(
    to ${itemType === 'top' ? 'bottom' : 'top'},
    ${theme.colors.white} 0%,
    transparent 90%
    );
  `}
`;

export default MockedStandingsRow;
