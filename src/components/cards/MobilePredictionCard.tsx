import React from 'react';
import styled from 'styled-components';
import { Fixture, Prediction } from '../../utils/Fixture';
import { theme } from '../../theme';
import { EmphasisTypography, HeadingsTypography, NormalTypography } from '../typography/Typography';
import UserName from '../typography/UserName';
import { Divider } from '../Divider';

interface MobilePredictionCardProps {
  prediction: Prediction;
  fixture?: Fixture;
  hasPredictedResult: boolean;
  points: number | '-' | undefined;
  oddsBonus?: number;
}

const MobilePredictionCard = ({
  prediction, hasPredictedResult, points, oddsBonus, fixture,
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
        <NormalTypography variant="m" color={theme.colors.primaryDark}>{hasPredictedResult ? prediction.outcome : '-'}</NormalTypography>
      </Outcome>
    </Row>
    <Divider />
    <Row>
      <EmphasisTypography variant="m" color={theme.colors.silverDarker}>Resultat</EmphasisTypography>
      <NormalTypography variant="m">{hasPredictedResult ? `${prediction.homeGoals} - ${prediction.awayGoals}` : 'Ej tippat'}</NormalTypography>
    </Row>
    <Divider />
    {fixture?.shouldPredictGoalScorer && (
      <>
        <Row>
          <EmphasisTypography variant="m" color={theme.colors.silverDarker}>Målskytt</EmphasisTypography>
          {prediction.goalScorer ? (
            <NormalTypography variant="m">{prediction.goalScorer.name}</NormalTypography>
          ) : (
            <NormalTypography variant="m" color={theme.colors.textLighter}>Ingen</NormalTypography>
          )}
        </Row>
        <Divider />
      </>
    )}
    <Row>
      <EmphasisTypography variant="m" color={theme.colors.silverDarker}>Oddsbonus</EmphasisTypography>
      <NormalTypography variant="m">{oddsBonus}</NormalTypography>
    </Row>
    <Divider />
    <Row>
      <HeadingsTypography variant="h6" color={theme.colors.primary}>Totalpoäng</HeadingsTypography>
      <NormalTypography variant="m" color={theme.colors.primary}>{points}</NormalTypography>
    </Row>
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
