import React from 'react';
import styled from 'styled-components';
import { Calculator } from '@phosphor-icons/react';
import { Prediction } from '../../utils/Fixture';
import { theme } from '../../theme';
import { EmphasisTypography, HeadingsTypography, NormalTypography } from '../typography/Typography';
import UserName from '../typography/UserName';
import { Divider } from '../Divider';
import Button from '../buttons/Button';

interface MobilePredictionCardProps {
  prediction: Prediction;
  finalResult: {
    homeGoals: string;
    awayGoals: string;
  }
  hasPredictedResult: boolean;
  onCalculatePoints: (prediction: Prediction) => void;
  points: number | '-' | undefined;
  oddsBonus?: number;
}

const MobilePredictionCard = ({
  prediction, finalResult, hasPredictedResult, onCalculatePoints, points, oddsBonus,
}: MobilePredictionCardProps) => (
  <Card>
    <HeadingContainer>
      <HeadingsTypography variant="h4" color={theme.colors.primary}>
        {prediction.username ? prediction.username : (
          <UserName userId={prediction.userId} />
        )}
      </HeadingsTypography>
    </HeadingContainer>
    <Row>
      <EmphasisTypography variant="m" color={theme.colors.silverDarker}>Utfall</EmphasisTypography>
      <Outcome>
        <NormalTypography variant="m" color={theme.colors.primaryDark}>{hasPredictedResult ? prediction.outcome : '?'}</NormalTypography>
      </Outcome>
    </Row>
    <Divider />
    <Row>
      <EmphasisTypography variant="m" color={theme.colors.silverDarker}>Resultat</EmphasisTypography>
      <NormalTypography variant="m">{hasPredictedResult ? `${prediction.homeGoals} - ${prediction.awayGoals}` : 'Ej tippat'}</NormalTypography>
    </Row>
    <Divider />
    <Row>
      <EmphasisTypography variant="m" color={theme.colors.silverDarker}>Målskytt</EmphasisTypography>
      {prediction.goalScorer ? (
        <NormalTypography variant="m">{prediction.goalScorer.name}</NormalTypography>
      ) : (
        <NormalTypography variant="m" color={theme.colors.textLighter}>Ingen tippad</NormalTypography>
      )}
    </Row>
    <Divider />
    <Row>
      <EmphasisTypography variant="m" color={theme.colors.silverDarker}>Oddsbonus</EmphasisTypography>
      <NormalTypography variant="m">{oddsBonus}</NormalTypography>
    </Row>
    <Divider />
    <Row>
      <HeadingsTypography variant="h6" color={theme.colors.textDefault}>Totalpoäng</HeadingsTypography>
      <NormalTypography variant="m">{points}</NormalTypography>
    </Row>
    <ButtonContainer>
      <Button
        size="m"
        variant="secondary"
        onClick={() => onCalculatePoints(prediction)}
        icon={<Calculator size={24} color={finalResult.homeGoals === '' || finalResult.awayGoals === '' ? theme.colors.silverLight : theme.colors.primary} />}
        fullWidth
        disabled={finalResult.homeGoals === '' || finalResult.awayGoals === ''}
      >
        Beräkna poäng
      </Button>
    </ButtonContainer>
  </Card>
);

const Card = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${theme.spacing.s};
  background-color: ${theme.colors.silverFade};
  border-radius: ${theme.borderRadius.m};
  gap: ${theme.spacing.xs};
  border: 1px solid ${theme.colors.silverLight};
  width: 100%;
  box-sizing: border-box;
`;

const HeadingContainer = styled.div`
  margin-bottom: ${theme.spacing.xs};
`;

// const ResultPrediction = styled.div`
//   display: flex;
//   align-items: center;
//   gap: ${theme.spacing.s};
//   width: 100%;
//   box-sizing: border-box;
// `;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  width: 100%;
  box-sizing: border-box;
  justify-content: space-between;
`;

const Outcome = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${theme.colors.primaryBleach};
  height: 24px;
  width: 24px;
  border-radius: ${theme.borderRadius.s};
`;

const ButtonContainer = styled.div`
  margin-top: ${theme.spacing.s};
`;

export default MobilePredictionCard;
