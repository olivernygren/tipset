import React from 'react';
import styled from 'styled-components';
import { Check, Eye } from '@phosphor-icons/react';
import { Fixture, TeamType } from '../../utils/Fixture';
import { Section } from '../section/Section';
import { devices, theme } from '../../theme';
import ClubAvatar from '../avatar/ClubAvatar';
import { AvatarSize } from '../avatar/Avatar';
import NationAvatar from '../avatar/NationAvatar';
import { NormalTypography } from '../typography/Typography';
import TextButton from '../buttons/TextButton';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';
import IconButton from '../buttons/IconButton';
import { Team } from '../../utils/Team';

interface FixturePreviewProps {
  fixture: Fixture;
  hidePredictions?: boolean;
  hasBeenCorrected?: boolean;
  onShowPredictionsClick?: () => void;
  onClick?: () => void;
  simple?: boolean;
  isCorrectionMode?: boolean;
  isCreationMode?: boolean;
  useShortNames?: boolean;
}

const CreateAndCorrectFixturePreview = ({
  fixture, hidePredictions, hasBeenCorrected, onShowPredictionsClick, simple, isCorrectionMode, isCreationMode, useShortNames, onClick,
}: FixturePreviewProps) => {
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const getKickoffTime = (kickoffTime: string) => {
    const date = new Date(kickoffTime);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours}:${minutes < 10 ? `0${minutes}` : minutes}`;
  };

  const getAvatar = (team: Team) => (fixture.teamType === TeamType.CLUBS ? (
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
    <Container>
      <Teams showPrediction={!hidePredictions}>
        <TeamContainer>
          <NormalTypography variant={isMobile ? 's' : 'm'}>
            {useShortNames && Boolean(fixture.homeTeam.shortName) ? fixture.homeTeam.shortName : fixture.homeTeam.name}
          </NormalTypography>
          {getAvatar(fixture.homeTeam)}
        </TeamContainer>
        <NormalTypography variant="s" color={theme.colors.textLight}>
          {hidePredictions ? getKickoffTime(fixture.kickOffTime) : 'vs'}
        </NormalTypography>
        <TeamContainer>
          {getAvatar(fixture.awayTeam)}
          <NormalTypography variant={isMobile ? 's' : 'm'}>
            {useShortNames && Boolean(fixture.awayTeam.shortName) ? fixture.awayTeam.shortName : fixture.awayTeam.name}
          </NormalTypography>
        </TeamContainer>
      </Teams>
      <ButtonsContainer>
        {isCorrectionMode && hasBeenCorrected && (
          <Section flexDirection="row" alignItems="center" gap="xxs" fitContent>
            <NormalTypography variant="m" color={theme.colors.silverDark}>Rättad</NormalTypography>
            <Check size={16} color={theme.colors.silverDark} />
          </Section>
        )}
        {isCorrectionMode && (
        <TextButton color="primary" onClick={onShowPredictionsClick}>
          {hasBeenCorrected ? 'Rätta igen' : 'Rätta'}
        </TextButton>
        )}
      </ButtonsContainer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${theme.borderRadius.m};
  background-color: ${theme.colors.silverLighter};
  width: 100%;
  box-sizing: border-box;
  position: relative;
  padding: ${theme.spacing.xxxs} ${theme.spacing.xxs};
  
  @media ${devices.tablet} {
    padding: 0 0 0 ${theme.spacing.s};
  }
`;

const Teams = styled.div<{ showPrediction: boolean }>`
  display: flex;
  align-items: center;
  padding: ${theme.spacing.xxxs};
  flex: 1;
  gap: ${theme.spacing.xxs};
  
  @media ${devices.tablet} {
    align-items: center;
    padding: 0;
    gap: ${theme.spacing.xs};
    height: 52px;
  }
`;

const TeamContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xxxs};
  width: fit-content;
  white-space: nowrap;
  
  @media ${devices.tablet} {
    gap: 0;
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

export default CreateAndCorrectFixturePreview;
