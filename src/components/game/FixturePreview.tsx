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
};

const FixturePreview = ({ fixture, hidePredictions, hasBeenCorrected, onShowPredictionsClick }: FixturePreviewProps) => {  
  return (
    <Section 
      flexDirection='row' 
      justifyContent={hidePredictions ? 'flex-start' : 'space-between'} 
      alignItems='center' 
      gap='s' 
      backgroundColor={theme.colors.silverLighter}
      borderRadius={theme.borderRadius.s}
    >
      <Teams showPrediction={!hidePredictions}>
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
        <NormalTypography variant='m'>Rättad</NormalTypography>
      )}
      {!hidePredictions && (
        <TextButton color='primaryDark' onClick={onShowPredictionsClick}>
          Se vad alla har tippat
        </TextButton>
      )}
    </Section>
  )
};

const Teams = styled.div<{ showPrediction: boolean }>`
  display: grid;
  align-items: center;
  gap: ${theme.spacing.s};
  grid-template-columns: ${({ showPrediction }) => showPrediction ? 'repeat(3, auto)' : '1fr auto 1fr'};
  width: ${({ showPrediction }) => showPrediction ? 'fit-content' : '100%'};

  :nth-child(3) {
    margin-left: auto;
  }
`;

const TeamContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xxxs};
  width: fit-content;
`;

export default FixturePreview;