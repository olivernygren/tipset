import React, { useEffect, useState } from 'react';
import {
  ListChecks,
  PlusCircle, XCircle,
} from '@phosphor-icons/react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import styled from 'styled-components';
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
import { Team } from '../../utils/Team';
import {
  Fixture, FixtureInput, PredictionInput, PredictionStatus, TeamType,
} from '../../utils/Fixture';
import {
  getPredictionOutcome, getPredictionStatus, hasInvalidTeamName, withDocumentIdOnObject,
} from '../../utils/helpers';
import Input from '../input/Input';
import Select from '../input/Select';
import CustomDatePicker from '../input/DatePicker';
import Checkbox from '../input/Checkbox';
import GamePredictor from '../game/GamePredictor';
import { generateRandomID } from '../../utils/firebaseHelpers';
import { Player } from '../../utils/Players';
import IconButton from '../buttons/IconButton';
import FixturePreview from '../game/FixturePreview';
import CorrectPredictionsModal from './CorrectPredictionsModal';
import FixtureResultPreview from '../game/FixtureResultPreview';
import EditGameWeekView from './EditGameWeekView';
import RootToast from '../toast/RootToast';
import { errorNotify, successNotify } from '../../utils/toast/toastHelpers';
import Tag from '../tag/Tag';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';
import SelectImitation from '../input/SelectImitation';
import SelectTeamModal from '../game/SelectTeamModal';

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
  const [upcomingGameWeek, setUpcomingGameWeek] = useState<LeagueGameWeek>();
  const [previousGameWeeks, setPreviousGameWeeks] = useState<Array<LeagueGameWeek>>();
  const [createGameWeekError, setCreateGameWeekError] = useState<string | null>(null);
  const [showCreateGameWeekSection, setShowCreateGameWeekSection] = useState<boolean>(false);
  const [showCorrectGameWeekContent, setShowCorrectGameWeekContent] = useState<boolean>(false);
  const [showPredictionsModalFixtureId, setShowPredictionsModalFixtureId] = useState<string | null>(null);
  const [createGameWeekLoading, setCreateGameWeekLoading] = useState<boolean>(false);
  const [endGameWeekLoading, setEndGameWeekLoading] = useState<boolean>(false);
  const [selectTeamModalOpen, setSelectTeamModalOpen] = useState<'home' | 'away' | null>(null);

  const [newGameWeekStartDate, setNewGameWeekStartDate] = useState<Date>(new Date());
  const [newGameWeekFixtures, setNewGameWeekFixtures] = useState<Array<Fixture>>([]);

  const [addFixtureViewOpen, setAddFixtureViewOpen] = useState<boolean>(false);
  const [editGameWeekViewOpen, setEditGameWeekViewOpen] = useState<boolean>(false);

  const [teamType, setTeamType] = useState<TeamType>(TeamType.CLUBS);
  const [newFixtureHomeTeam, setNewFixtureHomeTeam] = useState<Team | undefined>();
  const [newFixtureAwayTeam, setNewFixtureAwayTeam] = useState<Team | undefined>();
  const [newFixtureStadium, setNewFixtureStadium] = useState<string>('');
  const [newFixtureTournament, setNewFixtureTournament] = useState<string>('');
  const [newFixtureKickoffDateTime, setNewFixtureKickoffDateTime] = useState<Date>(new Date());
  const [newFixtureShouldPredictGoalScorer, setNewFixtureShouldPredictGoalScorer] = useState<boolean>(false);
  const [newFixtureGoalScorerTeam, setNewFixtureGoalScorerTeam] = useState<Array<string> | null>(null);

  const [predictionStatuses, setPredictionStatuses] = useState<Array<{ fixtureId: string, status: PredictionStatus }>>([]);
  const [gameWeekPredictionStatus, setGameWeekPredictionStatus] = useState<string>('');
  const [predictionLoading, setPredictionLoading] = useState<string | null>(null);

  const isAddFixtureButtonDisabled = !newFixtureHomeTeam
  || hasInvalidTeamName(newFixtureHomeTeam?.name)
  || !newFixtureAwayTeam
  || hasInvalidTeamName(newFixtureAwayTeam?.name)
  || newFixtureHomeTeam === newFixtureAwayTeam
  || !newFixtureStadium
  || !newFixtureTournament
  || !newFixtureKickoffDateTime
  || (newFixtureShouldPredictGoalScorer && (!newFixtureGoalScorerTeam || newFixtureGoalScorerTeam.includes('Välj lag')));

  useEffect(() => {
    if (league && league.gameWeeks && league.gameWeeks.length > 0) {
      const currentGameWeek = league.gameWeeks.find((gameWeek) => {
        const now = new Date();
        return new Date(gameWeek.startDate) < now && gameWeek.hasBeenCorrected === false;
      });

      const nextGameWeek = league.gameWeeks.find((gameWeek) => {
        const now = new Date();
        return new Date(gameWeek.startDate) > now;
      });

      const allPreviousGameWeeks = league.gameWeeks.filter((gameWeek) => gameWeek.hasBeenCorrected && gameWeek.hasEnded);

      setOngoingGameWeek(currentGameWeek);
      setUpcomingGameWeek(nextGameWeek);
      setPreviousGameWeeks(allPreviousGameWeeks);

      if (currentGameWeek && user) {
        setPredictionStatuses(currentGameWeek.games.fixtures.map((fixture) => ({
          fixtureId: fixture.id,
          status: getPredictionStatus(currentGameWeek, user?.documentId ?? '', fixture.id),
        })));
      }
    }
  }, [league]);

  useEffect(() => {
    if (!league || !predictionStatuses.length) return;
    console.log(predictionStatuses);

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

    if (upcomingGameWeek) {
      setCreateGameWeekError('Det finns redan en kommande omgång');
      setCreateGameWeekLoading(false);
      return;
    }

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
      setShowCreateGameWeekSection(false);
      refetchLeague();
    } catch (err) {
      setCreateGameWeekError('Något gick fel, försök igen senare');
      console.log(err);
    }

    setCreateGameWeekLoading(false);
  };

  const getNewGameWeekRoundNumber = () => {
    if (!league || !league.gameWeeks) return 1;
    return league.gameWeeks.length + 1;
  };

  // const getOptionItem = (team: Team): OptionItem => ({
  //   value: team.name,
  //   label: team.name,
  //   additionalOptions: team,
  // });

  // const getOptionGroups = () => {
  //   const filteredEntries = Object.entries(Teams).filter(([league]) => (teamType === TeamType.CLUBS ? league !== 'Landslag' : league === 'Landslag'));

  //   const placeholderObj = {
  //     label: '-',
  //     options: [{ value: 'Välj lag', label: 'Välj lag' }],
  //   };

  //   const teams = filteredEntries.map(([league, teams]) => ({
  //     label: league,
  //     options: teams.sort((a, b) => a.name.localeCompare(b.name)).map(getOptionItem),
  //   }));

  //   return [placeholderObj, ...teams];
  // };

  const handleSelectTeam = (team: Team | undefined, isHomeTeam: boolean) => {
    if (!team) return;

    if (isHomeTeam) {
      setNewFixtureHomeTeam(team);
      setNewFixtureStadium(team.stadium ?? '');
    } else {
      setNewFixtureAwayTeam(team);
    }
  };

  const handleUpdateKickoffTime = (date: Date) => {
    setNewFixtureKickoffDateTime(date);
  };

  const handleResetNewFixture = () => {
    setNewFixtureHomeTeam(undefined);
    setNewFixtureAwayTeam(undefined);
    setNewFixtureStadium('');
    setNewFixtureTournament('');
    setNewFixtureKickoffDateTime(new Date());
    setNewFixtureShouldPredictGoalScorer(false);
    setNewFixtureGoalScorerTeam(null);
  };

  const handleSetGoalScrorerTeam = (selection: string) => {
    if (selection === 'Välj lag') {
      setNewFixtureGoalScorerTeam(null);
      return;
    }
    if (selection === 'Båda lagen') {
      setNewFixtureGoalScorerTeam([newFixtureHomeTeam?.name!, newFixtureAwayTeam?.name!]);
      return;
    }
    setNewFixtureGoalScorerTeam([selection]);
  };

  const handleAddFixtureToGameWeek = () => {
    if (!newFixtureHomeTeam || !newFixtureAwayTeam) return;

    if (newGameWeekFixtures.length === 24) {
      errorNotify('Max antal matcher per omgång är 24');
      return;
    }

    const newFixtureInput: FixtureInput = {
      id: generateRandomID(),
      homeTeam: newFixtureHomeTeam,
      awayTeam: newFixtureAwayTeam,
      stadium: newFixtureStadium,
      tournament: newFixtureTournament,
      homeTeamForm: [],
      awayTeamForm: [],
      kickOffTime: new Date(newFixtureKickoffDateTime).toISOString(),
      shouldPredictGoalScorer: newFixtureShouldPredictGoalScorer,
      ...(newFixtureShouldPredictGoalScorer && { goalScorerFromTeam: newFixtureGoalScorerTeam }),
      teamType,
    };

    setNewGameWeekFixtures([...newGameWeekFixtures, { ...newFixtureInput }]);
    setAddFixtureViewOpen(false);
    handleResetNewFixture();
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
      console.error(error);
    }

    setEndGameWeekLoading(false);
  };

  const handleSavePrediction = async (fixture: Fixture, homeGoals: string, awayGoals: string, playerToScore?: Player | null) => {
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
      fixtureId: fixture.id,
      homeGoals: parseInt(homeGoals),
      awayGoals: parseInt(awayGoals),
      outcome: getPredictionOutcome(parseInt(homeGoals), parseInt(awayGoals)),
      ...((playerToScore && fixture.shouldPredictGoalScorer) && { goalScorer: playerToScore }),
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
      console.log(err);
      errorNotify('Något gick fel, försök igen senare');
    }
    setPredictionLoading(null);
  };

  const getNextGameWeekStartDate = () => {
    if (!upcomingGameWeek) return '';
    const startDate = new Date(upcomingGameWeek.startDate);
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
        />
      );
    }

    if (showCorrectGameWeekContent) return getCorrectGameWeekContent();

    return (
      <FixturesGrid>
        {ongoingGameWeek.games.fixtures.map((fixture, index) => (
          <GamePredictor
            key={fixture.id}
            gameNumber={index + 1}
            game={fixture}
            onResultUpdate={() => handleUpdatePredictionScoreline(fixture.id)}
            onPlayerPredictionUpdate={(_, playerToScore) => handleUpdatePlayerPrediction(fixture.id, playerToScore)}
            onSave={(homeGoals, awayGoals, playerToScore) => handleSavePrediction(fixture, homeGoals, awayGoals, playerToScore)}
            hasPredicted={ongoingGameWeek.games.predictions.some((prediction) => prediction.userId === user?.documentId && prediction.fixtureId === fixture.id)}
            predictionValue={ongoingGameWeek.games.predictions.find((prediction) => prediction.userId === user?.documentId && prediction.fixtureId === fixture.id)}
            loading={predictionLoading === fixture.id}
            anyFixtureHasPredictGoalScorer={ongoingGameWeek.games.fixtures.some((f) => f.shouldPredictGoalScorer)}
          />
        ))}
      </FixturesGrid>
    );
  };

  const getAddNewFixtureContent = () => (
    <AddFixtureContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Section flexDirection="row" gap="xs">
        <TeamTypeSelectorButton
          isSelected={teamType === TeamType.CLUBS}
          onClick={() => {
            setTeamType(TeamType.CLUBS);
            handleResetNewFixture();
          }}
        >
          <EmphasisTypography variant="m" color={teamType === TeamType.CLUBS ? theme.colors.primary : theme.colors.silver}>Klubblag</EmphasisTypography>
        </TeamTypeSelectorButton>
        <TeamTypeSelectorButton
          isSelected={teamType === TeamType.NATIONS}
          onClick={() => {
            setTeamType(TeamType.NATIONS);
            handleResetNewFixture();
          }}
        >
          <EmphasisTypography variant="m" color={teamType === TeamType.NATIONS ? theme.colors.primary : theme.colors.silver}>Landslag</EmphasisTypography>
        </TeamTypeSelectorButton>
      </Section>
      <Section flexDirection={isMobile ? 'column' : 'row'} gap={isMobile ? 'm' : 'l'} alignItems="center">
        <Section gap="xxs">
          <EmphasisTypography variant="s">Hemmalag</EmphasisTypography>
          {/* <Select
            options={[]}
            optionGroups={getOptionGroups()}
            value={newFixtureHomeTeam?.name ?? 'Välj lag'}
            onChange={(value) => handleSelectTeam(getTeamByName(value), true)}
            fullWidth
          /> */}
          <SelectImitation
            value={newFixtureHomeTeam?.name ?? ''}
            placeholder="Välj lag"
            onClick={() => setSelectTeamModalOpen('home')}
            fullWidth
          />
        </Section>
        {!isMobile && (
          <VersusTypography>
            <NormalTypography variant="m">vs</NormalTypography>
          </VersusTypography>
        )}
        <Section gap="xxs">
          <EmphasisTypography variant="s">Bortalag</EmphasisTypography>
          {/* <Select
            options={[]}
            optionGroups={getOptionGroups()}
            value={newFixtureAwayTeam?.name ?? 'Välj lag'}
            onChange={(value) => handleSelectTeam(getTeamByName(value), false)}
            fullWidth
          /> */}
          <SelectImitation
            value={newFixtureAwayTeam?.name ?? ''}
            placeholder="Välj lag"
            onClick={() => setSelectTeamModalOpen('away')}
            fullWidth
          />
        </Section>
      </Section>
      <Section flexDirection={isMobile ? 'column' : 'row'} gap={isMobile ? 'm' : 'l'} alignItems="center">
        <Input
          label="Arena"
          value={newFixtureStadium}
          onChange={(e) => setNewFixtureStadium(e.currentTarget.value)}
          fullWidth
        />
        <Input
          label="Turnering"
          name="tournament"
          value={newFixtureTournament}
          onChange={(e) => setNewFixtureTournament(e.currentTarget.value)}
          fullWidth
        />
        <CustomDatePicker
          label="Avsparkstid"
          selectedDate={newFixtureKickoffDateTime}
          onChange={(date) => handleUpdateKickoffTime(date!)}
          fullWidth
        />
      </Section>
      {(newFixtureHomeTeam?.name === 'Arsenal' || newFixtureAwayTeam?.name === 'Arsenal') && (
        <Checkbox
          label="Ska målskytt i matchen tippas?"
          checked={newFixtureShouldPredictGoalScorer}
          onChange={() => setNewFixtureShouldPredictGoalScorer(!newFixtureShouldPredictGoalScorer)}
        />
      )}
      {newFixtureShouldPredictGoalScorer && newFixtureHomeTeam && newFixtureAwayTeam && (
        <Section gap="xxs">
          <EmphasisTypography variant="s">Vilket lag ska målskytten tillhöra?</EmphasisTypography>
          <Select
            options={[
              { value: 'Välj lag', label: 'Välj lag' },
              { value: 'Arsenal', label: 'Arsenal' },
              // { value: newFixtureHomeTeam.name, label: newFixtureHomeTeam.name },
              // { value: newFixtureAwayTeam.name, label: newFixtureAwayTeam.name },
              // { value: 'Båda lagen', label: 'Båda lagen' },
            ]}
            value={newFixtureGoalScorerTeam ? newFixtureGoalScorerTeam[0] : 'Välj lag'}
            onChange={(value) => handleSetGoalScrorerTeam(value)}
            fullWidth={isMobile}
          />
        </Section>
      )}
      <Section gap="m">
        {/* {isMobile && (
          <TextButton color="red" onClick={handleResetNewFixture} noPadding>
            Nollställ
          </TextButton>
        )} */}
        <Section flexDirection="row" alignItems="center" gap="xxs">
          <Button variant="secondary" size="m" onClick={() => setAddFixtureViewOpen(false)}>
            Avbryt
          </Button>
          <Button size="m" onClick={handleAddFixtureToGameWeek} icon={<PlusCircle size={20} color={theme.colors.white} />} disabled={isAddFixtureButtonDisabled} fullWidth={isMobile}>
            Lägg till match
          </Button>
          {/* {!isMobile && (
            <TextButton color="red" onClick={handleResetNewFixture}>
              Nollställ matchinfo
            </TextButton>
          )} */}
        </Section>
      </Section>
    </AddFixtureContainer>
  );

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
        />
      </Section>
      <Divider />
      <Section gap="s">
        <HeadingsTypography variant="h5">Matcher</HeadingsTypography>
        {newGameWeekFixtures.length > 0 && (
          newGameWeekFixtures.map((fixture, index) => (
            <Section flexDirection="row" gap="xxs" alignItems="center">
              <FixturePreview fixture={fixture} key={index} hidePredictions />
              <IconButton
                icon={<XCircle size={24} weight="fill" />}
                colors={{ normal: theme.colors.red, hover: theme.colors.redDark, active: theme.colors.redDarker }}
                onClick={() => setNewGameWeekFixtures(newGameWeekFixtures.filter((f) => f.id !== fixture.id))}
              />
            </Section>
          ))
        )}
        {addFixtureViewOpen ? (
          <>
            {newGameWeekFixtures.length > 0 && <Divider />}
            {getAddNewFixtureContent()}
          </>
        ) : (
          <CreateFixtureCard onClick={() => setAddFixtureViewOpen(true)}>
            <PlusCircle size={32} color={theme.colors.textDefault} />
            <NormalTypography variant="l">Lägg till match</NormalTypography>
          </CreateFixtureCard>
        )}
      </Section>
      {!addFixtureViewOpen && (
        <>
          <Divider />
          {createGameWeekError && (
            <NormalTypography variant="m" color={theme.colors.red}>
              {createGameWeekError}
            </NormalTypography>
          )}
          <Section flexDirection="row" gap="xs">
            <Button variant="secondary" onClick={() => setShowCreateGameWeekSection(false)}>
              Avbryt
            </Button>
            <Button variant="primary" onClick={handleCreateGameWeek} disabled={addFixtureViewOpen || createGameWeekLoading} loading={createGameWeekLoading} fullWidth={isMobile}>
              Skapa omgång
            </Button>
          </Section>
        </>
      )}
    </CreateGameWeekSection>
  );

  const getCorrectGameWeekContent = () => {
    if (!ongoingGameWeek) return;

    return (
      <>
        <Section gap="xxs">
          {ongoingGameWeek.games.fixtures.map((fixture) => (
            <FixturePreview
              fixture={fixture}
              hasBeenCorrected={ongoingGameWeek.hasBeenCorrected || Boolean(fixture.finalResult)}
              onShowPredictionsClick={() => setShowPredictionsModalFixtureId(fixture.id)}
              hidePredictions={new Date(fixture.kickOffTime) > new Date()}
              isCorrectionMode
            />
          ))}
        </Section>
        {showPredictionsModalFixtureId && (
          <CorrectPredictionsModal
            onClose={() => setShowPredictionsModalFixtureId(null)}
            gameId={showPredictionsModalFixtureId}
            league={league}
            ongoingGameWeek={ongoingGameWeek}
            refetchLeague={refetchLeague}
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
              disabled={ongoingGameWeek !== undefined}
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
            <OngoingGameWeekHeader>
              <HeadingsTypography variant="h4">Pågående omgång</HeadingsTypography>
              {ongoingGameWeek && (
                <Section flexDirection={isMobile ? 'column' : 'row'} alignItems="center" gap="s" justifyContent="flex-end" fitContent={!isMobile} padding={isMobile ? `${theme.spacing.xxxs} 0 0 0` : '0'}>
                  <Section>
                    <NoWrapTypography variant="m" color={theme.colors.textLight}>{getGameWeekPredictionStatusText()}</NoWrapTypography>
                  </Section>
                  <Section flexDirection="row" alignItems="center" gap={isMobile ? 'xxs' : 'xs'} justifyContent="space-between">
                    <Tag
                      text={`Omgång ${ongoingGameWeek.round}`}
                      textAndIconColor={theme.colors.primaryDark}
                      backgroundColor={theme.colors.primaryBleach}
                      size="l"
                    />
                    {(isCreator || hasAdminRights) && (
                    <>
                      {/* <IconButton
                        icon={<PencilSimple size={24} />}
                        colors={{ normal: theme.colors.primary, hover: theme.colors.primaryDark, active: theme.colors.primaryDarker }}
                        onClick={() => setEditGameWeekViewOpen(true)}
                        /> */}
                      {ongoingGameWeek.games.fixtures.some((fixture) => fixture.kickOffTime && new Date(fixture.kickOffTime) < new Date()) && (
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
                      )}
                    </>
                    )}
                  </Section>
                </Section>
              )}
            </OngoingGameWeekHeader>
            {ongoingGameWeek ? (
              getOngoingGameWeekContent()
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
            <HeadingsTypography variant="h4">Nästa omgång</HeadingsTypography>
            {upcomingGameWeek ? (
              <NormalTypography variant="m" color={theme.colors.primary}>
                {`Du kan tippa nästa omgång fr.o.m. ${getNextGameWeekStartDate()}`}
              </NormalTypography>
            ) : (
              <NormalTypography variant="m" color={theme.colors.textLight}>Ingen kommande omgång</NormalTypography>
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
          {previousGameWeeks && previousGameWeeks.length > 0 ? (
            <>
              {previousGameWeeks.sort((a, b) => b.round - a.round).map((gameWeek) => (
                <PreviousRoundCard key={gameWeek.round}>
                  <Section justifyContent="space-between" alignItems="center" flexDirection="row" padding={`${theme.spacing.s} ${theme.spacing.s} 0 ${theme.spacing.s}`}>
                    <HeadingsTypography variant="h6" color={theme.colors.primaryDark}>
                      {`Omgång ${gameWeek.round}`}
                    </HeadingsTypography>
                    <Section flexDirection="row" gap="s" alignItems="center" fitContent>
                      <RoundPointsContainer>
                        <EmphasisTypography variant="m" color={theme.colors.gold}>
                          {gameWeek.games.predictions.filter((p) => p.userId === user?.documentId).reduce((acc, curr) => acc + (curr.points?.total ?? 0), 0)}
                          {' '}
                          poäng
                        </EmphasisTypography>
                      </RoundPointsContainer>
                    </Section>
                  </Section>
                  <Divider color={theme.colors.silverLight} />
                  <Section gap="xxs" padding={`0 ${theme.spacing.s} ${theme.spacing.s} ${theme.spacing.s}`}>
                    {gameWeek.games.fixtures.map((fixture) => (
                      <FixtureResultPreview
                        fixture={fixture}
                        predictions={gameWeek.games.predictions.filter((prediction) => prediction.fixtureId === fixture.id)}
                        compact={isMobile}
                      />
                    ))}
                  </Section>
                </PreviousRoundCard>
              ))}
            </>
          ) : (
            <NormalTypography variant="m" color={theme.colors.textLight}>Inga tidigare omgångar</NormalTypography>
          )}
        </Section>
      </Section>
      <RootToast />
      {selectTeamModalOpen && (
        <SelectTeamModal
          onClose={() => setSelectTeamModalOpen(null)}
          onSave={(team) => handleSelectTeam(team, selectTeamModalOpen === 'home')}
          teamType={teamType}
          isHomeTeam={selectTeamModalOpen === 'home'}
          value={selectTeamModalOpen === 'home' ? newFixtureHomeTeam : newFixtureAwayTeam}
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

const AddFixtureContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.m};
  width: 100%;
  box-sizing: border-box;
`;

const TeamTypeSelectorButton = styled.div<{ isSelected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xxs};
  border-radius: ${theme.borderRadius.s};
  border: 2px solid ${({ isSelected }) => (isSelected ? theme.colors.primary : theme.colors.silver)};
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  :hover {
    border-color: ${({ isSelected }) => (isSelected ? theme.colors.primary : theme.colors.primaryLight)};

    ${EmphasisTypography} {
      color: ${({ isSelected }) => (isSelected ? theme.colors.primary : theme.colors.primaryLight)};
    }
  }
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
`;

const VersusTypography = styled.div`
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: end;
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
  justify-content: center;
  background-color: ${theme.colors.primaryDark};
  border-radius: ${theme.borderRadius.s};
  padding: ${theme.spacing.xxs} ${theme.spacing.xs};
`;

const OngoingGameWeekHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  width: 100%;

  @media ${devices.tablet} {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const PreviousRoundCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.s};
  background-color: ${theme.colors.silverLighter};
  border-radius: ${theme.borderRadius.m};
  width: 100%;
  box-sizing: border-box;
  box-shadow: 0px 3px 0px rgba(0, 0, 0, 0.08);
`;

const NoWrapTypography = styled(NormalTypography)`
  white-space: nowrap;
`;

export default FixturesView;
