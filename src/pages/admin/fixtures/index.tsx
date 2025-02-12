import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  ArrowClockwise,
  Calendar,
  DotsThree, Globe, MinusCircle, PencilSimple, Plus, ShieldPlus, Sparkle, Trash, WarningDiamond, X,
  XCircle,
} from '@phosphor-icons/react';
import {
  getDocs, collection, doc, updateDoc,
} from 'firebase/firestore';
import { useSingleEffect } from 'react-haiku';
import { EmphasisTypography, HeadingsTypography } from '../../../components/typography/Typography';
import { Section } from '../../../components/section/Section';
import { theme } from '../../../theme';
import { Divider } from '../../../components/Divider';
import Button from '../../../components/buttons/Button';
import {
  Fixture, FixtureInput, FixturesCollectionResponse, TeamType,
} from '../../../utils/Fixture';
import { db } from '../../../config/firebase';
import { CollectionEnum } from '../../../utils/Firebase';
import { groupFixturesByDate, withDocumentIdOnObject } from '../../../utils/helpers';
import CreateCentralLevelFixtureModal from '../../../components/game/CreateCentralLevelFixtureModal';
import RootToast from '../../../components/toast/RootToast';
import { errorNotify, successNotify } from '../../../utils/toast/toastHelpers';
import UpcomingFixturePreview from '../../../components/game/UpcomingFixturePreview';
import useResizeListener, { DeviceSizes } from '../../../utils/hooks/useResizeListener';
import EditFixtureModal from '../../../components/game/EditFixtureModal';
import ContextMenu from '../../../components/menu/ContextMenu';
import IconButton from '../../../components/buttons/IconButton';
import ContextMenuOption from '../../../components/menu/ContextMenuOption';
import CreateFixturesViaFotMobSnippetModal from '../../../components/game/CreateFixturesViaFotMobSnippetModal';
import ActionsModal from '../../../components/modal/ActionsModal';
import { getTeamsByTournament, Team, TournamentsEnum } from '../../../utils/Team';
import TextButton from '../../../components/buttons/TextButton';
import SelectTournamentModal from '../../../components/game/SelectTournamentModal';
import SelectTeamModal from '../../../components/game/SelectTeamModal';
import CustomDatePicker from '../../../components/input/DatePicker';

enum FilterType {
  DATE = 'DATE',
  TOURNAMENT = 'TOURNAMENT',
  TEAM = 'TEAM',
  ALL = 'ALL',
}

type FixtureFilter = {
  type: FilterType;
  value: string;
  team?: Team;
  date?: Date;
};

const AdminFixturesPage = () => {
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const [allFixtures, setAllFixtures] = useState<Array<Fixture>>([]);
  const [filteredFixtures, setFilteredFixtures] = useState<Array<Fixture>>([]);
  const [passedFixtures, setPassedFixtures] = useState<Array<Fixture>>([]);
  const [responseDocId, setResponseDocId] = useState<string>('');
  const [createFixtureModalOpen, setCreateFixtureModalOpen] = useState<boolean>(false);
  const [createFixturesFromFotMobSnippetModalOpen, setCreateFixturesFromFotMobSnippetModalOpen] = useState<boolean>(false);
  const [editFixture, setEditFixture] = useState<Fixture | null>(null);
  const [contextMenuOpen, setContextMenuOpen] = useState<boolean>(false);
  const [datePickerMenuOpen, setDatePickerMenuOpen] = useState<boolean>(false);
  const [selectedFilters, setSelectedFilters] = useState<Array<FixtureFilter>>([]);
  const [confirmDeleteAllModalOpen, setConfirmDeleteAllModalOpen] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [showTournamentsModal, setShowTournamentsModal] = useState<boolean>(false);
  const [showTeamsModal, setShowTeamsModal] = useState<boolean>(false);

  const [createFixtureLoading, setCreateFixtureLoading] = useState<boolean>(false);
  const [deleteAllFixturesLoading, setDeleteAllFixturesLoading] = useState<boolean>(false);

  const getContextMenuOffsetY = () => {
    let offsetY = 1;

    if (passedFixtures.length > 0) {
      offsetY += 1;
    }

    if (allFixtures.length > 0) {
      offsetY += 1;
    }

    return offsetY;
  };

  const fotMobMatchesTournamentIds = [
    87, // La Liga
    55, // Serie A
    54, // Bundesliga
    53, // Ligue 1
    47, // Premier League
    42, // Champions League
    67, // Allsvenskan
  ];

  const allAllsvenskanTeams = getTeamsByTournament(TournamentsEnum.ALLSVENSKAN).map((team) => Number(team.id));

  // Always include games for thse teams
  const fotMobMatchesTeamIds = [
    ...allAllsvenskanTeams, // Allsvenskan (all teams)
    Number('9825'), // Arsenal
    Number('8455'), // Chelsea
    Number('10260'), // Manchester United
    Number('8456'), // Manchester City
    Number('8650'), // Liverpool
    Number('8586'), // Tottenham
    Number('8633'), // Real Madrid
    Number('8634'), // Barcelona
    Number('9906'), // Atletico Madrid
    Number('9885'), // Juventus
    Number('8636'), // Inter
    Number('8564'), // AC Milan
    Number('9823'), // Bayern Munchen
    Number('9789'), // Borussia Dortmund
    Number('8178'), // Leverkusen
    Number('9847'), // PSG
  ];

  useSingleEffect(() => {
    fetchFixtures();
  });

  useEffect(() => {
    applyFilters();
  }, [selectedFilters, allFixtures]);

  const fetchFixtures = async () => {
    try {
      const data = await getDocs(collection(db, CollectionEnum.FIXTURES));
      const fixturesResponse = withDocumentIdOnObject<FixturesCollectionResponse>(data.docs[0]);

      const passedFixtures = fixturesResponse.fixtures.filter((f) => new Date(f.kickOffTime) < new Date());
      const upcomingFixtures = fixturesResponse.fixtures.filter((f) => new Date(f.kickOffTime) >= new Date());

      setAllFixtures(upcomingFixtures);
      setPassedFixtures(passedFixtures);
      setResponseDocId(fixturesResponse.documentId);
    } catch (err) {
      errorNotify('Något gick fel när matcherna skulle hämtas');
    }
  };

  const handleCreateFixture = async (fixture: FixtureInput) => {
    setCreateFixtureLoading(true);

    try {
      await updateDoc(doc(db, CollectionEnum.FIXTURES, responseDocId), {
        fixtures: [...allFixtures, fixture],
      });
      successNotify('Matchen skapades');
      fetchFixtures();
    } catch (err) {
      errorNotify('Något gick fel när matchen skulle skapas');
    } finally {
      setCreateFixtureLoading(false);
    }
  };

  const handleUpdateFixture = async (fixture: Fixture) => {
    try {
      const fixturesDoc = doc(db, CollectionEnum.FIXTURES, responseDocId);

      setEditFixture(null);

      await updateDoc(fixturesDoc, {
        fixtures: allFixtures.map((f) => (f.id === fixture.id ? fixture : f)),
      });

      successNotify('Matchen uppdaterades');
      fetchFixtures();
    } catch (err) {
      errorNotify('Något gick fel när matchen skulle uppdateras');
    }
  };

  const handleDeleteAllPassedFixtures = async () => {
    try {
      await updateDoc(doc(db, CollectionEnum.FIXTURES, responseDocId), {
        fixtures: allFixtures, // replacing all fixtures with only the upcoming ones
      });

      successNotify('Matcherna som spelats raderades');
      fetchFixtures();
    } catch (error) {
      errorNotify('Något gick fel när matcherna skulle raderas');
    }
  };

  const handleDeleteAllFixtures = async () => {
    setDeleteAllFixturesLoading(true);

    try {
      await updateDoc(doc(db, CollectionEnum.FIXTURES, responseDocId), {
        fixtures: [],
      });

      setConfirmDeleteAllModalOpen(false);
      successNotify('Alla matcher raderades');
      fetchFixtures();
    } catch (error) {
      errorNotify('Något gick fel när matcherna skulle raderas');
    } finally {
      setDeleteAllFixturesLoading(false);
    }
  };

  const handleDeleteFixture = async () => {
    try {
      const fixturesDoc = doc(db, CollectionEnum.FIXTURES, responseDocId);
      await updateDoc(fixturesDoc, {
        fixtures: allFixtures.filter((f) => f.id !== editFixture?.id),
      });

      successNotify('Matchen raderades');
      fetchFixtures();
    } catch (error) {
      errorNotify('Något gick fel när matchen skulle raderas');
    }
  };

  const handleDeleteSetOfFixtures = async (fixturesToDelete: Array<Fixture>) => {
    try {
      const fixturesDoc = doc(db, CollectionEnum.FIXTURES, responseDocId);
      await updateDoc(fixturesDoc, {
        fixtures: allFixtures.filter((f) => !fixturesToDelete.includes(f)),
      });

      successNotify(`${fixturesToDelete.length} ${fixturesToDelete.length === 1 ? 'match' : 'matcher'} raderades`);
      fetchFixtures();
    } catch (error) {
      errorNotify('Något gick fel när matcherna skulle raderas');
    }
  };

  const getFixturesDateFormatted = (date: string) => {
    const fixtureDate = new Date(date);
    const day = fixtureDate.getDate();
    const weekday = fixtureDate.toLocaleString('default', { weekday: 'long' }).replaceAll('.', '').charAt(0).toUpperCase() + fixtureDate.toLocaleString('default', { weekday: 'long' }).slice(1);
    const month = fixtureDate.toLocaleString('default', { month: 'long' }).replaceAll('.', '');
    return `${weekday} ${day} ${month}`;
  };

  const compareFixtureAndFilterDates = (filteredFixtures: Array<Fixture>, filter: FixtureFilter) => filteredFixtures.filter((fixture) => {
    if (filter.date) {
      const fixtureDate = new Date(fixture.kickOffTime);
      return (
        fixtureDate.getFullYear() === filter.date.getFullYear()
        && fixtureDate.getMonth() === filter.date.getMonth()
        && fixtureDate.getDate() === filter.date.getDate()
      );
    }
    return false;
  });

  const applyFilters = () => {
    let filtered = [...allFixtures];

    const dateFilters = selectedFilters.filter((filter) => filter.type === FilterType.DATE);
    const tournamentFilters = selectedFilters.filter((filter) => filter.type === FilterType.TOURNAMENT);
    const teamFilters = selectedFilters.filter((filter) => filter.type === FilterType.TEAM);

    if (dateFilters.length > 0) {
      filtered = dateFilters.reduce((acc: Array<Fixture>, filter) => acc.concat(compareFixtureAndFilterDates(filtered, filter)), []);
    }

    if (tournamentFilters.length > 0) {
      filtered = tournamentFilters.reduce((acc: Array<Fixture>, filter) => acc.concat(filtered.filter((fixture) => fixture.tournament === filter.value)), []);
    }

    if (teamFilters.length > 0) {
      filtered = teamFilters.reduce((acc: Array<Fixture>, filter) => acc.concat(filtered.filter((fixture) => fixture.homeTeam.id === filter.team?.id
          || fixture.awayTeam.id === filter.team?.id
          || fixture.homeTeam.name === filter.value
          || fixture.awayTeam.name === filter.value
          || fixture.homeTeam.shortName === filter.value
          || fixture.awayTeam.shortName === filter.value)), []);
    }

    setFilteredFixtures(filtered);
  };

  const removeFilter = (type: FilterType, value: string) => {
    if (selectedFilters.length === 1) {
      clearFilters();
      return;
    }
    setSelectedFilters((prevFilters) => prevFilters.filter((filter) => filter.type !== type || filter.value !== value));
  };

  const clearFilters = () => {
    setSelectedFilters([]);
    setFilteredFixtures(allFixtures);
  };

  const getDateFilterValue = (date: Date) => {
    const weekday = date.toLocaleString('default', { weekday: 'short' }).charAt(0).toUpperCase() + date.toLocaleString('default', { weekday: 'short' }).slice(1);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' }).replaceAll('.', '');

    return `${weekday} ${day} ${month}`;
  };

  return (
    <>
      <Section gap="m" padding={theme.spacing.l}>
        <Header>
          <HeadingsTypography variant="h2">Matcher</HeadingsTypography>
          <HeaderButtons>
            <Button
              variant="secondary"
              onClick={() => setCreateFixturesFromFotMobSnippetModalOpen(true)}
              icon={<Sparkle size={20} weight="fill" color={theme.colors.primary} />}
            >
              Skapa matcher
            </Button>
            <Button
              variant="primary"
              onClick={() => setCreateFixtureModalOpen(true)}
              icon={<Plus size={20} weight="bold" color={theme.colors.white} />}
            >
              Lägg till match
            </Button>
          </HeaderButtons>
        </Header>
        <Divider />
        <ActionBar>
          <HeadingsTypography variant="h5">Hantera matcher</HeadingsTypography>
          <HeaderButtons>
            {editMode && (
              <TextButton
                size="s"
                color="red"
                onClick={() => setEditMode(false)}
              >
                Avsluta redigering
              </TextButton>
            )}
            <Section flexDirection="row" gap="s" alignItems="center" fitContent>
              {selectedFilters.length > 0 && !isMobile && (
                <TextButton
                  icon={<XCircle size={20} color={theme.colors.red} weight="fill" />}
                  color="red"
                  onClick={clearFilters}
                  noPadding
                >
                  Rensa filter
                </TextButton>
              )}
              <Button
                variant="secondary"
                size="s"
                icon={<Globe size={20} color={theme.colors.primary} />}
                onClick={() => setShowTournamentsModal(true)}
              >
                Välj turneringar
              </Button>
              <Button
                variant="secondary"
                size="s"
                icon={<ShieldPlus size={20} color={theme.colors.primary} />}
                onClick={() => setShowTeamsModal(true)}
              >
                Välj lag
              </Button>
              <DateFilterContainer>
                <Button
                  variant="secondary"
                  size="s"
                  icon={<Calendar size={20} color={theme.colors.primary} />}
                  onClick={() => setDatePickerMenuOpen(!datePickerMenuOpen)}
                >
                  Välj datum
                </Button>
                {datePickerMenuOpen && (
                  <ContextMenu positionX="right" positionY="bottom" offsetY={116} offsetX={0} overflow="visible">
                    <DatePickerContainer>
                      <CustomDatePicker
                        label="Datum"
                        selectedDate={new Date()}
                        includeTime={false}
                        onChange={(date) => {
                          if (!date) return;
                          setSelectedFilters((prevFilters) => {
                            const newFilter = { type: FilterType.DATE, value: getDateFilterValue(date), date };
                            if (prevFilters.some((filter) => filter.type === newFilter.type && filter.value === newFilter.value)) {
                              return prevFilters;
                            }
                            return [...prevFilters, newFilter];
                          });
                          setDatePickerMenuOpen(false);
                        }}
                        minDate={new Date()}
                        fullWidth
                      />
                    </DatePickerContainer>
                  </ContextMenu>
                )}
              </DateFilterContainer>
            </Section>
            <IconButton
              icon={<ArrowClockwise size={20} weight="bold" />}
              colors={{ normal: theme.colors.primary, hover: theme.colors.primaryDark, active: theme.colors.primaryDarker }}
              onClick={fetchFixtures}
            />
            <IconButton
              icon={contextMenuOpen ? <X size={28} /> : <DotsThree size={28} weight="bold" />}
              colors={{ normal: theme.colors.primary, hover: theme.colors.primaryDark, active: theme.colors.primaryDarker }}
              onClick={() => setContextMenuOpen(!contextMenuOpen)}
            />
            {contextMenuOpen && (
              <ContextMenu positionX="right" positionY="bottom" offsetY={(48 * getContextMenuOffsetY()) - 8} offsetX={-24}>
                {/* <ContextMenuOption
                  icon={<Funnel size={24} color={theme.colors.textDefault} />}
                  onClick={() => {
                    setContextMenuOpen(false);
                  }}
                  label="Filtrera"
                  color={theme.colors.textDefault}
                /> */}
                <ContextMenuOption
                  icon={<PencilSimple size={24} color={theme.colors.textDefault} />}
                  onClick={() => {
                    setEditMode(true);
                    setContextMenuOpen(false);
                  }}
                  label="Redigera"
                  color={theme.colors.textDefault}
                />
                {passedFixtures.length > 0 && (
                  <ContextMenuOption
                    icon={<MinusCircle size={24} color={theme.colors.red} />}
                    onClick={() => {
                      handleDeleteAllPassedFixtures();
                      setContextMenuOpen(false);
                    }}
                    label="Radera matcher som spelats"
                    color={theme.colors.red}
                  />
                )}
                {allFixtures.length > 0 && (
                  <ContextMenuOption
                    icon={<Trash size={24} color={theme.colors.red} />}
                    onClick={() => {
                      setConfirmDeleteAllModalOpen(true);
                      setContextMenuOpen(false);
                    }}
                    label="Radera alla matcher"
                    color={theme.colors.red}
                  />
                )}
              </ContextMenu>
            )}
          </HeaderButtons>
        </ActionBar>
        {selectedFilters.length > 0 && (
          <ActiveFiltersContainer>
            {selectedFilters.map((filter) => (
              <ActiveFilter>
                <EmphasisTypography variant="s" color={theme.colors.textDefault}>
                  {filter.value}
                </EmphasisTypography>
                <IconButton
                  icon={<X size={16} weight="bold" />}
                  colors={{ normal: theme.colors.silverDark, hover: theme.colors.silverDarker, active: theme.colors.textDefault }}
                  onClick={() => removeFilter(filter.type, filter.value)}
                />
              </ActiveFilter>
            ))}
          </ActiveFiltersContainer>
        )}
        {passedFixtures.length > 0 && (
          <PassedFixturesContainer>
            <WarningDiamond size={24} color={theme.colors.redDark} weight="fill" />
            <EmphasisTypography variant="m" color={theme.colors.textDefault}>
              {`${passedFixtures.length} ${passedFixtures.length === 1 ? 'match' : 'matcher'} har spelats`}
            </EmphasisTypography>
          </PassedFixturesContainer>
        )}
        {Array.from(groupFixturesByDate(filteredFixtures).entries())
          .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
          .map(([date, fixtures]) => (
            <FixturesContainer>
              <Section
                flexDirection="row"
                gap="xxs"
                justifyContent="center"
                padding={theme.spacing.xs}
                backgroundColor={theme.colors.silverLight}
                borderRadius={`${theme.borderRadius.m} ${theme.borderRadius.m} 0 0`}
                alignItems="center"
              >
                <EmphasisTypography variant="m" color={theme.colors.textDefault}>{getFixturesDateFormatted(date)}</EmphasisTypography>
                {editMode && (
                  <IconButton
                    icon={<Trash size={20} weight="fill" />}
                    colors={{ normal: theme.colors.red, hover: theme.colors.redDark, active: theme.colors.redDarker }}
                    onClick={() => handleDeleteSetOfFixtures(fixtures)}
                  />
                )}
              </Section>
              {fixtures
                .sort((a: Fixture, b: Fixture) => new Date(a.kickOffTime).getTime() - new Date(b.kickOffTime).getTime())
                .map((fixture: Fixture, index: number, array: Array<any>) => (
                  <>
                    <UpcomingFixturePreview
                      fixture={fixture}
                      useShortNames={isMobile}
                      backgroundColor={theme.colors.white}
                      onShowPredictionsClick={() => setEditFixture(fixture)}
                      alwaysClickable
                      hoverColor={theme.colors.silverLighter}
                    />
                    {index !== array.length - 1 && <Divider color={theme.colors.silverLight} />}
                  </>
                ))}
            </FixturesContainer>
          ))}
      </Section>
      {createFixtureModalOpen && (
        <CreateCentralLevelFixtureModal
          onClose={() => setCreateFixtureModalOpen(false)}
          onCreateFixture={(fixture) => handleCreateFixture(fixture)}
          loading={createFixtureLoading}
        />
      )}
      {editFixture && (
        <EditFixtureModal
          fixture={editFixture}
          onClose={() => setEditFixture(null)}
          onSave={(fixtureInput) => handleUpdateFixture(fixtureInput)}
          onDeleteFixture={handleDeleteFixture}
        />
      )}
      {createFixturesFromFotMobSnippetModalOpen && (
        <CreateFixturesViaFotMobSnippetModal
          onClose={() => setCreateFixturesFromFotMobSnippetModalOpen(false)}
          refetchFixtures={fetchFixtures}
          selectedTournamentIds={fotMobMatchesTournamentIds}
          collectionDocId={responseDocId}
          allFixtures={allFixtures}
          selectedTeamIds={fotMobMatchesTeamIds as Array<number>}
        />
      )}
      {confirmDeleteAllModalOpen && (
        <ActionsModal
          size="s"
          title="Radera alla matcher"
          message="Är du säker på att du vill radera alla matcher? Åtgärden går inte att ångra."
          actionButtonLabel="Radera"
          onActionClick={handleDeleteAllFixtures}
          onCancelClick={() => setConfirmDeleteAllModalOpen(false)}
          actionButtonColor="red"
          loading={deleteAllFixturesLoading}
        />
      )}
      {showTournamentsModal && (
        <SelectTournamentModal
          onClose={() => setShowTournamentsModal(false)}
          onSaveMultiple={(tournaments) => setSelectedFilters((prev) => [...prev, ...tournaments.map((tournament) => ({ type: FilterType.TOURNAMENT, value: tournament }))])}
          alreadySelectedTournaments={selectedFilters.filter((filter) => filter.type === FilterType.TOURNAMENT).map((filter) => filter.value as TournamentsEnum)}
          teamType={TeamType.ALL}
          multiple
        />
      )}
      {showTeamsModal && (
        <SelectTeamModal
          onClose={() => setShowTeamsModal(false)}
          onSaveMultipleTeams={(teams) => setSelectedFilters((prev) => [...prev, ...teams.map((team) => ({ type: FilterType.TEAM, value: team.name, team }))])}
          teamType={TeamType.ALL}
          value={undefined}
          alreadySelectedMultipleTeams={selectedFilters.filter((filter) => filter.type === FilterType.TEAM).map((filter) => filter.team as Team)}
          multiple
        />
      )}
      <RootToast />
    </>
  );
};

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
`;

const HeaderButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.s};
  align-items: center;
`;

const ActionBar = styled.div`
  display: flex;
  gap: ${theme.spacing.s};
  align-items: center;
  justify-content: space-between;
  background-color: ${theme.colors.white};
  padding: ${theme.spacing.xs} ${theme.spacing.s};
  border-radius: ${theme.borderRadius.l};
  width: 100%;
  box-sizing: border-box;
  position: relative;
`;

const PassedFixturesContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  align-items: center;
  justify-content: center;
  background-color: ${theme.colors.white};
  padding: ${theme.spacing.s};
  border-radius: ${theme.borderRadius.l};
  width: 100%;
  box-sizing: border-box;
  position: relative;
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

const FixturesContainer = styled.div`
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

const ActiveFiltersContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.s};
  flex-wrap: wrap;
  box-sizing: border-box;
  width: 100%;
`;

const ActiveFilter = styled.div`
  display: flex;
  gap: ${theme.spacing.xxxs};
  align-items: center;
  background-color: ${theme.colors.white};
  padding: ${theme.spacing.xxxs} ${theme.spacing.xxs} ${theme.spacing.xxxs} ${theme.spacing.xs};
  border-radius: 100px;
  border: 1px solid ${theme.colors.silverLight};
`;

const DateFilterContainer = styled.div`
  position: relative;
`;

const DatePickerContainer = styled.div`
  padding: ${theme.spacing.s};
`;

export default AdminFixturesPage;
