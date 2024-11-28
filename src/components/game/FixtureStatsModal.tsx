import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import {
  Check, PencilSimple, PlusCircle, XCircle,
} from '@phosphor-icons/react';
import { doc, updateDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import {
  Fixture, FixtureOdds, FixtureOutcomeEnum, FixturePreviewStats, FixtureResult, TeamType,
} from '../../utils/Fixture';
import Modal from '../modal/Modal';
import { EmphasisTypography, HeadingsTypography, NormalTypography } from '../typography/Typography';
import { devices, theme } from '../../theme';
import ClubAvatar from '../avatar/ClubAvatar';
import NationAvatar from '../avatar/NationAvatar';
import { AvatarSize } from '../avatar/Avatar';
import FormIcon, { getOutcomeBackgroundColor } from '../form/FormIcon';
import {
  getTeamByName, getTeamPrimaryColorByName, Team, TournamentsEnum,
} from '../../utils/Team';
import Button from '../buttons/Button';
import SelectImitation from '../input/SelectImitation';
import SelectTeamModal from './SelectTeamModal';
import { Section } from '../section/Section';
import Input from '../input/Input';
import IconButton from '../buttons/IconButton';
import GoalsInput from './GoalsInput';
import { db } from '../../config/firebase';
import { CollectionEnum } from '../../utils/Firebase';
import { LeagueGameWeek, PredictionLeague } from '../../utils/League';
import Checkbox from '../input/Checkbox';
import { errorNotify } from '../../utils/toast/toastHelpers';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';
import Textarea from '../textarea/Textarea';
import { getIsBottomOfLeague } from '../../utils/helpers';
import MockedStandingsRow from '../stats/MockedStandingsRow';
import TextButton from '../buttons/TextButton';

interface FixtureStatsModalProps {
  fixture: Fixture;
  onClose: () => void;
  isLeagueCreator?: boolean;
  league: PredictionLeague;
  ongoingGameWeek: LeagueGameWeek | undefined;
  refetchLeague: () => void;
}

const FixtureStatsModal = ({
  fixture, onClose, isLeagueCreator, league, ongoingGameWeek, refetchLeague,
}: FixtureStatsModalProps) => {
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const [isEditMode, setIsEditMode] = useState(false);
  const [selectTeamModalOpen, setSelectTeamModalOpen] = useState<'home' | 'away' | null>(null);
  const [includeLastFixture, setIncludeLastFixture] = useState<boolean>(false);
  const [includeStandings, setIncludeStandings] = useState<boolean>(false);
  const [includeInsights, setIncludeInsights] = useState<boolean>(false);
  const [includeOdds, setIncludeOdds] = useState<boolean>(false);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [mobileSelectedTeam, setMobileSelectedTeam] = useState<'home' | 'away'>('home');

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

  const canEdit = isLeagueCreator && isEditMode;
  const fixtureHasStandings = Boolean(fixture.previewStats && fixture.previewStats?.homeTeam.standingsPosition && fixture.previewStats?.awayTeam.standingsPosition && fixture.previewStats?.homeTeam.standingsPoints && fixture.previewStats?.awayTeam.standingsPoints);
  const fixtureHasForm = fixture.previewStats && fixture.previewStats?.homeTeam.form && fixture.previewStats?.awayTeam.form;
  const fixtureHasInsights = fixture.previewStats && (fixture.previewStats.homeTeam.insights || fixture.previewStats.awayTeam.insights);
  const fixtureHasOdds = fixture.odds && fixture.odds.homeWin && fixture.odds.draw && fixture.odds.awayWin;

  const handleSaveStats = async () => {
    if (!ongoingGameWeek) return;

    setSaveLoading(true);

    const previewStats: FixturePreviewStats = {
      homeTeam: {
        form: editFormValue.homeTeam,
        ...(includeStandings && { standingsPosition: editStandingsPositionValue.homeTeam }),
        ...(includeStandings && { standingsPoints: editStandingsPositionPoints.homeTeam }),
        ...(includeInsights && { insights: homeTeamInsights }),
        ...(includeLastFixture && {
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
        ...(includeStandings && { standingsPosition: editStandingsPositionValue.awayTeam }),
        ...(includeStandings && { standingsPoints: editStandingsPositionPoints.awayTeam }),
        ...(includeInsights && { insights: awayTeamInsights }),
        ...(includeLastFixture && {
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
      ...(includeOdds && { odds }),
    };

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
    } catch (error) {
      errorNotify('Något gick fel när statistiken skulle sparas');
      setSaveLoading(false);
    } finally {
      setIsEditMode(false);
      setSaveLoading(false);
      if (isMobile) {
        setMobileSelectedTeam(mobileSelectedTeam === 'home' ? 'away' : 'home');
      } else {
        onClose();
      }
    }
  };

  const handleSelectOpponent = (team: Team) => {
    setEditLastFixtureOpponents((oldstate) => {
      if (selectTeamModalOpen === 'home') {
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

  const handleSetEditMode = () => {
    const fixtureSavedWithLastFixture = Boolean(fixture.previewStats?.homeTeam.lastFixture?.opponent || fixture.previewStats?.awayTeam.lastFixture?.opponent) && Boolean(fixture.previewStats?.lastUpdated);
    const fixtureSavedWithStandings = Boolean(fixture.previewStats?.homeTeam.standingsPosition && fixture.previewStats?.awayTeam.standingsPosition && fixture.previewStats?.homeTeam.standingsPoints && fixture.previewStats?.awayTeam.standingsPoints) && Boolean(fixture.previewStats?.lastUpdated);
    const fixtureSavedWithInsights = Boolean(fixture.previewStats?.homeTeam.insights || fixture.previewStats?.awayTeam.insights);
    const fixtureSavedWithOdds = Boolean(fixture.odds?.homeWin && fixture.odds?.draw && fixture.odds?.awayWin);

    setIsEditMode(!isEditMode);
    setIncludeLastFixture(fixtureSavedWithLastFixture);
    setIncludeStandings(fixtureSavedWithStandings);
    setIncludeInsights(fixtureSavedWithInsights);
    setIncludeOdds(fixtureSavedWithOdds);
  };

  const getTeamAvatar = (isAwayTeam: boolean, customTeam?: Team, customSize?: AvatarSize) => {
    const team = customTeam || (isAwayTeam ? fixture.awayTeam : fixture.homeTeam);

    if (fixture.teamType === TeamType.CLUBS) {
      return (
        <ClubAvatar
          clubName={team.name}
          logoUrl={team.logoUrl}
          size={customSize ?? AvatarSize.M}
        />
      );
    }

    return (
      <NationAvatar
        nationName={team.name}
        flagUrl={team.logoUrl}
        size={customSize ?? AvatarSize.M}
      />
    );
  };

  const getLastFixtureResult = (isAwayTeam: boolean) => {
    let lastFixture;

    if (isAwayTeam) {
      lastFixture = fixture.previewStats?.awayTeam.lastFixture;
    } else {
      lastFixture = fixture.previewStats?.homeTeam.lastFixture;
    }

    if (!lastFixture) {
      return (
        <Section padding={`${theme.spacing.xxs} 0`} alignItems="center">
          <NormalTypography variant="s" color={theme.colors.silverDark}>Ingen match tillgänglig</NormalTypography>
        </Section>
      );
    }

    return (
      <Section flexDirection="row" alignItems="center" gap="xxs" justifyContent={isMobile ? 'center' : 'flex-start'}>
        <LastGameOpponent>
          <NormalTypography variant="s">vs</NormalTypography>
          {getTeamAvatar(isAwayTeam, getTeamByName(lastFixture?.opponent ?? ''))}
        </LastGameOpponent>
        <LastGameResult outcome={lastFixture?.outcome ?? FixtureOutcomeEnum.DRAW}>
          <EmphasisTypography variant="s" color={theme.colors.white}>
            {`${lastFixture?.result?.homeTeamGoals || 0} - ${lastFixture?.result?.awayTeamGoals || 0}`}
          </EmphasisTypography>
        </LastGameResult>
      </Section>
    );
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

  const getLastUpdatedDate = () => {
    const lastUpdated = fixture.previewStats?.lastUpdated;
    if (!lastUpdated) {
      return (
        <NormalTypography variant="m" color={theme.colors.silverDark}>Ingen statistik tillgänglig ännu</NormalTypography>
      );
    }

    const date = new Date(lastUpdated);
    const day = date.getDate();
    const month = date.toLocaleDateString('sv-SE', { month: 'long' }).replace('.', '');
    const formattedDate = `${day} ${month}`;

    return (
      <NormalTypography variant="m" color={theme.colors.silverDark}>{`Senast uppdaterad: ${formattedDate}`}</NormalTypography>
    );
  };

  const handleUpdateOddsInput = (type: 'homeWin' | 'draw' | 'awayWin', value: string) => {
    setOdds((oldstate) => ({
      ...oldstate,
      [type]: value,
    }));
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

  const getLastFixtureResultEdit = (isHomeTeam: boolean) => {
    const opponent = isHomeTeam ? editLastFixtureOpponents.homeTeamOpponent : editLastFixtureOpponents.awayTeamOpponent;
    const result = isHomeTeam ? editHomeTeamLastFixtureResult : editAwayTeamLastFixtureResult;
    const outcome = isHomeTeam ? homeTeamLastFixtureOutcome : awayTeamLastFixtureOutcome;
    const setOutcome = isHomeTeam ? setHomeTeamLastFixtureOutcome : setAwayTeamLastFixtureOutcome;

    const handleUpdateGoalsInput = (lastFixtureTeam: 'home' | 'away', value: string) => {
      handleUpdateLastFixtureGoalsInput(isHomeTeam ? 'home' : 'away', lastFixtureTeam, value);
    };

    if (!opponent) {
      return <NormalTypography variant="s" color={theme.colors.silverDark}>Ingen match tillgänglig</NormalTypography>;
    }

    const getGoalsSection = () => (
      <Section gap="xxs">
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
      <Section gap="xxs">
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
      <Section flexDirection="row" gap="xxs" alignItems="flex-start" padding={`0 0 ${theme.spacing.xs} 0`}>
        {getGoalsSection()}
        {getOutcomeSection()}
      </Section>
    );
  };

  const getStandings = (isHomeTeam: boolean) => {
    if (!fixture.previewStats) return null;

    const team = isHomeTeam ? fixture.homeTeam : fixture.awayTeam;
    const previewStats = isHomeTeam ? fixture.previewStats.homeTeam : fixture.previewStats.awayTeam;

    const isTopOfTable = previewStats.standingsPosition === '1';
    const isBottomOfTable = getIsBottomOfLeague(parseInt(previewStats.standingsPosition ?? ''), fixture.tournament as TournamentsEnum);

    return (
      <>
        {!isTopOfTable && (
          <MockedStandingsRow type="top" position={parseInt(previewStats.standingsPosition ?? '') - (isBottomOfTable ? 2 : 1)} />
        )}
        {isBottomOfTable && (
          <MockedStandingsRow type="full" position={parseInt(previewStats.standingsPosition ?? '') - 1} />
        )}
        <StandingsRow>
          <StandingsPosition>
            <EmphasisTypography variant="s" color={theme.colors.primaryDark}>{previewStats.standingsPosition}</EmphasisTypography>
          </StandingsPosition>
          <StandingsRowTeam>
            {getTeamAvatar(false, team, AvatarSize.XS)}
            <NormalTypography variant="s">{team.name}</NormalTypography>
          </StandingsRowTeam>
          <EmphasisTypography variant="s" color={theme.colors.silverDarker}>{`${previewStats.standingsPoints} p`}</EmphasisTypography>
        </StandingsRow>
        {isTopOfTable && (
          <MockedStandingsRow type="full" position={parseInt(previewStats.standingsPosition ?? '') + 1} />
        )}
        {!isBottomOfTable && (
          <MockedStandingsRow type="bottom" position={parseInt(previewStats.standingsPosition ?? '') + (isTopOfTable ? 2 : 1)} />
        )}
      </>
    );
  };

  if (isMobile) {
    const teamFormEditValue = mobileSelectedTeam === 'home' ? editFormValue.homeTeam : editFormValue.awayTeam;
    const teamOpponent = mobileSelectedTeam === 'home' ? editLastFixtureOpponents.homeTeamOpponent : editLastFixtureOpponents.awayTeamOpponent;
    const teamPreviewStats = mobileSelectedTeam === 'home' ? fixture.previewStats?.homeTeam : fixture.previewStats?.awayTeam;

    return (
      <>
        <Modal
          onClose={onClose}
          size="l"
          title="Statistik"
          mobileFullScreen
          headerDivider
          noPadding
        >
          <ModalContent>
            <MobileTopItems>
              <Section flexDirection="row" alignItems="center" justifyContent="space-between">
                {getLastUpdatedDate()}
                {isLeagueCreator && (
                  <IconButton
                    icon={isEditMode ? <XCircle size={24} weight="fill" /> : <PencilSimple size={24} />}
                    onClick={() => handleSetEditMode()}
                    colors={{ normal: theme.colors.primary, hover: theme.colors.primaryDark, active: theme.colors.primaryDarker }}
                  />
                )}
              </Section>
              {canEdit && (
                <Section gap="xxs" padding={`${theme.spacing.xs} 0 0 0`}>
                  <Checkbox
                    label="Inkludera tabellplacering"
                    checked={includeStandings}
                    onChange={() => setIncludeStandings(!includeStandings)}
                  />
                  <Checkbox
                    label="Inkludera senaste matchen"
                    checked={includeLastFixture}
                    onChange={() => setIncludeLastFixture(!includeLastFixture)}
                  />
                  <Checkbox
                    label="Inkludera insikter"
                    checked={includeInsights}
                    onChange={() => setIncludeInsights(!includeInsights)}
                  />
                </Section>
              )}
            </MobileTopItems>
            <Section gap="xs">
              <HeadingsTypography variant="h6">
                Välj lag
              </HeadingsTypography>
              <Section gap="xxs">
                <TeamItem isSelected={mobileSelectedTeam === 'home'} onClick={() => setMobileSelectedTeam('home')}>
                  <HeadingsTypography variant="h5">{fixture.homeTeam.name}</HeadingsTypography>
                  {getTeamAvatar(false)}
                </TeamItem>
                <TeamItem isSelected={mobileSelectedTeam === 'away'} onClick={() => setMobileSelectedTeam('away')}>
                  <HeadingsTypography variant="h5">{fixture.awayTeam.name}</HeadingsTypography>
                  {getTeamAvatar(true)}
                </TeamItem>
              </Section>
            </Section>
            {((!canEdit && fixtureHasStandings) || includeStandings) && (
              <MobileSection>
                <HeadingsTypography variant="h6">
                  Tabellplacering
                </HeadingsTypography>
                {canEdit && (
                  <>
                    <Input
                      value={mobileSelectedTeam === 'home' ? editStandingsPositionValue.homeTeam : editStandingsPositionValue.awayTeam}
                      onChange={(e) => {
                        if (mobileSelectedTeam === 'home') {
                          setEditStandingsPositionValue((oldstate) => ({
                            ...oldstate,
                            homeTeam: e.target.value,
                          }));
                        } else {
                          setEditStandingsPositionValue((oldstate) => ({
                            ...oldstate,
                            awayTeam: e.target.value,
                          }));
                        }
                      }}
                      placeholder="Placering"
                      type="number"
                      maxLength={2}
                      maxLengthInvisible
                      fullWidth
                      label="Placering"
                      compact
                    />
                    <Input
                      value={mobileSelectedTeam === 'home' ? editStandingsPositionPoints.homeTeam : editStandingsPositionPoints.awayTeam}
                      onChange={(e) => {
                        if (mobileSelectedTeam === 'home') {
                          setEditStandingsPositionValue((oldstate) => ({
                            ...oldstate,
                            homeTeam: e.target.value,
                          }));
                        } else {
                          setEditStandingsPositionValue((oldstate) => ({
                            ...oldstate,
                            awayTeam: e.target.value,
                          }));
                        }
                      }}
                      placeholder="Poäng"
                      label="Poäng"
                      type="number"
                      maxLength={3}
                      maxLengthInvisible
                      fullWidth
                      compact
                    />
                  </>
                )}
                {!canEdit && (
                  <Section gap="xxs">
                    {getStandings(mobileSelectedTeam === 'home')}
                  </Section>
                )}
              </MobileSection>
            )}
            <MobileSection>
              <HeadingsTypography variant="h6">
                Form
              </HeadingsTypography>
              <Section
                flexDirection="row"
                alignItems="center"
                gap="xxs"
                justifyContent="center"
                backgroundColor={theme.colors.silverLighter}
                padding={`${theme.spacing.xs} 0`}
                borderRadius={theme.borderRadius.s}
              >
                {canEdit && teamFormEditValue.map((outcome, index) => (
                  <FormIconContainer key={`${index}-${outcome}`}>
                    {canEdit && showEditOutcomeMenu.index === index && (
                      <SelectOutcomeMenu>
                        {Object.values(FixtureOutcomeEnum).map((outcome) => getClickableFormIcon(outcome, index, mobileSelectedTeam === 'home'))}
                      </SelectOutcomeMenu>
                    )}
                    <FormIcon
                      outcome={outcome as FixtureOutcomeEnum}
                      onClick={() => {
                        if (showEditOutcomeMenu.index === index) {
                          setShowEditOutcomeMenu({ team: mobileSelectedTeam, index: -1 });
                        }
                        setShowEditOutcomeMenu({ team: mobileSelectedTeam, index });
                      }}
                    />
                  </FormIconContainer>
                ))}
                {!canEdit && (
                  (fixtureHasForm && teamPreviewStats) ? teamPreviewStats.form.map((outcome, index) => (
                    <FormIconContainer key={`${index}-${outcome}`}>
                      <FormIcon
                        outcome={outcome as FixtureOutcomeEnum}
                        showBorder={index === 4}
                      />
                    </FormIconContainer>
                  )) : (
                    Array.from({ length: 5 }, (_, index) => (
                      <FormIconContainer key={index}>
                        <FormIcon outcome={FixtureOutcomeEnum.NONE} />
                      </FormIconContainer>
                    ))
                  ))}
              </Section>
            </MobileSection>
            {(!canEdit || includeLastFixture) && (
              <MobileSection>
                <HeadingsTypography variant="h6">
                  Senaste matchen
                </HeadingsTypography>
                {canEdit && (
                  <Section gap="xxs">
                    <SelectImitation
                      value={teamOpponent ? `vs ${teamOpponent.name}` : ''}
                      placeholder="Välj motståndare"
                      onClick={() => setSelectTeamModalOpen(mobileSelectedTeam)}
                      fullWidth
                      compact
                    />
                    {teamOpponent && getLastFixtureResultEdit(mobileSelectedTeam === 'home')}
                  </Section>
                )}
                {!canEdit && (
                  <Section
                    flexDirection="row"
                    alignItems="center"
                    gap="xxs"
                    justifyContent="center"
                    backgroundColor={theme.colors.silverLighter}
                    padding={`${theme.spacing.xxxs} 0`}
                    borderRadius={theme.borderRadius.s}
                  >
                    {getLastFixtureResult(mobileSelectedTeam === 'away')}
                  </Section>
                )}
              </MobileSection>
            )}
            {(fixtureHasInsights || (canEdit && includeInsights)) && (
              <MobileSection>
                <HeadingsTypography variant="h6">
                  Insikter
                </HeadingsTypography>
                {canEdit && isEditMode && (
                  <Section gap="xxs">
                    {(mobileSelectedTeam === 'home' && createNewHomeTeamInsight) || (mobileSelectedTeam === 'away' && createNewAwayTeamInsight) ? (
                      <>
                        <InsightCard isEditing>
                          <InsightCardColorStripe color={getTeamPrimaryColorByName(mobileSelectedTeam === 'home' ? fixture.homeTeam.name : fixture.awayTeam.name)} />
                          <Textarea
                            value={mobileSelectedTeam === 'home' ? editHomeTeamInsightsValue : editAwayTeamInsightsValue}
                            onChange={mobileSelectedTeam === 'home' ? (e) => setEditHomeTeamInsightsValue(e.currentTarget.value) : (e) => setEditAwayTeamInsightsValue(e.currentTarget.value)}
                            placeholder="Skriv..."
                            fullWidth
                            noBorder
                            customPadding={`${theme.spacing.xxxs} 0`}
                            customHeight="50px"
                            backgroundColor={theme.colors.silverBleach}
                          />
                        </InsightCard>
                        <TextButton noPadding onClick={() => handleAddInsight(mobileSelectedTeam === 'home')}>
                          Lägg till
                        </TextButton>
                      </>
                    ) : (
                      <AddInsightBlock
                        whileHover={{ scale: 1.02, backgroundColor: theme.colors.silverLight }}
                        whileTap={{ scale: 0.98 }}
                        onClick={mobileSelectedTeam === 'home' ? () => setCreateNewHomeTeamInsight(true) : () => setCreateNewAwayTeamInsight(true)}
                      >
                        <PlusCircle size={24} color={theme.colors.textDefault} />
                        <NormalTypography variant="m">Lägg till</NormalTypography>
                      </AddInsightBlock>
                    )}
                  </Section>
                )}
                {((mobileSelectedTeam === 'home' && homeTeamInsights.length > 0) || (mobileSelectedTeam === 'away' && awayTeamInsights.length > 0)) && (
                  <InsightsList>
                    {(mobileSelectedTeam === 'home' ? homeTeamInsights : awayTeamInsights).map((insight, index) => (
                      <InsightCard key={index}>
                        <InsightCardColorStripe color={getTeamPrimaryColorByName(mobileSelectedTeam === 'home' ? fixture.homeTeam.name : fixture.awayTeam.name)} />
                        <NormalTypography variant="s">{insight}</NormalTypography>
                        {canEdit && isEditMode && (
                          <IconButton
                            icon={<XCircle size={20} weight="fill" />}
                            colors={{ normal: theme.colors.red }}
                            onClick={mobileSelectedTeam === 'home' ? () => setHomeTeamInsights((oldstate) => oldstate.filter((i) => i !== insight)) : () => setAwayTeamInsights((oldstate) => oldstate.filter((i) => i !== insight))}
                          />
                        )}
                      </InsightCard>
                    ))}
                  </InsightsList>
                )}
              </MobileSection>
            )}
          </ModalContent>
          <ButtonsContainer>
            <Button
              variant="secondary"
              onClick={onClose}
              fullWidth
            >
              Avbryt
            </Button>
            <Button
              onClick={handleSaveStats}
              fullWidth
            >
              Spara
            </Button>
          </ButtonsContainer>
        </Modal>
        {selectTeamModalOpen && (
          <SelectTeamModal
            onClose={() => setSelectTeamModalOpen(null)}
            value={selectTeamModalOpen === 'home' ? editLastFixtureOpponents.homeTeamOpponent : editLastFixtureOpponents.awayTeamOpponent}
            teamType={fixture.teamType}
            onSave={(team) => handleSelectOpponent(team)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <Modal
        onClose={onClose}
        size="l"
        title="Statistik"
        mobileFullScreen
        headerDivider
        noPadding
      >
        <Layout isEditMode={isEditMode}>
          <LastUpdatedContainer>
            <Section flexDirection="row" alignItems="center" justifyContent="space-between">
              {getLastUpdatedDate()}
              {isLeagueCreator && (
                <IconButton
                  icon={isEditMode ? <XCircle size={24} weight="fill" /> : <PencilSimple size={24} />}
                  onClick={() => handleSetEditMode()}
                  colors={{ normal: theme.colors.primary, hover: theme.colors.primaryDark, active: theme.colors.primaryDarker }}
                />
              )}
            </Section>
            {canEdit && (
              <Section gap="xs" padding={`${theme.spacing.xs} 0 0 0`} flexDirection="row">
                <Checkbox
                  label="Inkludera tabellplacering"
                  checked={includeStandings}
                  onChange={() => setIncludeStandings(!includeStandings)}
                />
                <Checkbox
                  label="Inkludera senaste matchen"
                  checked={includeLastFixture}
                  onChange={() => setIncludeLastFixture(!includeLastFixture)}
                />
                <Checkbox
                  label="Inkludera insikter"
                  checked={includeInsights}
                  onChange={() => setIncludeInsights(!includeInsights)}
                />
                <Checkbox
                  label="Inkludera odds"
                  checked={includeOdds}
                  onChange={() => setIncludeOdds(!includeOdds)}
                />
              </Section>
            )}
          </LastUpdatedContainer>
          <TableRow>
            <TableCell>
              <Section flexDirection="row" alignItems="center" justifyContent="space-between">
                <HeadingsTypography variant="h6">Lag</HeadingsTypography>
              </Section>
            </TableCell>
            <TableCell>
              <TeamName>
                <HeadingsTypography variant="h5">{fixture.homeTeam.name}</HeadingsTypography>
                {getTeamAvatar(false)}
              </TeamName>
            </TableCell>
            <TableCell>
              <TeamName>
                <HeadingsTypography variant="h5">{fixture.awayTeam.name}</HeadingsTypography>
                {getTeamAvatar(true)}
              </TeamName>
            </TableCell>
          </TableRow>
          {((!canEdit && fixtureHasStandings) || includeStandings) && (
            <TableRow>
              <TableCell>
                <FlexColumn>
                  <EmphasisTypography variant="m">Tabellplacering</EmphasisTypography>
                  <NormalTypography variant="s" color={theme.colors.silverDark}>{fixture.tournament}</NormalTypography>
                </FlexColumn>
              </TableCell>
              <TableCell>
                {canEdit ? (
                  <>
                    <Input
                      value={editStandingsPositionValue.homeTeam}
                      onChange={(e) => setEditStandingsPositionValue((oldstate) => ({ ...oldstate, homeTeam: e.target.value }))}
                      placeholder="Placering"
                      type="number"
                      maxLength={2}
                      maxLengthInvisible
                      fullWidth
                      noBorder
                      compact
                      customPadding={`${theme.spacing.xxs} 0`}
                    />
                    <Input
                      value={editStandingsPositionPoints.homeTeam}
                      onChange={(e) => setEditStandingsPositionPoints((oldstate) => ({ ...oldstate, homeTeam: e.target.value }))}
                      placeholder="Poäng"
                      type="number"
                      maxLength={3}
                      maxLengthInvisible
                      fullWidth
                      noBorder
                      compact
                      customPadding={`${theme.spacing.xxs} 0`}
                    />
                  </>
                ) : (
                  <Section gap="xxs" padding={`${theme.spacing.xxs} 0`}>
                    {getStandings(true)}
                  </Section>
                )}
              </TableCell>
              <TableCell>
                {canEdit ? (
                  <>
                    <Input
                      value={editStandingsPositionValue.awayTeam}
                      onChange={(e) => setEditStandingsPositionValue((oldstate) => ({ ...oldstate, awayTeam: e.target.value }))}
                      placeholder="Placering"
                      type="number"
                      maxLength={2}
                      maxLengthInvisible
                      fullWidth
                      noBorder
                      compact
                      customPadding={`${theme.spacing.xxs} 0`}
                    />
                    <Input
                      value={editStandingsPositionPoints.awayTeam}
                      onChange={(e) => setEditStandingsPositionPoints((oldstate) => ({ ...oldstate, awayTeam: e.target.value }))}
                      placeholder="Poäng"
                      type="number"
                      maxLength={3}
                      maxLengthInvisible
                      fullWidth
                      noBorder
                      compact
                      customPadding={`${theme.spacing.xxs} 0`}
                    />
                  </>
                ) : (
                  <Section gap="xxs" padding={`${theme.spacing.xxs} 0`}>
                    {getStandings(false)}
                  </Section>
                )}
              </TableCell>
            </TableRow>
          )}
          <TableRow>
            <TableCell>
              <FlexColumn>
                <EmphasisTypography variant="m">Form</EmphasisTypography>
                <NormalTypography variant="s" color={theme.colors.silverDark}>5 senaste matcherna</NormalTypography>
              </FlexColumn>
            </TableCell>
            <TableCell>
              {canEdit && editFormValue.homeTeam.map((outcome, index) => (
                <FormIconContainer key={`${index}-${outcome}`}>
                  {canEdit && showEditOutcomeMenu.index === index && showEditOutcomeMenu.team === 'home' && (
                    <SelectOutcomeMenu>
                      {Object.values(FixtureOutcomeEnum).map((outcome) => getClickableFormIcon(outcome, index, true))}
                    </SelectOutcomeMenu>
                  )}
                  <FormIcon
                    outcome={outcome as FixtureOutcomeEnum}
                    onClick={() => {
                      if (showEditOutcomeMenu.index === index) {
                        setShowEditOutcomeMenu({ team: 'home', index: -1 });
                      }
                      setShowEditOutcomeMenu({ team: 'home', index });
                    }}
                  />
                </FormIconContainer>
              ))}
              {!canEdit && (
                fixtureHasForm ? fixture.previewStats?.homeTeam.form.map((outcome, index) => (
                  <FormIconContainer key={`${index}-${outcome}`}>
                    <FormIcon
                      outcome={outcome as FixtureOutcomeEnum}
                      showBorder={index === 4}
                    />
                  </FormIconContainer>
                )) : (
                  Array.from({ length: 5 }, (_, index) => (
                    <FormIconContainer key={index}>
                      <FormIcon outcome={FixtureOutcomeEnum.NONE} />
                    </FormIconContainer>
                  ))
                ))}
            </TableCell>
            <TableCell>
              {canEdit && editFormValue.awayTeam.map((outcome, index) => (
                <FormIconContainer key={`${index}-${outcome}`}>
                  {canEdit && showEditOutcomeMenu.index === index && showEditOutcomeMenu.team === 'away' && (
                    <SelectOutcomeMenu>
                      {Object.values(FixtureOutcomeEnum).map((outcome) => getClickableFormIcon(outcome, index, false))}
                    </SelectOutcomeMenu>
                  )}
                  <FormIcon
                    outcome={outcome as FixtureOutcomeEnum}
                    onClick={() => {
                      if (showEditOutcomeMenu.index === index) {
                        setShowEditOutcomeMenu({ team: 'away', index: -1 });
                      }
                      setShowEditOutcomeMenu({ team: 'away', index });
                    }}
                  />
                </FormIconContainer>
              ))}
              {!canEdit && (
                fixtureHasForm ? fixture.previewStats?.awayTeam.form.map((outcome, index) => (
                  <FormIconContainer key={`${index}-${outcome}`}>
                    <FormIcon
                      outcome={outcome as FixtureOutcomeEnum}
                      showBorder={index === 4}
                    />
                  </FormIconContainer>
                )) : (
                  Array.from({ length: 5 }, (_, index) => (
                    <FormIconContainer key={index}>
                      <FormIcon outcome={FixtureOutcomeEnum.NONE} />
                    </FormIconContainer>
                  ))
                ))}
            </TableCell>
          </TableRow>
          {(!canEdit || includeLastFixture) && (
            <TableRow>
              <TableCell>
                <FlexColumn>
                  <EmphasisTypography variant="m">Senaste matchen</EmphasisTypography>
                </FlexColumn>
              </TableCell>
              <TableCell>
                {canEdit && (
                  <Section gap="xxs">
                    <SelectImitation
                      value={editLastFixtureOpponents.homeTeamOpponent ? `vs ${editLastFixtureOpponents.homeTeamOpponent.name}` : ''}
                      placeholder="Välj motståndare"
                      onClick={() => setSelectTeamModalOpen('home')}
                      fullWidth
                      compact
                      borderless
                    />
                    {editLastFixtureOpponents.homeTeamOpponent && getLastFixtureResultEdit(true)}
                  </Section>
                )}
                {!canEdit && getLastFixtureResult(false)}
              </TableCell>
              <TableCell>
                {canEdit && (
                  <Section gap="xxs">
                    <SelectImitation
                      value={editLastFixtureOpponents?.awayTeamOpponent ? `vs ${editLastFixtureOpponents.awayTeamOpponent.name}` : ''}
                      placeholder="Välj motståndare"
                      onClick={() => setSelectTeamModalOpen('away')}
                      fullWidth
                      compact
                      borderless
                    />
                    {editLastFixtureOpponents.awayTeamOpponent && getLastFixtureResultEdit(false)}
                  </Section>
                )}
                {!canEdit && getLastFixtureResult(true)}
              </TableCell>
            </TableRow>
          )}
          {(fixtureHasInsights || (canEdit && includeInsights)) && (
            <TableRow>
              <TableCell>
                <FlexColumn>
                  <EmphasisTypography variant="m">Insikter</EmphasisTypography>
                </FlexColumn>
              </TableCell>
              <TableCell alignTop>
                <Section>
                  {canEdit && isEditMode && (
                    <Section gap="xxs" padding={`${theme.spacing.xxs} 0`}>
                      {createNewHomeTeamInsight ? (
                        <>
                          <InsightCard isEditing>
                            <InsightCardColorStripe color={getTeamPrimaryColorByName(fixture.homeTeam.name)} />
                            <Textarea
                              value={editHomeTeamInsightsValue}
                              onChange={(e) => setEditHomeTeamInsightsValue(e.currentTarget.value)}
                              placeholder="Skriv..."
                              fullWidth
                              noBorder
                              customPadding={`${theme.spacing.xxxs} 0`}
                              customHeight="50px"
                              backgroundColor={theme.colors.silverBleach}
                            />
                          </InsightCard>
                          <TextButton noPadding onClick={() => handleAddInsight(true)}>
                            Lägg till
                          </TextButton>
                        </>
                      ) : (
                        <AddInsightBlock
                          whileHover={{ scale: 1.02, backgroundColor: theme.colors.silverLight }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setCreateNewHomeTeamInsight(true)}
                        >
                          <PlusCircle size={24} color={theme.colors.textDefault} />
                          <NormalTypography variant="m">Lägg till</NormalTypography>
                        </AddInsightBlock>
                      )}
                    </Section>
                  )}
                  {homeTeamInsights.length > 0 && (
                    <InsightsList>
                      {homeTeamInsights.map((insight, index) => (
                        <InsightCard key={index}>
                          <InsightCardColorStripe color={getTeamPrimaryColorByName(fixture.homeTeam.name)} />
                          <NormalTypography variant="s">{insight}</NormalTypography>
                          {canEdit && isEditMode && (
                            <IconButton
                              icon={<XCircle size={20} weight="fill" />}
                              colors={{ normal: theme.colors.red }}
                              onClick={() => setHomeTeamInsights((oldstate) => oldstate.filter((i) => i !== insight))}
                            />
                          )}
                        </InsightCard>
                      ))}
                    </InsightsList>
                  )}
                </Section>
              </TableCell>
              <TableCell alignTop>
                <Section>
                  {canEdit && isEditMode && (
                    <Section gap="xxs" padding={`${theme.spacing.xxs} 0`}>
                      {createNewAwayTeamInsight ? (
                        <>
                          <InsightCard isEditing>
                            <InsightCardColorStripe color={getTeamPrimaryColorByName(fixture.awayTeam.name)} />
                            <Textarea
                              value={editAwayTeamInsightsValue}
                              onChange={(e) => setEditAwayTeamInsightsValue(e.currentTarget.value)}
                              placeholder="Skriv..."
                              fullWidth
                              noBorder
                              customPadding={`${theme.spacing.xxxs} 0`}
                              customHeight="50px"
                              backgroundColor={theme.colors.silverBleach}
                            />
                          </InsightCard>
                          <TextButton noPadding onClick={() => handleAddInsight(false)}>
                            Lägg till
                          </TextButton>
                        </>
                      ) : (
                        <AddInsightBlock
                          whileHover={{ scale: 1.02, backgroundColor: theme.colors.silverLight }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setCreateNewAwayTeamInsight(true)}
                        >
                          <PlusCircle size={24} color={theme.colors.textDefault} />
                          <NormalTypography variant="m">Lägg till</NormalTypography>
                        </AddInsightBlock>
                      )}
                    </Section>
                  )}
                  {awayTeamInsights.length > 0 && (
                    <InsightsList>
                      {awayTeamInsights.map((insight, index) => (
                        <InsightCard key={index}>
                          <InsightCardColorStripe color={getTeamPrimaryColorByName(fixture.awayTeam.name)} />
                          <NormalTypography variant="s">{insight}</NormalTypography>
                          {canEdit && isEditMode && (
                            <IconButton
                              icon={<XCircle size={20} weight="fill" />}
                              colors={{ normal: theme.colors.red }}
                              onClick={() => setAwayTeamInsights((oldstate) => oldstate.filter((i) => i !== insight))}
                            />
                          )}
                        </InsightCard>
                      ))}
                    </InsightsList>
                  )}
                </Section>
              </TableCell>
            </TableRow>
          )}
          {(canEdit && (includeOdds || fixtureHasOdds)) && (
            <TableRow isDoubleColSpan>
              <TableCell>
                <FlexColumn>
                  <EmphasisTypography variant="m">Odds</EmphasisTypography>
                </FlexColumn>
              </TableCell>
              <TableCell>
                {canEdit ? (
                  <>
                    <Input
                      value={odds.homeWin}
                      onChange={(e) => handleUpdateOddsInput('homeWin', e.currentTarget.value)}
                      placeholder="1"
                      fullWidth
                      noBorder
                      compact
                      customPadding={`${theme.spacing.xxs} 0`}
                    />
                    <Input
                      value={odds.draw}
                      onChange={(e) => handleUpdateOddsInput('draw', e.currentTarget.value)}
                      placeholder="X"
                      fullWidth
                      noBorder
                      compact
                      customPadding={`${theme.spacing.xxs} 0`}
                    />
                    <Input
                      value={odds.awayWin}
                      onChange={(e) => handleUpdateOddsInput('awayWin', e.currentTarget.value)}
                      placeholder="2"
                      fullWidth
                      noBorder
                      compact
                      customPadding={`${theme.spacing.xxs} 0`}
                    />
                  </>
                ) : (
                  <>
                    <NormalTypography variant="s">{`1 ${fixture.odds?.homeWin}`}</NormalTypography>
                    <NormalTypography variant="s">{`X ${fixture.odds?.draw}`}</NormalTypography>
                    <NormalTypography variant="s">{`2 ${fixture.odds?.awayWin}`}</NormalTypography>
                  </>
                )}
              </TableCell>
            </TableRow>
          )}
        </Layout>
        {canEdit && (
          <Section flexDirection="row" padding={isMobile ? `${theme.spacing.s} ${theme.spacing.m} ${theme.spacing.m} ${theme.spacing.m}` : `${theme.spacing.s} ${theme.spacing.l} ${theme.spacing.l} ${theme.spacing.l}`}>
            <Button
              size="m"
              disabled={saveLoading || (includeLastFixture && (!editLastFixtureOpponents.homeTeamOpponent || !editLastFixtureOpponents.awayTeamOpponent)) || (includeStandings && (!editStandingsPositionValue.homeTeam || !editStandingsPositionValue.awayTeam || !editStandingsPositionPoints.homeTeam || !editStandingsPositionPoints.awayTeam))}
              onClick={handleSaveStats}
              loading={saveLoading}
            >
              Spara
            </Button>
          </Section>
        )}
      </Modal>
      {selectTeamModalOpen && (
        <SelectTeamModal
          onClose={() => setSelectTeamModalOpen(null)}
          value={selectTeamModalOpen === 'home' ? editLastFixtureOpponents.homeTeamOpponent : editLastFixtureOpponents.awayTeamOpponent}
          teamType={fixture.teamType}
          onSave={(team) => handleSelectOpponent(team)}
        />
      )}
    </>
  );
};

const Layout = styled.div<{ isEditMode: boolean }>`
  display: flex;
  flex-direction: column;
  margin-bottom: ${({ isEditMode }) => (isEditMode ? 0 : theme.spacing.xl)};
`;

const TableRow = styled.div<{ isDoubleColSpan?: boolean }>`
  display: grid;
  grid-template-columns: ${({ isDoubleColSpan }) => (isDoubleColSpan ? '3fr 8fr' : '3fr 4fr 4fr')};
  align-items: center;
  padding: 0 ${theme.spacing.s};
  border-bottom: 1px solid ${theme.colors.silverLight};
  box-sizing: border-box;
`;

const LastUpdatedContainer = styled.div`
  padding: ${theme.spacing.s} ${theme.spacing.l};
  border-bottom: 1px solid ${theme.colors.silverLight};
`;

const TableCell = styled.div<{ alignTop?: boolean }>`
  display: flex;
  align-items: ${({ alignTop }) => (alignTop ? 'flex-start' : 'center')};
  gap: ${theme.spacing.xxs};
  padding: ${theme.spacing.xxxs} ${theme.spacing.s};
  flex: 1;
  height: 100%;
  border-right: 1px solid ${theme.colors.silverLight};
  box-sizing: border-box;
  
  &:last-child {
    border-right: none; /* Remove right border for the last cell */
  }
`;

const FlexColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xxxs};
  padding: ${theme.spacing.xxs} 0;
`;

const TeamName = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xxs};
`;

const LastGameResult = styled.div<{ outcome: FixtureOutcomeEnum }>`
  background-color: ${({ outcome }) => getOutcomeBackgroundColor(outcome)};
  padding: ${theme.spacing.xxxs} ${theme.spacing.xxs};
  border-radius: ${theme.borderRadius.s};
  display: flex;
  align-items: center;
`;

const LastGameOpponent = styled.div`
  display: flex;
  align-items: center;
`;

const FormIconContainer = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`;

const SelectOutcomeMenu = styled.div`
  position: absolute;
  top: -44px;
  left: 50%;
  transform: translateX(-50%);
  background-color: ${theme.colors.white};
  border: 1px solid ${theme.colors.silverLight};
  border-radius: ${theme.borderRadius.xs};
  padding: ${theme.spacing.xxs};
  z-index: 1;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xxxs};
`;

const TeamItem = styled.div<{ isSelected?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.xxxs} ${theme.spacing.xs} ${theme.spacing.xxxs} ${theme.spacing.xs};
  box-shadow: 0px 2px 0px rgba(0, 0, 0, 0.08);
  border-radius: ${theme.borderRadius.m};
  background-color: ${({ isSelected }) => (isSelected ? theme.colors.primaryFade : theme.colors.silverBleach)};
  cursor: pointer;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid ${({ isSelected }) => (isSelected ? theme.colors.primaryLighter : theme.colors.silverLight)};
  transition: background-color 0.2s;
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  border-top: 1px solid ${theme.colors.silverLight};
  width: 100%;
  box-sizing: border-box;
  padding: ${theme.spacing.s} ${theme.spacing.s} ${theme.spacing.m} ${theme.spacing.s};

  @media ${devices.tablet} {
    padding: ${theme.spacing.m};
  }
`;

const MobileTopItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 100%;
`;

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.m};
  padding: ${theme.spacing.m};
  overflow-y: auto;
  flex-grow: 1;
  
  @media ${devices.tablet} {
    padding: ${theme.spacing.l};
  }
`;

const MobileSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  width: 100%;
  box-sizing: border-box;

  @media ${devices.tablet} {
    display: block;
  }
`;

const StandingsRow = styled.div<{ isMock?: boolean }>`
  background-color: ${theme.colors.silverLighter};
  padding: ${theme.spacing.xxs};
  border-radius: ${theme.borderRadius.s};
  display: flex;
  gap: ${theme.spacing.xxs};
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  border: 1px solid ${theme.colors.silverLight};

  ${({ isMock }) => isMock && css`
    background-image: linear-gradient(90deg, #FFFFFF 0%, #FFFFFF 100%);
  `}
`;

const StandingsRowTeam = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xxs};
  flex: 1;
`;

const StandingsPosition = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${theme.colors.silverLight};
  border-radius: ${theme.borderRadius.xs};
  width: 24px;
  height: 24px;
`;

const AddInsightBlock = styled(motion.div)`
  background-color: ${theme.colors.silverLighter};
  padding: ${theme.spacing.xs};
  border-radius: ${theme.borderRadius.m};
  border: 1px dashed ${theme.colors.silverLight};
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
  padding: ${theme.spacing.xs} 0;
`;

export default FixtureStatsModal;
