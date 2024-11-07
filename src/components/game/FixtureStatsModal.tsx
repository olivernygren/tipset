import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import {
  Check, PencilSimple, X, XCircle,
} from '@phosphor-icons/react';
import { doc, updateDoc } from 'firebase/firestore';
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
import { getTeamByName, Team, TournamentsEnum } from '../../utils/Team';
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
  const [includeAnalysis, setIncludeAnalysis] = useState<boolean>(false);
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
  const [editAnalysisValue, setEditAnalysisValue] = useState(fixture.previewStats?.analysis ?? '');
  const [odds, setOdds] = useState<FixtureOdds>({ homeWin: fixture.odds?.homeWin.toString() ?? '', draw: fixture.odds?.draw.toString() ?? '', awayWin: fixture.odds?.awayWin.toString() ?? '' });

  const canEdit = isLeagueCreator && isEditMode;
  const fixtureHasStandings = Boolean(fixture.previewStats && fixture.previewStats?.homeTeam.standingsPosition && fixture.previewStats?.awayTeam.standingsPosition && fixture.previewStats?.homeTeam.standingsPoints && fixture.previewStats?.awayTeam.standingsPoints);
  const fixtureHasForm = fixture.previewStats && fixture.previewStats?.homeTeam.form && fixture.previewStats?.awayTeam.form;
  const fixtureHasAnalysis = fixture.previewStats && fixture.previewStats.analysis;
  const fixtureHasOdds = fixture.odds && fixture.odds.homeWin && fixture.odds.draw && fixture.odds.awayWin;

  const handleSaveStats = async () => {
    if (!ongoingGameWeek) return;

    setSaveLoading(true);

    const previewStats: FixturePreviewStats = {
      homeTeam: {
        form: editFormValue.homeTeam,
        ...(includeStandings && { standingsPosition: editStandingsPositionValue.homeTeam }),
        ...(includeStandings && { standingsPoints: editStandingsPositionPoints.homeTeam }),
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
        ...(includeLastFixture && {
          lastFixture: {
            opponent: editLastFixtureOpponents.awayTeamOpponent?.name ?? '',
            result: editAwayTeamLastFixtureResult,
            outcome: awayTeamLastFixtureOutcome,
          },
        }),
      },
      ...(includeAnalysis && { analysis: editAnalysisValue }),
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
    // if (value !== '' && !/^[0-9]$/.test(value)) {
    //   return;
    // }

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
    const fixtureSavedWithAnalysis = Boolean(fixture.previewStats?.analysis);
    const fixtureSavedWithOdds = Boolean(fixture.odds?.homeWin && fixture.odds?.draw && fixture.odds?.awayWin);

    setIsEditMode(!isEditMode);
    setIncludeLastFixture(fixtureSavedWithLastFixture);
    setIncludeStandings(fixtureSavedWithStandings);
    setIncludeAnalysis(fixtureSavedWithAnalysis);
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
      return <NormalTypography variant="s" color={theme.colors.silverDark}>Ingen match tillgänglig</NormalTypography>;
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
    // const hours = date.getHours().toString().padStart(2, '0');
    // const minutes = date.getMinutes().toString().padStart(2, '0');

    // const formattedDate = `${day} ${month} ${hours}:${minutes}`;
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
                    label="Inkludera analys"
                    checked={includeAnalysis}
                    onChange={() => setIncludeAnalysis(!includeAnalysis)}
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
            {(fixtureHasAnalysis || (canEdit && includeAnalysis)) && (
              <MobileSection>
                <HeadingsTypography variant="h6">
                  Analys
                </HeadingsTypography>
                {canEdit ? (
                  <Textarea
                    value={editAnalysisValue}
                    onChange={(e) => setEditAnalysisValue(e.target.value)}
                    placeholder="Analys"
                    customHeight="200px"
                    fullWidth
                  />
                ) : (
                  <Section padding={theme.spacing.s} backgroundColor={theme.colors.silverLighter} borderRadius={theme.borderRadius.s}>
                    <NormalTypography variant="s">{fixture.previewStats?.analysis}</NormalTypography>
                  </Section>
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
            {getLastUpdatedDate()}
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
                  label="Inkludera analys"
                  checked={includeAnalysis}
                  onChange={() => setIncludeAnalysis(!includeAnalysis)}
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
                {isLeagueCreator && (
                  <IconButton
                    icon={isEditMode ? <XCircle size={24} weight="fill" /> : <PencilSimple size={24} />}
                    onClick={() => handleSetEditMode()}
                    colors={{ normal: theme.colors.primary, hover: theme.colors.primaryDark, active: theme.colors.primaryDarker }}
                  />
                )}
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
          {(fixtureHasAnalysis || (canEdit && includeAnalysis)) && (
            <TableRow isDoubleColSpan>
              <TableCell>
                <FlexColumn>
                  <EmphasisTypography variant="m">Analys</EmphasisTypography>
                </FlexColumn>
              </TableCell>
              <TableCell>
                {canEdit ? (
                  <Textarea
                    value={editAnalysisValue}
                    onChange={(e) => setEditAnalysisValue(e.target.value)}
                    customPadding={`${theme.spacing.xxs} 0`}
                    placeholder="Analys"
                    fullWidth
                    noBorder
                  />
                ) : (
                  <Section padding={`${theme.spacing.xxs} 0`}>
                    <NormalTypography variant="s">{fixture.previewStats?.analysis}</NormalTypography>
                  </Section>
                )}
              </TableCell>
            </TableRow>
          )}
          {(fixtureHasOdds || (canEdit && includeOdds)) && (
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
                      // type="number"
                      value={odds.homeWin}
                      onChange={(e) => handleUpdateOddsInput('homeWin', e.currentTarget.value)}
                      placeholder="1"
                      fullWidth
                      noBorder
                      compact
                      customPadding={`${theme.spacing.xxs} 0`}
                    />
                    <Input
                      // type="number"
                      value={odds.draw}
                      onChange={(e) => handleUpdateOddsInput('draw', e.currentTarget.value)}
                      placeholder="X"
                      fullWidth
                      noBorder
                      compact
                      customPadding={`${theme.spacing.xxs} 0`}
                    />
                    <Input
                      // type="number"
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
              {/* <TableCell>
                {canEdit ? (
                  <Input
                    type="number"
                    value={odds.draw.toString() ?? '0'}
                    onChange={(e) => setOdds((oldstate) => ({ ...oldstate, draw: Number(e.currentTarget.value) }))}
                    placeholder="Oavgjort"
                    fullWidth
                    noBorder
                    compact
                    customPadding={`${theme.spacing.xxs} 0`}
                  />
                ) : (
                  <NormalTypography variant="s">{`Oavgjort: ${fixture.odds?.draw}`}</NormalTypography>

                )}
              </TableCell>
              <TableCell>
                {canEdit ? (
                  <Input
                    type="number"
                    value={odds.awayWin.toString() ?? '0'}
                    onChange={(e) => setOdds((oldstate) => ({ ...oldstate, awayWin: Number(e.currentTarget.value) }))}
                    placeholder="Bortalag"
                    fullWidth
                    noBorder
                    compact
                    customPadding={`${theme.spacing.xxs} 0`}
                  />
                ) : (
                  <Section gap="xxs">
                    <NormalTypography variant="s">{`Bortalag: ${fixture.odds?.awayWin}`}</NormalTypography>
                  </Section>
                )}
              </TableCell> */}
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
            <Button
              size="m"
              onClick={() => console.log({ homeWin: parseFloat(odds.homeWin), draw: parseFloat(odds.draw), awayWin: parseFloat(odds.awayWin) })}
              color="gold"
            >
              Se odds
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

const getTableRowColumnLayout = (style: 'triple' | 'double' | 'single') => {
  switch (style) {
    case 'triple':
      return '3fr auto auto auto';
    case 'double':
      return '3fr 4fr 4fr';
    case 'single':
      return '3fr 8fr';
    default:
      return '3fr 4fr 4fr';
  }
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

const TableCell = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xxs};
  padding: ${theme.spacing.xxxs} ${theme.spacing.s};
  flex: 1;
  height: 100%;
  border-right: 1px solid ${theme.colors.silverLight}; /* Add right border */
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

export default FixtureStatsModal;
