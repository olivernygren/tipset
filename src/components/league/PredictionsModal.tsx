import React from 'react'
import Modal from '../modal/Modal'
import { Fixture, Prediction } from '../../utils/Fixture';
import styled from 'styled-components';
import { theme } from '../../theme';
import PredictionScoreCard from '../game/PredictionScoreCard';
import FixtureResultPreview from '../game/FixtureResultPreview';

interface PredictionsModalProps {
  onClose: () => void;
  predictions: Array<Prediction>;
  fixture: Fixture | undefined;
}

const PredictionsModal = ({ onClose, predictions, fixture }: PredictionsModalProps) => {
  return (
    <Modal
      title='Vad tippade alla?'
      onClose={onClose}
      size='l'
      headerDivider
    >
      <>
        {fixture && <FixtureResultPreview fixture={fixture} showBorder />}
        <PredictionsContainer>
          {predictions?.map((prediction) => (
            <PredictionScoreCard prediction={prediction} />
          ))}
        </PredictionsContainer>
      </>
    </Modal>
  )
};

const PredictionsContainer = styled.div`
  gap: ${theme.spacing.xxs};
  width: 100%;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  margin-bottom: ${theme.spacing.s};
`;

export default PredictionsModal