import React from 'react';
import styled from 'styled-components';
import { Fixture, TeamType } from '../../utils/Fixture';
import { AvatarSize } from '../avatar/Avatar';
import ClubAvatar from '../avatar/ClubAvatar';
import NationAvatar from '../avatar/NationAvatar';
import { EmphasisTypography, NormalTypography } from '../typography/Typography';
import { devices, theme } from '../../theme';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';
import { Team } from '../../utils/Team';

interface FinalResultProps {
  fixture: Fixture;
}

const FinalResult = ({
  fixture,
}: FinalResultProps) => {
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const isFullTime = fixture.finalResult || (fixture.kickOffTime && new Date(fixture.kickOffTime).getTime() + 2 * 60 * 60 * 1000 < new Date().getTime());

  const getAvatar = (team: Team) => (fixture.teamType === TeamType.CLUBS ? (
    <ClubAvatar
      logoUrl={team.logoUrl}
      clubName={team.name}
      size={AvatarSize.XS}
    />
  ) : (
    <NationAvatar
      flagUrl={team.logoUrl}
      nationName={team.name}
      size={AvatarSize.XS}
    />
  ));

  return (
    <FixtureContainer>
      <Teams>
        <TeamContainer>
          <NormalTypography variant={isMobile ? 's' : 'm'} align="right">
            {fixture.homeTeam.name}
          </NormalTypography>
          {getAvatar(fixture.homeTeam)}
        </TeamContainer>
        {!isMobile && (
        <ResultContainer>
          <EmphasisTypography variant={isMobile ? 's' : 'm'} color={theme.colors.textDefault} noWrap>
            {fixture.finalResult?.homeTeamGoals ?? '?'}
            {' '}
            -
            {' '}
            {fixture.finalResult?.awayTeamGoals ?? '?'}
          </EmphasisTypography>
        </ResultContainer>
        )}
        <TeamContainer>
          {getAvatar(fixture.awayTeam)}
          <NormalTypography variant={isMobile ? 's' : 'm'}>
            {fixture.awayTeam.name}
          </NormalTypography>
        </TeamContainer>
      </Teams>
      {isFullTime ? (
        <FullTimeIndicator>
          <EmphasisTypography variant={isMobile ? 's' : 'm'} color={theme.colors.white}>FT</EmphasisTypography>
        </FullTimeIndicator>
      ) : (
        <KickOffTime>
          <EmphasisTypography variant="s" color={theme.colors.white}>LIVE</EmphasisTypography>
        </KickOffTime>
      )}
    </FixtureContainer>
  );
};

const FixtureContainer = styled.div`
  display: flex;
  height: fit-content;
  background-color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.m};
  width: 100%;
  box-sizing: border-box;
  border: 1px solid ${theme.colors.silverLight};
  overflow: hidden;
  position: relative;
  padding: 0 ${theme.spacing.xs};
  justify-content: center;
  box-shadow: 0px 3px 0px 0px ${theme.colors.silverLighter};
  background-color: ${theme.colors.silverBleach};
`;

const Teams = styled.div`
  gap: ${theme.spacing.xxs};
  height: 52px;
  align-items: center;
  justify-content: center;

  display: grid;
  grid-template-columns: 1fr auto 1fr;
  width: 100%;

  & > div:first-child {
    margin-left: auto;
  }
`;

const TeamContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.xxxs};
  align-items: center;
`;

const ResultContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 ${theme.spacing.xxs};
  width: fit-content;
  height: 100%;
  gap: ${theme.spacing.xxxs};
`;

const FullTimeIndicator = styled.div<{ compact?: boolean }>`
  height: fit-content;
  width: fit-content;
  margin: auto 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 100px;
  background-color: ${theme.colors.primary};
  padding: ${theme.spacing.xxxs} ${theme.spacing.xxs};

  position: absolute;
  left: ${theme.spacing.xs};
  top: 50%;
  transform: translateY(-50%);
`;

const KickOffTime = styled.div`
  height: fit-content;
  width: fit-content;
  margin: auto ${theme.spacing.xxs};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 100px;
  background-color: ${theme.colors.red};

  position: absolute;
  left: ${theme.spacing.xxxs};
  top: 50%;
  transform: translateY(-50%);
  
  @media ${devices.tablet} {
    padding: ${theme.spacing.xxxs} ${theme.spacing.xxs};
    flex-direction: row;
    gap: ${theme.spacing.xxxs};
  }
`;

export default FinalResult;
