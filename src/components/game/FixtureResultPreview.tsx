import React, { useState } from 'react'
import { Fixture, Prediction, TeamType } from '../../utils/Fixture';
import { AvatarSize } from '../avatar/Avatar';
import ClubAvatar from '../avatar/ClubAvatar';
import NationAvatar from '../avatar/NationAvatar';
import { EmphasisTypography, NormalTypography } from '../typography/Typography';
import { theme } from '../../theme';
import styled, { css } from 'styled-components';
import { Section } from '../section/Section';
import TextButton from '../buttons/TextButton';
import PredictionScoreCard from './PredictionScoreCard';
import { useUser } from '../../context/UserContext';
import Modal from '../modal/Modal';

interface FixtureResultPreviewProps {
  fixture: Fixture;
  predictions?: Array<Prediction>;
  // background?: 'white' | 'silver';
  showBorder?: boolean;
  compact?: boolean;
}

const FixtureResultPreview = ({ fixture, predictions, compact, showBorder }: FixtureResultPreviewProps) => {
  const { user } = useUser();

  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const handleOpenModal = () => {
    setModalOpen(true);
  }

  return (
    <>
      <FixtureContainer showBorder={showBorder}>
        <FullTimeIndicator>
          <EmphasisTypography variant='m' color={theme.colors.primaryDarker}>FT</EmphasisTypography>
        </FullTimeIndicator>
        <Teams compact={compact}>
          <TeamContainer compact={compact}>
            {fixture.teamType === TeamType.CLUBS ? (
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
            )}
            <EmphasisTypography variant='m'>{fixture.homeTeam.name}</EmphasisTypography>
          </TeamContainer>
          <NormalTypography variant='s' color={theme.colors.textLight}>vs</NormalTypography>
          <TeamContainer compact={compact}>
            <EmphasisTypography variant='m'>{fixture.awayTeam.name}</EmphasisTypography>
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
        <Section flexDirection='row' alignItems='center' justifyContent='flex-end'>
          <ResultContainer>
            <NormalTypography variant='m' color={theme.colors.primaryDark}>{fixture.finalResult?.homeTeamGoals ?? '?'} - {fixture.finalResult?.awayTeamGoals ?? '?'}</NormalTypography>
          </ResultContainer>
          {predictions && (
            <PointsContainer>
              <NormalTypography variant='m' color={theme.colors.gold}>{predictions.find((p) => p.fixtureId === fixture.id && p.userId === user?.documentId)?.points?.total ?? '?'} p</NormalTypography>
            </PointsContainer>
          )}
          {predictions && predictions.length > 0 && (
            <TextButton 
              onClick={handleOpenModal}
            >
              Se allas tips
            </TextButton>
          )}
        </Section>
      </FixtureContainer>
      {modalOpen && (
        <Modal
          title='Vad tippade alla?'
          onClose={() => setModalOpen(false)}
          size='l'
          headerDivider
        >
          <PredictionsContainer>
            {predictions?.map((prediction) => (
              <PredictionScoreCard prediction={prediction} />
            ))}
          </PredictionsContainer>
        </Modal>
      )}
    </>
  )
};

const FullTimeIndicator = styled.div`
  min-height: 44px;
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

const Teams = styled.div<{ compact?: boolean }>`
  display: flex;
  gap: ${({ compact }) => compact ? 0 : theme.spacing.xs};
  min-height: ${({ compact }) => compact ? '50px' : '44px'};
  height: 100%;
  align-items: ${({ compact }) => compact ? 'flex-start' : 'center'};
  flex-direction: ${({ compact }) => compact ? 'column' : 'row'};
  margin-left: ${theme.spacing.xs};
  justify-content: ${({ compact }) => compact ? 'center' : 'flex-start'};
  
  ${({ compact }) => compact && css`
    width: fit-content;

    > :nth-child(2) {
      display: none;
    }
  `}
`;

const FixtureContainer = styled.div<{ showBorder?: boolean }>`
  display: grid;
  grid-template-columns: auto auto 1fr;
  background-color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.s};
  width: 100%;
  box-sizing: border-box;
  border: ${({ showBorder }) => showBorder ? `1px solid ${theme.colors.silver}` : 'none'};
  overflow: hidden;
`;

const TeamContainer = styled.div<{ compact?: boolean }>`
  display: flex;
  gap: ${theme.spacing.xxxs};
  align-items: ${({ compact }) => compact ? 'flex-start' : 'center'};

  ${({ compact }) => compact && css`
    > .avatar {
      display: none;
    }
  `}
`;

const PredictionsContainer = styled.div`
  gap: ${theme.spacing.xxs};
  width: 100%;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  margin-bottom: ${theme.spacing.s};
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

export default FixtureResultPreview;