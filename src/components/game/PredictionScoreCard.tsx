import React from 'react'
import styled from 'styled-components';
import { Prediction } from '../../utils/Fixture';
import { theme } from '../../theme';
import { EmphasisTypography, HeadingsTypography, NormalTypography } from '../typography/Typography';
import UserName from '../typography/UserName';
import { Section } from '../section/Section';
import { getGeneralPositionShorthand } from '../../utils/helpers';
import { Divider } from '../Divider';

interface PredictionScoreCardProps {
  prediction: Prediction;
}

const PredictionScoreCard = ({ prediction }: PredictionScoreCardProps) => {
  return (
    <Card>
      <HeadingsTypography variant='h4' color={theme.colors.gold}>
        <UserName userId={prediction.userId} />
      </HeadingsTypography>
      <PointsContainer>
        <HeadingsTypography variant='h1' color={theme.colors.gold}>
          {prediction.points?.total ?? '?'}
        </HeadingsTypography>
      </PointsContainer>
      <Section flexDirection='row' alignItems='center' gap='s'>
        <HeadingsTypography variant='h5' color={theme.colors.white}>{prediction.homeGoals} - {prediction.awayGoals}</HeadingsTypography>
        {prediction.goalScorer && (
          <>
            <NormalTypography variant='m' color={theme.colors.white}>|</NormalTypography>
            <EmphasisTypography variant='m' color={theme.colors.white}>{prediction.goalScorer?.name} ({getGeneralPositionShorthand(prediction.goalScorer.position.general)})</EmphasisTypography>
          </>
        )}
      </Section>
      <Divider color={theme.colors.primaryDark} />
      <HeadingsTypography variant='h6' color={theme.colors.white}>Poängfördelning</HeadingsTypography>
      <Section
        backgroundColor={theme.colors.primaryDark}
        borderRadius={theme.borderRadius.s}
        padding={`${theme.spacing.xxs} ${theme.spacing.xs}`}
        gap='xxs'
      >
        <TableRow>
          <NormalTypography variant='s' color={theme.colors.white}>Korrekt utfall (1X2)</NormalTypography>
          <EmphasisTypography variant='m' color={theme.colors.gold}>{prediction.points?.correctOutcome ?? 0} p</EmphasisTypography>
        </TableRow>
        <Divider color={theme.colors.primary} />
        <TableRow>
          <NormalTypography variant='s' color={theme.colors.white}>Korrekt resultat</NormalTypography>
          <EmphasisTypography variant='m' color={theme.colors.gold}>{prediction.points?.correctResult ?? 0} p</EmphasisTypography>
        </TableRow>
        <Divider color={theme.colors.primary} />
        <TableRow>
          <NormalTypography variant='s' color={theme.colors.white}>Korrekt antal mål av hemmalag</NormalTypography>
          <EmphasisTypography variant='m' color={theme.colors.gold}>{prediction.points?.correctGoalsByHomeTeam ?? 0} p</EmphasisTypography>
        </TableRow>
        <Divider color={theme.colors.primary} />
        <TableRow>
          <NormalTypography variant='s' color={theme.colors.white}>Korrekt antal mål av bortalag</NormalTypography>
          <EmphasisTypography variant='m' color={theme.colors.gold}>{prediction.points?.correctGoalsByAwayTeam ?? 0} p</EmphasisTypography>
        </TableRow>
        <Divider color={theme.colors.primary} />
        <TableRow>
          <NormalTypography variant='s' color={theme.colors.white}>Korrekt målskillnad</NormalTypography>
          <EmphasisTypography variant='m' color={theme.colors.gold}>{prediction.points?.correctGoalDifference ?? 0} p</EmphasisTypography>
        </TableRow>
        {prediction.goalScorer && (
          <>
            <Divider color={theme.colors.primary} />
            <TableRow>
              <NormalTypography variant='s' color={theme.colors.white}>Korrekt målskytt ({getGeneralPositionShorthand(prediction.goalScorer.position.general)})</NormalTypography>
              <EmphasisTypography variant='m' color={theme.colors.gold}>{prediction.points?.correctGoalScorer ?? 0} p</EmphasisTypography>
            </TableRow>
          </>
        )}
      </Section>
    </Card>
  )
};

const Card = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.s};
  border-radius: ${theme.borderRadius.m};
  background-color: ${theme.colors.primary};
  position: relative;
  overflow: hidden;
`;

const PointsContainer = styled.div`
  height: 80px;
  width: 80px;
  border-radius: 50%;
  background-color: ${theme.colors.primaryDark};
  position: absolute;
  top: -10px;
  right: -10px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TableRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${theme.spacing.xs};
  width: 100%;
  box-sizing: border-box;
`;

export default PredictionScoreCard;