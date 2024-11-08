import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { Eye, Target } from '@phosphor-icons/react';
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

  return (
    <>
      <FixtureContainer showBorder={showBorder}>
        {isFullTime ? (
          <FullTimeIndicator compact={compact}>
            <EmphasisTypography variant={compact || isMobile ? 's' : 'm'} color={theme.colors.white}>FT</EmphasisTypography>
          </FullTimeIndicator>
        ) : (
          <KickOffTime>
            <EmphasisTypography variant="s" color={theme.colors.white}>LIVE</EmphasisTypography>
          </KickOffTime>
        )}
        <Teams compact={compact}>
          <TeamContainer compact={compact}>
            <EmphasisTypography variant={compact || isMobile ? 's' : 'm'}>{fixture.homeTeam.name}</EmphasisTypography>
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
          </TeamContainer>
          {!isMobile && !compact && (
            <ResultContainer>
              <NoWrapTypography variant={isMobile ? 's' : 'm'} color={theme.colors.textDefault}>
                {fixture.finalResult?.homeTeamGoals ?? '?'}
                {' '}
                -
                {' '}
                {fixture.finalResult?.awayTeamGoals ?? '?'}
              </NoWrapTypography>
            </ResultContainer>
          )}
          <TeamContainer compact={compact}>
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
            <EmphasisTypography variant={compact || isMobile ? 's' : 'm'}>{fixture.awayTeam.name}</EmphasisTypography>
          </TeamContainer>
        </Teams>
        <Section flexDirection="row" alignItems="center" justifyContent="flex-end" fitContent>
          {predictions && (
            <PointsContainer>
              <Target size={16} color={theme.colors.silverDarker} />
              <NoWrapTypography variant={isMobile ? 's' : 'm'} color={theme.colors.silverDarker}>
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
          {/* UPDATE COMPACT VERSION TO LOOK LIKE FORZA */}
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

const FullTimeIndicator = styled.div<{ compact?: boolean }>`
  height: fit-content;
  width: fit-content;
  margin: auto ${theme.spacing.xs};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 100px;
  background-color: ${theme.colors.primary};
  padding: ${theme.spacing.xxxs} ${theme.spacing.xxs};
  
  @media ${devices.tablet} {
    ${({ compact }) => !compact && css`
      position: absolute;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
    `}
  }
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
  
  @media ${devices.tablet} {
    padding: ${theme.spacing.xxxs} ${theme.spacing.xxs};
    flex-direction: row;
    gap: ${theme.spacing.xxxs};
  }
`;

const Teams = styled.div<{ compact?: boolean }>`
  display: flex;
  gap: ${({ compact }) => (compact ? 0 : theme.spacing.xxs)};
  min-height: 50px;
  align-items: ${({ compact }) => (compact ? 'flex-start' : 'center')};
  flex-direction: ${({ compact }) => (compact ? 'column' : 'row')};
  justify-content: center;
  flex: 1;
  
  ${({ compact }) => compact && css`
    width: fit-content;
  `}
  
  @media ${devices.tablet} {
    ${({ compact }) => (compact ? css`
      display: flex;
      ` : css`
      display: grid;
      grid-template-columns: 1fr auto 1fr;
    `)}

    ${({ compact }) => !compact && css`
      & > div:first-child {
        margin-left: auto;
      }
    `}
  }
`;

const FixtureContainer = styled.div<{ showBorder?: boolean }>`
  display: flex;
  height: fit-content;
  background-color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.m};
  width: 100%;
  box-sizing: border-box;
  border: ${({ showBorder }) => (showBorder ? `1px solid ${theme.colors.silver}` : 'none')};
  overflow: hidden;
  position: relative;
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
  width: fit-content;
  height: 100%;
  gap: ${theme.spacing.xxxs};
`;

const PointsContainer = styled.div`
  display: flex;
  align-items: center;
  border-radius: 100px;
  justify-content: center;
  padding: ${theme.spacing.xxxs} ${theme.spacing.xxs};
  background-color: ${theme.colors.silverLighter};
  width: fit-content;
  height: fit-content;
  gap: 6px;
`;

const NoWrapTypography = styled(NormalTypography)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MobileButtonContainer = styled.div`
  padding: 0 ${theme.spacing.xxs};
`;

export default FixtureResultPreview;
