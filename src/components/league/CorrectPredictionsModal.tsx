import React, { useState } from 'react';
import styled from 'styled-components';
import { Calculator } from '@phosphor-icons/react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { LeagueGameWeek, PredictionLeague } from '../../utils/League';
import Modal from '../modal/Modal';
import { Section } from '../section/Section';
import { EmphasisTypography, HeadingsTypography, NormalTypography } from '../typography/Typography';
import UserName from '../typography/UserName';
import { devices, theme } from '../../theme';
import IconButton from '../buttons/IconButton';
import {
  Prediction, FixtureResult, PredictionPoints, TeamType,
} from '../../utils/Fixture';
import Input from '../input/Input';
import { Divider } from '../Divider';
import Select from '../input/Select';
import {
  Player, getPlayersByGeneralPosition, GeneralPositionEnum, getPlayerById,
} from '../../utils/Players';
import Button from '../buttons/Button';
import { db } from '../../config/firebase';
import { CollectionEnum } from '../../utils/Firebase';
import {
  defenderGoalPoints, forwardGoalPoints, midfielderGoalPoints, withDocumentIdOnObject,
} from '../../utils/helpers';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';
import MobilePredictionCard from '../cards/MobilePredictionCard';
import { AvatarSize } from '../avatar/Avatar';
import ClubAvatar from '../avatar/ClubAvatar';
import NationAvatar from '../avatar/NationAvatar';

interface PredictionsModalProps {
  onClose: () => void;
  gameId: string;
  league: PredictionLeague;
  ongoingGameWeek: LeagueGameWeek | undefined;
  refetchLeague: () => void;
}

function CorrectPredictionsModal({
  onClose, gameId, league, ongoingGameWeek, refetchLeague,
}: PredictionsModalProps) {
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const [finalResult, setFinalResult] = useState({ homeGoals: '', awayGoals: '' });
  const [goalScorers, setGoalScorers] = useState<Array<string>>([]);
  const [pointsDistributions, setPointsDistributions] = useState<Array<{ participantId: string, points: PredictionPoints }>>([]);
  const [savingLoading, setSavingLoading] = useState<boolean>(false);

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

      return {
        ...standing,
        points: points ? standing.points + points.total : standing.points,
        correctResults: predictedCorrectResult ? standing.correctResults + 1 : standing.correctResults,
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
    } catch (error) {
      console.log('Error updating league', error);
      setSavingLoading(false);
    }
  };

  const getOptionItem = (player: Player) => ({
    value: player.id,
    label: player.name,
  });

  const getOptionGroups = () => {
    const defenders = getPlayersByGeneralPosition(GeneralPositionEnum.DF);
    const midfielders = getPlayersByGeneralPosition(GeneralPositionEnum.MF);
    const forwards = getPlayersByGeneralPosition(GeneralPositionEnum.FW);

    return [
      {
        label: 'Välj spelare',
        options: [{ value: 'Välj spelare', label: 'Välj spelare' }],
      },
      {
        label: `Försvarare (${defenderGoalPoints}p)`,
        options: defenders.map(getOptionItem),
      },
      {
        label: `Mittfältare (${midfielderGoalPoints}p)`,
        options: midfielders.map(getOptionItem),
      },
      {
        label: `Anfallare (${forwardGoalPoints}p)`,
        options: forwards.map(getOptionItem),
      },
    ];
  };

  const handleAddGoalScorer = (playerId: string) => {
    if (playerId === 'Välj spelare') return;

    const player = getPlayerById(playerId);

    if (!player) return;
    if (goalScorers.includes(player.name)) return;

    setGoalScorers([...goalScorers, player.name]);
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

    if (homeWinPredicted && wasHomeWin) {
      totalPoints += 1;
      pointDistribution.correctOutcome += 1;
    }

    if (awayWinPredicted && wasAwayWin) {
      totalPoints += 1;
      pointDistribution.correctOutcome += 1;
    }

    if (drawPredicted && wasDraw) {
      totalPoints += 1;
      pointDistribution.correctOutcome += 1;
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
    <Modal
      title="Tippningar för matchen"
      onClose={onClose}
      size="l"
      headerDivider
      mobileBottomSheet
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
                  <Select
                    options={[]}
                    optionGroups={getOptionGroups()}
                    onChange={(value) => handleAddGoalScorer(value)}
                    value={goalScorers[0]}
                    fullWidth={isMobile}
                  />
                </FixtureResultWrapper>
                {goalScorers.length > 0 && (
                  <Section gap="xxs">
                    {goalScorers.map((goalScorer) => (
                      <NormalTypography variant="m">
                        {`⚽️ ${goalScorer}`}
                      </NormalTypography>
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
                prediction={prediction}
                finalResult={finalResult}
                onCalculatePoints={handleCalculatePoints}
                points={getPointsValue(prediction.userId, prediction)}
                hasPredictedResult={hasPredictedResult(prediction)}
              />
            ))
        ) : (
          <>
            <TableHeader>
              <NormalTypography variant="s" color={theme.colors.textLight}>Deltagare</NormalTypography>
              <NormalTypography variant="s" color={theme.colors.textLight}>Utgång</NormalTypography>
              <NormalTypography variant="s" color={theme.colors.textLight}>Resultat</NormalTypography>
              <NormalTypography variant="s" color={theme.colors.textLight}>Målgörare</NormalTypography>
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
                    <PointsCell>
                      <NormalTypography variant="m">{getPointsValue(prediction.userId, prediction)}</NormalTypography>
                      <IconButton
                        icon={<Calculator size={24} color={theme.colors.primary} />}
                        onClick={() => handleCalculatePoints(prediction)}
                        colors={{
                          normal: (!prediction.points && (finalResult.homeGoals === '' || finalResult.awayGoals === '')) ? theme.colors.silverDark : theme.colors.primary,
                          hover: (!prediction.points && (finalResult.homeGoals === '' || finalResult.awayGoals === '')) ? theme.colors.silverDark : theme.colors.primaryDark,
                          active: (!prediction.points && (finalResult.homeGoals === '' || finalResult.awayGoals === '')) ? theme.colors.silverDark : theme.colors.primaryDarker,
                        }}
                        title="Räkna ut poäng"
                        disabled={finalResult.homeGoals === '' || finalResult.awayGoals === ''}
                      />
                    </PointsCell>
                  </TableRow>
                ))}
            </Table>
          </>
        )}
      </Section>
      <Section alignItems="flex-end">
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
  );
}

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 2fr 1fr;
  gap: ${theme.spacing.s};
  padding-bottom: ${theme.spacing.xs};
  border-bottom: 1px solid ${theme.colors.silver};
  width: 100%;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 2fr 1fr;
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

  @media ${devices.tablet} {
    width: auto;
  }
`;

const ResultInputContainer = styled.div`
  display: grid;
  grid-template-columns: auto 50px auto 50px auto;
  align-items: center;
  gap: ${theme.spacing.xs};
  justify-content: center;
`;

export default CorrectPredictionsModal;