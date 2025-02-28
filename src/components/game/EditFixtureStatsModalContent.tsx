import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { updateDoc, doc } from 'firebase/firestore';
import {
  CaretDown, Check, CheckCircle, PlusCircle, Sparkle, XCircle,
} from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import {
  Fixture, FixtureOdds, FixtureOutcomeEnum, FixturePreviewStats, FixtureResult,
  TeamType,
} from '../../utils/Fixture';
import { PredictionLeague, LeagueGameWeek } from '../../utils/League';
import Button from '../buttons/Button';
import { theme, devices } from '../../theme';
import { db } from '../../config/firebase';
import { CollectionEnum } from '../../utils/Firebase';
import { errorNotify, successNotify } from '../../utils/toast/toastHelpers';
import { Team, getTeamByName, getTeamPrimaryColorByName } from '../../utils/Team';
import { EmphasisTypography, HeadingsTypography, NormalTypography } from '../typography/Typography';
import FormIcon from '../form/FormIcon';
import Input from '../input/Input';
import SelectImitation from '../input/SelectImitation';
import { Section } from '../section/Section';
import GoalsInput from './GoalsInput';
import SelectTeamModal from './SelectTeamModal';
import IconButton from '../buttons/IconButton';
import Textarea from '../textarea/Textarea';
import TextButton from '../buttons/TextButton';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';
import ClubAvatar from '../avatar/ClubAvatar';
import NationAvatar from '../avatar/NationAvatar';
import { AvatarSize } from '../avatar/Avatar';

interface EditFixtureStatsModalContentProps {
  fixture: Fixture;
  onCloseEditView: () => void;
  onCloseModal: () => void;
  onSave?: (fixtureId: string, updatedFixtureObj: Fixture) => void;
  league: PredictionLeague;
  ongoingGameWeek: LeagueGameWeek | undefined;
  refetchLeague: () => void;
}

const EditFixtureStatsModalContent = ({
  fixture, onCloseEditView, onCloseModal, league, ongoingGameWeek, refetchLeague, onSave,
}: EditFixtureStatsModalContentProps) => {
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const [saveLoading, setSaveLoading] = useState<boolean>(false);

  // Dropdown states
  const [isFormExpanded, setIsFormExpanded] = useState<boolean>(false);
  const [isLastFixtureExpanded, setIsLastFixtureExpanded] = useState<boolean>(false);
  const [isStandingsExpanded, setIsStandingsExpanded] = useState<boolean>(false);
  const [isInsightsExpanded, setIsInsightsExpanded] = useState<boolean>(false);
  const [isOddsExpanded, setIsOddsExpanded] = useState<boolean>(false);
  const [isAggregateScoreExpanded, setIsAggregateScoreExpanded] = useState<boolean>(false);

  // Edit values
  const [editStandingsPositionValue, setEditStandingsPositionValue] = useState({
    homeTeam: fixture.previewStats?.homeTeam.standingsPosition ?? '',
    awayTeam: fixture.previewStats?.awayTeam.standingsPosition ?? '',
  });
  const [editStandingsPositionPoints, setEditStandingsPositionPoints] = useState({
    homeTeam: fixture.previewStats?.homeTeam.standingsPoints ?? '',
    awayTeam: fixture.previewStats?.awayTeam.standingsPoints ?? '',
  });
  const [editFormValue, setEditFormValue] = useState<{ homeTeam: Array<FixtureOutcomeEnum>, awayTeam: Array<FixtureOutcomeEnum> }>({
    homeTeam: fixture.previewStats?.homeTeam.form ?? [FixtureOutcomeEnum.NONE, FixtureOutcomeEnum.NONE, FixtureOutcomeEnum.NONE, FixtureOutcomeEnum.NONE, FixtureOutcomeEnum.NONE],
    awayTeam: fixture.previewStats?.awayTeam.form ?? [FixtureOutcomeEnum.NONE, FixtureOutcomeEnum.NONE, FixtureOutcomeEnum.NONE, FixtureOutcomeEnum.NONE, FixtureOutcomeEnum.NONE],
  });
  const [showEditOutcomeMenu, setShowEditOutcomeMenu] = useState<{ team: 'home' | 'away', index: number }>({ team: 'home', index: -1 });
  const [editLastFixtureOpponents, setEditLastFixtureOpponents] = useState<{ homeTeamOpponent: Team | undefined, awayTeamOpponent: Team | undefined }>({
    homeTeamOpponent: fixture.previewStats?.homeTeam.lastFixture?.opponent ? getTeamByName(fixture.previewStats?.homeTeam.lastFixture?.opponent) : undefined,
    awayTeamOpponent: fixture.previewStats?.awayTeam.lastFixture?.opponent ? getTeamByName(fixture.previewStats?.awayTeam.lastFixture?.opponent) : undefined,
  });
  const [selectLastFixtureOpponentModalOpen, setSelectLastFixtureOpponentModalOpen] = useState<'home' | 'away' | null>(null);
  const [editHomeTeamLastFixtureResult, setEditHomeTeamLastFixtureResult] = useState<FixtureResult>({
    homeTeamGoals: fixture.previewStats?.homeTeam.lastFixture?.result.homeTeamGoals ?? 0,
    awayTeamGoals: fixture.previewStats?.homeTeam.lastFixture?.result.awayTeamGoals ?? 0,
  });
  const [editAwayTeamLastFixtureResult, setEditAwayTeamLastFixtureResult] = useState<FixtureResult>({
    homeTeamGoals: fixture.previewStats?.awayTeam.lastFixture?.result.homeTeamGoals ?? 0,
    awayTeamGoals: fixture.previewStats?.awayTeam.lastFixture?.result.awayTeamGoals ?? 0,
  });
  const [homeTeamLastFixtureOutcome, setHomeTeamLastFixtureOutcome] = useState<FixtureOutcomeEnum>(fixture.previewStats?.homeTeam.lastFixture?.outcome ?? FixtureOutcomeEnum.NONE);
  const [awayTeamLastFixtureOutcome, setAwayTeamLastFixtureOutcome] = useState<FixtureOutcomeEnum>(fixture.previewStats?.awayTeam.lastFixture?.outcome ?? FixtureOutcomeEnum.NONE);
  const [odds, setOdds] = useState<FixtureOdds>({ homeWin: fixture.odds?.homeWin.toString() ?? '', draw: fixture.odds?.draw.toString() ?? '', awayWin: fixture.odds?.awayWin.toString() ?? '' });
  const [homeTeamInsights, setHomeTeamInsights] = useState<Array<string>>(fixture.previewStats?.homeTeam?.insights ?? []);
  const [awayTeamInsights, setAwayTeamInsights] = useState<Array<string>>(fixture.previewStats?.awayTeam?.insights ?? []);
  const [editHomeTeamInsightsValue, setEditHomeTeamInsightsValue] = useState<string>('');
  const [editAwayTeamInsightsValue, setEditAwayTeamInsightsValue] = useState<string>('');
  const [createNewHomeTeamInsight, setCreateNewHomeTeamInsight] = useState(false);
  const [createNewAwayTeamInsight, setCreateNewAwayTeamInsight] = useState(false);
  const [homeTeamAggregateScore, setHomeTeamAggregateScore] = useState<string>(fixture.aggregateScore?.homeTeamGoals.toString() ?? '');
  const [awayTeamAggregateScore, setAwayTeamAggregateScore] = useState<string>(fixture.aggregateScore?.awayTeamGoals.toString() ?? '');

  const [hasAutoAppliedForm, setHasAutoAppliedForm] = useState({ homeTeam: false, awayTeam: false });
  const [hasAutoAppliedLastFixture, setHasAutoAppliedLastFixture] = useState({ homeTeam: false, awayTeam: false });

  const hasAddedStandings = (editStandingsPositionValue.homeTeam !== '' && editStandingsPositionPoints.homeTeam !== '') || (editStandingsPositionValue.awayTeam !== '' && editStandingsPositionPoints.awayTeam !== '');
  const hasAddedLastFixture = editLastFixtureOpponents.homeTeamOpponent !== undefined || editLastFixtureOpponents.awayTeamOpponent !== undefined;
  const hasAddedLastFixtureForHomeTeam = editLastFixtureOpponents.homeTeamOpponent !== undefined && homeTeamLastFixtureOutcome !== FixtureOutcomeEnum.NONE;
  const hasAddedLastFixtureForAwayTeam = editLastFixtureOpponents.awayTeamOpponent !== undefined && awayTeamLastFixtureOutcome !== FixtureOutcomeEnum.NONE;
  const hasAddedOdds = odds.homeWin !== '' || odds.draw !== '' || odds.awayWin !== '';
  const hasAddedInsights = homeTeamInsights.length > 0 || awayTeamInsights.length > 0;
  const hasAddedAggregateScore = homeTeamAggregateScore !== '' && awayTeamAggregateScore !== '';

  const handleSaveStats = async () => {
    if (!ongoingGameWeek) return;

    setSaveLoading(true);

    const previewStats: FixturePreviewStats = {
      homeTeam: {
        form: editFormValue.homeTeam,
        ...(hasAddedStandings && { standingsPosition: editStandingsPositionValue.homeTeam }),
        ...(hasAddedStandings && { standingsPoints: editStandingsPositionPoints.homeTeam }),
        ...(hasAddedInsights && homeTeamInsights.length > 0 && { insights: homeTeamInsights }),
        ...(hasAddedLastFixtureForHomeTeam && {
          lastFixture: {
            opponent: editLastFixtureOpponents.homeTeamOpponent?.name ?? '',
            result: editHomeTeamLastFixtureResult,
            outcome: homeTeamLastFixtureOutcome,
          },
        }),
      },
      lastUpdated: new Date().toISOString(),
      awayTeam: {
        form: editFormValue.awayTeam,
        ...(hasAddedStandings && { standingsPosition: editStandingsPositionValue.awayTeam }),
        ...(hasAddedStandings && { standingsPoints: editStandingsPositionPoints.awayTeam }),
        ...(hasAddedInsights && awayTeamInsights.length > 0 && { insights: awayTeamInsights }),
        ...(hasAddedLastFixtureForAwayTeam && {
          lastFixture: {
            opponent: editLastFixtureOpponents.awayTeamOpponent?.name ?? '',
            result: editAwayTeamLastFixtureResult,
            outcome: awayTeamLastFixtureOutcome,
          },
        }),
      },
    };

    const updatedFixture: Fixture = {
      ...fixture,
      previewStats,
      ...(hasAddedOdds && { odds }),
      ...(hasAddedAggregateScore && { aggregateScore: { homeTeamGoals: parseInt(homeTeamAggregateScore), awayTeamGoals: parseInt(awayTeamAggregateScore) } }),
    };

    if (onSave) {
      onSave(fixture.id, updatedFixture);
      setSaveLoading(false);
      onCloseEditView();
      onCloseModal();
      return;
    }

    const updatedGameWeek: LeagueGameWeek = {
      ...ongoingGameWeek,
      games: {
        ...ongoingGameWeek.games,
        fixtures: ongoingGameWeek.games.fixtures.map((fixture) => {
          if (fixture.id === updatedFixture.id) {
            return updatedFixture;
          }
          return fixture;
        }),
      },
    };

    const updatedGameWeeks = league.gameWeeks?.map((week) => {
      if (week.round === ongoingGameWeek.round) {
        return updatedGameWeek;
      }
      return week;
    });

    try {
      await updateDoc(doc(db, CollectionEnum.LEAGUES, league.documentId), {
        gameWeeks: updatedGameWeeks,
      });
      refetchLeague();
      onCloseEditView();
      onCloseModal();
      successNotify('Statistiken har sparats');
    } catch (error) {
      errorNotify('Något gick fel när statistiken skulle sparas');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSelectOpponent = (team: Team) => {
    setEditLastFixtureOpponents((oldstate) => {
      if (selectLastFixtureOpponentModalOpen === 'home') {
        return { ...oldstate, homeTeamOpponent: team };
      }
      return { ...oldstate, awayTeamOpponent: team };
    });
  };

  const handleUpdateLastFixtureGoalsInput = (team: 'home' | 'away', lastFixtureTeam: 'home' | 'away', value: string) => {
    const parsedValue = value === '' ? 0 : parseInt(value);

    if (team === 'home') {
      setEditHomeTeamLastFixtureResult((oldstate) => ({
        ...oldstate,
        [lastFixtureTeam === 'home' ? 'homeTeamGoals' : 'awayTeamGoals']: parsedValue,
      }));
    }

    if (team === 'away') {
      setEditAwayTeamLastFixtureResult((oldstate) => ({
        ...oldstate,
        [lastFixtureTeam === 'home' ? 'homeTeamGoals' : 'awayTeamGoals']: parsedValue,
      }));
    }
  };

  const handleAddInsight = (isHomeTeam: boolean) => {
    const insight = isHomeTeam ? editHomeTeamInsightsValue : editAwayTeamInsightsValue;

    if (isHomeTeam) {
      setHomeTeamInsights((oldstate) => [...oldstate, insight]);
      setEditHomeTeamInsightsValue('');
      setCreateNewHomeTeamInsight(false);
    } else {
      setAwayTeamInsights((oldstate) => [...oldstate, insight]);
      setEditAwayTeamInsightsValue('');
      setCreateNewAwayTeamInsight(false);
    }
  };

  const getAvatar = (team: Team) => (fixture.teamType === TeamType.CLUBS ? (
    <ClubAvatar
      logoUrl={team.logoUrl}
      clubName={team.name}
      size={isMobile ? AvatarSize.S : AvatarSize.M}
    />
  ) : (
    <NationAvatar
      flagUrl={team.logoUrl}
      nationName={team.name}
      size={isMobile ? AvatarSize.S : AvatarSize.M}
    />
  ));

  const applyAutomaticFormValues = (isHomeTeam: boolean): void => {
    if (!league.gameWeeks || !ongoingGameWeek || league.gameWeeks.length < 2) return;

    const previousGameWeek = league.gameWeeks.find((gameWeek) => gameWeek.round === ongoingGameWeek.round - 1);
    if (!previousGameWeek) return;

    const { homeTeam, awayTeam } = fixture;

    const findPreviousFixture = (teamName: string) => previousGameWeek.games.fixtures.find(
      (fixture) => fixture.homeTeam.name === teamName || fixture.awayTeam.name === teamName,
    );

    const getFinalResult = (fixture: Fixture, teamName: string): FixtureOutcomeEnum => {
      const wasHomeTeam = fixture.homeTeam.name === teamName;
      const homeGoals = fixture.finalResult?.homeTeamGoals ?? 0;
      const awayGoals = fixture.finalResult?.awayTeamGoals ?? 0;

      if (homeGoals > awayGoals) return wasHomeTeam ? FixtureOutcomeEnum.WIN : FixtureOutcomeEnum.LOSS;
      if (homeGoals < awayGoals) return wasHomeTeam ? FixtureOutcomeEnum.LOSS : FixtureOutcomeEnum.WIN;
      return FixtureOutcomeEnum.DRAW;
    };

    const getForm = (fixture: Fixture, teamName: string): FixtureOutcomeEnum[] => {
      const wasHomeTeam = fixture.homeTeam.name === teamName;
      let form = wasHomeTeam ? fixture.previewStats?.homeTeam?.form : fixture.previewStats?.awayTeam?.form;
      if (form && form.length === 5) {
        form = form.slice(1); // Remove the first value and shift the other values one step back
      }
      const finalResult = getFinalResult(fixture, teamName);
      form = form ? [...form, finalResult] : [finalResult];
      while (form.length < 5) {
        form.unshift(FixtureOutcomeEnum.NONE); // Fill remaining slots with FixtureOutcomeEnum.NONE
      }
      return form;
    };

    const applyFormValues = (team: Team, setForm: (form: FixtureOutcomeEnum[]) => void) => {
      const teamFixture = findPreviousFixture(team.name);
      if (teamFixture) {
        const form = getForm(teamFixture, team.name);
        setForm(form);
      }
    };

    if (isHomeTeam) {
      applyFormValues(homeTeam, (form) => setEditFormValue((prevState) => ({ ...prevState, homeTeam: form })));
      setHasAutoAppliedForm({ ...hasAutoAppliedForm, homeTeam: true });
    } else {
      applyFormValues(awayTeam, (form) => setEditFormValue((prevState) => ({ ...prevState, awayTeam: form })));
      setHasAutoAppliedForm({ ...hasAutoAppliedForm, awayTeam: true });
    }
  };

  const getHasPreviousGameWeekFormValues = (isHomeTeam: boolean) => {
    if (!league.gameWeeks || !ongoingGameWeek || league.gameWeeks.length < 2) return false;

    const previousGameWeek = league.gameWeeks.find((gameWeek) => gameWeek.round === ongoingGameWeek.round - 1);
    if (!previousGameWeek) return false;

    const { homeTeam, awayTeam } = fixture;

    const findPreviousFixture = (teamName: string) => previousGameWeek.games.fixtures.find(
      (fixture) => fixture.homeTeam.name === teamName || fixture.awayTeam.name === teamName,
    );

    const homeTeamFixture = findPreviousFixture(homeTeam.name);
    const awayTeamFixture = findPreviousFixture(awayTeam.name);

    return isHomeTeam ? Boolean(homeTeamFixture) : Boolean(awayTeamFixture);
  };

  const getClickableFormIcon = (outcome: FixtureOutcomeEnum, index: number, isHomeTeam: boolean) => (
    <FormIcon
      key={outcome}
      outcome={outcome}
      onClick={() => setEditFormValue((oldstate) => {
        const newForm = isHomeTeam ? [...oldstate.homeTeam] : [...oldstate.awayTeam];
        newForm[index] = outcome;
        setShowEditOutcomeMenu({ team: isHomeTeam ? 'home' : 'away', index: -1 });
        const newFormObj = isHomeTeam ? { ...oldstate, homeTeam: newForm } : { ...oldstate, awayTeam: newForm };
        return newFormObj;
      })}
    />
  );

  const getTeamForm = (isHomeTeam: boolean) => {
    const teamForm = isHomeTeam ? editFormValue.homeTeam : editFormValue.awayTeam;

    return teamForm.map((outcome, index) => (
      <FormIconContainer key={`${index}-${outcome}`}>
        {showEditOutcomeMenu.team === (isHomeTeam ? 'home' : 'away') && showEditOutcomeMenu.index === index && (
          <SelectOutcomeMenu isVeryLeftItem={index === 0 && isHomeTeam}>
            {Object.values(FixtureOutcomeEnum).map((outcome) => getClickableFormIcon(outcome, index, isHomeTeam))}
          </SelectOutcomeMenu>
        )}
        <FormIcon
          outcome={outcome as FixtureOutcomeEnum}
          onClick={() => {
            if (showEditOutcomeMenu.team === (isHomeTeam ? 'home' : 'away') && showEditOutcomeMenu.index === index) {
              setShowEditOutcomeMenu({ team: isHomeTeam ? 'home' : 'away', index: -1 });
            } else {
              setShowEditOutcomeMenu({ team: isHomeTeam ? 'home' : 'away', index });
            }
          }}
        />
      </FormIconContainer>
    ));
  };

  const getStandingsInputs = (isHomeTeam: boolean) => (
    <StandingsInputsRow>
      <Input
        type="number"
        label="Placering"
        value={isHomeTeam ? editStandingsPositionValue.homeTeam : editStandingsPositionValue.awayTeam}
        onChange={(e) => {
          if (isHomeTeam) {
            setEditStandingsPositionValue({ ...editStandingsPositionValue, homeTeam: e.currentTarget.value });
          } else {
            setEditStandingsPositionValue({ ...editStandingsPositionValue, awayTeam: e.currentTarget.value });
          }
        }}
        noBorder
        placeholder="Placering"
        fullWidth
      />
      <Input
        type="number"
        label="Poäng"
        value={isHomeTeam ? editStandingsPositionPoints.homeTeam : editStandingsPositionPoints.awayTeam}
        onChange={(e) => {
          if (isHomeTeam) {
            setEditStandingsPositionPoints({ ...editStandingsPositionPoints, homeTeam: e.currentTarget.value });
          } else {
            setEditStandingsPositionPoints({ ...editStandingsPositionPoints, awayTeam: e.currentTarget.value });
          }
        }}
        noBorder
        placeholder="Poäng"
        fullWidth
      />
    </StandingsInputsRow>
  );

  const getHasLastGameWeekFixture = (isHomeTeam: boolean) => {
    if (!league.gameWeeks || !ongoingGameWeek || league.gameWeeks.length < 2) return false;

    const previousGameWeek = league.gameWeeks.find((gameWeek) => gameWeek.round === ongoingGameWeek.round - 1);
    if (!previousGameWeek) return false;

    const { homeTeam, awayTeam } = fixture;

    const findPreviousFixture = (teamName: string) => previousGameWeek.games.fixtures.find(
      (fixture) => fixture.homeTeam.name === teamName || fixture.awayTeam.name === teamName,
    );

    const homeTeamFixture = findPreviousFixture(homeTeam.name);
    const awayTeamFixture = findPreviousFixture(awayTeam.name);

    return isHomeTeam ? Boolean(homeTeamFixture) : Boolean(awayTeamFixture);
  };

  const applyAutomaticLastFixtureValues = (isHomeTeam: boolean) => {
    if (!league.gameWeeks || !ongoingGameWeek || league.gameWeeks.length < 2) return;

    const previousGameWeek = league.gameWeeks.find((gameWeek) => gameWeek.round === ongoingGameWeek.round - 1);
    if (!previousGameWeek) return;

    const { homeTeam, awayTeam } = fixture;

    const findPreviousFixture = (teamName: string) => previousGameWeek.games.fixtures.find(
      (fixture) => fixture.homeTeam.name === teamName || fixture.awayTeam.name === teamName,
    );

    const getFinalResult = (fixture: Fixture, teamName: string): FixtureOutcomeEnum => {
      const wasHomeTeam = fixture.homeTeam.name === teamName;
      const homeGoals = fixture.finalResult?.homeTeamGoals ?? 0;
      const awayGoals = fixture.finalResult?.awayTeamGoals ?? 0;

      if (homeGoals > awayGoals) return wasHomeTeam ? FixtureOutcomeEnum.WIN : FixtureOutcomeEnum.LOSS;
      if (homeGoals < awayGoals) return wasHomeTeam ? FixtureOutcomeEnum.LOSS : FixtureOutcomeEnum.WIN;
      return FixtureOutcomeEnum.DRAW;
    };

    const applyFixtureValues = (team: Team, setOpponent: (opponent: Team) => void, setResult: (result: { homeTeamGoals: number, awayTeamGoals: number }) => void, setOutcome: (outcome: FixtureOutcomeEnum) => void) => {
      const teamFixture = findPreviousFixture(team.name);
      if (teamFixture) {
        const opponentTeam = teamFixture.homeTeam.name === team.name ? teamFixture.awayTeam : teamFixture.homeTeam;
        const opponent = getTeamByName(opponentTeam.name)!;
        setOpponent(opponent);
        setResult({
          homeTeamGoals: teamFixture.finalResult?.homeTeamGoals ?? 0,
          awayTeamGoals: teamFixture.finalResult?.awayTeamGoals ?? 0,
        });
        setOutcome(getFinalResult(teamFixture, team.name));
      }
    };

    if (isHomeTeam) {
      applyFixtureValues(
        homeTeam,
        (opponent) => setEditLastFixtureOpponents((oldstate) => ({ ...oldstate, homeTeamOpponent: opponent })),
        setEditHomeTeamLastFixtureResult,
        setHomeTeamLastFixtureOutcome,
      );
      setHasAutoAppliedLastFixture({ ...hasAutoAppliedLastFixture, homeTeam: true });
    } else {
      applyFixtureValues(
        awayTeam,
        (opponent) => setEditLastFixtureOpponents((oldstate) => ({ ...oldstate, awayTeamOpponent: opponent })),
        setEditAwayTeamLastFixtureResult,
        setAwayTeamLastFixtureOutcome,
      );
      setHasAutoAppliedLastFixture({ ...hasAutoAppliedLastFixture, awayTeam: true });
    }
  };

  const getLastFixture = (isHomeTeam: boolean) => {
    const opponent = isHomeTeam ? editLastFixtureOpponents.homeTeamOpponent : editLastFixtureOpponents.awayTeamOpponent;
    const result = isHomeTeam ? editHomeTeamLastFixtureResult : editAwayTeamLastFixtureResult;
    const outcome = isHomeTeam ? homeTeamLastFixtureOutcome : awayTeamLastFixtureOutcome;
    const setOutcome = isHomeTeam ? setHomeTeamLastFixtureOutcome : setAwayTeamLastFixtureOutcome;

    const handleUpdateGoalsInput = (lastFixtureTeam: 'home' | 'away', value: string) => {
      handleUpdateLastFixtureGoalsInput(isHomeTeam ? 'home' : 'away', lastFixtureTeam, value);
    };

    const getGoalsSection = () => (
      <Section gap="xxs" fitContent>
        <EmphasisTypography variant="s">Resultat</EmphasisTypography>
        <Section flexDirection="row" gap="xxs" alignItems="center">
          <GoalsInput
            goals={result.homeTeamGoals.toString()}
            onInputChange={(value) => handleUpdateGoalsInput('home', value)}
          />
          <NormalTypography variant="s">–</NormalTypography>
          <GoalsInput
            goals={result.awayTeamGoals.toString()}
            onInputChange={(value) => handleUpdateGoalsInput('away', value)}
          />
        </Section>
      </Section>
    );

    const getOutcomeSection = () => (
      <Section gap="xxs" fitContent>
        <EmphasisTypography variant="s">Utfall</EmphasisTypography>
        <Section flexDirection="row" gap="xxs" alignItems="flex-start">
          {Object.values(FixtureOutcomeEnum).map((outcomeValue) => (
            <Section gap="xxs" fitContent justifyContent="flex-start" key={outcomeValue}>
              <FormIcon
                outcome={outcomeValue}
                onClick={() => setOutcome(outcomeValue)}
              />
              {outcomeValue === outcome && (
                <Check size={16} color={theme.colors.primary} weight="bold" />
              )}
            </Section>
          ))}
        </Section>
      </Section>
    );

    return (
      <LastFixtureContainer>
        <SelectImitation
          value={opponent?.name ?? ''}
          placeholder="Välj motståndare"
          onClick={() => setSelectLastFixtureOpponentModalOpen(isHomeTeam ? 'home' : 'away')}
          fullWidth
          compact
          borderless
        />
        <LastFixtureResultAndOutcome>
          {getGoalsSection()}
          {getOutcomeSection()}
        </LastFixtureResultAndOutcome>
      </LastFixtureContainer>
    );
  };

  const getInsights = (isHomeTeam: boolean) => {
    const insights = isHomeTeam ? homeTeamInsights : awayTeamInsights;
    const team = isHomeTeam ? fixture.homeTeam : fixture.awayTeam;
    const setInsights = isHomeTeam ? setHomeTeamInsights : setAwayTeamInsights;

    return insights.map((insight, index) => (
      <InsightCard key={index}>
        <InsightCardColorStripe color={getTeamPrimaryColorByName(team.name)} />
        <NormalTypography variant="s">{insight}</NormalTypography>
        <IconButton
          icon={<XCircle size={20} weight="fill" />}
          colors={{ normal: theme.colors.red }}
          onClick={() => setInsights((oldstate) => oldstate.filter((i) => i !== insight))}
        />
      </InsightCard>
    ));
  };

  const getAddInsightBlock = (isHomeTeam: boolean) => {
    const team = isHomeTeam ? fixture.homeTeam : fixture.awayTeam;
    const isCreatingNewInsight = isHomeTeam ? createNewHomeTeamInsight : createNewAwayTeamInsight;
    const newInsightValue = isHomeTeam ? editHomeTeamInsightsValue : editAwayTeamInsightsValue;
    const setEditInsightValue = isHomeTeam ? setEditHomeTeamInsightsValue : setEditAwayTeamInsightsValue;
    const setCreateNewInsight = isHomeTeam ? setCreateNewHomeTeamInsight : setCreateNewAwayTeamInsight;

    return isCreatingNewInsight ? (
      <>
        <InsightCard isEditing>
          <InsightCardColorStripe color={getTeamPrimaryColorByName(team.name)} />
          <Textarea
            value={newInsightValue}
            onChange={(e) => setEditInsightValue(e.currentTarget.value)}
            placeholder="Skriv..."
            fullWidth
            noBorder
            customPadding={`${theme.spacing.xxxs} 0`}
            customHeight="50px"
            backgroundColor={theme.colors.silverBleach}
          />
        </InsightCard>
        <TextButton noPadding onClick={() => handleAddInsight(isHomeTeam)}>
          Lägg till
        </TextButton>
      </>
    ) : (
      <AddInsightBlock
        whileHover={{ scale: 1.02, backgroundColor: theme.colors.silverLight }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setCreateNewInsight(true)}
      >
        <PlusCircle size={24} color={theme.colors.textDefault} />
        <NormalTypography variant="m">Lägg till</NormalTypography>
      </AddInsightBlock>
    );
  };

  const getOddsInputs = () => (
    <>
      <Input
        type="text"
        label={isMobile ? '1' : undefined}
        value={odds.homeWin}
        onChange={(e) => setOdds({ ...odds, homeWin: e.currentTarget.value })}
        noBorder
        placeholder="1"
        fullWidth
        textAlign="center"
      />
      <Input
        type="text"
        label={isMobile ? 'X' : undefined}
        value={odds.draw}
        onChange={(e) => setOdds({ ...odds, draw: e.currentTarget.value })}
        noBorder
        placeholder="X"
        fullWidth
        textAlign="center"
      />
      <Input
        type="text"
        label={isMobile ? '2' : undefined}
        value={odds.awayWin}
        onChange={(e) => setOdds({ ...odds, awayWin: e.currentTarget.value })}
        noBorder
        placeholder="2"
        fullWidth
        textAlign="center"
      />
    </>
  );

  return (
    <>
      <ModalContent>
        <DropdownsContainer>
          <Dropdown isExpanded={isFormExpanded}>
            <DropdownHeader onClick={() => setIsFormExpanded(!isFormExpanded)}>
              <CheckCircle size={24} color={theme.colors.primary} weight="fill" />
              <EmphasisTypography>Form</EmphasisTypography>
              <RotatingIcon isExpanded={isFormExpanded}>
                <CaretDown size={20} color={theme.colors.textDefault} />
              </RotatingIcon>
            </DropdownHeader>
            <DropdownContent>
              <TeamColumn>
                <HeadingsTypography variant="h6">{fixture.homeTeam.name}</HeadingsTypography>
                <FormIcons>
                  {getTeamForm(true)}
                </FormIcons>
                {getHasPreviousGameWeekFormValues(true) && !hasAutoAppliedForm.homeTeam && (
                  <TextButton onClick={() => applyAutomaticFormValues(true)} noPadding endIcon={<Sparkle size={16} color={theme.colors.primary} weight="fill" />}>
                    Lägg till automatiskt
                  </TextButton>
                )}
              </TeamColumn>
              <TeamColumn>
                <HeadingsTypography variant="h6">{fixture.awayTeam.name}</HeadingsTypography>
                <FormIcons>
                  {getTeamForm(false)}
                </FormIcons>
                {getHasPreviousGameWeekFormValues(false) && !hasAutoAppliedForm.awayTeam && (
                  <TextButton onClick={() => applyAutomaticFormValues(false)} noPadding endIcon={<Sparkle size={16} color={theme.colors.primary} weight="fill" />}>
                    Lägg till automatiskt
                  </TextButton>
                )}
              </TeamColumn>
            </DropdownContent>
          </Dropdown>
          <Dropdown isExpanded={isStandingsExpanded}>
            <DropdownHeader onClick={() => setIsStandingsExpanded(!isStandingsExpanded)}>
              {hasAddedStandings && <CheckCircle size={24} color={theme.colors.primary} weight="fill" />}
              <EmphasisTypography>Tabellplacering</EmphasisTypography>
              <RotatingIcon isExpanded={isStandingsExpanded}>
                <CaretDown size={20} color={theme.colors.textDefault} />
              </RotatingIcon>
            </DropdownHeader>
            <DropdownContent>
              <TeamColumn>
                <HeadingsTypography variant="h6">{fixture.homeTeam.name}</HeadingsTypography>
                {getStandingsInputs(true)}
              </TeamColumn>
              <TeamColumn>
                <HeadingsTypography variant="h6">{fixture.awayTeam.name}</HeadingsTypography>
                {getStandingsInputs(false)}
              </TeamColumn>
            </DropdownContent>
          </Dropdown>
          <Dropdown isExpanded={isLastFixtureExpanded}>
            <DropdownHeader onClick={() => setIsLastFixtureExpanded(!isLastFixtureExpanded)}>
              {hasAddedLastFixture && <CheckCircle size={24} color={theme.colors.primary} weight="fill" />}
              <EmphasisTypography>Senaste matchen</EmphasisTypography>
              <RotatingIcon isExpanded={isLastFixtureExpanded}>
                <CaretDown size={20} color={theme.colors.textDefault} />
              </RotatingIcon>
            </DropdownHeader>
            <DropdownContent>
              <TeamColumn>
                <HeadingsTypography variant="h6">{fixture.homeTeam.name}</HeadingsTypography>
                {getLastFixture(true)}
                {getHasLastGameWeekFixture(true) && !hasAutoAppliedLastFixture.homeTeam && (
                  <TextButton onClick={() => applyAutomaticLastFixtureValues(true)} noPadding endIcon={<Sparkle size={16} color={theme.colors.primary} weight="fill" />}>
                    Lägg till automatiskt
                  </TextButton>
                )}
              </TeamColumn>
              <TeamColumn>
                <HeadingsTypography variant="h6">{fixture.awayTeam.name}</HeadingsTypography>
                {getLastFixture(false)}
                {getHasLastGameWeekFixture(false) && !hasAutoAppliedLastFixture.awayTeam && (
                  <TextButton onClick={() => applyAutomaticLastFixtureValues(false)} noPadding endIcon={<Sparkle size={16} color={theme.colors.primary} weight="fill" />}>
                    Lägg till automatiskt
                  </TextButton>
                )}
              </TeamColumn>
            </DropdownContent>
          </Dropdown>
          <Dropdown isExpanded={isInsightsExpanded}>
            <DropdownHeader onClick={() => setIsInsightsExpanded(!isInsightsExpanded)}>
              {hasAddedInsights && <CheckCircle size={24} color={theme.colors.primary} weight="fill" />}
              <EmphasisTypography>Insikter</EmphasisTypography>
              <RotatingIcon isExpanded={isInsightsExpanded}>
                <CaretDown size={20} color={theme.colors.textDefault} />
              </RotatingIcon>
            </DropdownHeader>
            <DropdownContent>
              <TeamColumn>
                <HeadingsTypography variant="h6">{fixture.homeTeam.name}</HeadingsTypography>
                <InsightsList>
                  {getAddInsightBlock(true)}
                  {getInsights(true)}
                </InsightsList>
              </TeamColumn>
              <TeamColumn>
                <HeadingsTypography variant="h6">{fixture.awayTeam.name}</HeadingsTypography>
                <InsightsList>
                  {getAddInsightBlock(false)}
                  {getInsights(false)}
                </InsightsList>
              </TeamColumn>
            </DropdownContent>
          </Dropdown>
          <Dropdown isExpanded={isOddsExpanded}>
            <DropdownHeader onClick={() => setIsOddsExpanded(!isOddsExpanded)}>
              {hasAddedOdds && <CheckCircle size={24} color={theme.colors.primary} weight="fill" />}
              <EmphasisTypography>Odds</EmphasisTypography>
              <RotatingIcon isExpanded={isOddsExpanded}>
                <CaretDown size={20} color={theme.colors.textDefault} />
              </RotatingIcon>
            </DropdownHeader>
            <DropdownContent>
              {getOddsInputs()}
            </DropdownContent>
          </Dropdown>
          <Dropdown isExpanded={isAggregateScoreExpanded}>
            <DropdownHeader onClick={() => setIsAggregateScoreExpanded(!isAggregateScoreExpanded)}>
              {hasAddedAggregateScore && <CheckCircle size={24} color={theme.colors.primary} weight="fill" />}
              <EmphasisTypography>Sammanlagt resultat</EmphasisTypography>
              <RotatingIcon isExpanded={isAggregateScoreExpanded}>
                <CaretDown size={20} color={theme.colors.textDefault} />
              </RotatingIcon>
            </DropdownHeader>
            <DropdownContent>
              <Section gap="s">
                <NormalTypography color={theme.colors.silverDarker}>Lägg till resultat från ett eventuellt första möte i utslagsrundan.</NormalTypography>
                <StandingsInputsRow>
                  {getAvatar(fixture.homeTeam)}
                  <GoalsInput
                    goals={homeTeamAggregateScore}
                    onInputChange={(value) => setHomeTeamAggregateScore(value)}
                  />
                  <NormalTypography variant="m">–</NormalTypography>
                  <GoalsInput
                    goals={awayTeamAggregateScore}
                    onInputChange={(value) => setAwayTeamAggregateScore(value)}
                  />
                  {getAvatar(fixture.awayTeam)}
                </StandingsInputsRow>
              </Section>
            </DropdownContent>
          </Dropdown>
        </DropdownsContainer>
        <ActionButtonsContainer>
          <Button
            variant="secondary"
            fullWidth
            onClick={onCloseEditView}
          >
            Avbryt
          </Button>
          <Button
            onClick={handleSaveStats}
            fullWidth
            loading={saveLoading}
            disabled={saveLoading}
          >
            Spara
          </Button>
        </ActionButtonsContainer>
      </ModalContent>
      {selectLastFixtureOpponentModalOpen && (
        <SelectTeamModal
          onClose={() => setSelectLastFixtureOpponentModalOpen(null)}
          value={selectLastFixtureOpponentModalOpen === 'home' ? editLastFixtureOpponents.homeTeamOpponent : editLastFixtureOpponents.awayTeamOpponent}
          teamType={fixture.teamType}
          onSave={(team) => handleSelectOpponent(team)}
        />
      )}
    </>
  );
};

const ModalContent = styled.div`
  display: flex;
  gap: ${theme.spacing.m};
  flex-direction: column;
  padding: ${theme.spacing.m} ${theme.spacing.m} ${theme.spacing.l} ${theme.spacing.m};
  flex-grow: 1;

  @media ${devices.tablet} {
    padding: ${theme.spacing.l} ${theme.spacing.l} ${theme.spacing.l} ${theme.spacing.l};
  }
`;

const DropdownsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  flex-grow: 1;
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.s};
`;

const Dropdown = styled.div<{ isExpanded?: boolean }>`
  display: flex;
  flex-direction: column;
  background-color: ${theme.colors.silverBleach};
  border-radius: ${theme.borderRadius.m};
  border: 1px solid ${theme.colors.silverLighter};
  width: 100%;
  box-sizing: border-box;
  transition: max-height 0.3s ease;
  overflow-y: hidden;
  max-height: ${({ isExpanded }) => (isExpanded ? '1000px' : '56px')};
  position: relative;
  z-index: 0;
`;

const DropdownHeader = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  align-items: center;
  cursor: pointer;
  padding: ${theme.spacing.s};

  ${EmphasisTypography} {
    flex: 1;
  }
`;

const RotatingIcon = styled.div<{ isExpanded?: boolean }>`
  svg {
    transform: ${({ isExpanded }) => (isExpanded ? 'rotate(-180deg)' : 'rotate(0deg)')};
    transition: transform 0.3s ease;
  }
`;

const DropdownContent = styled.div`
  display: flex;
  gap: ${theme.spacing.m};
  flex-direction: column;
  padding: ${theme.spacing.xxxs} ${theme.spacing.s} ${theme.spacing.s} ${theme.spacing.s};
  
  @media ${devices.tablet} {
    flex-direction: row;
  }
`;

const TeamColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  flex: 1;
`;

const FormIcons = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xxs};
`;

const FormIconContainer = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`;

const SelectOutcomeMenu = styled.div<{ isVeryLeftItem?: boolean }>`
  position: absolute;
  top: -44px;
  left: ${({ isVeryLeftItem }) => (isVeryLeftItem ? '0' : '50%')};
  transform: ${({ isVeryLeftItem }) => (isVeryLeftItem ? 'translateX(0)' : 'translateX(-50%)')};
  background-color: ${theme.colors.white};
  border: 1px solid ${theme.colors.silverLight};
  border-radius: ${theme.borderRadius.xs};
  padding: ${theme.spacing.xxs};
  z-index: 1;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xxxs};
`;

const StandingsInputsRow = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  align-items: center;
  width: 100%;
  box-sizing: border-box;
`;

const LastFixtureContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  width: 100%;
  box-sizing: border-box;
  background-color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.m};
  padding: ${theme.spacing.xs};
`;

const LastFixtureResultAndOutcome = styled.div`
  display: flex;
  gap: ${theme.spacing.m};
  align-items: flex-start;
  justify-content: space-between;
  
  @media ${devices.mobileL} {
    justify-content: flex-start;
  }
  
  @media ${devices.tablet} {
    justify-content: space-between;
  }
`;

const AddInsightBlock = styled(motion.div)`
  background-color: ${theme.colors.silverLight};
  padding: ${theme.spacing.xs};
  border-radius: ${theme.borderRadius.m};
  border: 1px dashed ${theme.colors.silver};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.xxs};
  width: 100%;
  cursor: pointer;
  box-sizing: border-box;
`;

const InsightCard = styled.div<{ isEditing?: boolean }>`
  background-color: ${theme.colors.silverBleach};
  position: relative;
  ${({ isEditing }) => (isEditing ? css`
    padding: 6px ${theme.spacing.xxxs} ${theme.spacing.xxxs} ${theme.spacing.s};
    ` : css`
    padding: ${theme.spacing.xxs} ${theme.spacing.xs} ${theme.spacing.xxs} ${theme.spacing.s};
  `)}
  border-radius: ${theme.borderRadius.s};
  border: 1px solid ${theme.colors.silverLight};
  box-sizing: border-box;
  width: 100%;
  display: flex;
  gap: ${theme.spacing.xxs};
  align-items: center;

  ${NormalTypography} {
    flex: 1;
  }
`;

const InsightCardColorStripe = styled.div<{ color: string }>`
  background-color: ${({ color }) => color};
  width: 6px;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  border-top-left-radius: ${theme.borderRadius.s};
  border-bottom-left-radius: ${theme.borderRadius.s};
  box-shadow: 1px 0px 4px rgba(0, 0, 0, 0.1);
`;

const InsightsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xxs};
  width: 100%;
  box-sizing: border-box;
`;

export default EditFixtureStatsModalContent;
