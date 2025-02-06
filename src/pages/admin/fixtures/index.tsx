import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Funnel, Plus, Sparkle } from '@phosphor-icons/react';
import {
  getDocs, collection, addDoc, deleteDoc, doc,
  updateDoc,
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
import { groupFixturesByDate, withDocumentIdOnObjectsInArray } from '../../../utils/helpers';
import CreateCentralLevelFixtureModal from '../../../components/game/CreateCentralLevelFixtureModal';
import RootToast from '../../../components/toast/RootToast';
import { errorNotify, successNotify } from '../../../utils/toast/toastHelpers';
import UpcomingFixturePreview from '../../../components/game/UpcomingFixturePreview';
import useResizeListener, { DeviceSizes } from '../../../utils/hooks/useResizeListener';
import EditFixtureModal from '../../../components/game/EditFixtureModal';

const AdminFixturesPage = () => {
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const [fixtures, setFixtures] = useState<Array<Fixture>>([]);
  const [createFixtureModalOpen, setCreateFixtureModalOpen] = useState<boolean>(false);
  const [createFixtureLoading, setCreateFixtureLoading] = useState<boolean>(false);
  const [editFixture, setEditFixture] = useState<Fixture | null>(null);

  useSingleEffect(() => {
    fetchFixtures();
  });

  const fetchFixtures = async () => {
    try {
      const data = await getDocs(collection(db, CollectionEnum.FIXTURES));
      const allFixtures = withDocumentIdOnObjectsInArray<Fixture>(data.docs);
      setFixtures(allFixtures);
    } catch (err) {
      errorNotify('Något gick fel när matcherna skulle hämtas');
    }
  };

  const handleCreateFixture = async (fixture: FixtureInput) => {
    setCreateFixtureLoading(true);

    try {
      await addDoc(collection(db, CollectionEnum.FIXTURES), fixture);
      successNotify('Matchen skapades');
      fetchFixtures();
    } catch (err) {
      errorNotify('Något gick fel när matchen skulle skapas');
    } finally {
      setCreateFixtureLoading(false);
    }
  };

  const handleUpdateFixture = async (fixture: Fixture) => {
    const fixtureDoc = doc(db, CollectionEnum.FIXTURES, fixture.documentId ?? '');

    try {
      setEditFixture(null);
      await updateDoc(fixtureDoc, fixture as any);
      successNotify('Matchen uppdaterades');
      fetchFixtures();
    } catch (err) {
      errorNotify('Något gick fel när matchen skulle uppdateras');
    }
  };

  const handleDeleteFixture = async () => {
    try {
      const fixtureDoc = doc(db, CollectionEnum.FIXTURES, editFixture?.documentId ?? '');
      await deleteDoc(fixtureDoc);

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
          <HeadingsTypography variant="h5">Filtrera matcher</HeadingsTypography>
          <HeaderButtons>
            {/* <Button variant="secondary" onClick={() => console.log('Rensa filter')}>
            Rensa filter
          </Button> */}
            <Button
              variant="secondary"
              onClick={() => console.log('Rensa filter')}
              color="textDefault"
              icon={<Funnel size={20} weight="fill" color={theme.colors.textDefault} />}
            >
              Filtrera
            </Button>
          </HeaderButtons>
        </ActionBar>
        {Array.from(groupFixturesByDate(fixtures).entries()).map(([date, fixtures]) => (
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
  padding: ${theme.spacing.s};
  border-radius: ${theme.borderRadius.l};
  width: 100%;
  box-sizing: border-box;
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
