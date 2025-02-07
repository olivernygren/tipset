import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  DotsThree, Funnel, MinusCircle, Plus, Sparkle, Trash, WarningDiamond, X,
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
import { Fixture, FixtureInput, FixturesCollectionResponse } from '../../../utils/Fixture';
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
import { getTeamsByTournament, TournamentsEnum } from '../../../utils/Team';

enum FilterType {
  DATE = 'DATE',
  TOURNAMENT = 'TOURNAMENT',
  TEAM = 'TEAM',
  ALL = 'ALL',
}

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
  const [selectedFilters, setSelectedFilters] = useState<Array<{ type: FilterType; value: string }>>([]);
  const [confirmDeleteAllModalOpen, setConfirmDeleteAllModalOpen] = useState<boolean>(false);

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

  const getFixturesDateFormatted = (date: string) => {
    const fixtureDate = new Date(date);
    const day = fixtureDate.getDate();
    const weekday = fixtureDate.toLocaleString('default', { weekday: 'long' }).replaceAll('.', '').charAt(0).toUpperCase() + fixtureDate.toLocaleString('default', { weekday: 'long' }).slice(1);
    const month = fixtureDate.toLocaleString('default', { month: 'long' }).replaceAll('.', '');
    return `${weekday} ${day} ${month}`;
  };

  const applyFilters = () => {
    let filtered = [...allFixtures];

    selectedFilters.forEach((filter) => {
      switch (filter.type) {
        case FilterType.DATE:
          filtered = filtered.filter((fixture) => new Date(fixture.kickOffTime).toDateString() === new Date(filter.value).toDateString());
          break;
        case FilterType.TOURNAMENT:
          filtered = filtered.filter((fixture) => fixture.tournament === filter.value);
          break;
        case FilterType.TEAM:
          filtered = filtered.filter((fixture) => fixture.homeTeam.name === filter.value || fixture.awayTeam.name === filter.value);
          break;
        case FilterType.ALL:
          filtered = [...allFixtures];
          break;
        default:
          break;
      }
    });

    setFilteredFixtures(filtered);
  };

  const addFilter = (type: FilterType, value: string) => {
    setSelectedFilters((prevFilters) => [...prevFilters, { type, value }]);
  };

  const removeFilter = (type: FilterType, value: string) => {
    setSelectedFilters((prevFilters) => prevFilters.filter((filter) => filter.type !== type || filter.value !== value));
  };

  const clearFilters = () => {
    setSelectedFilters([]);
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
            <IconButton
              icon={contextMenuOpen ? <X size={28} /> : <DotsThree size={28} weight="bold" />}
              colors={{ normal: theme.colors.primary, hover: theme.colors.primaryDark, active: theme.colors.primaryDarker }}
              onClick={() => setContextMenuOpen(!contextMenuOpen)}
              backgroundColor={theme.colors.white}
            />
            {contextMenuOpen && (
              <ContextMenu positionX="right" positionY="bottom" offsetY={(48 * getContextMenuOffsetY()) - 8} offsetX={-24}>
                <ContextMenuOption
                  icon={<Funnel size={24} color={theme.colors.textDefault} />}
                  onClick={() => {
                    setContextMenuOpen(false);
                  }}
                  label="Filtrera"
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
  padding: ${theme.spacing.xxs} ${theme.spacing.s};
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

export default AdminFixturesPage;
