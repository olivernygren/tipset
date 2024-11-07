import React from 'react';
import styled from 'styled-components';
import { Fixture, Prediction, TeamType } from '../../utils/Fixture';
import { devices, theme } from '../../theme';
import { EmphasisTypography, HeadingsTypography, NormalTypography } from '../typography/Typography';
import UserName from '../typography/UserName';
import { Section } from '../section/Section';
import { getGeneralPositionShorthand } from '../../utils/helpers';
import { Divider } from '../Divider';
import { AvatarSize } from '../avatar/Avatar';
import ClubAvatar from '../avatar/ClubAvatar';
import NationAvatar from '../avatar/NationAvatar';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';

interface PredictionScoreCardProps {
  prediction: Prediction;
  fixture: Fixture | undefined;
}

const PredictionScoreCard = ({ prediction, fixture }: PredictionScoreCardProps) => {
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const getOddsForPredictedOutcome = () => {
    let predictedOutcome;
    if (prediction.homeGoals > prediction.awayGoals) {
      predictedOutcome = '1';
    } else if (prediction.homeGoals === prediction.awayGoals) {
      predictedOutcome = 'X';
    } else {
      predictedOutcome = '2';
    }

    let finalOutcome = null;
    if (fixture?.finalResult?.homeTeamGoals !== undefined && fixture?.finalResult?.awayTeamGoals !== undefined) {
      if (fixture.finalResult.homeTeamGoals > fixture.finalResult.awayTeamGoals) {
        finalOutcome = '1';
      } else if (fixture.finalResult.homeTeamGoals === fixture.finalResult.awayTeamGoals) {
        finalOutcome = 'X';
      } else {
        finalOutcome = '2';
      }
    }

    if (predictedOutcome === finalOutcome) {
      if (predictedOutcome === '1') {
        return fixture?.odds?.homeWin;
      }
      if (predictedOutcome === 'X') {
        return fixture?.odds?.draw;
      }
      if (predictedOutcome === '2') {
        return fixture?.odds?.awayWin;
      }
    }
  };

  const getTableRow = (label: string, points: number | undefined) => {
    if (!points || points === 0) return null;
    return (
      <>
        <TableRow>
          <NormalTypography variant="s" color={theme.colors.white}>{label}</NormalTypography>
          <EmphasisTypography variant="m" color={theme.colors.gold}>
            {points}
            {' '}
            p
          </EmphasisTypography>
        </TableRow>
        <Divider color={theme.colors.primary} className="divider" />
      </>
    );
  };

  const getLogo = (teamType: TeamType, logoUrl: string) => {
    if (!fixture) return null;

    if (teamType === TeamType.CLUBS) {
      return <ClubAvatar logoUrl={logoUrl} clubName={fixture.homeTeam.name} size={AvatarSize.L} showBorder isDarkMode />;
    }
    return <NationAvatar flagUrl={logoUrl} nationName={fixture.homeTeam.name} size={AvatarSize.L} />;
  };

  return (
    <Card>
      <HeadingsTypography variant={isMobile ? 'h5' : 'h3'} color={theme.colors.white}>
        {prediction.username ? (
          prediction.username
        ) : (
          <UserName userId={prediction.userId} />
        )}
      </HeadingsTypography>
      <PointsContainer>
        <HeadingsTypography variant={isMobile ? 'h2' : 'h1'} color={theme.colors.gold}>
          {prediction.points?.total ?? '?'}
        </HeadingsTypography>
      </PointsContainer>
      <Section gap="s" padding={`${theme.spacing.s} 0`} alignItems="center">
        <Section flexDirection="row" alignItems="center" gap="s" fitContent>
          {fixture && getLogo(fixture.teamType, fixture.homeTeam.logoUrl)}
          <HeadingsTypography variant="h2" color={theme.colors.white}>
            {prediction.homeGoals}
            {' '}
            -
            {' '}
            {prediction.awayGoals}
          </HeadingsTypography>
          {fixture && getLogo(fixture.teamType, fixture.awayTeam.logoUrl)}
        </Section>
        {prediction.goalScorer && (
          <EmphasisTypography variant="m" color={theme.colors.white}>
            {prediction.goalScorer?.name}
            {' '}
            {getGeneralPositionShorthand(prediction.goalScorer.position.general)}
          </EmphasisTypography>
        )}
      </Section>
      <Divider color={theme.colors.primaryDark} />
      <HeadingsTypography variant="h6" color={theme.colors.white}>Poängfördelning</HeadingsTypography>
      {prediction.points && prediction.points.total && prediction.points.total > 0 ? (
        <Section
          backgroundColor={theme.colors.primaryDark}
          borderRadius={theme.borderRadius.s}
          padding={`${theme.spacing.xxs} ${theme.spacing.xs}`}
          gap="xxs"
        >
          {getTableRow('Korrekt utfall (1X2)', prediction.points?.correctOutcome)}
          {getTableRow(`Oddsbonus (${getOddsForPredictedOutcome()})`, prediction.points?.oddsBonus)}
          {getTableRow('Korrekt resultat', prediction.points?.correctResult)}
          {getTableRow('Korrekt antal mål av hemmalag', prediction.points?.correctGoalsByHomeTeam)}
          {getTableRow('Korrekt antal mål av bortalag', prediction.points?.correctGoalsByAwayTeam)}
          {getTableRow('Korrekt målskillnad', prediction.points?.correctGoalDifference)}
          {prediction.goalScorer && (
            <>
              {getTableRow(`Korrekt målskytt (${getGeneralPositionShorthand(prediction.goalScorer.position.general)})`, prediction.points?.correctGoalScorer)}
            </>
          )}
        </Section>
      ) : (
        <NormalTypography variant={isMobile ? 's' : 'm'} color={theme.colors.white}>Inga poäng</NormalTypography>
      )}
    </Card>
  );
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

  .divider:last-of-type {
    display: none;
  }
`;

const PointsContainer = styled.div`
  height: 70px;
  width: 70px;
  border-radius: 50%;
  background-color: ${theme.colors.primaryDark};
  position: absolute;
  top: -10px;
  right: -10px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media ${devices.tablet} {
    height: 80px;
    width: 80px;
  }
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
