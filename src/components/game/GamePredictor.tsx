/* eslint-disable react/jsx-no-useless-fragment */
import React, { useEffect, useState } from 'react';
import {
  ChartBar, CheckCircle, Confetti, FireSimple, MapPin, PlusCircle, Prohibit, SoccerBall, Target,
  XCircle,
} from '@phosphor-icons/react';
import styled, { css, keyframes } from 'styled-components';
import {
  collection, getDocs, query, where,
} from 'firebase/firestore';
import { useHover } from 'react-haiku';
import { Section } from '../section/Section';
import { EmphasisTypography, NormalTypography } from '../typography/Typography';
import {
  Fixture, Prediction, PredictionPoints, TeamType, FirstTeamToScore,
} from '../../utils/Fixture';
import { Player } from '../../utils/Players';
import Avatar, { AvatarSize } from '../avatar/Avatar';
import { devices, theme } from '../../theme';
import { Team } from '../../utils/Team';
import { Divider } from '../Divider';
import Button from '../buttons/Button';
import ClubAvatar from '../avatar/ClubAvatar';
import NationAvatar from '../avatar/NationAvatar';
import GoalsInput from './GoalsInput';
import { errorNotify } from '../../utils/toast/toastHelpers';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';
import GoalScorerModal from './GoalScorerModal';
import IconButton from '../buttons/IconButton';
import Tag from '../tag/Tag';
import { db } from '../../config/firebase';
import { CollectionEnum } from '../../utils/Firebase';
import { bullseyeScoringSystem, withDocumentIdOnObject } from '../../utils/helpers';
import Tooltip from '../tooltip/Tooltip';
import { LeagueScoringSystemValues } from '../../utils/League';
import FirstTeamToScoreModal from './FirstTeamToScoreModal';

interface GamePredictorProps {
  game: Fixture;
  gameNumber: number;
  onResultUpdate: (gameNumber: number, homeGoals: string, awayGoals: string) => void;
  onPlayerPredictionUpdate: (gameNumber: number, player: Player | undefined) => void;
  onFirstTeamToScoreUpdate: (gameNumber: number, firstTeamToScore: FirstTeamToScore) => void;
  onSave: (homeGoals: string, awayGoals: string, predictedPlayerToScore?: Player, firstTeamToScore?: FirstTeamToScore) => void;
  onShowStats: (fixture: Fixture) => void;
  hasPredicted?: boolean;
  predictionValue?: Prediction;
  loading?: boolean;
  previousGameWeekPredictedGoalScorers?: Array<Player>;
  numberOfParticipantsPredicted?: number;
  isLeagueCreator?: boolean;
  awardedPoints?: PredictionPoints;
  particpantsThatPredicted?: Array<string>;
  leagueScoringSystem?: LeagueScoringSystemValues;
}

const GamePredictor = ({
  game,
  gameNumber,
  onPlayerPredictionUpdate,
  onFirstTeamToScoreUpdate,
  onResultUpdate,
  onSave,
  onShowStats,
  hasPredicted,
  predictionValue,
  loading,
  previousGameWeekPredictedGoalScorers,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isLeagueCreator,
  numberOfParticipantsPredicted,
  awardedPoints,
  particpantsThatPredicted,
  leagueScoringSystem,
}: GamePredictorProps) => {
  const isMobile = useResizeListener(DeviceSizes.MOBILE);
  const { hovered: homeWinHovered, ref: homeWinRef } = useHover();
  const { hovered: drawHovered, ref: drawRef } = useHover();
  const { hovered: awayWinHovered, ref: awayWinRef } = useHover();

  const [homeGoals, setHomeGoals] = useState<string>(predictionValue?.homeGoals.toString() ?? '');
  const [awayGoals, setAwayGoals] = useState<string>(predictionValue?.awayGoals.toString() ?? '');
  const [predictedPlayerToScore, setPredictedPlayerToScore] = useState<Player | undefined>(predictionValue && predictionValue.goalScorer ? predictionValue.goalScorer : undefined);
  const [predictedFirstTeamToScore, setPredictedFirstTeamToScore] = useState<FirstTeamToScore | undefined>(predictionValue?.firstTeamToScore);
  const [isSelectGoalScorerModalOpen, setIsSelectGoalScorerModalOpen] = useState(false);
  const [isSelectFirstTeamToScoreModalOpen, setIsSelectFirstTeamToScoreModalOpen] = useState(false);
  const [homeTeamPlayers, setHomeTeamPlayers] = useState<Array<Player>>([]);
  const [awayTeamPlayers, setAwayTeamPlayers] = useState<Array<Player>>([]);
  const [showParticipantsPredictedTooltip, setShowParticipantsPredictedTooltip] = useState<boolean>(false);

  const kickoffTimeHasPassed = new Date(game.kickOffTime) < new Date();
  const hasPredictedHomeWin = homeGoals !== '' && awayGoals !== '' && homeGoals > awayGoals;
  const hasPredictedDraw = homeGoals !== '' && awayGoals !== '' && homeGoals === awayGoals;
  const hasPredictedAwayWin = homeGoals !== '' && awayGoals !== '' && homeGoals < awayGoals;
  const predictedCorrectGoalScorer = predictedPlayerToScore && game.finalResult && game.finalResult.goalScorers && game.finalResult.goalScorers.includes(predictedPlayerToScore.name);
  const predictedIncorrectGoalScorer = predictedPlayerToScore && game.finalResult && game.finalResult.goalScorers && !game.finalResult.goalScorers.includes(predictedPlayerToScore.name);
  const predictedCorrectFirstTeamToScore = predictedFirstTeamToScore && game.finalResult && game.finalResult.firstTeamToScore && game.finalResult.firstTeamToScore === predictedFirstTeamToScore;
  const predictedIncorrectFirstTeamToScore = predictedFirstTeamToScore && game.finalResult && game.finalResult.firstTeamToScore && game.finalResult.firstTeamToScore !== predictedFirstTeamToScore;

  useEffect(() => {
    const fetchTeams = async () => {
      if (game.shouldPredictGoalScorer) {
        const homePlayers = await fetchTeamByName(game.homeTeam.name);
        const awayPlayers = await fetchTeamByName(game.awayTeam.name);

        if (homePlayers && homePlayers.length > 0) {
          setHomeTeamPlayers(homePlayers);
        }
        if (awayPlayers && awayPlayers.length > 0) {
          setAwayTeamPlayers(awayPlayers);
        }
      }
    };
    fetchTeams();
  }, []);

  const fetchTeamByName = async (teamName: string) => {
    const teamsRef = collection(db, CollectionEnum.TEAMS);
    const q = query(teamsRef, where('name', '==', teamName));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const teamDoc = querySnapshot.docs[0];
      const teamData = withDocumentIdOnObject<Team>(teamDoc);

      if (teamData.players) {
        return teamData.players;
      }
      return [];
    }
    return [];
  };

  const handleIncreaseGoals = (team: 'home' | 'away') => {
    if (new Date(game.kickOffTime) < new Date()) {
      errorNotify('Deadline har passerat');
      return;
    }

    let updatedHomeGoals = homeGoals;
    let updatedAwayGoals = awayGoals;

    if (team === 'home') {
      if (homeGoals === '') {
        updatedHomeGoals = '0';
        setHomeGoals('0');
        return;
      }
      updatedHomeGoals = (parseInt(homeGoals) + 1).toString();
      setHomeGoals((oldstate) => (parseInt(oldstate) + 1).toString());
    } else {
      if (awayGoals === '') {
        updatedAwayGoals = '0';
        setAwayGoals('0');
        return;
      }
      updatedAwayGoals = (parseInt(awayGoals) + 1).toString();
      setAwayGoals((oldstate) => (parseInt(oldstate) + 1).toString());
    }
    onResultUpdate(gameNumber, updatedHomeGoals, updatedAwayGoals);
  };

  const handleDecreaseGoals = (team: 'home' | 'away') => {
    if (new Date(game.kickOffTime) < new Date()) {
      errorNotify('Deadline har passerat');
      return;
    }

    let updatedHomeGoals = homeGoals;
    let updatedAwayGoals = awayGoals;

    if (team === 'home') {
      if (homeGoals === '') {
        updatedHomeGoals = '0';
        setHomeGoals('0');
        return;
      }
      updatedHomeGoals = (parseInt(homeGoals) - 1).toString();
      setHomeGoals((oldstate) => (parseInt(oldstate) - 1).toString());
    } else {
      if (awayGoals === '') {
        updatedAwayGoals = '0';
        setAwayGoals('0');
        return;
      }
      updatedAwayGoals = (parseInt(awayGoals) - 1).toString();
      setAwayGoals((oldstate) => (parseInt(oldstate) - 1).toString());
    }
    onResultUpdate(gameNumber, updatedHomeGoals, updatedAwayGoals);
  };

  const getKickoffTime = (mobile: boolean) => {
    const weekday = new Date(game.kickOffTime).toLocaleDateString('sv-SE', { weekday: 'short' });
    const weekdayCapitalized = weekday.charAt(0).toUpperCase() + weekday.slice(1);
    const date = new Date(game.kickOffTime).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
    const time = new Date(game.kickOffTime).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });

    const isToday = new Date(game.kickOffTime).toDateString() === new Date().toDateString();
    const isTomorrow = new Date(game.kickOffTime).toDateString() === new Date(new Date().setDate(new Date().getDate() + 1)).toDateString();

    let weekdayFormatted;
    if (isToday) {
      weekdayFormatted = 'Idag';
    } else if (isTomorrow) {
      weekdayFormatted = 'Imorgon';
    } else {
      weekdayFormatted = weekdayCapitalized;
    }

    if (mobile || isToday || isTomorrow) {
      return `${weekdayFormatted} ${time}`;
    }

    return `${weekdayFormatted} ${date.replaceAll('.', '')} ${time}`;
  };

  const getTextColor = () => (hasPredicted ? theme.colors.white : theme.colors.textDefault);

  const getPotentialOddsBonusPoints = (hoveredOdds: 'home' | 'draw' | 'away') => {
    if (game.odds) {
      const homeWinOdds = parseFloat(game.odds.homeWin);
      const drawOdds = parseFloat(game.odds.draw);
      const awayWinOdds = parseFloat(game.odds.awayWin);

      const leagueScoringSystemToUse = leagueScoringSystem ?? bullseyeScoringSystem;

      const getBonusPointsFromOdds = (odds: number): number => {
        if (odds >= 1 && odds <= 2.99) return 0;
        if (odds >= 3.0 && odds <= 3.99) return leagueScoringSystemToUse.oddsBetween3And4;
        if (odds >= 4.0 && odds <= 5.99) return leagueScoringSystemToUse.oddsBetween4And6;
        if (odds >= 6.0 && odds <= 9.99) return leagueScoringSystemToUse.oddsBetween6And10;
        if (odds >= 10) return leagueScoringSystemToUse.oddsAvobe10;
        return 0;
      };

      if (hoveredOdds === 'home' && homeWinOdds) {
        return getBonusPointsFromOdds(homeWinOdds);
      }
      if (hoveredOdds === 'draw' && drawOdds) {
        return getBonusPointsFromOdds(drawOdds);
      }
      if (hoveredOdds === 'away' && awayWinOdds) {
        return getBonusPointsFromOdds(awayWinOdds);
      }

      return 0;
    }
    return 0;
  };

  const handleInputChange = (team: 'home' | 'away', value: string) => {
    if (value !== '' && !/^[0-9]$/.test(value)) {
      return;
    }
    if (team === 'home') {
      setHomeGoals(value);
    } else {
      setAwayGoals(value);
    }
    onResultUpdate(gameNumber, homeGoals, awayGoals);
  };

  const handleSave = () => {
    onSave(homeGoals, awayGoals, predictedPlayerToScore, predictedFirstTeamToScore);
  };

  const handleUpdatePlayerPrediction = (player?: Player) => {
    if (!player) return;
    setPredictedPlayerToScore(player);
    onPlayerPredictionUpdate(gameNumber, player);
  };

  const handleUpdateFirstTeamToScore = (firstTeamToScore: FirstTeamToScore) => {
    setPredictedFirstTeamToScore(firstTeamToScore);
    onFirstTeamToScoreUpdate(gameNumber, firstTeamToScore);
    setIsSelectFirstTeamToScoreModalOpen(false);
  };

  const getGoalScorerIconButtonColor = () => {
    if (kickoffTimeHasPassed) {
      if (hasPredicted) {
        return theme.colors.primaryDark;
      }
      return theme.colors.silverLight;
    }
    if (hasPredicted && !predictedPlayerToScore) return theme.colors.gold;
    return theme.colors.primary;
  };

  const getFirstTeamToScoreIconButtonColor = () => {
    if (kickoffTimeHasPassed) {
      if (hasPredicted) {
        return theme.colors.primaryDark;
      }
      return theme.colors.silverLight;
    }
    if (hasPredicted && (!predictedFirstTeamToScore || predictedFirstTeamToScore === FirstTeamToScore.NONE)) return theme.colors.gold;
    return theme.colors.primary;
  };

  const getFormattedPredictedParticipantNames = () => {
    if (particpantsThatPredicted && particpantsThatPredicted.length > 0) {
      const [name1, name2, name3, ...rest] = particpantsThatPredicted;
      const restCount = rest.length;

      if (particpantsThatPredicted.length === 1) {
        return name1;
      } if (particpantsThatPredicted.length === 2) {
        return `${name1} & ${name2}`;
      } if (particpantsThatPredicted.length === 3) {
        return `${name1}, ${name2} & ${name3}`;
      }
      return `${name1}, ${name2} & ${name3} + ${restCount} till`;
    }
    return 'Ingen';
  };

  const wasThisOutcomeByFinalResult = (outcome: 'home' | 'draw' | 'away') => {
    if (game.finalResult) {
      if (outcome === 'home' && game.finalResult.homeTeamGoals > game.finalResult.awayTeamGoals) {
        return true;
      }
      if (outcome === 'draw' && game.finalResult.homeTeamGoals === game.finalResult.awayTeamGoals) {
        return true;
      }
      if (outcome === 'away' && game.finalResult.homeTeamGoals < game.finalResult.awayTeamGoals) {
        return true;
      }
    }
    return false;
  };

  const getPotentialOddsBonusPointsTooltip = (hoveredOdds: 'home' | 'draw' | 'away') => {
    let hasPredictedThisOutcome;

    if (hoveredOdds === 'home') {
      hasPredictedThisOutcome = hasPredictedHomeWin;
    } else if (hoveredOdds === 'draw') {
      hasPredictedThisOutcome = hasPredictedDraw;
    } else {
      hasPredictedThisOutcome = hasPredictedAwayWin;
    }

    const potentialOddsBonusPoints = getPotentialOddsBonusPoints(hoveredOdds);

    return (
      <TooltipContainer topOffset={36}>
        <Tooltip
          textWeight={hasPredictedThisOutcome ? 'emphasis' : 'normal'}
          text={`${potentialOddsBonusPoints}`}
          endIcon={<FireSimple size={18} color={hasPredictedThisOutcome ? theme.colors.gold : theme.colors.white} weight={hasPredictedThisOutcome ? 'fill' : 'regular'} />}
          textColor={hasPredictedThisOutcome ? theme.colors.gold : theme.colors.white}
          show={(hoveredOdds === 'home' && homeWinHovered) || (hoveredOdds === 'draw' && drawHovered) || (hoveredOdds === 'away' && awayWinHovered)}
        />
      </TooltipContainer>
    );
  };

  const getFirstTeamToScoreTeamName = () => {
    if (predictedFirstTeamToScore === FirstTeamToScore.HOME_TEAM) {
      return game.homeTeam.name;
    }
    if (predictedFirstTeamToScore === FirstTeamToScore.AWAY_TEAM) {
      return game.awayTeam.name;
    }
    return '';
  };

  const getFirstTeamToScoreLogoUrl = () => {
    if (predictedFirstTeamToScore === FirstTeamToScore.HOME_TEAM) {
      return game.homeTeam.logoUrl;
    }
    if (predictedFirstTeamToScore === FirstTeamToScore.AWAY_TEAM) {
      return game.awayTeam.logoUrl;
    }
    return '';
  };

  const getTeam = (team: Team, isAwayTeam: boolean) => {
    const { name, shortName } = team;
    const logoUrl = (hasPredicted && team.darkModeLogoUrl) ? team.darkModeLogoUrl : team.logoUrl;
    const displayName = ((isMobile || team.name.length > 15) && shortName) ? shortName : name;
    const aggregatedScore = isAwayTeam ? game.aggregateScore?.awayTeamGoals : game.aggregateScore?.homeTeamGoals;
    const abc = `${displayName} (${aggregatedScore})`;

    return (
      <TeamContainer team={isAwayTeam ? 'away' : 'home'}>
        <AvatarAndTeamName>
          {game.teamType === TeamType.CLUBS ? (
            <ClubAvatar
              clubName={displayName}
              logoUrl={logoUrl}
              size={isMobile ? AvatarSize.L : AvatarSize.XL}
              shape="square"
            />
          ) : (
            <NationAvatar
              nationName={name}
              flagUrl={logoUrl}
              size={isMobile ? AvatarSize.L : AvatarSize.XL}
            />
          )}
          <TeamName variant={isMobile ? 's' : 'm'} color={hasPredicted ? theme.colors.white : theme.colors.textDefault} align="center">
            {aggregatedScore !== undefined ? abc : displayName}
          </TeamName>
        </AvatarAndTeamName>
      </TeamContainer>
    );
  };

  const getCardHeaderContent = () => {
    if (game.finalResult && awardedPoints) {
      const correctGoalScorerPredicted = awardedPoints.correctGoalScorer > 0;
      const correctResultPredicted = awardedPoints.correctResult > 0 || awardedPoints.correctResultBool;
      const oddsBonusPointsAwarded = awardedPoints.oddsBonus > 0;
      const goalFestBonusPointsAwarded = awardedPoints.goalFest > 0;

      return (
        <Section flexDirection="row" alignItems="center" gap="xs" justifyContent="center">
          <Tag
            size="m"
            textWeight="emphasis"
            text={`${awardedPoints.total} p`}
            textAndIconColor={hasPredicted ? theme.colors.primaryDark : theme.colors.primaryDark}
            backgroundColor={hasPredicted ? theme.colors.gold : theme.colors.primaryBleach}
          />
          {(correctGoalScorerPredicted || correctResultPredicted || oddsBonusPointsAwarded) && (
            <Tag
              size="m"
              textAndIconColor={theme.colors.gold}
              backgroundColor={theme.colors.primaryDark}
              icon={(oddsBonusPointsAwarded || correctResultPredicted || correctGoalScorerPredicted) ? (
                <PointsIcons>
                  {correctGoalScorerPredicted && (
                    <SoccerBall size={18} weight="fill" />
                  )}
                  {oddsBonusPointsAwarded && (
                    <FireSimple size={18} />
                  )}
                  {correctResultPredicted && (
                    <Target size={18} />
                  )}
                  {goalFestBonusPointsAwarded && (
                    <Confetti size={18} weight="fill" />
                  )}
                </PointsIcons>
              ) : undefined}
            />
          )}
        </Section>
      );
    }

    if (isMobile) {
      return (
        <>
          {/* <Section flexDirection="row" gap="xxxs" alignItems="center" fitContent>
            <MapPin size={16} weight="fill" color={getTextColor()} />
            <EllipsisTypography variant="s" align="center" color={getTextColor()}>{game.stadium}</EllipsisTypography>
          </Section> */}
          <Section flexDirection="row" alignItems="center" gap="xs" justifyContent="center">
            <NoWrapTypography variant="s" align="center" color={getTextColor()}>{getKickoffTime(true)}</NoWrapTypography>
            <NormalTypography variant="s" color={getTextColor()}>•</NormalTypography>
            <EllipsisTypography variant="s" align="center" color={getTextColor()}>{game.tournament}</EllipsisTypography>
            {game.includeStats && (
              <IconButton
                icon={<ChartBar size={24} weight="fill" />}
                colors={{
                  normal: hasPredicted ? theme.colors.gold : theme.colors.primary,
                  hover: hasPredicted ? theme.colors.gold : theme.colors.primaryDark,
                  active: hasPredicted ? theme.colors.gold : theme.colors.primaryDarker,
                }}
                onClick={() => onShowStats(game)}
              />
            )}
          </Section>
        </>
      );
    }

    return (
      <>
        <Section flexDirection="row" gap="xxxs" alignItems="center" fitContent overflow="hidden">
          <MapPin size={16} weight="fill" color={getTextColor()} />
          <EllipsisTypography variant="s" align="center" color={getTextColor()}>{game.stadium}</EllipsisTypography>
        </Section>
        <NormalTypography variant="s" color={getTextColor()}>•</NormalTypography>
        <NoWrapTypography variant="s" align="center" color={getTextColor()}>{getKickoffTime(false)}</NoWrapTypography>
        <NormalTypography variant="s" color={getTextColor()}>•</NormalTypography>
        <EllipsisTypography variant="s" align="center" color={getTextColor()}>{game.tournament}</EllipsisTypography>
        {game.includeStats && (
          <IconButton
            icon={<ChartBar size={24} weight="fill" />}
            colors={{
              normal: hasPredicted ? theme.colors.gold : theme.colors.primary,
              hover: hasPredicted ? theme.colors.gold : theme.colors.primaryDark,
              active: hasPredicted ? theme.colors.gold : theme.colors.primaryDarker,
            }}
            onClick={() => onShowStats(game)}
          />
        )}
      </>
    );
  };

  return (
    <>
      <Card hasPredicted={hasPredicted}>
        <CardHeader includesStats={game.includeStats}>
          {getCardHeaderContent()}
        </CardHeader>
        <Divider color={hasPredicted ? theme.colors.primaryLight : theme.colors.silverLighter} />
        <TagsSection>
          {game.fixtureNickname && (
            <>
              <Tag
                text={game.fixtureNickname}
                textAndIconColor={hasPredicted ? theme.colors.primaryDark : theme.colors.primaryDark}
                backgroundColor={hasPredicted ? theme.colors.gold : theme.colors.primaryBleach}
                size="s"
              />
              {!isMobile && game.shouldPredictGoalScorer && <NormalTypography variant="s" color={getTextColor()}>•</NormalTypography>}
            </>
          )}
          <NumberOfParticipantsPredicted
            onMouseEnter={() => setShowParticipantsPredictedTooltip(true)}
            onMouseLeave={() => setShowParticipantsPredictedTooltip(false)}
          >
            <EmphasisTypography variant="s" color={hasPredicted ? theme.colors.primaryLighter : theme.colors.silver}>
              {`${numberOfParticipantsPredicted === 0 ? 'Ingen' : numberOfParticipantsPredicted} deltagare har tippat`}
            </EmphasisTypography>
            {particpantsThatPredicted && particpantsThatPredicted.length > 0 && !isMobile && (
              <TooltipContainer topOffset={24}>
                <Tooltip
                  text={getFormattedPredictedParticipantNames()}
                  show={showParticipantsPredictedTooltip}
                  textSize="xs"
                />
              </TooltipContainer>
            )}
          </NumberOfParticipantsPredicted>
        </TagsSection>
        <Divider color={hasPredicted ? theme.colors.primaryLight : theme.colors.silverLighter} />
        <GameWrapper>
          {getTeam(game.homeTeam, false)}
          <GoalInputWrapper>
            <GoalsInput
              goals={homeGoals}
              onIncrease={() => handleIncreaseGoals('home')}
              onDecrease={() => handleDecreaseGoals('home')}
              onInputChange={(value) => handleInputChange('home', value)}
              hasPredicted={hasPredicted}
              disabled={kickoffTimeHasPassed}
            />
            <NormalTypography variant="l" color={hasPredicted ? theme.colors.white : theme.colors.textDefault}>–</NormalTypography>
            <GoalsInput
              goals={awayGoals}
              onIncrease={() => handleIncreaseGoals('away')}
              onDecrease={() => handleDecreaseGoals('away')}
              onInputChange={(value) => handleInputChange('away', value)}
              hasPredicted={hasPredicted}
              disabled={kickoffTimeHasPassed}
            />
          </GoalInputWrapper>
          {getTeam(game.awayTeam, true)}
        </GameWrapper>
        {game.odds && (
          <>
            {!(game.shouldPredictFirstTeamToScore && game.shouldPredictGoalScorer) && (
              <Divider color={hasPredicted ? theme.colors.primaryLight : theme.colors.silverLighter} />
            )}
            <OddsContainer hasPredicted={hasPredicted} hasDivider={!(game.shouldPredictFirstTeamToScore && game.shouldPredictGoalScorer)}>
              <OddsWrapper>
                {!isMobile && getPotentialOddsBonusPointsTooltip('home')}
                <OddsTextWrapper
                  hasPredictedThisOutcome={hasPredictedHomeWin}
                  ref={homeWinRef as React.RefObject<HTMLDivElement>}
                  hasPredicted={hasPredicted}
                  wasThisOutcomeByFinalResult={wasThisOutcomeByFinalResult('home')}
                >
                  <NormalTypography variant="s" color={hasPredicted ? theme.colors.gold : theme.colors.primary}>1</NormalTypography>
                  <NormalTypography variant="s" color={hasPredicted ? theme.colors.white : theme.colors.textDefault}>{game.odds.homeWin}</NormalTypography>
                </OddsTextWrapper>
              </OddsWrapper>
              <OddsWrapper>
                {!isMobile && getPotentialOddsBonusPointsTooltip('draw')}
                <OddsTextWrapper
                  hasPredictedThisOutcome={hasPredictedDraw}
                  ref={drawRef as React.RefObject<HTMLDivElement>}
                  hasPredicted={hasPredicted}
                  wasThisOutcomeByFinalResult={wasThisOutcomeByFinalResult('draw')}
                >
                  <NormalTypography variant="s" color={hasPredicted ? theme.colors.gold : theme.colors.primary}>X</NormalTypography>
                  <NormalTypography variant="s" color={hasPredicted ? theme.colors.white : theme.colors.textDefault}>{game.odds.draw}</NormalTypography>
                </OddsTextWrapper>
              </OddsWrapper>
              <OddsWrapper>
                {!isMobile && getPotentialOddsBonusPointsTooltip('away')}
                <OddsTextWrapper
                  hasPredictedThisOutcome={hasPredictedAwayWin}
                  ref={awayWinRef as React.RefObject<HTMLDivElement>}
                  hasPredicted={hasPredicted}
                  wasThisOutcomeByFinalResult={wasThisOutcomeByFinalResult('away')}
                >
                  <NormalTypography variant="s" color={hasPredicted ? theme.colors.gold : theme.colors.primary}>2</NormalTypography>
                  <NormalTypography variant="s" color={hasPredicted ? theme.colors.white : theme.colors.textDefault}>{game.odds.awayWin}</NormalTypography>
                </OddsTextWrapper>
              </OddsWrapper>
            </OddsContainer>
          </>
        )}
        <Divider color={hasPredicted ? theme.colors.primaryLight : theme.colors.silverLighter} />
        {game.shouldPredictFirstTeamToScore && (
          <>
            <FirstTeamToScoreSection
              hasPredicted={hasPredicted}
              hasChosen={predictedFirstTeamToScore !== undefined}
              shouldPredictFirstTeamToScore={game.shouldPredictFirstTeamToScore}
              disabled={kickoffTimeHasPassed}
              onClick={kickoffTimeHasPassed ? (() => {}) : () => setIsSelectFirstTeamToScoreModalOpen(true)}
            >
              <EmphasisTypography variant={isMobile ? 's' : 'm'} color={hasPredicted ? theme.colors.white : theme.colors.textDefault}>Första lag att göra mål</EmphasisTypography>
              <FirstTeamToScoreContainer>
                {predictedFirstTeamToScore ? (
                  <AvatarWrapper>
                    {predictedFirstTeamToScore !== FirstTeamToScore.NONE ? (
                      <FirstTeamToScoreLogo>
                        {game.teamType === TeamType.CLUBS ? (
                          <ClubAvatar
                            clubName={getFirstTeamToScoreTeamName()}
                            logoUrl={getFirstTeamToScoreLogoUrl()}
                            size={AvatarSize.M}
                            shape="square"
                          />
                        ) : (
                          <NationAvatar
                            nationName={getFirstTeamToScoreTeamName()}
                            flagUrl={getFirstTeamToScoreLogoUrl()}
                            size={AvatarSize.M}
                          />
                        )}
                      </FirstTeamToScoreLogo>
                    ) : (
                      <Section padding={theme.spacing.xxs}>
                        <Prohibit size={32} color={getFirstTeamToScoreIconButtonColor()} />
                      </Section>
                    )}
                    {predictedCorrectFirstTeamToScore && (
                      <GoalScorerIconWrapper wasCorrect>
                        <CheckCircle color={theme.colors.gold} size={16} weight="fill" />
                      </GoalScorerIconWrapper>
                    )}
                    {predictedIncorrectFirstTeamToScore && (
                      <GoalScorerIconWrapper>
                        <XCircle color={theme.colors.red} size={16} weight="fill" />
                      </GoalScorerIconWrapper>
                    )}
                  </AvatarWrapper>
                ) : (
                  <PlusCircle color={getFirstTeamToScoreIconButtonColor()} size={30} weight="fill" />
                )}
              </FirstTeamToScoreContainer>
            </FirstTeamToScoreSection>
            <Divider color={hasPredicted ? theme.colors.primaryLight : theme.colors.silverLighter} />
          </>
        )}
        {game.shouldPredictGoalScorer && (
          <>
            <GoalScorerSection
              shouldPredictGoalScorer={game.shouldPredictGoalScorer}
              disabled={kickoffTimeHasPassed}
              onClick={kickoffTimeHasPassed || !game.shouldPredictGoalScorer ? (() => {}) : () => setIsSelectGoalScorerModalOpen(true)}
              hasPredicted={hasPredicted}
              hasChosen={predictedPlayerToScore !== undefined}
            >
              <EmphasisTypography variant={isMobile ? 's' : 'm'} color={hasPredicted ? theme.colors.white : theme.colors.textDefault}>{isMobile ? 'Välj målskytt' : 'Välj målskytt i matchen'}</EmphasisTypography>
              {/* {game.shouldPredictGoalScorer ? (
            <EmphasisTypography variant={isMobile ? 's' : 'm'} color={hasPredicted ? theme.colors.white : theme.colors.textDefault}>{isMobile ? 'Välj målskytt' : 'Välj målskytt i matchen'}</EmphasisTypography>
          ) : (
            <Section flexDirection="row" alignItems="center" justifyContent="center">
              <EmphasisTypography variant={isMobile ? 's' : 'm'} color={hasPredicted ? theme.colors.primaryLighter : theme.colors.silver}>
                Ingen målskytt ska tippas
              </EmphasisTypography>
            </Section>
          )} */}
              {game.shouldPredictGoalScorer && (
              <GoalScorer>
                {predictedPlayerToScore ? (
                  <AvatarWrapper>
                    <Avatar
                      src={predictedPlayerToScore.externalPictureUrl ?? predictedPlayerToScore.picture ?? '/images/placeholder-fancy.png'}
                      alt={predictedPlayerToScore.name}
                      size={AvatarSize.M}
                      title={predictedPlayerToScore.name}
                      objectFit="cover"
                      showBorder
                      customBorderWidth={1}
                      backgroundColor={theme.colors.silverLight}
                    />
                    {predictedCorrectGoalScorer && (
                    <GoalScorerIconWrapper wasCorrect>
                      <CheckCircle color={theme.colors.gold} size={16} weight="fill" />
                    </GoalScorerIconWrapper>
                    )}
                    {predictedIncorrectGoalScorer && (
                    <GoalScorerIconWrapper>
                      <XCircle color={theme.colors.red} size={16} weight="fill" />
                    </GoalScorerIconWrapper>
                    )}
                  </AvatarWrapper>
                ) : (
                  <PlusCircle color={getGoalScorerIconButtonColor()} size={30} weight="fill" />
                )}
              </GoalScorer>
              )}
            </GoalScorerSection>
            <Divider color={hasPredicted ? theme.colors.primaryLight : theme.colors.silverLighter} />
          </>
        )}
        {!kickoffTimeHasPassed && (
          <SaveButtonSection hasPredicted={hasPredicted}>
            <Button
              variant="primary"
              onClick={handleSave}
              color={hasPredicted ? 'gold' : 'primary'}
              loading={loading}
              disabledInvisible={homeGoals === '' || awayGoals === '' || loading}
              textColor={hasPredicted ? theme.colors.textDefault : theme.colors.white}
              fullWidth
            >
              Spara
            </Button>
          </SaveButtonSection>
        )}
      </Card>
      {isSelectGoalScorerModalOpen && (
        <GoalScorerModal
          homeTeamPlayers={homeTeamPlayers}
          awayTeamPlayers={awayTeamPlayers}
          fixture={game}
          onSave={(players) => handleUpdatePlayerPrediction(players[0])}
          onClose={() => setIsSelectGoalScorerModalOpen(false)}
          initialSelectedPlayers={[predictedPlayerToScore]}
          previousGameWeekPredictedGoalScorers={previousGameWeekPredictedGoalScorers}
          leagueScoringSystem={leagueScoringSystem}
        />
      )}
      {isSelectFirstTeamToScoreModalOpen && (
        <FirstTeamToScoreModal
          fixture={game}
          onSave={(firstTeamToScore: FirstTeamToScore) => handleUpdateFirstTeamToScore(firstTeamToScore)}
          onClose={() => setIsSelectFirstTeamToScoreModalOpen(false)}
          selectedTeamValue={predictedFirstTeamToScore}
        />
      )}
    </>
  );
};

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Card = styled.div<{ hasPredicted?: boolean }>`
  border-radius: ${theme.borderRadius.l};
  border: 2px solid ${({ hasPredicted }) => (hasPredicted ? theme.colors.gold : theme.colors.primary)};
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  background-color: ${({ hasPredicted }) => (hasPredicted ? theme.colors.primary : theme.colors.white)};
  width: 100%;
  box-sizing: border-box;
  animation: ${fadeIn} 0.4s ease;
`;

const CardHeader = styled.div<{ includesStats?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xs} ${theme.spacing.s};
  width: 100%;
  box-sizing: border-box;
  flex-direction: column;
  gap: ${theme.spacing.xxs};
  
  @media ${devices.tablet} {
    flex-direction: row;
    gap: ${theme.spacing.s};
    padding: ${({ includesStats }) => (includesStats ? theme.spacing.xxs : theme.spacing.xs)} ${theme.spacing.s};
  }
`;

const GameWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  margin: auto 0;
  padding: ${theme.spacing.s} 0 ${theme.spacing.s} 0;
  position: relative;
  
  @media ${devices.tablet} {
    gap: ${theme.spacing.s};
  }
`;

const GoalInputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  position: relative;

  @media ${devices.tablet} {
    gap: ${theme.spacing.s};
  }
`;

const TeamContainer = styled.div<{ team: 'home' | 'away' }>`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xxxs};
  box-sizing: border-box;
  flex: 1;
  align-items: ${({ team }) => (team === 'home' ? 'flex-end' : 'flex-start')};
  
  @media ${devices.tablet} {
    width: 100%;
    align-items: ${({ team }) => (team === 'home' ? 'flex-end' : 'flex-start')};
  }

  @media ${devices.mobile} {
    width: 100%;
    align-items: ${({ team }) => (team === 'home' ? 'flex-end' : 'flex-start')};
  }
`;

const AvatarAndTeamName = styled.div`
  display: flex;
  gap: ${theme.spacing.xxxs};
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
  align-items: center;
  margin: 0 auto;
`;

const getGoalScorerHoverColor = (disabled?: boolean, shouldPredictGoalScorer?: boolean, hasPredicted?: boolean) => {
  if (hasPredicted) {
    if (disabled) return theme.colors.primary;
    return theme.colors.primaryDark;
  }
  if (disabled) return theme.colors.white;
  return theme.colors.primaryFade;
};

const GoalScorerSection = styled.div<{ shouldPredictGoalScorer?: boolean, disabled?: boolean, hasPredicted?: boolean, hasChosen?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 ${({ hasChosen }) => (hasChosen ? theme.spacing.xxxs : theme.spacing.xs)} 0 ${theme.spacing.xs};
  width: 100%;
  height: 50px;
  box-sizing: border-box;
  gap: ${theme.spacing.xs};
  cursor: ${({ disabled, shouldPredictGoalScorer }) => (disabled || !shouldPredictGoalScorer ? 'not-allowed' : 'pointer')};
  transition: all 0.2s ease;
  background-color: ${({ hasPredicted }) => (hasPredicted ? theme.colors.primary : theme.colors.white)};

  ${({
    shouldPredictGoalScorer, disabled, hasPredicted,
  }) => shouldPredictGoalScorer && !disabled && css`
    &:hover {
      background-color: ${getGoalScorerHoverColor(disabled, shouldPredictGoalScorer, hasPredicted)};
    }
  `}

  @media ${devices.tablet} {
    padding: 0 ${({ hasChosen }) => (hasChosen ? theme.spacing.xxs : theme.spacing.s)} 0 ${theme.spacing.s};
  }
`;

const SaveButtonSection = styled.div<{ hasPredicted?: boolean }>`
  background-color: ${({ hasPredicted }) => (hasPredicted ? theme.colors.gold : theme.colors.primary)};
  width: 100%;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ hasPredicted }) => (hasPredicted ? theme.colors.goldDark : theme.colors.primaryDark)};
  }
`;

const EllipsisTypography = styled(NormalTypography)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const NoWrapTypography = styled(NormalTypography)`
  white-space: nowrap;
`;

const TeamName = styled(EmphasisTypography)`
  white-space: nowrap;
`;

const TagsSection = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xs} 0;
  flex-direction: column;
  min-height: 24px;
  width: 100%;
  
  @media ${devices.tablet} {
    flex-direction: row;
    gap: ${theme.spacing.m};
  }
`;

const OddsContainer = styled.div<{ hasPredicted?: boolean, hasDivider?: boolean }>`
  ${({ hasDivider }) => (hasDivider ? css`
    padding: 6px 0;
  ` : css`
    padding-bottom: 12px;
  `)};
  border-radius: ${theme.borderRadius.s};
  align-items: center;
  display: grid;
  grid-template-columns: 4fr 3fr 4fr;
  gap: ${theme.spacing.s};
  width: 100%;
  box-sizing: border-box;
  position: relative;
`;

const OddsWrapper = styled.div`
  display: flex;
  gap: ${theme.spacing.xxs};
  align-items: center;
  justify-content: center;
  width: 100%;
  box-sizing: border-box;
  position: relative;
`;

const OddsTextWrapper = styled.div<{ hasPredictedThisOutcome?: boolean, hasPredicted?: boolean, wasThisOutcomeByFinalResult?: boolean }>`
  display: flex;
  gap: ${theme.spacing.xxs};
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  border-radius: 100px;
  padding: 6px ${theme.spacing.xs};
  cursor: pointer;
  transition: background-color 0.5s ease;

  ${({ hasPredictedThisOutcome, hasPredicted }) => hasPredictedThisOutcome && css`
    background-color: ${hasPredicted ? theme.colors.primaryDark : theme.colors.primaryBleach};
  `};

  ${({ wasThisOutcomeByFinalResult }) => wasThisOutcomeByFinalResult && css`
    border: 2px solid ${theme.colors.gold};
  `}
`;

const GoalScorer = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xxs};
`;

const FirstTeamToScoreContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xxs};
`;

const AvatarWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
`;

const PointsIcons = styled.div`
  display: flex;
  gap: ${theme.spacing.xxxs};
  align-items: center;
`;

const NumberOfParticipantsPredicted = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  cursor: pointer;
  position: relative;
`;

const TooltipContainer = styled.div<{ topOffset: number }>`
  position: absolute;
  top: ${({ topOffset }) => `${topOffset}px`};
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
`;

const GoalScorerIconWrapper = styled.div<{ wasCorrect?: boolean }>`
  position: absolute;
  bottom: 6px;
  right: 6px;
  z-index: 1;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  background-color: ${({ wasCorrect }) => (wasCorrect ? theme.colors.textDefault : theme.colors.white)};
`;

const FirstTeamToScoreSection = styled.div<{ disabled?: boolean, hasPredicted?: boolean, shouldPredictFirstTeamToScore?: boolean, hasChosen?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 ${({ hasChosen }) => (hasChosen ? theme.spacing.xxxs : theme.spacing.xs)} 0 ${theme.spacing.xs};
  width: 100%;
  height: 50px;
  box-sizing: border-box;
  gap: ${theme.spacing.xs};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s ease;
  background-color: ${({ hasPredicted }) => (hasPredicted ? theme.colors.primary : theme.colors.white)};
  
  ${({
    shouldPredictFirstTeamToScore, disabled, hasPredicted,
  }) => shouldPredictFirstTeamToScore && !disabled && css`
    &:hover {
      background-color: ${getGoalScorerHoverColor(disabled, shouldPredictFirstTeamToScore, hasPredicted)};
    }
    `}
    
  @media ${devices.tablet} {
    padding: 0 ${({ hasChosen }) => (hasChosen ? theme.spacing.xxs : theme.spacing.s)} 0 ${theme.spacing.s};
  }
`;

const FirstTeamToScoreLogo = styled.div`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default GamePredictor;
