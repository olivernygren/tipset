import React from 'react';
import styled, { css } from 'styled-components';
import { Eye } from '@phosphor-icons/react';
import { Fixture, TeamType } from '../../utils/Fixture';
import { devices, theme } from '../../theme';
import ClubAvatar from '../avatar/ClubAvatar';
import { AvatarSize } from '../avatar/Avatar';
import NationAvatar from '../avatar/NationAvatar';
import { NormalTypography } from '../typography/Typography';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';
import IconButton from '../buttons/IconButton';
import { Team } from '../../utils/Team';

interface UpcomingFixturePreviewProps {
  fixture: Fixture;
  onShowPredictionsClick?: () => void;
  useShortNames?: boolean;
}

const UpcomingFixturePreview = ({
  fixture, onShowPredictionsClick, useShortNames,
}: UpcomingFixturePreviewProps) => {
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const canViewPredictions = Boolean(fixture.kickOffTime && new Date(fixture.kickOffTime) < new Date());

  const getKickoffTime = (kickoffTime: string) => {
    const date = new Date(kickoffTime);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours}:${minutes < 10 ? `0${minutes}` : minutes}`;
  };

  const getTeamAvatar = (team: Team) => (fixture.teamType === TeamType.CLUBS ? (
    <ClubAvatar
      logoUrl={team.logoUrl}
      clubName={team.name}
      size={isMobile ? AvatarSize.XS : AvatarSize.S}
    />
  ) : (
    <NationAvatar
      flagUrl={team.logoUrl}
      nationName={team.name}
      size={isMobile ? AvatarSize.XS : AvatarSize.S}
    />
  ));

  return (
    <Container
      canViewPredictions={canViewPredictions}
      onClick={canViewPredictions ? onShowPredictionsClick : undefined}
    >
      <Teams>
        <TeamContainer isHomeTeam>
          <NormalTypography variant={isMobile ? 's' : 'm'} align="right">
            {useShortNames && Boolean(fixture.homeTeam.shortName) ? fixture.homeTeam.shortName : fixture.homeTeam.name}
          </NormalTypography>
          {getTeamAvatar(fixture.homeTeam)}
        </TeamContainer>
        <NormalTypography variant="s" color={canViewPredictions ? theme.colors.primary : theme.colors.textLight}>
          {canViewPredictions ? (
            <IconButton
              icon={<Eye size={24} />}
              colors={{ normal: theme.colors.primary, hover: theme.colors.primaryDark }}
              onClick={onShowPredictionsClick || (() => {})}
            />
          ) : getKickoffTime(fixture.kickOffTime)}
        </NormalTypography>
        <TeamContainer>
          {getTeamAvatar(fixture.awayTeam)}
          <NormalTypography variant={isMobile ? 's' : 'm'}>
            {useShortNames && Boolean(fixture.awayTeam.shortName) ? fixture.awayTeam.shortName : fixture.awayTeam.name}
          </NormalTypography>
        </TeamContainer>
      </Teams>
    </Container>
  );
};

const Container = styled.div<{ canViewPredictions?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${theme.colors.silverLighter};
  width: 100%;
  box-sizing: border-box;
  position: relative;
  padding: ${theme.spacing.xs} 0 ${theme.spacing.xs} ${theme.spacing.xs};
  
  @media ${devices.tablet} {
    padding: ${theme.spacing.xxxs} 0;
  }

  @media ${devices.laptop} {
    ${({ canViewPredictions }) => canViewPredictions && css`
      cursor: pointer;
      transition: background-color 0.2s ease;
      &:hover {
        background-color: ${theme.colors.silverLight};
      }
    `}
  }
`;

const Teams = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: ${theme.spacing.xxs};
  
  @media ${devices.tablet} {
    gap: ${theme.spacing.s};
    padding: 0;
    min-height: 48px;
  }
`;

const TeamContainer = styled.div<{ isHomeTeam?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xxxs};
  width: fit-content;
  white-space: nowrap;
  ${({ isHomeTeam }) => isHomeTeam && css`
    justify-content: flex-end;
    margin-left: auto;
  `}
  
  /* @media ${devices.mobileL} {
    ${({ isHomeTeam }) => isHomeTeam && css`
    `}
  } */
`;

const Absolute = styled.div`
  position: absolute;
  top: 50%;
  right: ${theme.spacing.xs};
  transform: translateY(-50%);
`;

export default UpcomingFixturePreview;
