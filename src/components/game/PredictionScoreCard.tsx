import React, { useState } from 'react';
import styled from 'styled-components';
import {
  CaretDown, CaretUp, FireSimple, SoccerBall, Target,
} from '@phosphor-icons/react';
import { Fixture, Prediction, TeamType } from '../../utils/Fixture';
import { devices, theme } from '../../theme';
import { EmphasisTypography, HeadingsTypography, NormalTypography } from '../typography/Typography';
import { UserProfilePicture } from '../typography/UserName';
import { AvatarSize } from '../avatar/Avatar';
import ClubAvatar from '../avatar/ClubAvatar';
import NationAvatar from '../avatar/NationAvatar';
import IconButton from '../buttons/IconButton';
import { Team } from '../../utils/Team';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';
import { Section } from '../section/Section';
import { getGeneralPositionShorthand } from '../../utils/helpers';

interface PredictionScoreCardProps {
  prediction: Prediction;
  fixture: Fixture | undefined;
}

const PredictionScoreCard = ({ prediction, fixture }: PredictionScoreCardProps) => {
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const oddsBonusPointsAwarded = Boolean(prediction.points?.oddsBonus);
  const correctResultPredicted = Boolean(prediction.points?.correctResult);
  const correctGoalScorerPredicted = Boolean(prediction.points?.correctGoalScorer);

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

    const isOddsBonus = label.includes('Oddsbonus');

    return (
      <TableRow topBorder>
        {isOddsBonus && (
          <FireSimple size={20} color={theme.colors.silverDark} />
        )}
        <NormalTypography variant="s" color={theme.colors.textDefault}>{label}</NormalTypography>
        <EmphasisTypography variant="m" color={theme.colors.primary}>
          {points}
          {' '}
          p
        </EmphasisTypography>
      </TableRow>
    );
  };

  const getAvatar = (team: Team) => ((fixture && fixture.teamType) === TeamType.CLUBS ? (
    <ClubAvatar
      logoUrl={team.logoUrl}
      clubName={team.name}
      size={AvatarSize.S}
    />
  ) : (
    <NationAvatar
      flagUrl={team.logoUrl}
      nationName={team.name}
      size={AvatarSize.S}
    />
  ));

  return (
    <Card isExpanded={isExpanded}>
      <MainContent>
        <UserInfo>
          {!isMobile && (
            <UserProfilePicture userId={prediction.userId} size={AvatarSize.M} />
          )}
          <EmphasisTypography variant="m">{prediction.username}</EmphasisTypography>
        </UserInfo>
        <PointsBadges>
          {!isMobile && (oddsBonusPointsAwarded || correctResultPredicted || correctGoalScorerPredicted) && (
          <>
            {oddsBonusPointsAwarded && (
              <PointsBadge>
                <FireSimple size={20} color={theme.colors.primaryDark} />
              </PointsBadge>
            )}
            {correctResultPredicted && (
              <PointsBadge>
                <Target size={20} color={theme.colors.primaryDark} />
              </PointsBadge>
            )}
            {correctGoalScorerPredicted && (
              <PointsBadge>
                <SoccerBall size={20} color={theme.colors.primaryDark} weight="fill" />
              </PointsBadge>
            )}
          </>
          )}
        </PointsBadges>
        <PointsContainer>
          <HeadingsTypography variant={isMobile ? 'h6' : 'h5'} color={theme.colors.white}>
            {`${prediction.points?.total ?? '?'} p`}
          </HeadingsTypography>
        </PointsContainer>
        <IconButton
          icon={isExpanded ? <CaretUp size={20} weight="bold" /> : <CaretDown size={20} weight="bold" />}
          colors={{ normal: theme.colors.textDefault }}
          onClick={() => setIsExpanded(!isExpanded)}
        />
      </MainContent>
      <Section
        alignItems="center"
        padding={isMobile ? `${theme.spacing.xxxs} 0 ${theme.spacing.xxs} 0` : `0 ${theme.spacing.xxs} ${theme.spacing.xxs} ${theme.spacing.xxs}`}
        gap="xs"
      >
        {fixture && (
          <PredictionContainer>
            <HeadingsTypography variant="h6" color={theme.colors.textDefault}>
              Tippade:
            </HeadingsTypography>
            {!isMobile && fixture.shouldPredictGoalScorer && (
              <PredictedGoalScorer>
                {prediction.goalScorer ? (
                  <>
                    <SoccerBall size={16} color={theme.colors.silverDark} weight="fill" />
                    <NormalTypography variant="s" color={theme.colors.silverDark}>{prediction.goalScorer?.name}</NormalTypography>
                    <NormalTypography variant="s" color={theme.colors.silverDark}>{`(${getGeneralPositionShorthand(prediction.goalScorer.position.general)})`}</NormalTypography>
                  </>
                ) : (
                  <NormalTypography variant="s" color={theme.colors.silverDark}>Ingen målskytt tippad</NormalTypography>
                )}
              </PredictedGoalScorer>
            )}
            <PredictionResult>
              {getAvatar(fixture.homeTeam)}
              <NormalTypography variant="m">{prediction.homeGoals}</NormalTypography>
              <NormalTypography variant="m">-</NormalTypography>
              <NormalTypography variant="m">{prediction.awayGoals}</NormalTypography>
              {getAvatar(fixture.awayTeam)}
            </PredictionResult>
          </PredictionContainer>
        )}
        {isMobile && fixture && fixture.shouldPredictGoalScorer && (
          <PredictedGoalScorerSection>
            <EmphasisTypography variant="s" color={theme.colors.textDefault}>Målskytt:</EmphasisTypography>
            <PredictedGoalScorer>
              {prediction.goalScorer ? (
                <>
                  <SoccerBall size={16} color={theme.colors.silverDark} weight="fill" />
                  <NormalTypography variant="s" color={theme.colors.silverDark}>{prediction.goalScorer?.name}</NormalTypography>
                </>
              ) : (
                <NormalTypography variant="s" color={theme.colors.silverDark}>Ingen målskytt tippad</NormalTypography>
              )}
            </PredictedGoalScorer>
          </PredictedGoalScorerSection>
        )}
        {prediction.points && prediction.points.total && prediction.points.total > 0 ? (
          <>
            <Section padding={`${theme.spacing.xxs} 0 ${theme.spacing.xxxs} 0`}>
              <EmphasisTypography variant="m" color={theme.colors.primaryDark}>Poängfördelning</EmphasisTypography>
            </Section>
            {getTableRow('Korrekt utfall (1X2)', prediction.points?.correctOutcome)}
            {getTableRow('Korrekt resultat', prediction.points?.correctResult)}
            {getTableRow('Korrekt antal mål av hemmalag', prediction.points?.correctGoalsByHomeTeam)}
            {getTableRow('Korrekt antal mål av bortalag', prediction.points?.correctGoalsByAwayTeam)}
            {getTableRow('Korrekt målskillnad', prediction.points?.correctGoalDifference)}
            {getTableRow(`Oddsbonus (${getOddsForPredictedOutcome()})`, prediction.points?.oddsBonus)}
            {prediction.goalScorer && (
              <>
                {getTableRow(`Korrekt målskytt (${getGeneralPositionShorthand(prediction.goalScorer.position.general)})`, prediction.points?.correctGoalScorer)}
              </>
            )}
          </>
        ) : (
          <Section padding={`0 ${theme.spacing.xxs}`}>
            <NormalTypography variant="m" color={theme.colors.silverDark}>Inga poäng</NormalTypography>
          </Section>
        )}
      </Section>
      {!prediction && (
        <NormalTypography variant="m" color={theme.colors.silverDark}>Inget resultat tippades</NormalTypography>
      )}
    </Card>
  );
};

const Card = styled.div<{ isExpanded: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.s};
  border: 1px solid ${theme.colors.silverLight};
  background-color: ${theme.colors.silverBleach};
  border-radius: ${theme.borderRadius.m};
  padding: ${theme.spacing.xs} ${theme.spacing.xs};
  /* cursor: pointer; */
  box-shadow: 0px 3px 0px 0px ${theme.colors.silverLighter};
  max-height: ${({ isExpanded }) => (isExpanded ? '1000px' : '32px')};
  overflow: hidden;
  transition: max-height 0.3s ease;
  
  @media ${devices.tablet} {
    max-height: ${({ isExpanded }) => (isExpanded ? '1000px' : '52px')};
    padding: ${theme.spacing.xxs} ${theme.spacing.s} ${theme.spacing.xxs} ${theme.spacing.xxs};
  }
`;

const MainContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};

  @media ${devices.tablet} {
    gap: ${theme.spacing.s};
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xxxs};
  flex: 1;
  box-sizing: border-box;
`;

const PointsContainer = styled.div`
  height: 32px;
  border-radius: 16px;
  background-color: ${theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
  
  @media ${devices.tablet} {
    height: 36px;
    border-radius: 18px;
    padding: 0 ${theme.spacing.xs};
  }
`;

const PointsBadges = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

const PointsBadge = styled.div`
  height: 30px;
  border-radius: 15px;
  background-color: ${theme.colors.primaryBleach};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 ${theme.spacing.xxs};
`;

const TableRow = styled.div<{ topBorder?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${theme.spacing.xxs};
  width: 100%;
  box-sizing: border-box;
  ${({ topBorder }) => topBorder && `border-top: 1px solid ${theme.colors.silverLight};`}
  padding-top: ${theme.spacing.xs};

  ${NormalTypography} {
    flex: 1;
  }
`;

const PredictionContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${theme.spacing.xs};
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  background-color: ${theme.colors.white};
  padding: ${theme.spacing.xxs} ${theme.spacing.xxs} ${theme.spacing.xxs} ${theme.spacing.xs};
  border: 1px solid ${theme.colors.silverLight};
  border-radius: ${theme.borderRadius.s};

  ${HeadingsTypography} {
    flex: 1;
  }
`;

const PredictionResult = styled.div`
  display: flex;
  gap: ${theme.spacing.xxxs};
  align-items: center;
`;

const PredictedGoalScorerSection = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  align-items: center;
  justify-content: space-between;
  width: 100%;
  box-sizing: border-box;
`;

const PredictedGoalScorer = styled.div`
  display: flex;
  gap: ${theme.spacing.xxxs};
  align-items: center;
`;

export default PredictionScoreCard;
