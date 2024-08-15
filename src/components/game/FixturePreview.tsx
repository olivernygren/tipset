import React from 'react';
import styled from 'styled-components';
import { Fixture, TeamType } from '../../utils/Fixture';
import { Section } from '../section/Section';
import { devices, theme } from '../../theme';
import ClubAvatar from '../avatar/ClubAvatar';
import { AvatarSize } from '../avatar/Avatar';
import NationAvatar from '../avatar/NationAvatar';
import { NormalTypography } from '../typography/Typography';
import TextButton from '../buttons/TextButton';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';

interface FixturePreviewProps {
  fixture: Fixture;
  hidePredictions?: boolean;
  hasBeenCorrected?: boolean;
  onShowPredictionsClick?: () => void;
  simple?: boolean;
  isCorrectionMode?: boolean;
  useShortNames?: boolean;
}

const FixturePreview = ({
  fixture, hidePredictions, hasBeenCorrected, onShowPredictionsClick, simple, isCorrectionMode, useShortNames,
}: FixturePreviewProps) => {
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  // const getFormattedKickoffTime = (kickoffTime: string) => {
  //   const date = new Date(kickoffTime);
  //   const day = date.getDate();
  //   const month = date.getMonth() + 1;
  //   const hours = date.getHours();
  //   const minutes = date.getMinutes();
  //   return `${day}/${month} | ${hours}:${minutes < 10 ? `0${minutes}` : minutes}`;
  // };

  const getKickoffDate = (kickoffTime: string) => {
    const date = new Date(kickoffTime);
    const day = date.getDate();
    const month = date.toLocaleDateString('sv-SE', { month: 'short' }).replaceAll('.', '');
    return `${day} ${month}`;
  };

  const getKickoffTime = (kickoffTime: string) => {
    const date = new Date(kickoffTime);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours}:${minutes < 10 ? `0${minutes}` : minutes}`;
  };

  return (
    <Section
      flexDirection="row"
      justifyContent={hidePredictions || simple ? 'flex-start' : 'space-between'}
      alignItems="center"
      gap="s"
      backgroundColor={theme.colors.silverLighter}
      borderRadius={theme.borderRadius.s}
    >
      <Teams showPrediction={!hidePredictions}>
        <TeamContainer>
          {fixture.teamType === TeamType.CLUBS ? (
            <ClubAvatar
              logoUrl={fixture.homeTeam.logoUrl}
              clubName={fixture.homeTeam.name}
              size={isMobile ? AvatarSize.XS : AvatarSize.S}
            />
          ) : (
            <NationAvatar
              flagUrl={fixture.homeTeam.logoUrl}
              nationName={fixture.homeTeam.name}
              size={isMobile ? AvatarSize.XS : AvatarSize.S}
            />
          )}
          <NormalTypography variant={isMobile ? 's' : 'm'}>{useShortNames && Boolean(fixture.homeTeam.shortName) ? fixture.homeTeam.shortName : fixture.homeTeam.name}</NormalTypography>
        </TeamContainer>
        {!isMobile && (
          <NormalTypography variant="s" color={theme.colors.textLight}>vs</NormalTypography>
        )}
        <TeamContainer reverse={isMobile}>
          <NormalTypography variant={isMobile ? 's' : 'm'}>{useShortNames && Boolean(fixture.awayTeam.shortName) ? fixture.awayTeam.shortName : fixture.awayTeam.name}</NormalTypography>
          {fixture.teamType === TeamType.CLUBS ? (
            <ClubAvatar
              logoUrl={fixture.awayTeam.logoUrl}
              clubName={fixture.awayTeam.name}
              size={isMobile ? AvatarSize.XS : AvatarSize.S}
            />
          ) : (
            <NationAvatar
              flagUrl={fixture.awayTeam.logoUrl}
              nationName={fixture.awayTeam.name}
              size={isMobile ? AvatarSize.XS : AvatarSize.S}
            />
          )}
        </TeamContainer>
      </Teams>
      {hasBeenCorrected && (
        <RightAligned>
          {isCorrectionMode ? (
            <TextButton color="primary" onClick={onShowPredictionsClick}>
              {isCorrectionMode ? 'Rätta' : 'Se allas tips'}
            </TextButton>
          ) : (
            <NormalTypography variant="m" color={theme.colors.silverDarker}>Rättad</NormalTypography>
          )}
        </RightAligned>
      )}
      {!hidePredictions && !hasBeenCorrected && (
        <RightAligned>
          <TextButton color="primary" onClick={onShowPredictionsClick}>
            {isCorrectionMode ? 'Rätta' : 'Se allas tips'}
          </TextButton>
        </RightAligned>
      )}
      {!hasBeenCorrected && hidePredictions && (
        <KickoffTime>
          <NormalTypography variant={isMobile ? 's' : 'm'} color={theme.colors.primary}>{getKickoffDate(fixture.kickOffTime)}</NormalTypography>
          <NormalTypography variant="s" color={theme.colors.silverDark}>{getKickoffTime(fixture.kickOffTime)}</NormalTypography>
        </KickoffTime>
      )}
    </Section>
  );
};

const Teams = styled.div<{ showPrediction: boolean }>`
  display: flex;
  flex-direction: column;
  padding: ${theme.spacing.xxxs};
  flex: 1;
  
  @media ${devices.tablet} {
    flex-direction: row;
    align-items: center;
    padding: 0;
    gap: ${theme.spacing.s};
    min-height: 48px;
  }
`;

const TeamContainer = styled.div<{ reverse?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xxxs};
  width: fit-content;
  white-space: nowrap;
  flex-direction: ${({ reverse }) => (reverse ? 'row-reverse' : 'row')};
  
  @media ${devices.tablet} {
    gap: 0;
  }
`;

const KickoffTime = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: fit-content;
  padding: 0 ${theme.spacing.xxs};
  gap: ${theme.spacing.xxxs};
  border-left: 1px solid ${theme.colors.silverLight};

  @media ${devices.tablet} {
    gap: 0;
  }
`;

const RightAligned = styled.div`
  margin-left: auto;

  > span {
    margin-right: ${theme.spacing.xs};
  }
`;

export default FixturePreview;
