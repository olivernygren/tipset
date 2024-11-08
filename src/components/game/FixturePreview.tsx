import React from 'react';
import styled from 'styled-components';
import { Eye } from '@phosphor-icons/react';
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

const FixturePreview = ({
  fixture, hidePredictions, hasBeenCorrected, onShowPredictionsClick, simple, isCorrectionMode, isCreationMode, useShortNames, onClick,
}: FixturePreviewProps) => {
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

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
      backgroundColor={isCreationMode || isCorrectionMode ? theme.colors.silverLighter : undefined}
      borderRadius={theme.borderRadius.m}
      onClick={onClick}
      pointer={Boolean(onClick)}
    >
      <Teams showPrediction={!hidePredictions}>
        <TeamContainer isHomeTeam>
          <NormalTypography variant={isMobile ? 's' : 'm'}>{useShortNames && Boolean(fixture.homeTeam.shortName) ? fixture.homeTeam.shortName : fixture.homeTeam.name}</NormalTypography>
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
        </TeamContainer>
        {!isMobile && (
          <NormalTypography variant="s" color={theme.colors.textLight}>{hidePredictions ? getKickoffTime(fixture.kickOffTime) : 'vs'}</NormalTypography>
        )}
        <TeamContainer>
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
          <NormalTypography variant={isMobile ? 's' : 'm'}>{useShortNames && Boolean(fixture.awayTeam.shortName) ? fixture.awayTeam.shortName : fixture.awayTeam.name}</NormalTypography>
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
        <Absolute>
          {isCorrectionMode ? (
            <TextButton color="primary" onClick={onShowPredictionsClick}>
              Rätta
            </TextButton>
          ) : (
            <IconButton
              icon={<Eye size={24} />}
              colors={{ normal: theme.colors.primary, hover: theme.colors.primaryDark }}
              onClick={onShowPredictionsClick || (() => {})}
            />
          )}
        </Absolute>
      )}
    </Section>
  );
};

const Teams = styled.div<{ showPrediction: boolean }>`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  padding: ${theme.spacing.xxxs};
  flex: 1;
  
  @media ${devices.tablet} {
    align-items: center;
    padding: 0;
    gap: ${theme.spacing.xs};
    min-height: 48px;
  }
`;

const TeamContainer = styled.div<{ reverse?: boolean, isHomeTeam?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xxxs};
  width: fit-content;
  white-space: nowrap;
  flex-direction: ${({ reverse }) => (reverse ? 'row-reverse' : 'row')};
  ${({ isHomeTeam }) => isHomeTeam && 'margin-left: auto;'}
  
  @media ${devices.tablet} {
    gap: 0;
  }
`;

// const KickoffTime = styled.div`
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   justify-content: center;
//   height: 100%;
//   width: fit-content;
//   padding: 0 ${theme.spacing.xxs};
//   gap: ${theme.spacing.xxxs};
//   border-left: 1px solid ${theme.colors.silverLight};

//   @media ${devices.tablet} {
//     gap: 0;
//   }
// `;

const RightAligned = styled.div`
  margin-left: auto;

  > span {
    margin-right: ${theme.spacing.xs};
  }
`;

const Absolute = styled.div`
  position: absolute;
  top: 50%;
  right: ${theme.spacing.xs};
  transform: translateY(-50%);
`;

export default FixturePreview;
