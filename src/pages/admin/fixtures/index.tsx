import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  DotsThree, Funnel, Plus, Sparkle, Trash, WarningDiamond, X,
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
import { Fixture, FixtureInput } from '../../../utils/Fixture';
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

type FixturesCollectionResponse = {
  documentId: string;
  fixtures: Array<Fixture>;
};

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
  const [createFixtureLoading, setCreateFixtureLoading] = useState<boolean>(false);
  const [editFixture, setEditFixture] = useState<Fixture | null>(null);
  const [contextMenuOpen, setContextMenuOpen] = useState<boolean>(false);
  const [selectedFilters, setSelectedFilters] = useState<Array<{ type: FilterType; value: string }>>([]);

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
      // setFilteredFixtures(upcomingFixtures);
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
              onClick={() => setCreateFixtureModalOpen(true)}
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
              <ContextMenu positionX="right" positionY="bottom" offsetY={(48 * 2) - 8} offsetX={-24}>
                <ContextMenuOption
                  icon={<Funnel size={24} color={theme.colors.textDefault} />}
                  onClick={() => {
                    // setEditTeamModalOpen(true);
                    setContextMenuOpen(false);
                  }}
                  label="Filtrera"
                  color={theme.colors.textDefault}
                />
                {/* <ContextMenuOption
                  icon={<UsersFour size={24} color={theme.colors.textDefault} />}
                  onClick={() => {
                    setUpdateSquadModal(true);
                    setContextMenuOpen(false);
                  }}
                  label="Uppdatera trupp"
                  color={theme.colors.textDefault}
                /> */}
                <ContextMenuOption
                  icon={<Trash size={24} color={theme.colors.red} />}
                  onClick={() => {
                    handleDeleteAllPassedFixtures();
                    setContextMenuOpen(false);
                  }}
                  label="Radera matcher som spelats"
                  color={theme.colors.red}
                />
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
        {Array.from(groupFixturesByDate(filteredFixtures).entries()).map(([date, fixtures]) => (
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
