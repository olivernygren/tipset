import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { Eye } from '@phosphor-icons/react';
import { Fixture, Prediction, TeamType } from '../../utils/Fixture';
import { AvatarSize } from '../avatar/Avatar';
import ClubAvatar from '../avatar/ClubAvatar';
import NationAvatar from '../avatar/NationAvatar';
import { EmphasisTypography, NormalTypography } from '../typography/Typography';
import { devices, theme } from '../../theme';
import { Section } from '../section/Section';
import TextButton from '../buttons/TextButton';
import { useUser } from '../../context/UserContext';
// eslint-disable-next-line import/no-cycle
import PredictionsModal from '../league/PredictionsModal';
import IconButton from '../buttons/IconButton';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';

interface FixtureResultPreviewProps {
  fixture: Fixture;
  predictions?: Array<Prediction>;
  showBorder?: boolean;
  compact?: boolean;
  isFullTime?: boolean;
}

const FixtureResultPreview = ({
  fixture, predictions, compact, showBorder, isFullTime = true,
}: FixtureResultPreviewProps) => {
  const { user } = useUser();
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const getFormattedKickOffDate = (kickOffTime: string) => {
    const date = new Date(kickOffTime);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' }).replaceAll('.', '');
    return `${day} ${month}`;
  };

  const getFormattedKickOffTime = (kickOffTime: string) => {
    const date = new Date(kickOffTime);
    const hours = `${date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()}`;
    const minutes = `${date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()}`;
    return `${hours}:${minutes}`;
  };

  return (
    <>
      <FixtureContainer showBorder={showBorder}>
        {isFullTime ? (
          <FullTimeIndicator>
            <EmphasisTypography variant={isMobile ? 's' : 'm'} color={theme.colors.primaryDarker}>FT</EmphasisTypography>
          </FullTimeIndicator>
        ) : (
          <KickOffTime>
            <EmphasisTypography variant={isMobile ? 's' : 'm'} color={theme.colors.primaryDarker}>{`${getFormattedKickOffDate(fixture.kickOffTime)}`}</EmphasisTypography>
            <NormalTypography variant={isMobile ? 's' : 'm'} color={theme.colors.primaryDarker}>{`${getFormattedKickOffTime(fixture.kickOffTime)}`}</NormalTypography>
          </KickOffTime>
        )}
        <Teams compact={compact}>
          <TeamContainer compact={compact}>
            {!compact && (
              fixture.teamType === TeamType.CLUBS ? (
                <ClubAvatar
                  logoUrl={fixture.homeTeam.logoUrl}
                  clubName={fixture.homeTeam.name}
                  size={compact ? AvatarSize.XS : AvatarSize.S}
                />
              ) : (
                <NationAvatar
                  flagUrl={fixture.homeTeam.logoUrl}
                  nationName={fixture.homeTeam.name}
                  size={compact ? AvatarSize.XS : AvatarSize.S}
                />
              )
            )}
            <EmphasisTypography variant={isMobile ? 's' : 'm'}>{fixture.homeTeam.name}</EmphasisTypography>
            {/* <EmphasisTypography variant={isMobile ? 's' : 'm'}>{fixture.homeTeam.shortName || fixture.homeTeam.name}</EmphasisTypography> */}
          </TeamContainer>
          {!isMobile && !compact && (
            <NormalTypography variant="s" color={theme.colors.textLight}>vs</NormalTypography>
          )}
          <TeamContainer compact={compact}>
            <EmphasisTypography variant={isMobile ? 's' : 'm'}>{fixture.awayTeam.name}</EmphasisTypography>
            {/* <EmphasisTypography variant={isMobile ? 's' : 'm'}>{fixture.awayTeam.shortName || fixture.awayTeam.name}</EmphasisTypography> */}
            {!compact && (
              fixture.teamType === TeamType.CLUBS ? (
                <ClubAvatar
                  logoUrl={fixture.awayTeam.logoUrl}
                  clubName={fixture.awayTeam.name}
                  size={compact ? AvatarSize.XS : AvatarSize.S}
                />
              ) : (
                <NationAvatar
                  flagUrl={fixture.awayTeam.logoUrl}
                  nationName={fixture.awayTeam.name}
                  size={compact ? AvatarSize.XS : AvatarSize.S}
                />
              )
            )}
          </TeamContainer>
        </Teams>
        <Section flexDirection="row" alignItems="center" justifyContent="flex-end" fitContent>
          <ResultContainer>
            <NoWrapTypography variant={isMobile ? 's' : 'm'} color={theme.colors.primaryDark}>
              {fixture.finalResult?.homeTeamGoals ?? '?'}
              {' '}
              -
              {' '}
              {fixture.finalResult?.awayTeamGoals ?? '?'}
            </NoWrapTypography>
          </ResultContainer>
          {predictions && (
            <PointsContainer>
              <NoWrapTypography variant={isMobile ? 's' : 'm'} color={theme.colors.gold}>
                {predictions.find((p) => p.fixtureId === fixture.id && p.userId === user?.documentId)?.points?.total ?? '?'}
                {' '}
                p
              </NoWrapTypography>
            </PointsContainer>
          )}
          {predictions && predictions.length > 0 && (
            isMobile ? (
              <MobileButtonContainer>
                <IconButton
                  icon={<Eye size={24} />}
                  onClick={handleOpenModal}
                  colors={{ normal: theme.colors.primary, hover: theme.colors.primaryDark, active: theme.colors.primaryDarker }}
                />
              </MobileButtonContainer>
            ) : (
              <TextButton
                onClick={handleOpenModal}
              >
                Se allas tips
              </TextButton>
            )
          )}
        </Section>
      </FixtureContainer>
      {modalOpen && (
        <PredictionsModal
          onClose={() => setModalOpen(false)}
          predictions={predictions ?? []}
          fixture={fixture}
        />
      )}
    </>
  );
};

const FullTimeIndicator = styled.div`
  min-height: 50px;
  height: 100%;
  width: fit-content;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${theme.borderRadius.s} 0 0 ${theme.borderRadius.s};
  border-right: 1px solid ${theme.colors.primaryLighter};
  background-color: ${theme.colors.primaryBleach};
  padding: 0 ${theme.spacing.xs};
`;

const KickOffTime = styled.div`
  min-height: 50px;
  height: 100%;
  width: fit-content;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: ${theme.borderRadius.s} 0 0 ${theme.borderRadius.s};
  border-right: 1px solid ${theme.colors.primaryLighter};
  background-color: ${theme.colors.primaryBleach};
  padding: 0 ${theme.spacing.xs};
  
  @media ${devices.tablet} {
    padding: 0 ${theme.spacing.xxs};
    flex-direction: row;
    gap: ${theme.spacing.xxxs};
  }
`;

const Teams = styled.div<{ compact?: boolean }>`
  display: flex;
  gap: ${({ compact }) => (compact ? 0 : theme.spacing.xs)};
  min-height: 50px;
  align-items: ${({ compact }) => (compact ? 'flex-start' : 'center')};
  flex-direction: ${({ compact }) => (compact ? 'column' : 'row')};
  margin-left: ${({ compact }) => (compact ? theme.spacing.xxs : 0)};
  justify-content: ${({ compact }) => (compact ? 'center' : 'flex-start')};
  flex: 1;
  
  ${({ compact }) => compact && css`
    width: fit-content;
  `}

  @media ${devices.tablet} {
    margin-left: ${({ compact }) => (compact ? theme.spacing.xs : 0)};
  }
`;

const FixtureContainer = styled.div<{ showBorder?: boolean }>`
  display: flex;
  height: fit-content;
  /* grid-template-columns: auto auto 1fr; */
  background-color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.s};
  width: 100%;
  box-sizing: border-box;
  border: ${({ showBorder }) => (showBorder ? `1px solid ${theme.colors.silver}` : 'none')};
  overflow: hidden;
`;

const TeamContainer = styled.div<{ compact?: boolean }>`
  display: flex;
  gap: ${theme.spacing.xxxs};
  align-items: ${({ compact }) => (compact ? 'flex-start' : 'center')};
`;

const ResultContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 ${theme.spacing.xxs};
  background-color: ${theme.colors.primaryBleach};
  width: fit-content;
  height: 100%;
`;

const PointsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 ${theme.spacing.xxs};
  background-color: ${theme.colors.primaryDark};
  width: fit-content;
  height: 100%;
`;

const NoWrapTypography = styled(NormalTypography)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MobileButtonContainer = styled.div`
  padding: 0 ${theme.spacing.xxxs};
`;

export default FixtureResultPreview;
