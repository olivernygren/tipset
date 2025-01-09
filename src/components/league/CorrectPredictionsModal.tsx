import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Calculator, XCircle } from '@phosphor-icons/react';
import {
  collection, doc, getDoc, getDocs, query, updateDoc, where,
} from 'firebase/firestore';
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
} from '../../utils/Fixture';
import Input from '../input/Input';
import { Divider } from '../Divider';
import {
  Player, GeneralPositionEnum,
} from '../../utils/Players';
import Button from '../buttons/Button';
import { db } from '../../config/firebase';
import { CollectionEnum } from '../../utils/Firebase';
import {
  defenderGoalPoints, forwardGoalPoints, getSortedPlayerByPosition, midfielderGoalPoints, withDocumentIdOnObject,
} from '../../utils/helpers';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';
import MobilePredictionCard from '../cards/MobilePredictionCard';
import { AvatarSize } from '../avatar/Avatar';
import ClubAvatar from '../avatar/ClubAvatar';
import NationAvatar from '../avatar/NationAvatar';
import { errorNotify } from '../../utils/toast/toastHelpers';
import SelectImitation from '../input/SelectImitation';
import GoalScorerModal from '../game/GoalScorerModal';
import { Team } from '../../utils/Team';

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
  const [goalScorers, setGoalScorers] = useState<Array<string>>(savedFinalResult?.goalScorers ?? []);
  const [pointsDistributions, setPointsDistributions] = useState<Array<{ participantId: string, points: PredictionPoints }>>([]);
  const [savingLoading, setSavingLoading] = useState<boolean>(false);
  const [showSelectGoalScorerModal, setShowSelectGoalScorerModal] = useState(false);
  const [homeTeamPlayers, setHomeTeamPlayers] = useState<Array<Player>>([]);
  const [awayTeamPlayers, setAwayTeamPlayers] = useState<Array<Player>>([]);

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
      const predictedCorrectResult = pointsDistribution?.points?.correctResult;

      // Find the fixture to check if it already has a final result
      const fixture = ongoingGameWeek.games.fixtures.find((f) => f.id === gameId);
      let previousPoints = 0;
      let previousCorrectResults = 0;
      let previousOddsBonus = 0;

      if (fixture?.finalResult && standing.awardedPointsForFixtures?.includes(gameId)) {
        // Calculate the previously awarded points
        const previousPointsDistribution = ongoingGameWeek.games.predictions.find((p) => p.userId === standing.userId && p.fixtureId === gameId);
        previousPoints = previousPointsDistribution?.points?.total || 0;
        previousCorrectResults = previousPointsDistribution?.points?.correctResult ? 1 : 0;
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
        return defenderGoalPoints;
      case GeneralPositionEnum.MF:
        return midfielderGoalPoints;
      case GeneralPositionEnum.FW:
        return forwardGoalPoints;
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
      if (odds >= 3.0 && odds <= 3.99) return 1;
      if (odds >= 4.0 && odds <= 5.99) return 2;
      if (odds >= 6.0 && odds <= 9.99) return 3;
      if (odds >= 10) return 5;
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
      oddsBonus: 0,
      total: 0,
    };

    const correctHomeGoals = prediction.homeGoals === parseInt(finalResult.homeGoals);
    const correctAwayGoals = prediction.awayGoals === parseInt(finalResult.awayGoals);

    const predictedGoalDifference = prediction.homeGoals - prediction.awayGoals;
    const actualGoalDifference = parseInt(finalResult.homeGoals) - parseInt(finalResult.awayGoals);
    const correctGoalDifference = predictedGoalDifference === actualGoalDifference;

    const homeWinPredicted = prediction.homeGoals > prediction.awayGoals;
    const awayWinPredicted = prediction.homeGoals < prediction.awayGoals;
    const drawPredicted = prediction.homeGoals === prediction.awayGoals;
    const wasHomeWin = parseInt(finalResult.homeGoals) > parseInt(finalResult.awayGoals);
    const wasAwayWin = parseInt(finalResult.homeGoals) < parseInt(finalResult.awayGoals);
    const wasDraw = parseInt(finalResult.homeGoals) === parseInt(finalResult.awayGoals);

    const hasPredictedGoalScorer = prediction.goalScorer !== null;
    const correctPlayerPrediction = hasPredictedGoalScorer && prediction.goalScorer && goalScorers.includes(prediction.goalScorer.name);

    const oddsBonusPoints = getOddsBonusPoints(prediction);

    if (homeWinPredicted && wasHomeWin) {
      totalPoints += 1;
      pointDistribution.correctOutcome += 1;

      if (oddsBonusPoints > 0) {
        totalPoints += oddsBonusPoints;
        pointDistribution.oddsBonus += oddsBonusPoints;
      }
    }

    if (awayWinPredicted && wasAwayWin) {
      totalPoints += 1;
      pointDistribution.correctOutcome += 1;

      if (oddsBonusPoints > 0) {
        totalPoints += oddsBonusPoints;
        pointDistribution.oddsBonus += oddsBonusPoints;
      }
    }

    if (drawPredicted && wasDraw) {
      totalPoints += 1;
      pointDistribution.correctOutcome += 1;

      if (oddsBonusPoints > 0) {
        totalPoints += oddsBonusPoints;
        pointDistribution.oddsBonus += oddsBonusPoints;
      }
    }

    if (correctHomeGoals) {
      totalPoints += 1;
      pointDistribution.correctGoalsByHomeTeam += 1;
    }

    if (correctAwayGoals) {
      totalPoints += 1;
      pointDistribution.correctGoalsByAwayTeam += 1;
    }

    if (correctHomeGoals && correctAwayGoals) {
      totalPoints += 1;
      pointDistribution.correctResult += 1;
    }

    if (correctGoalDifference) {
      totalPoints += 1;
      pointDistribution.correctGoalDifference += 1;
    }

    if (correctPlayerPrediction) {
      const playerPoints = getPlayerToScorePoints(prediction.goalScorer);
      totalPoints += playerPoints;
      pointDistribution.correctGoalScorer += playerPoints;
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
          <HeadingsTypography variant="h5">Fyll i resultatet i matchen</HeadingsTypography>
          {ongoingGameWeek.games.fixtures
            .filter((fixture) => fixture.id === gameId)
            .map((fixture) => (
              <Section key={fixture.id} gap="m">
                <FixtureResultWrapper>
                  <ResultInputContainer>
                    {fixture.teamType === TeamType.CLUBS ? (
                      <ClubAvatar
                        logoUrl={fixture.homeTeam.logoUrl}
                        clubName={fixture.homeTeam.name}
                        size={AvatarSize.L}
                      />
                    ) : (
                      <NationAvatar
                        flagUrl={fixture.homeTeam.logoUrl}
                        nationName={fixture.homeTeam.name}
                        size={AvatarSize.L}
                      />
                    )}
                    <Input
                      placeholder="0"
                      textAlign="center"
                      type="number"
                      value={finalResult.homeGoals ?? ''}
                      onChange={(e) => setFinalResult({ ...finalResult, homeGoals: e.target.value })}
                      fullWidth
                    />
                    <NormalTypography variant="m">-</NormalTypography>
                    <Input
                      placeholder="0"
                      type="number"
                      textAlign="center"
                      value={finalResult.awayGoals ?? ''}
                      onChange={(e) => setFinalResult({ ...finalResult, awayGoals: e.target.value })}
                      fullWidth
                    />
                    {fixture.teamType === TeamType.CLUBS ? (
                      <ClubAvatar
                        logoUrl={fixture.awayTeam.logoUrl}
                        clubName={fixture.awayTeam.name}
                        size={AvatarSize.L}
                      />
                    ) : (
                      <NationAvatar
                        flagUrl={fixture.awayTeam.logoUrl}
                        nationName={fixture.awayTeam.name}
                        size={AvatarSize.L}
                      />
                    )}
                  </ResultInputContainer>
                </FixtureResultWrapper>
                {fixture.shouldPredictGoalScorer && (
                  <>
                    <FixtureResultWrapper>
                      <NormalTypography variant="m">Målgörare</NormalTypography>
                      <SelectImitation
                        value={goalScorers[0]}
                        onClick={() => setShowSelectGoalScorerModal(true)}
                        placeholder="Välj målgörare"
                        fullWidth={isMobile}
                      />
                    </FixtureResultWrapper>
                    {goalScorers.length > 0 && (
                    <Section gap={isMobile ? 'xxxs' : 'xxs'}>
                      {goalScorers.map((goalScorer) => (
                        <GoalScorerContainer>
                          <NormalTypography variant="m">
                            {`⚽️ ${goalScorer}`}
                          </NormalTypography>
                          <IconButton
                            icon={<XCircle size={24} weight="fill" />}
                            onClick={() => setGoalScorers(goalScorers.filter((scorer) => scorer !== goalScorer))}
                            title="Ta bort målgörare"
                            colors={{ normal: theme.colors.red, hover: theme.colors.redDark, active: theme.colors.redDarker }}
                          />
                        </GoalScorerContainer>
                      ))}
                    </Section>
                    )}
                  </>
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
                <NormalTypography variant="s" color={theme.colors.textLight}>Utgång</NormalTypography>
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
                      <EmphasisTypography variant="m">
                        <UserName userId={prediction.userId} />
                      </EmphasisTypography>
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
            disabled={finalResult.homeGoals === '' || finalResult.awayGoals === ''}
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
  justify-content: center;

  @media ${devices.tablet} {
    width: auto;
  }

  @media ${devices.mobileL} {
    justify-content: flex-start;
  }
`;

const ResultInputContainer = styled.div`
  display: grid;
  grid-template-columns: auto 50px auto 50px auto;
  align-items: center;
  gap: ${theme.spacing.xs};
  justify-content: center;
`;

const GoalScorerContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  box-sizing: border-box;
`;

export default CorrectPredictionsModal;
