import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { CheckCircle, Eye } from '@phosphor-icons/react';
import { Fixture, TeamType } from '../../utils/Fixture';
import { devices, theme } from '../../theme';
import ClubAvatar from '../avatar/ClubAvatar';
import { AvatarSize } from '../avatar/Avatar';
import NationAvatar from '../avatar/NationAvatar';
import { EmphasisTypography, NormalTypography } from '../typography/Typography';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';
import IconButton from '../buttons/IconButton';
import { Team } from '../../utils/Team';

interface UpcomingFixturePreviewProps {
  fixture: Fixture;
  alreadySelectedFixtures?: Array<Fixture>;
  onShowPredictionsClick?: () => void;
  onSelectFixture?: () => void;
  useShortNames?: boolean;
  backgroundColor?: string;
  hoverColor?: string;
  alwaysClickable?: boolean;
  showDay?: boolean;
}

const UpcomingFixturePreview = ({
  fixture, onShowPredictionsClick, onSelectFixture, useShortNames, backgroundColor = theme.colors.silverLighter, alwaysClickable, hoverColor = theme.colors.silverLight, showDay, alreadySelectedFixtures,
}: UpcomingFixturePreviewProps) => {
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const [isSelected, setIsSelected] = useState<boolean>(alreadySelectedFixtures?.some((selectedFixture) => selectedFixture.id === fixture.id) || false);

  const canViewPredictions = Boolean(fixture.kickOffTime && new Date(fixture.kickOffTime) < new Date() && !alwaysClickable);
  const isAlreadySelectedBefore = alreadySelectedFixtures && alreadySelectedFixtures.some((f) => f.id === fixture.id);

  const getKickoffTime = (kickoffTime: string) => {
    const date = new Date(kickoffTime);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours}:${minutes < 10 ? `0${minutes}` : minutes}`;
  };

  const getKickoffDay = (kickoffTime: string) => {
    const date = new Date(kickoffTime);
    return date.toLocaleDateString('sv-se', { day: 'numeric', month: 'short' }).replaceAll('.', ' ');
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

  const handleClick = () => {
    if (isAlreadySelectedBefore) {
      return;
    }

    if (onSelectFixture) {
      setIsSelected(!isSelected);
      onSelectFixture();
      return;
    }

    if (onShowPredictionsClick) {
      onShowPredictionsClick();
    }
  };

  return (
    <Container
      canViewPredictions={canViewPredictions || alwaysClickable}
      onClick={handleClick}
      backgroundColor={backgroundColor}
      hoverColor={hoverColor}
    >
      <Teams>
        <TeamContainer isHomeTeam>
          <NormalTypography variant={isMobile ? 's' : 'm'} align="right">
            {useShortNames && Boolean(fixture.homeTeam.shortName) ? fixture.homeTeam.shortName : fixture.homeTeam.name}
          </NormalTypography>
          {getTeamAvatar(fixture.homeTeam)}
        </TeamContainer>
        {canViewPredictions ? (
          <IconButton
            icon={<Eye size={24} />}
            colors={{ normal: theme.colors.primary, hover: theme.colors.primaryDark }}
            onClick={onShowPredictionsClick || (() => {})}
          />
        ) : (
          <MiddleSection>
            {isSelected && (
              <CheckCircle size={24} color={isAlreadySelectedBefore ? theme.colors.silverDark : theme.colors.primary} weight="fill" />
            )}
            {showDay && !isSelected && (
              <EmphasisTypography variant="xs" color={theme.colors.textDefault}>
                {getKickoffDay(fixture.kickOffTime)}
              </EmphasisTypography>
            )}
            {!isSelected && (
              <NormalTypography variant="s" color={theme.colors.textLight}>
                {getKickoffTime(fixture.kickOffTime)}
              </NormalTypography>
            )}
            {fixture.aggregateScore && !isSelected && (
              <NormalTypography variant="xs" color={theme.colors.textDefault}>
                {`(${fixture.aggregateScore.homeTeamGoals} - ${fixture.aggregateScore.awayTeamGoals})`}
              </NormalTypography>
            )}
          </MiddleSection>
        )}
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

const Container = styled.div<{ canViewPredictions?: boolean, backgroundColor: string, hoverColor: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ backgroundColor }) => backgroundColor};
  width: 100%;
  box-sizing: border-box;
  position: relative;
  padding: ${theme.spacing.xs} 0;
  
  @media ${devices.tablet} {
    padding: ${theme.spacing.xxxs} 0;
  }

  @media ${devices.laptop} {
    ${({ canViewPredictions, hoverColor }) => canViewPredictions && css`
      cursor: pointer;
      transition: background-color 0.1s ease;
      &:hover {
        background-color: ${hoverColor};
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
`;

const MiddleSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export default UpcomingFixturePreview;
