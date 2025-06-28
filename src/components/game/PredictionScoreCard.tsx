import React, { useState } from 'react';
import styled from 'styled-components';
import {
  CaretDown, CaretUp, Confetti, FireSimple, Info, SoccerBall, Target,
} from '@phosphor-icons/react';
import { useHover } from 'react-haiku';
import { Fixture, Prediction, TeamType } from '../../utils/Fixture';
import { devices, theme } from '../../theme';
import { EmphasisTypography, HeadingsTypography, NormalTypography } from '../typography/Typography';
import { UserProfilePicture } from '../typography/UserName';
import Avatar, { AvatarSize } from '../avatar/Avatar';
import ClubAvatar from '../avatar/ClubAvatar';
import NationAvatar from '../avatar/NationAvatar';
import IconButton from '../buttons/IconButton';
import { Team } from '../../utils/Team';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';
import { Section } from '../section/Section';
import { getGeneralPositionShorthand, getPredictionOutcome } from '../../utils/helpers';
import Tooltip from '../tooltip/Tooltip';
import { Divider } from '../Divider';

interface PredictionScoreCardProps {
  prediction: Prediction;
  fixture: Fixture | undefined;
}

const PredictionScoreCard = ({ prediction, fixture }: PredictionScoreCardProps) => {
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const { hovered: underdogBonusHovered, ref: underdogInfoRef } = useHover();
  const { hovered: goalFestHovered, ref: goalFestInfoRef } = useHover();

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showTooltipMobile, setShowTooltipMobile] = useState<'underdog' | 'goalFest' | null>(null);

  const oddsBonusPointsAwarded = Boolean(prediction.points?.oddsBonus);
  const correctResultPredicted = Boolean(prediction.points?.correctResult) || Boolean(prediction.points?.correctResultBool);
  const correctGoalScorerPredicted = Boolean(prediction.points?.correctGoalScorer);
  const goalFestAwarded = Boolean(prediction.points?.goalFest);

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

  const handleShowInfoTooltip = (type: 'underdog' | 'goalFest') => {
    if (!isMobile) return;

    if (showTooltipMobile === type) {
      setShowTooltipMobile(null);
    } else {
      setShowTooltipMobile(type);
    }
  };

  const getFirstTeamToScore = () => {
    if (fixture && prediction.points?.firstTeamToScore) {
      return fixture.homeTeam.name;
    }
    if (fixture && !prediction.points?.firstTeamToScore) {
      return fixture.awayTeam.name;
    }
    return 'Inget lag (0-0)';
  };

  const getGoalScorerName = () => {
    if (prediction.goalScorer) {
      if (isMobile) {
        const nameParts = prediction.goalScorer.name.split(' ');
        // Handle single-name players (like Raphinha, Ronaldinho, etc.)
        if (nameParts.length === 1) {
          return nameParts[0];
        }
        // For players with first and last name, return initial + last name
        return `${nameParts[0].charAt(0)}. ${nameParts[1]}`;
      }
      return prediction.goalScorer.name;
    }
    return 'Ingen målskytt';
  };

  const getTableRow = (label: string, userPrediction: string, points: number | undefined) => {
    if (!points || points === 0 || !fixture) return null;

    const isOddsBonus = label.includes('Oddsbonus');
    const isGoalScorer = label.includes('Korrekt målskytt');
    const isCorrectResult = label.includes('Korrekt resultat');
    const isOutcome = label.includes('Korrekt utfall (1X2)');
    const isFirstTeamToScore = label.includes('Första lag att göra mål');
    const isUnderdogBonus = label.includes('Underdog bonus');
    const isGoalFest = label.includes('Målfestbonus');

    const firstTeamToScoreAvatar = userPrediction === fixture?.homeTeam.name ? getAvatar(fixture.homeTeam) : getAvatar(fixture.awayTeam);

    return (
      <TableRow topBorder>
        <Section flexDirection="row" gap="xxs" alignItems="center">
          {isOddsBonus && !isMobile && (
            <FireSimple size={20} color={theme.colors.silverDark} />
          )}
          {isGoalScorer && !isMobile && (
            <SoccerBall size={20} color={theme.colors.silverDark} weight="fill" />
          )}
          {isCorrectResult && !isMobile && (
            <Target size={20} color={theme.colors.silverDark} />
          )}
          {isGoalFest && !isMobile && (
            <Confetti size={20} color={theme.colors.silverDark} weight="fill" />
          )}
          <NormalTypography variant="s" color={theme.colors.textDefault}>{label}</NormalTypography>
          {isUnderdogBonus && (
            <InfoIconWrapper ref={underdogInfoRef as React.RefObject<HTMLDivElement>} onClick={() => handleShowInfoTooltip('underdog')}>
              <Info size={20} color={theme.colors.silver} weight="fill" />
              <InfoIconTooltipContainer>
                <Tooltip show={underdogBonusHovered || (isMobile && showTooltipMobile === 'underdog')} text="Ensam att tippa korrekt resultat" arrowPosition="bottom" size="small" />
              </InfoIconTooltipContainer>
            </InfoIconWrapper>
          )}
          {isGoalFest && (
            <InfoIconWrapper ref={goalFestInfoRef as React.RefObject<HTMLDivElement>} onClick={() => handleShowInfoTooltip('goalFest')}>
              <Info size={20} color={theme.colors.silver} weight="fill" />
              <InfoIconTooltipContainer>
                <Tooltip show={goalFestHovered || (isMobile && showTooltipMobile === 'goalFest')} text="Korrekt resultat med > 4 mål" arrowPosition="bottom" size="small" />
              </InfoIconTooltipContainer>
            </InfoIconWrapper>
          )}
        </Section>
        <CenterAdjustedTableCell>
          {isOutcome && (
            <PredictedOutcome>
              <NormalTypography variant="s" color={theme.colors.textDefault} align="center">{userPrediction}</NormalTypography>
            </PredictedOutcome>
          )}
          {isFirstTeamToScore && (
            firstTeamToScoreAvatar
          )}
          {!isOutcome && !isFirstTeamToScore && (
            <NormalTypography variant="s" color={theme.colors.textDefault} align="center">{userPrediction}</NormalTypography>
          )}
        </CenterAdjustedTableCell>
        <RightAdjustedTableCell>
          <EmphasisTypography variant="m" color={theme.colors.primary}>
            {points}
            {' '}
            p
          </EmphasisTypography>
        </RightAdjustedTableCell>
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
            prediction.userProfilePictureUrl ? (
              <Avatar
                src={prediction.userProfilePictureUrl && prediction.userProfilePictureUrl.length > 0 ? `/images/${prediction.userProfilePictureUrl}.png` : '/images/generic.png'}
                size={AvatarSize.M}
                objectFit="cover"
                showBorder
                customBorderWidth={1}
              />
            ) : (
              <UserProfilePicture userId={prediction.userId} size={AvatarSize.M} />
            )
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
            {goalFestAwarded && (
              <PointsBadge>
                <Confetti size={20} color={theme.colors.primaryDark} weight="fill" />
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
          <>
            <PredictedGoalScorerSection>
              <EmphasisTypography variant="s" color={theme.colors.textDefault}>Målskytt:</EmphasisTypography>
              <PredictedGoalScorer>
                {prediction.goalScorer ? (
                  <>
                    <SoccerBall size={16} color={theme.colors.silverDark} weight="fill" />
                    <NormalTypography variant="s" color={theme.colors.silverDark}>{getGoalScorerName()}</NormalTypography>
                  </>
                ) : (
                  <NormalTypography variant="s" color={theme.colors.silverDark}>Ingen målskytt tippad</NormalTypography>
                )}
              </PredictedGoalScorer>
            </PredictedGoalScorerSection>
            <Divider />
          </>
        )}
        {prediction.points && prediction.points.total && prediction.points.total > 0 ? (
          <>
            <TableRow>
              <EmphasisTypography variant="m" color={theme.colors.primaryDark}>Poängfördelning</EmphasisTypography>
              <CenterAdjustedTableCell>
                <Tooltip show text={prediction.username?.split(' ')[0] ?? 'Tippat'} arrowPosition="bottom" size="small" />
              </CenterAdjustedTableCell>
              <RightAdjustedTableCell>
                <NormalTypography variant={isMobile ? 's' : 'm'} color={theme.colors.textDefault}>Poäng</NormalTypography>
              </RightAdjustedTableCell>
            </TableRow>
            {getTableRow('Korrekt resultat', `${prediction.homeGoals} - ${prediction.awayGoals}`, prediction.points?.correctResult)}
            {getTableRow('Korrekt utfall (1X2)', getPredictionOutcome(prediction.homeGoals, prediction.awayGoals), prediction.points?.correctOutcome)}
            {getTableRow('Korrekt antal mål av hemmalag', prediction.homeGoals.toString(), prediction.points?.correctGoalsByHomeTeam)}
            {getTableRow('Korrekt antal mål av bortalag', prediction.awayGoals.toString(), prediction.points?.correctGoalsByAwayTeam)}
            {getTableRow('Korrekt målskillnad', (prediction.homeGoals - prediction.awayGoals).toString(), prediction.points?.correctGoalDifference)}
            {getTableRow('Första lag att göra mål', getFirstTeamToScore(), prediction.points?.firstTeamToScore)}
            {getTableRow('Underdog bonus', '✓', prediction.points?.underdogBonus)}
            {getTableRow('Målfestbonus', `${(prediction.homeGoals + prediction.awayGoals).toString()} mål`, prediction.points?.goalFest)}
            {getTableRow('Oddsbonus', getOddsForPredictedOutcome() ?? '-', prediction.points?.oddsBonus)}
            {prediction.goalScorer && (
              <>
                {getTableRow(`Korrekt målskytt (${getGeneralPositionShorthand(prediction.goalScorer.position.general)})`, getGoalScorerName(), prediction.points?.correctGoalScorer)}
              </>
            )}
          </>
        ) : (
          <Section>
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
  box-shadow: 0px 3px 0px 0px ${theme.colors.silverLighter};
  max-height: ${({ isExpanded }) => (isExpanded ? '1000px' : '32px')};
  overflow: hidden;
  transition: max-height 0.6s cubic-bezier(.39,-0.15,.46,.94);
  
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
  display: grid;
  grid-template-columns: 1fr 100px 32px;
  align-items: center;
  gap: ${theme.spacing.xxs};
  width: 100%;
  box-sizing: border-box;
  ${({ topBorder }) => topBorder && `border-top: 1px solid ${theme.colors.silverLight};`}
  padding-top: ${theme.spacing.xs};

  @media ${devices.tablet} {
    grid-template-columns: 1fr 200px 100px;
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

const CenterAdjustedTableCell = styled.div`
  display: flex;
  justify-content: center;
  gap: ${theme.spacing.xs};
  align-items: center;
  width: 100px;
  box-sizing: border-box;
  
  @media ${devices.tablet} {
    width: 200px;
  }
`;

const RightAdjustedTableCell = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${theme.spacing.xs};
  align-items: center;
  width: 100%;
  box-sizing: border-box;
`;

const PredictedOutcome = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: ${theme.borderRadius.s};
  background-color: ${theme.colors.silverLight};
  border: 1px solid ${theme.colors.silver};
`;

const InfoIconWrapper = styled.div`
  height: fit-content;
  width: fit-content;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: help;
`;

const InfoIconTooltipContainer = styled.div`
  position: absolute;
  bottom: 26px;
  left: 50%;
  transform: translateX(-50%);
`;

export default PredictionScoreCard;
