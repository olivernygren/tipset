import React from 'react';
import styled from 'styled-components';
import Modal from '../modal/Modal';
import { Fixture, Prediction } from '../../utils/Fixture';
import { devices, theme } from '../../theme';
import PredictionScoreCard from '../game/PredictionScoreCard';
// eslint-disable-next-line import/no-cycle
import FixtureResultPreview from '../game/FixtureResultPreview';
import SimpleFixturePredictionCard from '../cards/SimpleFixturePredictionCard';
import { Section } from '../section/Section';
import { HeadingsTypography, NormalTypography } from '../typography/Typography';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';
import LastRoundFixtureResult from '../game/LastRoundFixtureResult';

interface PredictionsModalProps {
  onClose: () => void;
  predictions: Array<Prediction>;
  fixture: Fixture | undefined;
}

const PredictionsModal = ({ onClose, predictions, fixture }: PredictionsModalProps) => {
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const gameHasFinished = fixture && Boolean(fixture.finalResult);
  const goalScorers = fixture?.finalResult?.goalScorers?.join(', ');

  return (
    <Modal
      title="Vad tippade alla?"
      onClose={onClose}
      size={gameHasFinished ? 'l' : 'm'}
      headerDivider
      mobileBottomSheet
    >
      <Section gap="m">
        {fixture && (
          // <FixtureResultPreview
          //   fixture={fixture}
          //   showBorder
          //   isFullTime={gameHasFinished}
          //   compact={isMobile}
          // />
          <LastRoundFixtureResult
            fixture={fixture}
            predictions={predictions}
            showButtonsAndPoints={false}
          />
        )}
        {fixture && gameHasFinished && fixture.shouldPredictGoalScorer && (
          <GoalScorersContainer>
            <HeadingsTypography variant="h6">Målskyttar</HeadingsTypography>
            <Section gap="xxs" flexDirection="row" alignItems="center" fitContent>
              {fixture.finalResult?.goalScorers && fixture.finalResult?.goalScorers.length > 0 ? (
                <NormalTypography variant="m">{goalScorers}</NormalTypography>
              ) : (
                <NormalTypography variant="s" color={theme.colors.silverDark}>Inga målskyttar</NormalTypography>
              )}
            </Section>
          </GoalScorersContainer>
        )}
        <PredictionsContainer>
          {predictions?.map((prediction) => (
            gameHasFinished ? (
              <PredictionScoreCard prediction={prediction} fixture={fixture ?? undefined} />
            ) : (
              <SimpleFixturePredictionCard prediction={prediction} fixture={fixture} />
            )
          ))}
        </PredictionsContainer>
      </Section>
    </Modal>
  );
};

const PredictionsContainer = styled.div`
  gap: ${theme.spacing.s};
  width: 100%;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  margin-bottom: ${theme.spacing.s};

  @media ${devices.tablet} {
    gap: ${theme.spacing.s};
  }
`;

const GoalScorersContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xxs};

  @media ${devices.tablet} {
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    gap: ${theme.spacing.m};
  }
  `;

export default PredictionsModal;
