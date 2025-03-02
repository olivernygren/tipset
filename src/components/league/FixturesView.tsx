/* eslint-disable react/jsx-no-useless-fragment */
import React, { useEffect, useState } from 'react';
import {
  Info, ListChecks, MagnifyingGlass, PencilSimple, PlusCircle, XCircle,
} from '@phosphor-icons/react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { LeagueGameWeek, LeagueGameWeekInput, PredictionLeague } from '../../utils/League';
import { Section } from '../section/Section';
import { devices, theme } from '../../theme';
import { EmphasisTypography, HeadingsTypography, NormalTypography } from '../typography/Typography';
import Button from '../buttons/Button';
import { Divider } from '../Divider';
import { db } from '../../config/firebase';
import { CollectionEnum } from '../../utils/Firebase';
import { useUser } from '../../context/UserContext';
import {
  FirstTeamToScore,
  Fixture, PredictionInput, PredictionStatus,
} from '../../utils/Fixture';
import {
  getLastGameWeek,
  getLastKickoffTimeInAllGameWeeks,
  getLastKickoffTimeInGameWeek,
  getPredictionOutcome, getPredictionStatus, getUserPreviousGameWeekPrecitedGoalScorers, groupFixturesByDate, withDocumentIdOnObject,
} from '../../utils/helpers';
import CustomDatePicker from '../input/DatePicker';
import GamePredictor from '../game/GamePredictor';
import { Player } from '../../utils/Players';
import IconButton from '../buttons/IconButton';
import CreateFixturePreview from '../game/CreateFixturePreview';
import CorrectPredictionsModal from './CorrectPredictionsModal';
import FixtureResultPreview from '../game/FixtureResultPreview';
import EditGameWeekView from './EditGameWeekView';
import RootToast from '../toast/RootToast';
import { errorNotify, successNotify } from '../../utils/toast/toastHelpers';
import Tag from '../tag/Tag';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';
import FixtureStatsModal from '../game/FixtureStatsModal';
import TextButton from '../buttons/TextButton';
import Modal from '../modal/Modal';
import CompactFixtureResult from '../game/CompactFixtureResult';
import PredictionsModal from './PredictionsModal';
import CreateFixtureModal from '../game/CreateFixtureModal';
import FindOtherFixturesModal from './FindOtherFixturesModal';
import CorrectingFixtureCard from '../game/CorrectingFixtureCard';
import UpcomingFixturePreview from '../game/UpcomingFixturePreview';
import EditFixtureModal from '../game/EditFixtureModal';

interface FixturesViewProps {
  league: PredictionLeague;
  isCreator: boolean;
  refetchLeague: () => void;
}

enum GameWeekPredictionStatus {
  ALL_PREDICTED = 'ALL_PREDICTED',
  NOT_ALL_PREDICTED = 'NOT_ALL_PREDICTED',
  UNSAVED_CHANGES = 'UNSAVED_CHANGES',
  NONE_PREDICTED = 'NONE_PREDICTED',
}

const FixturesView = ({ league, isCreator, refetchLeague }: FixturesViewProps) => {
  const { user, hasAdminRights } = useUser();
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const [ongoingGameWeek, setOngoingGameWeek] = useState<LeagueGameWeek>();
  const [upcomingGameWeeks, setUpcomingGameWeeks] = useState<Array<LeagueGameWeek>>();
  const [previousGameWeeks, setPreviousGameWeeks] = useState<Array<LeagueGameWeek>>();
  const [initiallyDisplayedPreviousGameWeeks, setInitiallyDisplayedPreviousGameWeeks] = useState<Array<LeagueGameWeek>>();
  const [createGameWeekError, setCreateGameWeekError] = useState<string | null>(null);
  const [showCreateGameWeekSection, setShowCreateGameWeekSection] = useState<boolean>(false);
  const [showCorrectGameWeekContent, setShowCorrectGameWeekContent] = useState<boolean>(false);
  const [showPredictionsModalFixtureId, setShowPredictionsModalFixtureId] = useState<string | null>(null);
  const [createGameWeekLoading, setCreateGameWeekLoading] = useState<boolean>(false);
  const [endGameWeekLoading, setEndGameWeekLoading] = useState<boolean>(false);
  const [oddsBonusModalOpen, setOddsBonusModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState<Fixture | null>(null);
  const [showFixturePredictionsModal, setShowFixturePredictionsModal] = useState<string | null>(null);
  const [findOtherFixturesModalOpen, setFindOtherFixturesModalOpen] = useState<boolean>(false);
  const [upcomingGameWeekFixtures, setUpcomingGameWeekFixtures] = useState<Array<Fixture>>([]);

  const [newGameWeekStartDate, setNewGameWeekStartDate] = useState<Date>(ongoingGameWeek ? getLastKickoffTimeInAllGameWeeks(league.gameWeeks ?? []) : new Date());
  const [newGameWeekFixtures, setNewGameWeekFixtures] = useState<Array<Fixture>>([]);
  const [isCreateFixtureModalOpen, setIsCreateFixtureModalOpen] = useState<boolean>(false);
  const [editGameWeekViewOpen, setEditGameWeekViewOpen] = useState<boolean>(false);
  const [editUpcomingGameWeekViewOpen, setEditUpcomingGameWeekViewOpen] = useState<boolean>(false);
  const [newFixtureToEdit, setNewFixtureToEdit] = useState<Fixture | null>(null);

  const [predictionStatuses, setPredictionStatuses] = useState<Array<{ fixtureId: string, status: PredictionStatus }>>([]);
  const [gameWeekPredictionStatus, setGameWeekPredictionStatus] = useState<string>('');
  const [predictionLoading, setPredictionLoading] = useState<string | null>(null);

  const fixturesCanBeCorrected = ongoingGameWeek?.games.fixtures.some((fixture) => fixture.kickOffTime && new Date(fixture.kickOffTime) < new Date());

  useEffect(() => {
    if (league && league.gameWeeks && league.gameWeeks.length > 0) {
      const currentGameWeek = league.gameWeeks.find((gameWeek) => {
        const now = new Date();
        return new Date(gameWeek.startDate) < now && gameWeek.hasBeenCorrected === false;
      });

      const comingGameWeeks = league.gameWeeks.filter((gameWeek) => {
        const now = new Date();
        return new Date(gameWeek.startDate) > now;
      });

      const allPreviousGameWeeks = league.gameWeeks.filter((gameWeek) => gameWeek.hasBeenCorrected && gameWeek.hasEnded);

      setOngoingGameWeek(currentGameWeek);
      setUpcomingGameWeeks(comingGameWeeks.sort((a, b) => a.round - b.round));
      setPreviousGameWeeks(allPreviousGameWeeks);

      setInitiallyDisplayedPreviousGameWeeks(allPreviousGameWeeks.slice(-3));

      if (currentGameWeek && user) {
        setPredictionStatuses(currentGameWeek.games.fixtures.map((fixture) => ({
          fixtureId: fixture.id,
          status: getPredictionStatus(currentGameWeek, user?.documentId ?? '', fixture.id),
        })));
      }

      if (currentGameWeek) {
        setNewGameWeekStartDate(getLastKickoffTimeInAllGameWeeks(league.gameWeeks ?? []));
      }

      if (comingGameWeeks && comingGameWeeks.length > 0) {
        setUpcomingGameWeekFixtures(comingGameWeeks[0].games.fixtures);
      }
    }
  }, [league]);

  useEffect(() => {
    if (!league || !predictionStatuses.length) return;

    if (predictionStatuses.some(({ status }) => status === PredictionStatus.UPDATED)) {
      setGameWeekPredictionStatus(GameWeekPredictionStatus.UNSAVED_CHANGES);
      return;
    }

    if (predictionStatuses.every(({ status }) => status === PredictionStatus.PREDICTED)) {
      setGameWeekPredictionStatus(GameWeekPredictionStatus.ALL_PREDICTED);
      return;
    }

    if (predictionStatuses.map(({ status }) => status === PredictionStatus.NOT_PREDICTED).length === predictionStatuses.length) {
      setGameWeekPredictionStatus(GameWeekPredictionStatus.NONE_PREDICTED);
      return;
    }

    setGameWeekPredictionStatus(GameWeekPredictionStatus.NOT_ALL_PREDICTED);
  }, [predictionStatuses]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (gameWeekPredictionStatus === GameWeekPredictionStatus.UNSAVED_CHANGES) {
        const message = 'Du har glömt att spara ditt tips. Är du säker på att du vill lämna sidan?';
        // eslint-disable-next-line no-param-reassign
        event.returnValue = message; // Standard for most browsers
        return message; // For some older browsers
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [gameWeekPredictionStatus]);

  const handleCreateGameWeek = async () => {
    if (!league) return;

    if (league.gameWeeks && league.gameWeeks.length === 100) {
      setCreateGameWeekError('Max antal omgångar är 100');
      return;
    }

    setCreateGameWeekError(null);
    setCreateGameWeekLoading(true);

    if (!isCreator && !hasAdminRights) {
      setCreateGameWeekError('Du har inte rättigheter att skapa en ny omgång');
      setCreateGameWeekLoading(false);
      return;
    }

    if (ongoingGameWeek) {
      const latestKickoffTime = getLastKickoffTimeInAllGameWeeks(league.gameWeeks ?? []);
      if (newGameWeekStartDate < latestKickoffTime) {
        setCreateGameWeekError('Startdatum för att tippa omgången måste vara efter ligans sista match');
        setCreateGameWeekLoading(false);
        return;
      }
      if (newGameWeekFixtures.some((fixture) => new Date(fixture.kickOffTime) < latestKickoffTime)) {
        setCreateGameWeekError('En eller flera matcher startar före en annan match i ligan');
        setCreateGameWeekLoading(false);
        return;
      }
    }

    // if (upcomingGameWeek) {
    //   setCreateGameWeekError('Det finns redan en kommande omgång');
    //   setCreateGameWeekLoading(false);
    //   return;
    // }

    if (newGameWeekFixtures.length === 0) {
      setCreateGameWeekError('Inga matcher tillagda');
      setCreateGameWeekLoading(false);
      return;
    }

    const newGameWeekObj: LeagueGameWeekInput = {
      leagueId: league.documentId,
      round: (league && league.gameWeeks !== undefined) ? league.gameWeeks.length + 1 : 1,
      startDate: newGameWeekStartDate.toISOString(),
      games: {
        fixtures: newGameWeekFixtures,
        predictions: [],
      },
      hasBeenCorrected: false,
      hasEnded: false,
    };

    try {
      const leagueDoc = await getDoc(doc(db, CollectionEnum.LEAGUES, league.documentId));
      const leagueData = withDocumentIdOnObject<PredictionLeague>(leagueDoc);

      const updatedGameWeeks = leagueData.gameWeeks ? [...leagueData.gameWeeks, newGameWeekObj] : [newGameWeekObj];

      await updateDoc(doc(db, CollectionEnum.LEAGUES, league.documentId), {
        gameWeeks: updatedGameWeeks,
      });

      setNewGameWeekFixtures([]);
      setShowCreateGameWeekSection(false);

      refetchLeague();
    } catch (err) {
      setCreateGameWeekError('Något gick fel, försök igen senare');
    }

    setCreateGameWeekLoading(false);
  };

  const getNewGameWeekRoundNumber = () => {
    if (!league || !league.gameWeeks) return 1;
    return league.gameWeeks.length + 1;
  };

  const handleUpdatePredictionScoreline = (fixtureId: string) => {
    const fixture = predictionStatuses.find((fixture) => fixture.fixtureId === fixtureId);

    if (!fixture || league.hasEnded) return;

    const updatedPredictionStatuses = predictionStatuses.map((prediction) => {
      if (prediction.fixtureId === fixtureId) {
        return {
          ...prediction,
          status: PredictionStatus.UPDATED,
        };
      }
      return prediction;
    });
    setPredictionStatuses(updatedPredictionStatuses);
  };

  const handleUpdatePlayerPrediction = (fixtureId: string, playerToScore?: Player | null) => {
    const fixture = predictionStatuses.find((fixture) => fixture.fixtureId === fixtureId);

    if (!fixture || !playerToScore) return;

    const updatedPredictionStatuses = predictionStatuses.map((prediction) => {
      if (prediction.fixtureId === fixtureId) {
        return {
          ...prediction,
          status: PredictionStatus.UPDATED,
        };
      }
      return prediction;
    });
    setPredictionStatuses(updatedPredictionStatuses);
  };

  const handleUpdateFirstTeamToScore = (fixtureId: string, firstTeamToScore: FirstTeamToScore) => {
    const fixture = predictionStatuses.find((fixture) => fixture.fixtureId === fixtureId);

    if (!fixture || league.hasEnded || !firstTeamToScore) return;

    const updatedPredictionStatuses = predictionStatuses.map((prediction) => {
      if (prediction.fixtureId === fixtureId) {
        return {
          ...prediction,
          status: PredictionStatus.UPDATED,
        };
      }
      return prediction;
    });
    setPredictionStatuses(updatedPredictionStatuses);
  };

  const handleEndGameWeek = async () => {
    if (!league || !ongoingGameWeek) return;

    setEndGameWeekLoading(true);

    const updatedGameWeek: LeagueGameWeek = {
      ...ongoingGameWeek,
      hasEnded: true,
      hasBeenCorrected: true,
    };

    try {
      const leagueDoc = await getDoc(doc(db, CollectionEnum.LEAGUES, league.documentId));
      const leagueData = withDocumentIdOnObject<PredictionLeague>(leagueDoc);

      const updatedGameWeeks: Array<LeagueGameWeek> = leagueData.gameWeeks ? leagueData.gameWeeks.map((gameWeek) => {
        if (gameWeek.round === ongoingGameWeek.round) {
          return updatedGameWeek;
        }
        return gameWeek;
      }) : [];

      await updateDoc(doc(db, CollectionEnum.LEAGUES, league.documentId), {
        gameWeeks: updatedGameWeeks,
      });

      refetchLeague();
      setShowCorrectGameWeekContent(false);
    } catch (error) {
      errorNotify('Något gick fel, försök igen senare');
    }

    setEndGameWeekLoading(false);
  };

  const handleSavePrediction = async (fixture: Fixture, homeGoals: string, awayGoals: string, playerToScore?: Player | null, firstTeamToScore?: FirstTeamToScore) => {
    if (!user || !user.documentId || !ongoingGameWeek) return;

    if (!homeGoals || !awayGoals || parseInt(homeGoals) < 0 || parseInt(awayGoals) < 0 || league.hasEnded) return;

    if (new Date(fixture.kickOffTime) < new Date()) {
      errorNotify('Deadline har passerat');
      return;
    }

    setPredictionLoading(fixture.id);

    const predictionInput: PredictionInput = {
      userId: user.documentId,
      username: `${user.firstname} ${user.lastname}`,
      userProfilePictureUrl: user.profilePicture,
      fixtureId: fixture.id,
      homeGoals: parseInt(homeGoals),
      awayGoals: parseInt(awayGoals),
      outcome: getPredictionOutcome(parseInt(homeGoals), parseInt(awayGoals)),
      ...((playerToScore && fixture.shouldPredictGoalScorer) && { goalScorer: playerToScore }),
      ...((firstTeamToScore && fixture.shouldPredictFirstTeamToScore) && { firstTeamToScore }),
    };

    try {
      const leagueDoc = await getDoc(doc(db, CollectionEnum.LEAGUES, league.documentId));
      const leagueData = withDocumentIdOnObject<PredictionLeague>(leagueDoc);

      const updatedGameWeeks: Array<LeagueGameWeek> = leagueData.gameWeeks ? leagueData.gameWeeks.map((gameWeek) => {
        if (gameWeek.round === ongoingGameWeek.round) {
          const existingPredictionIndex = gameWeek.games.predictions.findIndex((p) => p.fixtureId === predictionInput.fixtureId && p.userId === predictionInput.userId);
          const updatedPredictions = [...gameWeek.games.predictions];
          if (existingPredictionIndex > -1) {
            // Overwrite the existing prediction
            updatedPredictions[existingPredictionIndex] = predictionInput;
          } else {
            // Add the new prediction
            updatedPredictions.push(predictionInput);
          }
          return {
            ...gameWeek,
            games: {
              ...gameWeek.games,
              predictions: updatedPredictions,
            },
          };
        }
        return gameWeek;
      }) : [];

      await updateDoc(doc(db, CollectionEnum.LEAGUES, league.documentId), {
        gameWeeks: updatedGameWeeks,
      });

      const updatedPredictionStatuses = predictionStatuses.map((prediction) => {
        if (prediction.fixtureId === fixture.id) {
          return {
            ...prediction,
            status: PredictionStatus.PREDICTED,
          };
        }
        return prediction;
      });
      setPredictionStatuses(updatedPredictionStatuses);
      successNotify('Tips sparades');
      refetchLeague();
    } catch (err) {
      errorNotify('Något gick fel, försök igen senare');
    } finally {
      setPredictionLoading(null);
    }
  };

  const handleAddExternalFixtures = (fixtures: Array<Fixture>) => {
    setNewGameWeekFixtures((prev) => [...prev, ...fixtures]);

    setFindOtherFixturesModalOpen(false);
    successNotify('Matcher tillagda');
  };

  const handleEditGameWeekClick = (gameWeek: 'ongoing' | 'upcoming') => {
    if (gameWeek === 'ongoing') {
      setEditGameWeekViewOpen(true);
      setEditUpcomingGameWeekViewOpen(false);
    } else {
      setEditUpcomingGameWeekViewOpen(true);
      setEditGameWeekViewOpen(false);
    }
  };

  const getNextGameWeekStartDate = () => {
    if (!upcomingGameWeeks || upcomingGameWeeks.length === 0) return '';
    const startDate = new Date(upcomingGameWeeks[0]?.startDate ?? '');
    if (!startDate) return '';
    const day = startDate.getDate();
    const month = startDate.toLocaleString('default', { month: 'short' }).replaceAll('.', '');
    const hours = `${startDate.getHours() < 10 ? `0${startDate.getHours()}` : startDate.getHours()}`;
    const minutes = `${startDate.getMinutes() < 10 ? `0${startDate.getMinutes()}` : startDate.getMinutes()}`;
    return `${day} ${month} ${hours}:${minutes}`;
  };

  const getGameWeekPredictionStatusText = () => {
    switch (gameWeekPredictionStatus) {
      case GameWeekPredictionStatus.ALL_PREDICTED:
        return 'Alla matcher tippade';
      case GameWeekPredictionStatus.NOT_ALL_PREDICTED:
        return 'Match(er) kvar att tippa';
      case GameWeekPredictionStatus.UNSAVED_CHANGES:
        return 'Osparade ändringar';
      case GameWeekPredictionStatus.NONE_PREDICTED:
        return 'Dags att tippa!';
      default:
        break;
    }
  };

  const getOngoingGameWeekContent = () => {
    if (!ongoingGameWeek) return;

    if (editGameWeekViewOpen) {
      return (
        <EditGameWeekView
          gameWeek={ongoingGameWeek}
          onClose={() => setEditGameWeekViewOpen(false)}
          refetch={refetchLeague}
          minDate={new Date(ongoingGameWeek.startDate)}
          league={league}
        />
      );
    }

    if (showCorrectGameWeekContent) return getCorrectGameWeekContent();

    return (
      <FixturesGrid>
        {ongoingGameWeek.games.fixtures
          .sort((a, b) => new Date(a.kickOffTime).getTime() - new Date(b.kickOffTime).getTime())
          .map((fixture, index) => (
            <GamePredictor
              key={fixture.id}
              gameNumber={index + 1}
              game={fixture}
              onResultUpdate={() => handleUpdatePredictionScoreline(fixture.id)}
              onPlayerPredictionUpdate={(_, playerToScore) => handleUpdatePlayerPrediction(fixture.id, playerToScore)}
              onFirstTeamToScoreUpdate={(_, firstTeamToScore) => handleUpdateFirstTeamToScore(fixture.id, firstTeamToScore)}
              onSave={(homeGoals, awayGoals, playerToScore, firstTeamToScore) => handleSavePrediction(fixture, homeGoals, awayGoals, playerToScore, firstTeamToScore)}
              hasPredicted={ongoingGameWeek.games.predictions.some((prediction) => prediction.userId === user?.documentId && prediction.fixtureId === fixture.id)}
              predictionValue={ongoingGameWeek.games.predictions.find((prediction) => prediction.userId === user?.documentId && prediction.fixtureId === fixture.id)}
              loading={predictionLoading === fixture.id}
              numberOfParticipantsPredicted={ongoingGameWeek.games.predictions.filter((p) => p.fixtureId === fixture.id).length}
              // anyFixtureHasPredictGoalScorer={ongoingGameWeek.games.fixtures.some((f) => f.shouldPredictGoalScorer)}
              isLeagueCreator={isCreator}
              previousGameWeekPredictedGoalScorers={getUserPreviousGameWeekPrecitedGoalScorers(getLastGameWeek(previousGameWeeks), user?.documentId ?? '')}
              onShowStats={() => setIsStatsModalOpen(fixture)}
              awardedPoints={ongoingGameWeek.games.predictions.find((p) => p.fixtureId === fixture.id && p.userId === user?.documentId)?.points}
              particpantsThatPredicted={ongoingGameWeek.games.predictions.filter((p) => p.fixtureId === fixture.id).map((p) => p.username).filter((username): username is string => username !== undefined)}
              leagueScoringSystem={league.scoringSystem}
            />
          ))}
      </FixturesGrid>
    );
  };

  const getFixturesDateFormatted = (date: string) => {
    const fixtureDate = new Date(date);
    const day = fixtureDate.getDate();
    const weekday = fixtureDate.toLocaleString('default', { weekday: 'long' }).replaceAll('.', '').charAt(0).toUpperCase() + fixtureDate.toLocaleString('default', { weekday: 'long' }).slice(1);
    const month = fixtureDate.toLocaleString('default', { month: 'long' }).replaceAll('.', '');
    return `${weekday} ${day} ${month}`;
  };

  const getGameWeeksDates = (fixtureList: Array<Fixture>) => {
    const dates = fixtureList.map((fixture) => new Date(fixture.kickOffTime));
    const uniqueDates = Array.from(new Set(dates.map((date) => date.toDateString())));
    const startDate = new Date(uniqueDates[0]);
    const endDate = new Date(uniqueDates[uniqueDates.length - 1]);
    const isSameDay = startDate.toDateString() === endDate.toDateString();

    const startDateFormatted = `${startDate.getDate()} ${startDate.toLocaleString('default', { month: 'short' }).replaceAll('.', '')}`;
    const endDateFormatted = `${endDate.getDate()} ${endDate.toLocaleString('default', { month: 'short' }).replaceAll('.', '')}`;

    if (isSameDay) {
      return `(${startDateFormatted})`;
    }

    return `(${startDateFormatted} - ${endDateFormatted})`;
  };

  const getCreateGameWeekContent = () => (
    <CreateGameWeekSection
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Section flexDirection="row" justifyContent="space-between" alignItems="center">
        <HeadingsTypography variant="h4">Skapa ny omgång</HeadingsTypography>
        <Tag
          text={`Omgång ${getNewGameWeekRoundNumber()}`}
          textAndIconColor={theme.colors.primaryDark}
          backgroundColor={theme.colors.primaryBleach}
          size="l"
        />
      </Section>
      <Section flexDirection="row" alignItems="center" gap="l">
        <CustomDatePicker
          label="Startdatum (kan tippas fr.o.m.)"
          selectedDate={newGameWeekStartDate}
          onChange={(date) => setNewGameWeekStartDate(date!)}
          fullWidth={isMobile}
          minDate={ongoingGameWeek ? new Date(ongoingGameWeek.games.fixtures[0].kickOffTime) : new Date()}
          includeTime
        />
      </Section>
      <Divider />
      <Section gap="s">
        <Section flexDirection="row" alignItems="center" gap="xxs" justifyContent="space-between">
          <HeadingsTypography variant="h5">Matcher</HeadingsTypography>
          <Button
            variant="primary"
            size="s"
            onClick={() => setFindOtherFixturesModalOpen(true)}
            icon={<MagnifyingGlass size={16} color={theme.colors.white} weight="bold" />}
          >
            Hitta matcher
          </Button>
        </Section>
        <Section gap="xs">
          {newGameWeekFixtures.length > 0 && (
            newGameWeekFixtures
              .sort((a, b) => new Date(a.kickOffTime).getTime() - new Date(b.kickOffTime).getTime())
              .map((fixture) => (
                <CreateFixturePreview
                  fixture={fixture}
                  key={Math.random() * 100}
                  onEditClick={() => setNewFixtureToEdit(fixture)}
                  onDeleteClick={() => setNewGameWeekFixtures(newGameWeekFixtures.filter((f) => f.id !== fixture.id))}
                />
              ))
          )}
        </Section>
        <CreateFixtureCard onClick={() => setIsCreateFixtureModalOpen(true)}>
          <PlusCircle size={32} color={theme.colors.textDefault} />
          <NormalTypography variant="l">Lägg till match</NormalTypography>
        </CreateFixtureCard>
      </Section>
      <Divider />
      {createGameWeekError && (
        <NormalTypography variant="m" color={theme.colors.red}>
          {createGameWeekError}
        </NormalTypography>
      )}
      <Section flexDirection="row" gap="xs">
        <Button
          variant="secondary"
          onClick={() => setShowCreateGameWeekSection(false)}
        >
          Avbryt
        </Button>
        <Button
          variant="primary"
          onClick={handleCreateGameWeek}
          disabled={isCreateFixtureModalOpen || createGameWeekLoading || newGameWeekFixtures.length === 0}
          loading={createGameWeekLoading}
          fullWidth={isMobile}
        >
          Skapa omgång
        </Button>
      </Section>
    </CreateGameWeekSection>
  );

  const getCorrectGameWeekContent = () => {
    if (!ongoingGameWeek) return;

    return (
      <>
        <CorrectFixturesContainer>
          {ongoingGameWeek.games.fixtures.map((fixture) => (
            <CorrectingFixtureCard
              fixture={fixture}
              onClick={() => setShowPredictionsModalFixtureId(fixture.id)}
            />
          ))}
        </CorrectFixturesContainer>
        {showPredictionsModalFixtureId && (
          <CorrectPredictionsModal
            onClose={() => setShowPredictionsModalFixtureId(null)}
            gameId={showPredictionsModalFixtureId}
            fixture={ongoingGameWeek.games.fixtures.find((f) => f.id === showPredictionsModalFixtureId)}
            league={league}
            ongoingGameWeek={ongoingGameWeek}
            refetchLeague={refetchLeague}
            savedFinalResult={ongoingGameWeek.games.fixtures.find((f) => f.id === showPredictionsModalFixtureId)?.finalResult}
          />
        )}
        {ongoingGameWeek.games.fixtures.every((f) => Boolean(f.finalResult)) && (
          <Button
            color="red"
            onClick={handleEndGameWeek}
            loading={endGameWeekLoading}
          >
            Avsluta omgång
          </Button>
        )}
      </>
    );
  };

  const handleShowMoreGameWeeks = () => {
    const currentlyDisplayedRounds = initiallyDisplayedPreviousGameWeeks?.map((gameWeek) => gameWeek.round) ?? [];
    const next10Rounds = previousGameWeeks
      ?.filter((gameWeek) => !currentlyDisplayedRounds.includes(gameWeek.round))
      .slice(-10);

    if (next10Rounds && initiallyDisplayedPreviousGameWeeks) {
      setInitiallyDisplayedPreviousGameWeeks((prev) => [...prev as LeagueGameWeek[], ...next10Rounds]);
    }

    if (next10Rounds && next10Rounds.length < 10) {
      setInitiallyDisplayedPreviousGameWeeks(previousGameWeeks);
    }
  };

  return (
    <>
      <Section gap="m">
        {isCreator && !showCreateGameWeekSection && !league.hasEnded && (
          <Section flexDirection="row" gap="s" padding={isMobile ? `0 ${theme.spacing.s}` : '0'}>
            <Button
              color="primary"
              size="m"
              icon={<PlusCircle size={20} color={theme.colors.white} />}
              onClick={isCreator || hasAdminRights ? () => setShowCreateGameWeekSection(!showCreateGameWeekSection) : () => {}}
              // disabled={upcomingGameWeek !== undefined}
              fullWidth={isMobile}
            >
              Skapa ny omgång
            </Button>
          </Section>
        )}
        {showCreateGameWeekSection && getCreateGameWeekContent()}
        {!league.hasEnded && (
          <Section
            backgroundColor={theme.colors.white}
            borderRadius={theme.borderRadius.l}
            padding={isMobile ? `${theme.spacing.m} ${theme.spacing.s}` : theme.spacing.m}
            gap="s"
            expandMobile
          >
            <OngoingGameWeekHeader hasFixtures={Boolean(ongoingGameWeek && ongoingGameWeek.games.fixtures.length > 0)}>
              <HeadingsTypography variant="h4">Pågående omgång</HeadingsTypography>
              {ongoingGameWeek && (
                <Section flexDirection={isMobile ? 'column' : 'row'} alignItems="center" gap="s" justifyContent="flex-end" fitContent={!isMobile} padding={isMobile ? `${theme.spacing.xxxs} 0 0 0` : '0'}>
                  {!showCorrectGameWeekContent && (
                    <Section>
                      <NoWrapTypography variant="m" color={theme.colors.textLight}>{getGameWeekPredictionStatusText()}</NoWrapTypography>
                    </Section>
                  )}
                  <Section
                    flexDirection="row"
                    alignItems="center"
                    gap={isMobile ? 'xxs' : 'xs'}
                    justifyContent="space-between"
                  >
                    <Tag
                      text={`Omgång ${ongoingGameWeek.round}`}
                      textAndIconColor={theme.colors.primaryDark}
                      backgroundColor={theme.colors.primaryBleach}
                      size="l"
                    />
                    <Section
                      flexDirection="row"
                      alignItems="center"
                      gap={isMobile ? 'xxs' : 'xs'}
                      fitContent
                    >
                      {(isCreator || hasAdminRights) && !editGameWeekViewOpen && (
                        fixturesCanBeCorrected && (
                          showCorrectGameWeekContent ? (
                            <IconButton
                              icon={<XCircle size={24} />}
                              colors={{ normal: theme.colors.red, hover: theme.colors.redDark, active: theme.colors.redDarker }}
                              onClick={() => setShowCorrectGameWeekContent(false)}
                            />
                          ) : (
                            <Button
                              variant="primary"
                              size="s"
                              onClick={() => setShowCorrectGameWeekContent(true)}
                              icon={<ListChecks size={20} color={theme.colors.white} />}
                            >
                              Rätta
                            </Button>
                          )
                        )
                      )}
                      {(isCreator || hasAdminRights) && !showCorrectGameWeekContent && !editGameWeekViewOpen && (
                        <IconButton
                          icon={<PencilSimple size={24} />}
                          colors={{ normal: theme.colors.primary, hover: theme.colors.primaryDark, active: theme.colors.primaryDarker }}
                          onClick={() => handleEditGameWeekClick('ongoing')}
                        />
                      )}
                    </Section>
                  </Section>
                </Section>
              )}
            </OngoingGameWeekHeader>
            {ongoingGameWeek ? (
              <>
                {getOngoingGameWeekContent()}
                {ongoingGameWeek.games.fixtures.some((f) => f.odds) && !editGameWeekViewOpen && (
                  <Section padding="8px 0">
                    <TextButton
                      icon={<Info size={20} color={theme.colors.primary} />}
                      noPadding
                      onClick={() => setOddsBonusModalOpen(true)}
                    >
                      Läs mer om oddsbonus
                    </TextButton>
                  </Section>
                )}
              </>
            ) : (
              <NormalTypography variant="m" color={theme.colors.textLight}>Ingen pågående omgång</NormalTypography>
            )}
          </Section>
        )}
        {!league.hasEnded && (
          <Section
            backgroundColor={theme.colors.white}
            borderRadius={theme.borderRadius.l}
            padding={isMobile ? `${theme.spacing.m} ${theme.spacing.s}` : theme.spacing.m}
            gap="s"
            expandMobile
          >
            <Section flexDirection="row" alignItems="center" justifyContent="space-between" gap="xxs">
              <HeadingsTypography variant="h4">Nästa omgång</HeadingsTypography>
              {upcomingGameWeeks && upcomingGameWeeks.length > 0 && (
                <Section flexDirection="row" alignItems="center" gap="xs" fitContent>
                  {upcomingGameWeeks && upcomingGameWeeks.length > 0 && (
                    <Tag
                      text={`Omgång ${upcomingGameWeeks[0].round}`}
                      textAndIconColor={theme.colors.primaryDark}
                      backgroundColor={theme.colors.primaryBleach}
                      size="l"
                    />
                  )}
                  {(isCreator || hasAdminRights) && !editUpcomingGameWeekViewOpen && (
                    <IconButton
                      icon={<PencilSimple size={24} />}
                      colors={{ normal: theme.colors.primary, hover: theme.colors.primaryDark, active: theme.colors.primaryDarker }}
                      onClick={() => handleEditGameWeekClick('upcoming')}
                    />
                  )}
                </Section>
              )}
            </Section>
            {upcomingGameWeeks && upcomingGameWeeks.length > 0 && (
              <>
                <Divider />
                <Section flexDirection="row" alignItems="center" gap="xxs" justifyContent="center">
                  <NormalTypography variant="m" color={theme.colors.silverDark} align="center">
                    {`Kan tippas tidigast ${getNextGameWeekStartDate()}`}
                  </NormalTypography>
                </Section>
              </>
            )}
            {upcomingGameWeeks && upcomingGameWeeks.length > 0 ? (
              <>
                {editUpcomingGameWeekViewOpen ? (
                  <EditGameWeekView
                    gameWeek={upcomingGameWeeks[0]}
                    onClose={() => setEditUpcomingGameWeekViewOpen(false)}
                    refetch={refetchLeague}
                    minDate={ongoingGameWeek ? getLastKickoffTimeInGameWeek(ongoingGameWeek) : undefined}
                    league={league}
                  />
                ) : (
                  Array.from(groupFixturesByDate(upcomingGameWeekFixtures).entries()).map(([date, fixtures]) => (
                    <UpcomingFixturesDateContainer key={date.toString()}>
                      <Section
                        padding={theme.spacing.xs}
                        backgroundColor={theme.colors.silverLight}
                        borderRadius={`${theme.borderRadius.m} ${theme.borderRadius.m} 0 0`}
                        alignItems="center"
                      >
                        <EmphasisTypography variant="m" color={theme.colors.textDefault}>{getFixturesDateFormatted(date)}</EmphasisTypography>
                      </Section>
                      {fixtures
                        .sort((a: Fixture, b: Fixture) => new Date(a.kickOffTime).getTime() - new Date(b.kickOffTime).getTime())
                        .map((fixture: Fixture, index: number, array: Array<any>) => (
                          <>
                            <UpcomingFixturePreview
                              fixture={fixture}
                              useShortNames={isMobile}
                            />
                            {index !== array.length - 1 && <Divider color={theme.colors.silverLight} />}
                          </>
                        ))}
                    </UpcomingFixturesDateContainer>
                  ))
                )}
              </>
            ) : (
              <NormalTypography variant="m" color={theme.colors.textLight}>Ingen kommande omgång</NormalTypography>
            )}
            {upcomingGameWeeks && upcomingGameWeeks.length > 1 && (
              <Section flexDirection="row" alignItems="center" gap="xxs" justifyContent="center">
                <EmphasisTypography variant="m" color={theme.colors.textDefault}>
                  {`+ ${upcomingGameWeeks.length - 1} ytterligare omgång${upcomingGameWeeks.length > 2 ? 'ar' : ''}`}
                </EmphasisTypography>
              </Section>
            )}
          </Section>
        )}
        <Section
          backgroundColor={theme.colors.white}
          borderRadius={theme.borderRadius.l}
          padding={isMobile ? `${theme.spacing.m} ${theme.spacing.s}` : theme.spacing.m}
          gap="s"
          expandMobile
        >
          <HeadingsTypography variant="h4">Tidigare omgångar</HeadingsTypography>
          {previousGameWeeks && previousGameWeeks.length > 0 && initiallyDisplayedPreviousGameWeeks && initiallyDisplayedPreviousGameWeeks.length > 0 ? (
            <>
              {initiallyDisplayedPreviousGameWeeks.sort((a, b) => b.round - a.round).map((gameWeek) => (
                <PreviousRoundCard key={gameWeek.startDate.toString()}>
                  <Section
                    justifyContent="space-between"
                    alignItems="flex-start"
                    flexDirection="row"
                    backgroundColor={theme.colors.silverLighter}
                    borderRadius={`${theme.borderRadius.l} ${theme.borderRadius.l} 0 0`}
                  >
                    <Section padding={theme.spacing.s} fitContent gap={isMobile ? 'xxxs' : 'xs'} alignItems={isMobile ? 'flex-start' : 'center'} flexDirection={isMobile ? 'column' : 'row'}>
                      <EmphasisTypography variant="m" color={theme.colors.textDefault}>
                        {`Omgång ${gameWeek.round}`}
                      </EmphasisTypography>
                      <NormalTypography variant="s" color={theme.colors.textLight}>
                        {getGameWeeksDates(gameWeek.games.fixtures)}
                      </NormalTypography>
                    </Section>
                    <RoundPointsContainer>
                      <EmphasisTypography variant="m" color={theme.colors.textDefault}>
                        {gameWeek.games.predictions.filter((p) => p.userId === user?.documentId).reduce((acc, curr) => acc + (curr.points?.total ?? 0), 0)}
                        {' '}
                        poäng
                      </EmphasisTypography>
                    </RoundPointsContainer>
                  </Section>
                  <Divider color={theme.colors.silverLight} />
                  <Section
                    backgroundColor={theme.colors.white}
                    padding={isMobile ? theme.spacing.xs : '0px'}
                    gap={isMobile ? 'xxs' : undefined}
                  >
                    {gameWeek.games.fixtures
                      .sort((a, b) => new Date(a.kickOffTime).getTime() - new Date(b.kickOffTime).getTime())
                      .map((fixture, index, array) => (
                        <>
                          {isMobile ? (
                            <CompactFixtureResult
                              fixture={fixture}
                              predictions={gameWeek.games.predictions.filter((prediction) => prediction.fixtureId === fixture.id)}
                              onModalOpen={() => setShowFixturePredictionsModal(fixture.id)}
                            />
                          ) : (
                            <FixtureResultPreview
                              fixture={fixture}
                              predictions={gameWeek.games.predictions.filter((prediction) => prediction.fixtureId === fixture.id)}
                              onTogglePredictionsModalOpen={() => {
                                if (showFixturePredictionsModal === fixture.id) {
                                  setShowFixturePredictionsModal(null);
                                } else {
                                  setShowFixturePredictionsModal(fixture.id);
                                }
                              }}
                            />
                          )}
                          {!isMobile && index < array.length - 1 && <Divider />}
                        </>
                      ))}
                  </Section>
                </PreviousRoundCard>
              ))}
            </>
          ) : (
            <NormalTypography variant="m" color={theme.colors.textLight}>Inga tidigare omgångar</NormalTypography>
          )}
          {initiallyDisplayedPreviousGameWeeks && previousGameWeeks && initiallyDisplayedPreviousGameWeeks.length < previousGameWeeks.length && (
            <Section padding={`${theme.spacing.xs} 0 0 0`} justifyContent="center">
              <Button
                onClick={handleShowMoreGameWeeks}
              >
                Visa fler
              </Button>
            </Section>
          )}
        </Section>
      </Section>
      <RootToast />
      {isCreateFixtureModalOpen && (
        <CreateFixtureModal
          onClose={() => setIsCreateFixtureModalOpen(false)}
          league={league}
          allNewGameWeekFixtures={newGameWeekFixtures}
          onUpdateAllNewGameWeekFixtures={setNewGameWeekFixtures}
          minDate={ongoingGameWeek ? getLastKickoffTimeInAllGameWeeks(league.gameWeeks ?? []) : new Date()}
        />
      )}
      {newFixtureToEdit && (
        <EditFixtureModal
          fixture={newFixtureToEdit}
          onClose={() => setNewFixtureToEdit(null)}
          onSave={(updatedFixture) => {
            setNewGameWeekFixtures(newGameWeekFixtures.map((f) => (f.id === updatedFixture.id ? updatedFixture : f)));
            setNewFixtureToEdit(null);
          }}
          onDeleteFixture={() => setNewGameWeekFixtures(newGameWeekFixtures.filter((f) => f.id !== newFixtureToEdit.id))}
          minDate={ongoingGameWeek ? getLastKickoffTimeInAllGameWeeks(league.gameWeeks ?? []) : new Date()}
          league={league}
        />
      )}
      {isStatsModalOpen && (
        <FixtureStatsModal
          fixture={isStatsModalOpen}
          onClose={() => setIsStatsModalOpen(null)}
          isLeagueCreator={isCreator}
          ongoingGameWeek={ongoingGameWeek}
          league={league}
          refetchLeague={refetchLeague}
        />
      )}
      {oddsBonusModalOpen && (
        <Modal size="s" title="Oddsbonus" onClose={() => setOddsBonusModalOpen(false)} mobileBottomSheet>
          <NormalTypography variant="m">Om du tippat rätt utfall i en match får du bonuspoäng enligt hur hur höga oddsen var för det utfallet du tippade.</NormalTypography>
          <HeadingsTypography variant="h6">Utdelning av bonuspoäng</HeadingsTypography>
          <Section gap="xs">
            <NormalTypography variant="m">
              Inga extra poäng för odds från 1.00 till 2.99
            </NormalTypography>
            <NormalTypography variant="m">
              {league.scoringSystem?.oddsBetween3And4}
              {' '}
              poäng för odds mellan 3.00 och 3.99
            </NormalTypography>
            <NormalTypography variant="m">
              {league.scoringSystem?.oddsBetween4And6}
              {' '}
              poäng för odds mellan 4.00 och 5.99
            </NormalTypography>
            <NormalTypography variant="m">
              {league.scoringSystem?.oddsBetween6And10}
              {' '}
              poäng för odds mellan 6.00 och 9.99
            </NormalTypography>
            <NormalTypography variant="m">
              {league.scoringSystem?.oddsAvobe10}
              {' '}
              poäng för odds 10.00 eller högre
            </NormalTypography>
          </Section>
        </Modal>
      )}
      {showFixturePredictionsModal && (
        <PredictionsModal
          predictions={previousGameWeeks?.map((gw) => gw.games.predictions).flat().filter((p) => p.fixtureId === showFixturePredictionsModal) ?? []}
          fixture={previousGameWeeks?.map((gw) => gw.games.fixtures).flat().find((f) => f.id === showFixturePredictionsModal)}
          onClose={() => setShowFixturePredictionsModal(null)}
        />
      )}
      {findOtherFixturesModalOpen && (
        <FindOtherFixturesModal
          onClose={() => setFindOtherFixturesModalOpen(false)}
          onFixturesSelect={(fixtures) => handleAddExternalFixtures(fixtures)}
          alreadySelectedFixtures={newGameWeekFixtures}
          minDate={ongoingGameWeek ? getLastKickoffTimeInAllGameWeeks(league.gameWeeks ?? []) : new Date()}
          leagueScoringSystem={league.scoringSystem}
        />
      )}
    </>
  );
};

const CreateGameWeekSection = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.m};
  background-color: ${theme.colors.white};
  padding: ${theme.spacing.m};
  border-radius: ${theme.borderRadius.m};
  width: 100%;
  box-sizing: border-box;
`;

const CreateFixtureCard = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  gap: ${theme.spacing.xs};
  background-color: ${theme.colors.silverLighter};
  border-radius: ${theme.borderRadius.m};
  width: 100%;
  box-sizing: border-box;
  border: 1px dashed ${theme.colors.silver};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border: 1px solid ${theme.colors.silver};
    background-color: ${theme.colors.silverLight};
  }
`;

const FixturesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto;
  gap: ${theme.spacing.m};
  width: 100%;
  box-sizing: border-box;

  @media ${devices.tablet} {
    grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  }
`;

const RoundPointsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xxs};
  justify-content: center;
  background-color: ${theme.colors.gold};
  border-radius: 0 ${theme.borderRadius.m} 0 ${theme.borderRadius.xl};
  padding: ${theme.spacing.xxs} ${theme.spacing.xs} ${theme.spacing.xxs} ${theme.spacing.s};
`;

const OngoingGameWeekHeader = styled.div<{ hasFixtures: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  width: 100%;
  
  @media ${devices.tablet} {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding-bottom: ${({ hasFixtures }) => (hasFixtures ? theme.spacing.xxs : 0)};
  }
`;

const PreviousRoundCard = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${theme.colors.silverLighter};
  border-radius: ${theme.borderRadius.l};
  width: 100%;
  box-sizing: border-box;
  border: 2px solid ${theme.colors.gold};
  overflow: hidden;
`;

const NoWrapTypography = styled(NormalTypography)`
  white-space: nowrap;
`;

const CorrectFixturesContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto;
  gap: ${theme.spacing.xs};
  width: 100%;
  
  @media ${devices.laptop} {
    grid-template-columns: 1fr 1fr;
    gap: ${theme.spacing.s};
  }
`;

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

const UpcomingFixturesDateContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
  box-sizing: border-box;
  background-color: ${theme.colors.silverLighter};
  border-radius: ${theme.borderRadius.l};
  overflow: hidden;
  border: 1px solid ${theme.colors.silverLight};
  animation: ${fadeIn} 0.4s ease;
`;

export default FixturesView;
