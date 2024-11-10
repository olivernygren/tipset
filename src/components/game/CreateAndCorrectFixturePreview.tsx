import React from 'react';
import styled from 'styled-components';
import { Check, CheckFat, CheckSquare } from '@phosphor-icons/react';
import { Fixture, TeamType } from '../../utils/Fixture';
import { Section } from '../section/Section';
import { devices, theme } from '../../theme';
import ClubAvatar from '../avatar/ClubAvatar';
import { AvatarSize } from '../avatar/Avatar';
import NationAvatar from '../avatar/NationAvatar';
import { NormalTypography } from '../typography/Typography';
import TextButton from '../buttons/TextButton';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';
import { Team } from '../../utils/Team';
import IconButton from '../buttons/IconButton';

interface FixturePreviewProps {
  fixture: Fixture;
  hidePredictions?: boolean;
  hasBeenCorrected?: boolean;
  onShowPredictionsClick?: () => void;
  onClick?: () => void;
  isCorrectionMode?: boolean;
  useShortNames?: boolean;
}

const CreateAndCorrectFixturePreview = ({
  fixture, hidePredictions, hasBeenCorrected, onShowPredictionsClick, isCorrectionMode, useShortNames, onClick,
}: FixturePreviewProps) => {
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const getKickoffTime = (kickoffTime: string) => {
    const date = new Date(kickoffTime);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours}:${minutes < 10 ? `0${minutes}` : minutes}`;
  };

  const kickoffHasPassed = Boolean(fixture.kickOffTime && new Date(fixture.kickOffTime) < new Date());

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
    <Container onClick={onClick}>
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
            {isMobile ? (
              <CheckSquare size={16} color={theme.colors.silverDark} weight="fill" />
            ) : (
              <>
                <NormalTypography variant="m" color={theme.colors.silverDark}>Rättad</NormalTypography>
                <Check size={16} color={theme.colors.silverDark} />
              </>
            )}
          </Section>
        )}
        {isCorrectionMode && kickoffHasPassed && (
          isMobile ? (
            <IconButton
              icon={<CheckFat size={20} weight="fill" />}
              colors={{ normal: theme.colors.primary }}
              onClick={onShowPredictionsClick || (() => {})}
            />
          ) : (
            <TextButton color="primary" onClick={onShowPredictionsClick} noPadding>
              {hasBeenCorrected ? 'Rätta igen' : 'Rätta'}
            </TextButton>
          )
        )}
      </ButtonsContainer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  border-radius: ${theme.borderRadius.m};
  background-color: ${theme.colors.silverLighter};
  width: 100%;
  box-sizing: border-box;
  position: relative;
  padding: ${theme.spacing.xxxs} ${theme.spacing.xxs};
  cursor: pointer;

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
  gap: ${theme.spacing.xxxs};
  padding-right: ${theme.spacing.xxxs};
  
  @media ${devices.tablet} {
    gap: ${theme.spacing.xs};
    padding-right: ${theme.spacing.xs};
  }
`;

export default CreateAndCorrectFixturePreview;
