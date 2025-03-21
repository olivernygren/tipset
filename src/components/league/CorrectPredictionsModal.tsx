import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import {
  ArrowsLeftRight,
  Calculator, CaretDown, CaretUp,
  PencilSimple,
  Prohibit,
} from '@phosphor-icons/react';
import {
  collection, doc, getDoc, getDocs, query, updateDoc, where,
} from 'firebase/firestore';
import { PlusCircle } from '@phosphor-icons/react/dist/ssr';
import { LeagueGameWeek, PredictionLeague } from '../../utils/League';
import Modal from '../modal/Modal';
import { Section } from '../section/Section';
import { EmphasisTypography, HeadingsTypography, NormalTypography } from '../typography/Typography';
import UserName from '../typography/UserName';
import { devices, theme } from '../../theme';
import IconButton from '../buttons/IconButton';
import {
  Prediction, FixtureResult, PredictionPoints, TeamType,
  Fixture,
  FirstTeamToScore,
} from '../../utils/Fixture';
import { Divider } from '../Divider';
import {
  Player, GeneralPositionEnum,
} from '../../utils/Players';
import Button from '../buttons/Button';
import { db } from '../../config/firebase';
import { CollectionEnum } from '../../utils/Firebase';
import {
  getGeneralPositionShorthand, getPlayerPositionColor, bullseyeScoringSystem, withDocumentIdOnObject,
} from '../../utils/helpers';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';
import MobilePredictionCard from '../cards/MobilePredictionCard';
import Avatar, { AvatarSize } from '../avatar/Avatar';
import ClubAvatar from '../avatar/ClubAvatar';
import NationAvatar from '../avatar/NationAvatar';
import { errorNotify } from '../../utils/toast/toastHelpers';
import GoalScorerModal from '../game/GoalScorerModal';
import { Team } from '../../utils/Team';
import GoalsInput from '../game/GoalsInput';
import FirstTeamToScoreModal from '../game/FirstTeamToScoreModal';

interface PredictionsModalProps {
  onClose: () => void;
  gameId: string;
  fixture?: Fixture;
  league: PredictionLeague;
  ongoingGameWeek: LeagueGameWeek | undefined;
  refetchLeague: () => void;
  savedFinalResult?: FixtureResult;
}

const CorrectPredictionsModal = ({
  onClose, gameId, league, ongoingGameWeek, refetchLeague, savedFinalResult, fixture,
}: PredictionsModalProps) => {
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const [finalResult, setFinalResult] = useState<{ homeGoals: string, awayGoals: string }>({ homeGoals: savedFinalResult?.homeTeamGoals.toString() ?? '', awayGoals: savedFinalResult?.awayTeamGoals.toString() ?? '' });
  const [firstTeamToScore, setFirstTeamToScore] = useState<FirstTeamToScore | undefined>(savedFinalResult?.firstTeamToScore);
  const [goalScorers, setGoalScorers] = useState<Array<string>>(savedFinalResult?.goalScorers ?? []);
  const [pointsDistributions, setPointsDistributions] = useState<Array<{ participantId: string, points: PredictionPoints }>>([]);
  const [savingLoading, setSavingLoading] = useState<boolean>(false);
  const [showSelectGoalScorerModal, setShowSelectGoalScorerModal] = useState<boolean>(false);
  const [showFirstTeamToScoreModal, setShowFirstTeamToScoreModal] = useState<boolean>(false);
  const [homeTeamPlayers, setHomeTeamPlayers] = useState<Array<Player>>([]);
  const [awayTeamPlayers, setAwayTeamPlayers] = useState<Array<Player>>([]);
  const [isGoalScorersExpanded, setIsGoalScorersExpanded] = useState<boolean>(false);
  const [hasAwardedPoints, setHasAwardedPoints] = useState<boolean>(false);

  const hasGoalScorers = goalScorers.length > 0;
  const scoringSystem = league.scoringSystem ?? bullseyeScoringSystem;

  useEffect(() => {
    const fetchTeams = async () => {
      if (fixture?.shouldPredictGoalScorer) {
        const homePlayers = await fetchTeamByName(fixture?.homeTeam.name);
        const awayPlayers = await fetchTeamByName(fixture?.awayTeam.name);

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

  const hasPredictedResult = (prediction: Prediction) => prediction.homeGoals !== null && prediction.awayGoals !== null;

  const handleSaveCorrectedPredictions = async () => {
    setSavingLoading(true);

    if (!ongoingGameWeek) return;

    const finalResultInput: FixtureResult = {
      homeTeamGoals: parseInt(finalResult.homeGoals),
      awayTeamGoals: parseInt(finalResult.awayGoals),
      goalScorers,
      ...(fixture?.shouldPredictFirstTeamToScore && { firstTeamToScore }),
    };

    const updatedPredictions = ongoingGameWeek.games.predictions.map((prediction) => {
      if (prediction.fixtureId === gameId) {
        return {
          ...prediction,
          points: pointsDistributions.find((d) => d.participantId === prediction.userId)?.points,
        };
      }
      return prediction;
    });

    const updatedGameWeekObject = {
      ...ongoingGameWeek,
      games: {
        ...ongoingGameWeek.games,
        fixtures: ongoingGameWeek.games.fixtures.map((fixture) => {
          if (fixture.id === gameId) {
            return {
              ...fixture,
              finalResult: finalResultInput,
            };
          }
          return fixture;
        }),
        predictions: updatedPredictions,
        hasBeenCorrected: ongoingGameWeek.games.fixtures.every((fixture) => fixture.finalResult !== undefined),
        hasEnded: ongoingGameWeek.games.fixtures.every((fixture) => fixture.finalResult !== undefined),
      },
    };

    const updatedStandings = league.standings.map((standing) => {
      const pointsDistribution = pointsDistributions.find((d) => d.participantId === standing.userId);
      const points = pointsDistribution?.points;
      const predictedCorrectResult = pointsDistribution?.points?.correctResult || pointsDistribution?.points?.correctResultBool;

      // Find the fixture to check if it already has a final result
      const fixture = ongoingGameWeek.games.fixtures.find((f) => f.id === gameId);
      let previousPoints = 0;
      let previousCorrectResults = 0;
      let previousOddsBonus = 0;

      if (fixture?.finalResult && standing.awardedPointsForFixtures?.includes(gameId)) {
        // Calculate the previously awarded points
        const previousPointsDistribution = ongoingGameWeek.games.predictions.find((p) => p.userId === standing.userId && p.fixtureId === gameId);
        previousPoints = previousPointsDistribution?.points?.total || 0;
        previousCorrectResults = (previousPointsDistribution?.points?.correctResult || previousPointsDistribution?.points?.correctResultBool) ? 1 : 0;
        previousOddsBonus = previousPointsDistribution?.points?.oddsBonus || 0;
      }

      const updatedPoints = points ? standing.points - previousPoints + points.total : standing.points;
      const updatedCorrectResults = predictedCorrectResult ? standing.correctResults - previousCorrectResults + 1 : standing.correctResults;
      const updatedOddsBonus = points ? (standing.oddsBonusPoints ?? 0) - previousOddsBonus + points.oddsBonus : (standing.oddsBonusPoints ?? 0);

      return {
        ...standing,
        points: updatedPoints,
        correctResults: updatedCorrectResults,
        oddsBonusPoints: updatedOddsBonus,
        awardedPointsForFixtures: [...(standing.awardedPointsForFixtures ?? []).filter((id) => id !== gameId), gameId],
      };
    });

    try {
      const leagueDoc = await getDoc(doc(db, CollectionEnum.LEAGUES, league.documentId));
      const leagueData = withDocumentIdOnObject<PredictionLeague>(leagueDoc);

      if (!leagueData || !leagueData.gameWeeks) return;

      const updatedGameWeeks = leagueData.gameWeeks.map((gameWeek) => {
        if (gameWeek.round === ongoingGameWeek.round) {
          return updatedGameWeekObject;
        }
        return gameWeek;
      });

      await updateDoc(doc(db, CollectionEnum.LEAGUES, league.documentId), {
        gameWeeks: updatedGameWeeks,
        standings: updatedStandings,
      });

      refetchLeague();
      setSavingLoading(false);
      onClose();
    } catch {
      errorNotify('Något gick fel. Kunde inte uppdatera ligan');
      setSavingLoading(false);
    }
  };

  const handleSelectGoalScorers = (players: Array<Player | undefined>) => {
    const playerNames = players
      ?.map((player) => player?.name)
      .filter((name): name is string => name !== undefined);

    setGoalScorers(playerNames ?? []);
  };

  const getPlayerToScorePoints = (predictedPlayerToScore: Player | undefined) => {
    if (!predictedPlayerToScore) return 0;

    switch (predictedPlayerToScore.position.general) {
      case GeneralPositionEnum.DF:
        return scoringSystem.correctGoalScorerDefender;
      case GeneralPositionEnum.MF:
        return scoringSystem.correctGoalScorerMidfielder;
      case GeneralPositionEnum.FW:
        return scoringSystem.correctGoalScorerForward;
      default:
        return 0;
    }
  };

  const getOddsBonusPoints = (prediction: Prediction) => {
    if (!ongoingGameWeek || !ongoingGameWeek.games.fixtures) return 0;

    const fixture = ongoingGameWeek.games.fixtures.find((f) => f.id === gameId);
    if (!fixture || !fixture.odds) return 0;

    const homeWinOdds = parseFloat(fixture.odds.homeWin);
    const drawOdds = parseFloat(fixture.odds.draw);
    const awayWinOdds = parseFloat(fixture.odds.awayWin);

    const getBonusPointsFromOdds = (odds: number): number => {
      if (odds >= 1 && odds <= 2.99) return 0;
      if (odds >= 3.0 && odds <= 3.99) return scoringSystem.oddsBetween3And4;
      if (odds >= 4.0 && odds <= 5.99) return scoringSystem.oddsBetween4And6;
      if (odds >= 6.0 && odds <= 9.99) return scoringSystem.oddsBetween6And10;
      if (odds >= 10) return scoringSystem.oddsAvobe10;
      return 0;
    };

    const homeWinPredicted = prediction.homeGoals > prediction.awayGoals;
    const drawPredicted = prediction.homeGoals === prediction.awayGoals;
    const awayWinPredicted = prediction.homeGoals < prediction.awayGoals;

    const finalResultHomeWin = parseInt(finalResult.homeGoals) > parseInt(finalResult.awayGoals);
    const finalResultDraw = parseInt(finalResult.homeGoals) === parseInt(finalResult.awayGoals);
    const finalResultAwayWin = parseInt(finalResult.homeGoals) < parseInt(finalResult.awayGoals);

    if (homeWinPredicted && homeWinOdds && finalResultHomeWin) {
      return getBonusPointsFromOdds(homeWinOdds);
    }
    if (drawPredicted && drawOdds && finalResultDraw) {
      return getBonusPointsFromOdds(drawOdds);
    }
    if (awayWinPredicted && awayWinOdds && finalResultAwayWin) {
      return getBonusPointsFromOdds(awayWinOdds);
    }

    return 0;
  };

  const handleCalculateEveryonesPoints = () => {
    setHasAwardedPoints(true);

    ongoingGameWeek?.games.predictions.forEach((prediction) => {
      if (prediction.fixtureId === gameId) {
        handleCalculatePoints(prediction);
      }
    });
  };

  const handleCalculatePoints = (prediction: Prediction) => {
    if (!prediction || finalResult.homeGoals === '' || finalResult.awayGoals === '') {
      return;
    }

    let totalPoints: number = 0;
    const pointDistribution: PredictionPoints = {
      correctResult: 0,
      correctOutcome: 0,
      correctGoalScorer: 0,
      correctGoalDifference: 0,
      correctGoalsByHomeTeam: 0,
      correctGoalsByAwayTeam: 0,
      firstTeamToScore: 0,
      underdogBonus: 0,
      goalFest: 0,
      oddsBonus: 0,
      total: 0,
    };

    const correctHomeGoals = prediction.homeGoals === parseInt(finalResult.homeGoals);
    const correctAwayGoals = prediction.awayGoals === parseInt(finalResult.awayGoals);
    const correctResult = correctHomeGoals && correctAwayGoals;

    const predictedGoalDifference = prediction.homeGoals - prediction.awayGoals;
    const actualGoalDifference = parseInt(finalResult.homeGoals) - parseInt(finalResult.awayGoals);
    const correctGoalDifference = predictedGoalDifference === actualGoalDifference;

    const homeWinPredicted = prediction.homeGoals > prediction.awayGoals;
    const awayWinPredicted = prediction.homeGoals < prediction.awayGoals;
    const drawPredicted = prediction.homeGoals === prediction.awayGoals;
    const wasHomeWin = parseInt(finalResult.homeGoals) > parseInt(finalResult.awayGoals);
    const wasAwayWin = parseInt(finalResult.homeGoals) < parseInt(finalResult.awayGoals);
    const wasDraw = parseInt(finalResult.homeGoals) === parseInt(finalResult.awayGoals);

    const correctOutcome = (homeWinPredicted && wasHomeWin) || (awayWinPredicted && wasAwayWin) || (drawPredicted && wasDraw);
    const correctFirstTeamToScore = fixture?.shouldPredictFirstTeamToScore && prediction.firstTeamToScore === firstTeamToScore;
    const moreThan5GoalsInFixture = parseInt(finalResult.homeGoals) + parseInt(finalResult.awayGoals) >= 5;
    const isUnderdogBonus = getIsUnderdogBonus(prediction);

    const hasPredictedGoalScorer = prediction.goalScorer !== null;
    const correctPlayerPrediction = hasPredictedGoalScorer && prediction.goalScorer && goalScorers.includes(prediction.goalScorer.name);

    const oddsBonusPoints = getOddsBonusPoints(prediction);

    if (correctOutcome) {
      totalPoints += scoringSystem.correctOutcome;
      pointDistribution.correctOutcome += scoringSystem.correctOutcome;

      if (oddsBonusPoints > 0) {
        totalPoints += oddsBonusPoints;
        pointDistribution.oddsBonus += oddsBonusPoints;
      }
    }

    if (correctHomeGoals) {
      totalPoints += scoringSystem.correctGoalsByTeam;
      pointDistribution.correctGoalsByHomeTeam += scoringSystem.correctGoalsByTeam;
    }

    if (correctAwayGoals) {
      totalPoints += scoringSystem.correctGoalsByTeam;
      pointDistribution.correctGoalsByAwayTeam += scoringSystem.correctGoalsByTeam;
    }

    if (correctResult) {
      totalPoints += scoringSystem.correctResult;
      pointDistribution.correctResult += scoringSystem.correctResult;
      pointDistribution.correctResultBool = true;
    }

    if (correctGoalDifference) {
      totalPoints += scoringSystem.correctGoalDifference;
      pointDistribution.correctGoalDifference += scoringSystem.correctGoalDifference;
    }

    if (correctPlayerPrediction) {
      const playerPoints = getPlayerToScorePoints(prediction.goalScorer);
      totalPoints += playerPoints;
      pointDistribution.correctGoalScorer += playerPoints;
    }

    if (correctFirstTeamToScore) {
      totalPoints += scoringSystem.firstTeamToScore;
      pointDistribution.firstTeamToScore += scoringSystem.firstTeamToScore;
    }

    if (moreThan5GoalsInFixture && correctResult && scoringSystem.goalFest > 0) {
      totalPoints += scoringSystem.goalFest;
      pointDistribution.goalFest += scoringSystem.goalFest;
    }

    if (isUnderdogBonus && scoringSystem.underdogBonus > 0) {
      totalPoints += scoringSystem.underdogBonus;
      pointDistribution.underdogBonus += scoringSystem.underdogBonus;
    }

    pointDistribution.total = totalPoints;

    setPointsDistributions((oldstate) => {
      const existingIndex = oldstate.findIndex((item) => item.participantId === prediction.userId);
      if (existingIndex !== -1) {
        // If the participantId exists, update the points
        const newState = [...oldstate];
        newState[existingIndex].points = pointDistribution;
        return newState;
      }
      // If the participantId does not exist, add a new object
      return [...oldstate, { participantId: prediction.userId, points: pointDistribution }];
    });
  };

  const getPointsValue = (participantId: string, prediction?: Prediction) => {
    const hasCalculatedPointsForUser = pointsDistributions.some((d) => d.participantId === participantId);
    const hasSavedPointsForUser = prediction?.points !== undefined;

    if (hasCalculatedPointsForUser) return pointsDistributions.find((d) => d.participantId === participantId)?.points.total;
    if (hasSavedPointsForUser) return prediction?.points?.total;

    return '-';
  };

  const getIsUnderdogBonus = (prediction: Prediction) => {
    const allPredictionsForFixture = ongoingGameWeek?.games.predictions.filter((p) => p.fixtureId === gameId);
    if (!allPredictionsForFixture) return false;

    const correctPredictions = allPredictionsForFixture.filter((p) => p.homeGoals === parseInt(finalResult.homeGoals) && p.awayGoals === parseInt(finalResult.awayGoals));
    const isOnlyCorrectPrediction = correctPredictions.length === 1 && correctPredictions[0].homeGoals === prediction.homeGoals && correctPredictions[0].awayGoals === prediction.awayGoals;

    return isOnlyCorrectPrediction;
  };

  const getTeamAvatar = (team: Team, customSize?: AvatarSize) => {
    if (fixture?.teamType === TeamType.CLUBS) {
      return (
        <ClubAvatar
          logoUrl={team.logoUrl}
          clubName={team.name}
          size={customSize || AvatarSize.L}
        />
      );
    }
    return (
      <NationAvatar
        flagUrl={team.logoUrl}
        nationName={team.name}
        size={customSize || AvatarSize.L}
      />
    );
  };

  const getPlayerAvatarByName = (name: string, index: number, showTeam?: boolean) => {
    const combinedPlayers = [...homeTeamPlayers, ...awayTeamPlayers];
    const playerObj = combinedPlayers.find((player) => player.name === name);

    if (!playerObj || !fixture) return null;

    return (
      <AvatarContainer index={index}>
        <Avatar
          src={playerObj.externalPictureUrl ?? playerObj.picture ?? '/images/placeholder-fancy.png'}
          alt={playerObj.name}
          size={AvatarSize.M}
          objectFit="cover"
          showBorder
          backgroundColor={theme.colors.silverLight}
          customBorderWidth={1}
        />
        {showTeam && (
          <GoalScorerTeamAvatar>
            {getTeamAvatar(homeTeamPlayers.some((player) => player.name === name) ? fixture.homeTeam : fixture.awayTeam, AvatarSize.XS)}
          </GoalScorerTeamAvatar>
        )}
      </AvatarContainer>
    );
  };

  if (!ongoingGameWeek) return null;

  return (
    <>
      <Modal
        title="Tippningar för matchen"
        onClose={onClose}
        size="l"
        headerDivider
        mobileFullScreen
      >
        <Section gap="m">
          {ongoingGameWeek.games.fixtures
            .filter((fixture) => fixture.id === gameId)
            .map((fixture) => (
              <Section key={fixture.id} gap="s">
                <FixtureResultWrapper>
                  {!isMobile && (
                    <Section gap="xxxs">
                      <HeadingsTypography variant="h6">Slutrestultat</HeadingsTypography>
                      <NormalTypography variant="s" color={theme.colors.textLight}>Fyll i matchens slutresultat</NormalTypography>
                    </Section>
                  )}
                  <ResultInputContainer>
                    {getTeamAvatar(fixture.homeTeam)}
                    <GoalsInput
                      goals={finalResult.homeGoals ?? ''}
                      onInputChange={(value) => setFinalResult({ ...finalResult, homeGoals: value })}
                    />
                    <NormalTypography variant="m">-</NormalTypography>
                    <GoalsInput
                      goals={finalResult.awayGoals ?? ''}
                      onInputChange={(value) => setFinalResult({ ...finalResult, awayGoals: value })}
                    />
                    {getTeamAvatar(fixture.awayTeam)}
                  </ResultInputContainer>
                </FixtureResultWrapper>
                {fixture.shouldPredictGoalScorer && (
                  <GoalScorersContainer isExpanded={isGoalScorersExpanded}>
                    <GoalScorersMainContent>
                      <HeadingsTypography variant="h6">Målskyttar</HeadingsTypography>
                      <IconButton
                        icon={hasGoalScorers ? <PencilSimple size={24} /> : <PlusCircle size={32} weight="fill" />}
                        colors={{ normal: theme.colors.primary, hover: theme.colors.primaryDark, active: theme.colors.primaryDarker }}
                        onClick={() => setShowSelectGoalScorerModal(true)}
                      />
                      {hasGoalScorers && (
                        <GoalScorersAvatars hasGoalScorers={hasGoalScorers}>
                          {goalScorers.map((scorer, index) => (
                            getPlayerAvatarByName(scorer, index)
                          ))}
                        </GoalScorersAvatars>
                      )}
                      {hasGoalScorers && (
                        <IconButton
                          icon={isGoalScorersExpanded ? <CaretUp size={20} weight="bold" /> : <CaretDown size={20} weight="bold" />}
                          colors={{ normal: theme.colors.textDefault }}
                          onClick={() => setIsGoalScorersExpanded(!isGoalScorersExpanded)}
                        />
                      )}
                    </GoalScorersMainContent>
                    <ExpandedGoalScorers>
                      {goalScorers.map((scorer) => (
                        <GoalScorerCard>
                          {getPlayerAvatarByName(scorer, 0, true)}
                          <NormalTypography variant="m">{scorer}</NormalTypography>
                          <PlayerPositionTag bgColor={getPlayerPositionColor([...homeTeamPlayers, ...awayTeamPlayers].find((player) => player.name === scorer)?.position.general as GeneralPositionEnum)}>
                            <NormalTypography variant="xs" color={theme.colors.white}>
                              {getGeneralPositionShorthand([...homeTeamPlayers, ...awayTeamPlayers].find((player) => player.name === scorer)?.position.general as GeneralPositionEnum)}
                            </NormalTypography>
                          </PlayerPositionTag>
                        </GoalScorerCard>
                      ))}
                    </ExpandedGoalScorers>
                  </GoalScorersContainer>
                )}
                {fixture.shouldPredictFirstTeamToScore && (
                  <FirstTeamToScoreContainer hasSelectedTeam={firstTeamToScore !== undefined}>
                    <HeadingsTypography variant="h6">Första lag att göra mål</HeadingsTypography>
                    {firstTeamToScore ? (
                      <Section gap={isMobile ? undefined : 'xxs'} flexDirection="row" alignItems="center" fitContent>
                        <IconButton
                          icon={<ArrowsLeftRight size={24} color={theme.colors.primary} />}
                          colors={{ normal: theme.colors.primary, hover: theme.colors.primaryDark, active: theme.colors.primaryDarker }}
                          onClick={() => setShowFirstTeamToScoreModal(true)}
                        />
                        <FirstTeamToScoreLogo>
                          {firstTeamToScore === FirstTeamToScore.HOME_TEAM && getTeamAvatar(fixture.homeTeam, AvatarSize.M)}
                          {firstTeamToScore === FirstTeamToScore.AWAY_TEAM && getTeamAvatar(fixture.awayTeam, AvatarSize.M)}
                          {firstTeamToScore === FirstTeamToScore.NONE && (
                            <Section padding={theme.spacing.xxs}>
                              <Prohibit size={32} color={theme.colors.textDefault} />
                            </Section>
                          )}
                        </FirstTeamToScoreLogo>
                      </Section>
                    ) : (
                      <IconButton
                        icon={<PlusCircle size={32} weight="fill" />}
                        colors={{ normal: theme.colors.primary, hover: theme.colors.primaryDark, active: theme.colors.primaryDarker }}
                        onClick={() => setShowFirstTeamToScoreModal(true)}
                      />
                    )}
                  </FirstTeamToScoreContainer>
                )}
              </Section>
            ))}
          <Divider />
          {isMobile ? (
            ongoingGameWeek.games.predictions
              .filter((prediction) => prediction.fixtureId === gameId)
              .map((prediction) => (
                <MobilePredictionCard
                  key={prediction.userId}
                  fixture={ongoingGameWeek.games.fixtures.find((f) => f.id === gameId)}
                  prediction={prediction}
                  points={getPointsValue(prediction.userId, prediction)}
                  hasPredictedResult={hasPredictedResult(prediction)}
                  oddsBonus={getOddsBonusPoints(prediction)}
                />
              ))
          ) : (
            <>
              <TableHeader>
                <NormalTypography variant="s" color={theme.colors.textLight}>Deltagare</NormalTypography>
                <NormalTypography variant="s" color={theme.colors.textLight}>Utfall</NormalTypography>
                <NormalTypography variant="s" color={theme.colors.textLight}>Resultat</NormalTypography>
                <NormalTypography variant="s" color={theme.colors.textLight}>Målgörare</NormalTypography>
                <NormalTypography variant="s" color={theme.colors.textLight}>varav bonus</NormalTypography>
                <NormalTypography variant="s" color={theme.colors.textLight}>Poäng</NormalTypography>
              </TableHeader>
              <Table>
                {ongoingGameWeek.games.predictions
                  .filter((prediction) => prediction.fixtureId === gameId)
                  .map((prediction) => (
                    <TableRow key={prediction.userId}>
                      {prediction.username ? (
                        <EmphasisTypography variant="m">{prediction.username}</EmphasisTypography>
                      ) : (
                        <EmphasisTypography variant="m">
                          <UserName userId={prediction.userId} />
                        </EmphasisTypography>
                      )}
                      <Outcome>
                        <NormalTypography variant="m" color={theme.colors.primaryDark}>{hasPredictedResult(prediction) ? prediction.outcome : '?'}</NormalTypography>
                      </Outcome>
                      <NormalTypography variant="m">{hasPredictedResult(prediction) ? `${prediction.homeGoals} - ${prediction.awayGoals}` : 'Ej tippat'}</NormalTypography>
                      {prediction.goalScorer ? (
                        <NormalTypography variant="m">{prediction.goalScorer.name}</NormalTypography>
                      ) : (
                        <NormalTypography variant="m" color={theme.colors.textLighter}>Ingen tippad</NormalTypography>
                      )}
                      <NormalTypography variant="m">{getOddsBonusPoints(prediction)}</NormalTypography>
                      <PointsCell>
                        <NormalTypography variant="m">{getPointsValue(prediction.userId, prediction)}</NormalTypography>
                      </PointsCell>
                    </TableRow>
                  ))}
              </Table>
            </>
          )}
        </Section>
        <Section justifyContent="flex-end" gap="xs" flexDirection={isMobile ? 'column' : 'row'}>
          <Button
            icon={<Calculator size={24} color={finalResult.homeGoals === '' || finalResult.awayGoals === '' ? theme.colors.silverLight : theme.colors.primary} />}
            variant="secondary"
            onClick={handleCalculateEveryonesPoints}
            disabled={finalResult.homeGoals === '' || finalResult.awayGoals === ''}
            fullWidth={isMobile}
          >
            Beräkna poäng
          </Button>
          <Button
            onClick={handleSaveCorrectedPredictions}
            loading={savingLoading}
            disabled={finalResult.homeGoals === '' || finalResult.awayGoals === '' || !hasAwardedPoints}
            fullWidth={isMobile}
          >
            Spara
          </Button>
        </Section>
      </Modal>
      {showSelectGoalScorerModal && (
        <GoalScorerModal
          fixture={fixture}
          homeTeamPlayers={homeTeamPlayers}
          awayTeamPlayers={awayTeamPlayers}
          onClose={() => setShowSelectGoalScorerModal(false)}
          onSave={(players) => handleSelectGoalScorers(players)}
          multiple
          initialSelectedPlayers={[...homeTeamPlayers, ...awayTeamPlayers].filter((player) => goalScorers.includes(player.name))}
          leagueScoringSystem={league.scoringSystem}
          isCorrectionMode
        />
      )}
      {showFirstTeamToScoreModal && (
        <FirstTeamToScoreModal
          fixture={fixture}
          onClose={() => setShowFirstTeamToScoreModal(false)}
          onSave={(team) => {
            setFirstTeamToScore(team);
            setShowFirstTeamToScoreModal(false);
          }}
          selectedTeamValue={firstTeamToScore}
        />
      )}
    </>
  );
};

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 2fr 1fr 1fr;
  gap: ${theme.spacing.s};
  padding-bottom: ${theme.spacing.xs};
  border-bottom: 1px solid ${theme.colors.silver};
  width: 100%;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 2fr 1fr 1fr;
  gap: ${theme.spacing.s};
  align-items: center;
  width: 100%;
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

const PointsCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing.xxs};
  width: 100%;
`;

const Table = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xxs};
  width: 100%;
`;

const FixtureResultWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  width: 100%;
  box-sizing: border-box;
  justify-content: space-between;
  background-color: ${theme.colors.silverBleach};
  border-radius: ${theme.borderRadius.m};
  padding: ${theme.spacing.xs} ${theme.spacing.xs} ${theme.spacing.xs} ${theme.spacing.s};
  box-shadow: 0px 2px 0px 0px ${theme.colors.silverLighter};
  border: 1px solid ${theme.colors.silverLight};

  @media ${devices.mobile} {
    justify-content: center;
  }
`;

const ResultInputContainer = styled.div`
  display: grid;
  grid-template-columns: auto 50px auto 50px auto;
  align-items: center;
  gap: ${theme.spacing.xs};
  justify-content: center;
`;

const GoalScorersContainer = styled.div<{ isExpanded: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xxs};
  border: 1px solid ${theme.colors.silverLight};
  background-color: ${theme.colors.silverBleach};
  border-radius: ${theme.borderRadius.m};
  padding: 0 ${theme.spacing.xs};
  box-shadow: 0px 2px 0px 0px ${theme.colors.silverLighter};
  max-height: ${({ isExpanded }) => (isExpanded ? '1000px' : '60px')};
  overflow: hidden;
  transition: max-height 0.6s cubic-bezier(.39,-0.15,.46,.94);
  width: 100%;
  box-sizing: border-box;
  
  @media ${devices.tablet} {
    max-height: ${({ isExpanded }) => (isExpanded ? '1000px' : '58px')};
  }
`;

const GoalScorersMainContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  min-height: 60px;
  
  ${HeadingsTypography} {
    flex: 1;
  }

  @media ${devices.tablet} {
    gap: ${theme.spacing.s};
    min-height: 56px;
  }
`;

const GoalScorersAvatars = styled.div<{ hasGoalScorers: boolean }>`
  display: flex;
  align-items: center;
  padding-top: ${theme.spacing.xxxs};
  margin-left: auto;
  ${({ hasGoalScorers }) => hasGoalScorers && 'margin-right: -10px;'}
`;

const ExpandedGoalScorers = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xxs};
  padding-bottom: ${theme.spacing.xs};
`;

const GoalScorerTeamAvatar = styled.div`
  position: absolute;
  bottom: 4px;
  right: 4px;
  z-index: 1;
`;

const AvatarContainer = styled.div<{ index: number }>`
  position: relative;
  z-index: ${({ index }) => index};
  margin-left: ${({ index }) => (index === 0 ? '0' : '-28px')};
`;

const PlayerPositionTag = styled.div<{ bgColor: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xxxs} ${theme.spacing.xxs};
  border-radius: ${theme.borderRadius.l};
  background-color: ${({ bgColor }) => bgColor};
  margin-left: auto;
`;

const GoalScorerCard = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  padding: 0 ${theme.spacing.xs} 0 ${theme.spacing.xxxs};
  gap: ${theme.spacing.xxxs};
  background-color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.m};
  border: 1px solid ${theme.colors.silverLight};
`;

const FirstTeamToScoreContainer = styled.div<{ hasSelectedTeam: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing.xxs};
  border: 1px solid ${theme.colors.silverLight};
  background-color: ${theme.colors.silverBleach};
  border-radius: ${theme.borderRadius.m};
  box-shadow: 0px 2px 0px 0px ${theme.colors.silverLighter};
  width: 100%;
  box-sizing: border-box;
  max-height: 60px;

  ${({ hasSelectedTeam }) => (hasSelectedTeam ? css`
    padding: ${theme.spacing.xxs} ${theme.spacing.xxs} ${theme.spacing.xxs} ${theme.spacing.xs};
  ` : css`
    padding: ${theme.spacing.xxs} ${theme.spacing.xs};
  `)}
`;

const FirstTeamToScoreLogo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default CorrectPredictionsModal;
