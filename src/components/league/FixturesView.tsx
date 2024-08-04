import { useEffect, useState } from 'react';
import { LeagueGameWeek, LeagueGameWeekInput, PredictionLeague } from '../../utils/League';
import { Section } from '../section/Section';
import { theme } from '../../theme';
import { EmphasisTypography, HeadingsTypography, NormalTypography } from '../typography/Typography';
import Button from '../buttons/Button';
import { CheckSquareOffset, PencilSimple, PlusCircle, XCircle } from '@phosphor-icons/react';
import { Divider } from '../Divider';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { CollectionEnum } from '../../utils/Firebase';
import { useUser } from '../../context/UserContext';
import { Team, Teams, getTeamByName } from '../../utils/Team';
import { Fixture, FixtureInput, PredictionInput, PredictionStatus, TeamType } from '../../utils/Fixture';
import { getPredictionOutcome, getPredictionStatus, hasInvalidTeamName, withDocumentIdOnObject } from '../../utils/helpers';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Input from '../input/Input';
import Select, { OptionItem } from '../input/Select';
import CustomDatePicker from '../input/DatePicker';
import TextButton from '../buttons/TextButton';
import Checkbox from '../input/Checkbox';
import GamePredictor from '../game/GamePredictor';
import { generateRandomID } from '../../utils/firebaseHelpers';
import { Player } from '../../utils/Players';
import IconButton from '../buttons/IconButton';
import FixturePreview from '../game/FixturePreview';
import PredictionsModal from './PredictionsModal';
import FixtureResultPreview from '../game/FixtureResultPreview';
import EditGameWeekView from './EditGameWeekView';

interface FixturesViewProps {
  league: PredictionLeague;
  isCreator: boolean;
  refetchLeague: () => void;
};

enum GameWeekPredictionStatus {
  ALL_PREDICTED = 'ALL_PREDICTED',
  NOT_ALL_PREDICTED = 'NOT_ALL_PREDICTED',
  UNSAVED_CHANGES = 'UNSAVED_CHANGES',
  NONE_PREDICTED = 'NONE_PREDICTED',
}

const FixturesView = ({ league, isCreator, refetchLeague }: FixturesViewProps) => {
  const { user, hasAdminRights } = useUser();

  const [ongoingGameWeek, setOngoingGameWeek] = useState<LeagueGameWeek>();
  const [upcomingGameWeek, setUpcomingGameWeek] = useState<LeagueGameWeek>();
  const [previousGameWeeks, setPreviousGameWeeks] = useState<Array<LeagueGameWeek>>();
  const [createGameWeekError, setCreateGameWeekError] = useState<string | null>(null);
  const [showCreateGameWeekSection, setShowCreateGameWeekSection] = useState<boolean>(false);
  const [showCorrectGameWeekContent, setShowCorrectGameWeekContent] = useState<boolean>(false)
  const [showPredictionsModalFixtureId, setShowPredictionsModalFixtureId] = useState<string | null>(null);
  const [createGameWeekLoading, setCreateGameWeekLoading] = useState<boolean>(false);

  const [newGameWeekStartDate, setNewGameWeekStartDate] = useState<Date>(new Date());
  const [newGameWeekDeadline, setNewGameWeekDeadline] = useState<Date>(new Date());
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

  const isAddFixtureButtonDisabled = 
  !newFixtureHomeTeam || 
  hasInvalidTeamName(newFixtureHomeTeam?.name) ||
  !newFixtureAwayTeam || 
  hasInvalidTeamName(newFixtureAwayTeam?.name) ||
  newFixtureHomeTeam === newFixtureAwayTeam ||
  !newFixtureStadium || 
  !newFixtureTournament || 
  !newFixtureKickoffDateTime ||
  (newFixtureShouldPredictGoalScorer && (!newFixtureGoalScorerTeam || newFixtureGoalScorerTeam.includes('Välj lag')));

  useEffect(() => {    
    if (league && league.gameWeeks && league.gameWeeks.length > 0) {
      const currentGameWeek = league.gameWeeks.find((gameWeek) => {
        const now = new Date();
        return new Date(gameWeek.startDate) < now && (new Date(gameWeek.deadline) > now || gameWeek.hasBeenCorrected === false);
      });

      const upcomingGameWeek = league.gameWeeks.find((gameWeek) => {
        const now = new Date();
        return new Date(gameWeek.startDate) > now;
      });

      const previousGameWeeks = league.gameWeeks.filter((gameWeek) => {
        const now = new Date();
        return new Date(gameWeek.deadline) < now && gameWeek.hasBeenCorrected;
      });
      
      setOngoingGameWeek(currentGameWeek);
      setUpcomingGameWeek(upcomingGameWeek);
      setPreviousGameWeeks(previousGameWeeks);

      if (currentGameWeek && user) {
        setPredictionStatuses(currentGameWeek.games.fixtures.map((fixture) => ({
          fixtureId: fixture.id,
          status: getPredictionStatus(currentGameWeek, user?.documentId ?? '')
        })));
      };
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [predictionStatuses]);

  const handleCreateGameWeek = async () => {
    if (!league) return;

    setCreateGameWeekError(null);
    setCreateGameWeekLoading(true);

    const today = new Date();

    if (!isCreator && !hasAdminRights) {
      setCreateGameWeekError('Du har inte rättigheter att skapa en ny omgång');
      setCreateGameWeekLoading(false);
      return;
    }

    if (upcomingGameWeek) {
      setCreateGameWeekError('Det finns redan en kommande omgång');
      setCreateGameWeekLoading(false);
      return;
    };

    if (ongoingGameWeek && newGameWeekStartDate > new Date(ongoingGameWeek.deadline)) {
      setCreateGameWeekError('Ny omgång kan inte starta innan pågående omgångs deadline');
      setCreateGameWeekLoading(false);
      return;
    }

    if (newGameWeekDeadline < today) {
      setCreateGameWeekError('Ogiltig deadline');
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
      deadline: newGameWeekDeadline.toISOString(),
      games: {
        fixtures: newGameWeekFixtures,
        predictions: [],
      },
      hasBeenCorrected: false,
      hasEnded: false,
    }

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

  const getOptionItem = (team: Team): OptionItem => {
    return {
      value: team.name,
      label: team.name,
      additionalOptions: team,
    }
  };

  const getOptionGroups = () => {
    const filteredEntries = Object.entries(Teams).filter(([league]) => 
      teamType === TeamType.CLUBS ? league !== "Landslag" : league === "Landslag"
    );

    const placeholderObj = {
      label: '-',
      options: [ { value: 'Välj lag', label: 'Välj lag' }]
    }
  
    const teams = filteredEntries.map(([league, teams]) => ({
      label: league,
      options: teams.sort((a, b) => a.name.localeCompare(b.name)).map(getOptionItem)
    }));

    return [placeholderObj, ...teams]
  };


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
  
    const currentFixtureKickoffTimes = newGameWeekFixtures.map((fixture) => new Date(fixture.kickOffTime).getTime());
    const anyFixtureHasLaterKickoff = currentFixtureKickoffTimes.some(kickoffTime => kickoffTime > date.getTime());
  
    if (!anyFixtureHasLaterKickoff) {
      setNewGameWeekDeadline(date);
    }
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
    }

    setNewGameWeekFixtures([...newGameWeekFixtures, { ...newFixtureInput }]);
    setAddFixtureViewOpen(false);
    handleResetNewFixture();
  };

  const handleUpdatePredictionScoreline = (fixtureId: string) => {
    const fixture = predictionStatuses.find((fixture) => fixture.fixtureId === fixtureId);
    
    if (!fixture) return;

    const updatedPredictionStatuses = predictionStatuses.map((prediction) => {
      if (prediction.fixtureId === fixtureId) {
        return {
          ...prediction,
          status: PredictionStatus.UPDATED,
        }
      }
      return prediction;
    });
    setPredictionStatuses(updatedPredictionStatuses);
  }

  const handleUpdatePlayerPrediction = (fixtureId: string, playerToScore?: Player | null) => {
    const fixture = predictionStatuses.find((fixture) => fixture.fixtureId === fixtureId);
    
    if (!fixture || !playerToScore) return;

    const updatedPredictionStatuses = predictionStatuses.map((prediction) => {
      if (prediction.fixtureId === fixtureId) {
        return {
          ...prediction,
          status: PredictionStatus.UPDATED,
        }
      }
      return prediction;
    });
    setPredictionStatuses(updatedPredictionStatuses);
  };

  const handleSavePrediction = async (fixture: Fixture, homeGoals: string, awayGoals: string, playerToScore?: Player | null) => {
    if (!user || !user.documentId || !ongoingGameWeek) return;

    if (!homeGoals || !awayGoals || parseInt(homeGoals) < 0 || parseInt(awayGoals) < 0) return;

    if (new Date(ongoingGameWeek.deadline) < new Date()) return;

    setPredictionLoading(fixture.id);

    const predictionInput: PredictionInput = {
      userId: user.documentId,
      fixtureId: fixture.id,
      homeGoals: parseInt(homeGoals),
      awayGoals: parseInt(awayGoals),
      outcome: getPredictionOutcome(parseInt(homeGoals), parseInt(awayGoals)),
      ...((playerToScore && fixture.shouldPredictGoalScorer) && { goalScorer: playerToScore }),
    }

    try {
      const leagueDoc = await getDoc(doc(db, CollectionEnum.LEAGUES, league.documentId));
      const leagueData = withDocumentIdOnObject<PredictionLeague>(leagueDoc);
      
      const updatedGameWeeks: Array<LeagueGameWeek> = leagueData.gameWeeks ? leagueData.gameWeeks.map((gameWeek) => {
        if (gameWeek.round === ongoingGameWeek.round) {
          const existingPredictionIndex = gameWeek.games.predictions.findIndex((p) => p.fixtureId === predictionInput.fixtureId && p.userId === predictionInput.userId);
          let updatedPredictions = [...gameWeek.games.predictions];
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
            }
          }
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
          }
        }
        return prediction;
      });
      setPredictionStatuses(updatedPredictionStatuses);
      refetchLeague();
    } catch (err) {
      console.log(err);
    }
    setPredictionLoading(null);
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
    };
  };

  const getOngoingGameWeekContent = () => {
    if (!ongoingGameWeek) return;

    if (editGameWeekViewOpen) {
      return (
        <EditGameWeekView
          gameWeek={ongoingGameWeek}
          onClose={() => setEditGameWeekViewOpen(false)}
        />
      )
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
          />
        ))}
      </FixturesGrid>
    )
  };

  const getAddNewFixtureContent = () => (
    <AddFixtureContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Section flexDirection='row' gap='xs'>
        <TeamTypeSelectorButton 
          isSelected={teamType === TeamType.CLUBS}
          onClick={() => setTeamType(TeamType.CLUBS)}
        >
          <EmphasisTypography variant='m' color={teamType === TeamType.CLUBS ? theme.colors.primary : theme.colors.silver}>Klubblag</EmphasisTypography>
        </TeamTypeSelectorButton>
        <TeamTypeSelectorButton 
          isSelected={teamType === TeamType.NATIONS}
          onClick={() => setTeamType(TeamType.NATIONS)}
        >
          <EmphasisTypography variant='m' color={teamType === TeamType.NATIONS ? theme.colors.primary : theme.colors.silver}>Landslag</EmphasisTypography>
        </TeamTypeSelectorButton>
      </Section>
      <Section flexDirection='row' gap='l' alignItems='center'>
        <Section gap='xxs'>
          <EmphasisTypography variant='s'>Hemmalag</EmphasisTypography>
          <Select
            options={[]}
            optionGroups={getOptionGroups()}
            value={newFixtureHomeTeam?.name ?? 'Välj lag'}
            onChange={(value) => handleSelectTeam(getTeamByName(value), true)}
            fullWidth
          />
        </Section>
        <VersusTypography>
          <NormalTypography variant='m'>vs</NormalTypography>
        </VersusTypography>
        <Section gap='xxs'>
          <EmphasisTypography variant='s'>Bortalag</EmphasisTypography>
          <Select
            options={[]}
            optionGroups={getOptionGroups()}
            value={newFixtureAwayTeam?.name ?? 'Välj lag'}
            onChange={(value) => handleSelectTeam(getTeamByName(value), false)}
            fullWidth
          />
        </Section>
      </Section>
      <Section gap='l' flexDirection='row' alignItems='center'>
        <Input
          label='Arena'
          value={newFixtureStadium}
          onChange={(e) => setNewFixtureStadium(e.currentTarget.value)}
          fullWidth
        />
        <Input
          label='Turnering'
          name='tournament'
          value={newFixtureTournament}
          onChange={(e) => setNewFixtureTournament(e.currentTarget.value)}
          fullWidth
        />
        <CustomDatePicker
          label='Avsparkstid'
          selectedDate={newFixtureKickoffDateTime}
          onChange={(date) => handleUpdateKickoffTime(date!)}
          fullWidth
        />
      </Section>
      <Checkbox
        label='Ska målskytt i matchen tippas?'
        checked={newFixtureShouldPredictGoalScorer}
        onChange={() => setNewFixtureShouldPredictGoalScorer(!newFixtureShouldPredictGoalScorer)}
      />
      {newFixtureShouldPredictGoalScorer && newFixtureHomeTeam && newFixtureAwayTeam && (
        <Section gap='xxs'>
          <EmphasisTypography variant='s'>Vilket lag ska målskytten tillhöra?</EmphasisTypography>
          <Select
            options={[
              { value: 'Välj lag', label: 'Välj lag' },
              { value: newFixtureHomeTeam.name, label: newFixtureHomeTeam.name },
              { value: newFixtureAwayTeam.name, label: newFixtureAwayTeam.name },
              { value: 'Båda lagen', label: 'Båda lagen'}
            ]}
            value={newFixtureGoalScorerTeam ? newFixtureGoalScorerTeam[0] : 'Välj lag'}
            onChange={(value) => handleSetGoalScrorerTeam(value)}
          />
        </Section>
      )}
      <Section flexDirection='row' alignItems='center' gap='xxs'>
        <Button size='m' onClick={handleAddFixtureToGameWeek} icon={<PlusCircle size={20} color={theme.colors.white} />} disabled={isAddFixtureButtonDisabled}>
          Lägg till match
        </Button>
        <TextButton color="red" onClick={handleResetNewFixture}>
          Nollställ matchinfo
        </TextButton>
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
      <Section flexDirection='row' justifyContent='space-between' alignItems='center'>
        <HeadingsTypography variant='h4'>Skapa ny omgång</HeadingsTypography>
        <Section
          backgroundColor={theme.colors.primaryFade}
          padding={theme.spacing.xxs}
          borderRadius={theme.borderRadius.s}
          fitContent
          >
          <EmphasisTypography variant='m' color={theme.colors.primaryDark}>Omgång {getNewGameWeekRoundNumber()}</EmphasisTypography>
        </Section>
      </Section>
      <Divider />
      <Section flexDirection='row' alignItems='center' gap='l'>
        <CustomDatePicker
          label='Startdatum (kan tippas fr.o.m.)'
          selectedDate={newGameWeekStartDate}
          onChange={(date) => setNewGameWeekStartDate(date!)}
          fullWidth
        />
        <CustomDatePicker
          label='Deadline att tippa'
          selectedDate={newGameWeekDeadline}
          onChange={(date) => setNewGameWeekDeadline(date!)}
          fullWidth
        />
      </Section>
      <Divider />
      <Section gap='s'>
        <HeadingsTypography variant='h5'>Matcher</HeadingsTypography>
        {newGameWeekFixtures.length > 0 && (
          newGameWeekFixtures.map((fixture, index) => (
            <Section flexDirection='row' gap='s' key={index} alignItems='center'>
              <NormalTypography variant='m'>{fixture.homeTeam.name} - {fixture.awayTeam.name}</NormalTypography>
              <Button 
                color="red"
                size='s' 
                icon={<XCircle size={16} color={theme.colors.white} />} 
                onClick={() => setNewGameWeekFixtures(newGameWeekFixtures.filter((_, i) => i !== index))}
              >
                Ta bort
              </Button>
            </Section>
          ))
        )}
        {addFixtureViewOpen ? getAddNewFixtureContent() : (
          <CreateFixtureCard onClick={() => setAddFixtureViewOpen(true)}>
            <PlusCircle size={32} color={theme.colors.textDefault} />
            <NormalTypography variant='l'>Lägg till match</NormalTypography>
          </CreateFixtureCard>
        )}
      </Section>
      <Divider />
      {createGameWeekError && (
        <NormalTypography variant='m' color={theme.colors.red}>
          {createGameWeekError}
        </NormalTypography>
      )}
      <Section flexDirection='row' gap='xs'>
        <Button variant='secondary' onClick={() => setShowCreateGameWeekSection(false)}>
          Avbryt
        </Button>
        <Button variant='primary' onClick={handleCreateGameWeek} disabled={addFixtureViewOpen || createGameWeekLoading} loading={createGameWeekLoading}>
          Skapa omgång
        </Button>
      </Section>
    </CreateGameWeekSection>
  );

  const getCorrectGameWeekContent = () => {
    if (!ongoingGameWeek) return;

    return (
      <>
        <Section gap='xxs'>
          {ongoingGameWeek.games.fixtures.map((fixture) => (
            <FixturePreview 
              fixture={fixture}
              hasBeenCorrected={ongoingGameWeek.hasBeenCorrected}
              onShowPredictionsClick={() => setShowPredictionsModalFixtureId(fixture.id)}
            />
          ))}
        </Section>
        {showPredictionsModalFixtureId && (
          <PredictionsModal
            onClose={() => setShowPredictionsModalFixtureId(null)}
            gameId={showPredictionsModalFixtureId}
            league={league}
            ongoingGameWeek={ongoingGameWeek}
          />
        )}
      </>
    )
  }
  
  return (
    <Section gap='m'>
      {isCreator && !showCreateGameWeekSection && (
        <Section flexDirection='row' gap='s'>
          <Button 
            color="primary"
            size='m' 
            icon={<PlusCircle size={20} color={theme.colors.white} />} 
            onClick={isCreator || hasAdminRights ? () => setShowCreateGameWeekSection(!showCreateGameWeekSection) : () => {}}
          >
            Skapa ny omgång
          </Button>
        </Section>
      )}
      {showCreateGameWeekSection && getCreateGameWeekContent()}
      {ongoingGameWeek && (
        <Section 
          backgroundColor={theme.colors.white} 
          borderRadius={theme.borderRadius.l}
          padding={theme.spacing.m}
          gap='s'
        >
          <Section flexDirection='row' justifyContent='space-between' alignItems='center'>
            <HeadingsTypography variant='h4'>Pågående omgång</HeadingsTypography>
            <Section flexDirection='row' alignItems='center' gap='s' fitContent>
              <NormalTypography variant='m' color={theme.colors.textLight}>{getGameWeekPredictionStatusText()}</NormalTypography>
              <Section
                backgroundColor={theme.colors.primaryFade}
                padding={theme.spacing.xxs}
                borderRadius={theme.borderRadius.s}
                fitContent
              >
                <EmphasisTypography variant='m' color={theme.colors.primaryDark}>Omgång {ongoingGameWeek.round}</EmphasisTypography>
              </Section>
              {(isCreator || hasAdminRights) && (
                <>
                  <IconButton 
                    icon={<PencilSimple size={24} />} 
                    colors={{ normal: theme.colors.primary, hover: theme.colors.primaryDark, active: theme.colors.primaryDarker }}
                    onClick={() => setEditGameWeekViewOpen(true)}
                  />
                  {new Date(ongoingGameWeek.deadline) < new Date() && (
                    <IconButton 
                      icon={<CheckSquareOffset size={24} />} 
                      colors={{ normal: theme.colors.primary, hover: theme.colors.primaryDark, active: theme.colors.primaryDarker }}
                      onClick={() => setShowCorrectGameWeekContent(true)}
                    />
                  )}
                </>
              )}
            </Section>
          </Section>
          {getOngoingGameWeekContent()}
        </Section>
      )}
      <Section 
        backgroundColor={theme.colors.white} 
        borderRadius={theme.borderRadius.l}
        padding={theme.spacing.m}
        gap='s'
      >
        <HeadingsTypography variant='h4'>Nästa omgång</HeadingsTypography>
        {upcomingGameWeek ? (
          <>
            <NormalTypography variant='m' color={theme.colors.textLight}>Startdatum: {upcomingGameWeek.startDate.toString()}</NormalTypography>
            <NormalTypography variant='m' color={theme.colors.textLight}>Deadline: {upcomingGameWeek.deadline.toString()}</NormalTypography>
            <NormalTypography variant='m' color={theme.colors.textLight}>Antal matcher: {upcomingGameWeek.games.fixtures.length}</NormalTypography>
          </>
        ) : (
          <NormalTypography variant='m' color={theme.colors.textLight}>Ingen kommande omgång</NormalTypography>
        )}
      </Section>
      <Section 
        backgroundColor={theme.colors.white} 
        borderRadius={theme.borderRadius.l}
        padding={theme.spacing.m}
        gap='s'
      >
        <HeadingsTypography variant='h4'>Föregående omgångar</HeadingsTypography>
        {previousGameWeeks && previousGameWeeks.length > 0 ? (
          <>
            {previousGameWeeks.sort((a, b) => b.round - a.round).map((gameWeek) => (
              <Section key={gameWeek.round} gap='s' backgroundColor={theme.colors.silverLighter} borderRadius={theme.borderRadius.m}>
                <Section justifyContent='space-between' alignItems='center' flexDirection='row' padding={`${theme.spacing.s} ${theme.spacing.s} 0 ${theme.spacing.s}`}>
                  <HeadingsTypography variant='h6' color={theme.colors.primaryDark}>Omgång {gameWeek.round}</HeadingsTypography>
                  <Section flexDirection='row' gap='s' alignItems='center' fitContent>
                    <NormalTypography variant='m' color={theme.colors.textLight}>{new Date(gameWeek.deadline).toLocaleDateString()}</NormalTypography>
                    <RoundPointsContainer>
                      <EmphasisTypography variant='m' color={theme.colors.gold}>
                        {gameWeek.games.predictions.filter((p) => p.userId === user?.documentId).reduce((acc, curr) => acc + (curr.points?.total ?? 0), 0)} poäng
                      </EmphasisTypography>
                    </RoundPointsContainer>
                  </Section>
                </Section>
                <Divider color={theme.colors.silver} />
                <Section gap='xxs' padding={`0 ${theme.spacing.s} ${theme.spacing.s} ${theme.spacing.s}`}>
                  {gameWeek.games.fixtures.map((fixture) => (
                    <FixtureResultPreview 
                      fixture={fixture}
                      predictions={gameWeek.games.predictions.filter((prediction) => prediction.fixtureId === fixture.id)}
                      compact={false}
                    />
                  ))}
                </Section>
              </Section>
            ))}
          </>
        ) : (
          <NormalTypography variant='m' color={theme.colors.textLight}>Inga föregående omgångar</NormalTypography>
        )}
      </Section>
    </Section>
  )
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
  border: 2px solid ${({ isSelected }) => isSelected ? theme.colors.primary : theme.colors.silver};
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  :hover {
    border-color: ${({ isSelected }) => isSelected ? theme.colors.primary : theme.colors.primaryLight};

    ${EmphasisTypography} {
      color: ${({ isSelected }) => isSelected ? theme.colors.primary : theme.colors.primaryLight};
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
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  grid-template-rows: auto;
  gap: ${theme.spacing.m};
  width: 100%;
  box-sizing: border-box;
`;

const RoundPointsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${theme.colors.primaryDark};
  border-radius: ${theme.borderRadius.s};
  padding: ${theme.spacing.xxs} ${theme.spacing.xs};
`;

export default FixturesView;