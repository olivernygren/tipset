import React from 'react'
import { Fixture, TeamType } from '../../utils/Fixture';
import { Section } from '../section/Section';
import styled from 'styled-components';
import { theme } from '../../theme';
import ClubAvatar from '../avatar/ClubAvatar';
import { AvatarSize } from '../avatar/Avatar';
import NationAvatar from '../avatar/NationAvatar';
import { NormalTypography } from '../typography/Typography';
import TextButton from '../buttons/TextButton';

interface FixturePreviewProps {
  fixture: Fixture;
  hidePredictions?: boolean;
  hasBeenCorrected?: boolean;
  onShowPredictionsClick?: () => void;
  simple?: boolean;
};

const FixturePreview = ({ fixture, hidePredictions, hasBeenCorrected, onShowPredictionsClick, simple }: FixturePreviewProps) => {
  const getFormattedKickoffTime = (kickoffTime: string) => {
    const date = new Date(kickoffTime);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${day}/${month} | ${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
  };

  return (
    <Section 
      flexDirection='row' 
      justifyContent={hidePredictions || simple ? 'flex-start' : 'space-between'} 
      alignItems='center' 
      gap='s' 
      backgroundColor={theme.colors.silverLighter}
      borderRadius={theme.borderRadius.s}
    >
      <Teams showPrediction={!hidePredictions} simple={simple}>
        <TeamContainer>
          {fixture.teamType === TeamType.CLUBS ? (
            <ClubAvatar
              logoUrl={fixture.homeTeam.logoUrl}
              clubName={fixture.homeTeam.name}
              size={AvatarSize.S}
            />
          ) : (
            <NationAvatar
              flagUrl={fixture.homeTeam.logoUrl}
              nationName={fixture.homeTeam.name}
              size={AvatarSize.S}
            />
          )}
          <NormalTypography variant='m'>{fixture.homeTeam.name}</NormalTypography>
        </TeamContainer>
        <NormalTypography variant='s' color={theme.colors.textLight}>vs</NormalTypography>
        <TeamContainer>
          <NormalTypography variant='m'>{fixture.awayTeam.name}</NormalTypography>
          {fixture.teamType === TeamType.CLUBS ? (
            <ClubAvatar
              logoUrl={fixture.awayTeam.logoUrl}
              clubName={fixture.awayTeam.name}
              size={AvatarSize.S}
            />
          ) : (
            <NationAvatar
              flagUrl={fixture.awayTeam.logoUrl}
              nationName={fixture.awayTeam.name}
              size={AvatarSize.S}
            />
          )}
        </TeamContainer>
      </Teams>
      {hasBeenCorrected && (
        <RightAligned>
          <NormalTypography variant='m' color={theme.colors.silverDarker}>Rättad</NormalTypography>
        </RightAligned>
      )}
      {!hidePredictions && !hasBeenCorrected && (
        <RightAligned>
          <TextButton color='primaryDark' onClick={onShowPredictionsClick}>
            Se allas tips
          </TextButton>
        </RightAligned>
      )}
      {!hasBeenCorrected && hidePredictions && (
        <KickoffTime>
          <NormalTypography variant='m' color={theme.colors.silverDarker}>{getFormattedKickoffTime(fixture.kickOffTime)}</NormalTypography>
        </KickoffTime>
      )}
    </Section>
  )
};

const Teams = styled.div<{ showPrediction: boolean, simple?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.s};
  flex: 1;
`;

const TeamContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xxxs};
  width: fit-content;
  white-space: nowrap;
`;

const KickoffTime = styled.div`
  display: flex;
  align-items: center;
  width: fit-content;
  white-space: nowrap;
  margin-right: ${theme.spacing.xxs};
  margin-left: auto;
`;

const RightAligned = styled.div`
  margin-left: auto;

  > span {
    margin-right: ${theme.spacing.xs};
  }
`;

export default FixturePreview;