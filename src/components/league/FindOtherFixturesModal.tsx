import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  Plus,
} from '@phosphor-icons/react';
import {
  collection, getDocs,
} from 'firebase/firestore';
import { useSingleEffect } from 'react-haiku';
import { theme } from '../../theme';
import { Section } from '../section/Section';
import { EmphasisTypography, HeadingsTypography, NormalTypography } from '../typography/Typography';
import { Team } from '../../utils/Team';
import SelectTournamentModal from '../game/SelectTournamentModal';
import {
  Fixture, FixtureGroup, FixturesCollectionResponse, TeamType,
} from '../../utils/Fixture';
import SelectTeamModal from '../game/SelectTeamModal';
import { db } from '../../config/firebase';
import { CollectionEnum } from '../../utils/Firebase';
import { getFixtureGroups, getTournamentIcon, withDocumentIdOnObject } from '../../utils/helpers';
import { errorNotify } from '../../utils/toast/toastHelpers';
import Avatar, { AvatarSize } from '../avatar/Avatar';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';
import UpcomingFixturePreview from '../game/UpcomingFixturePreview';
import { Divider } from '../Divider';
import ActionsModal from '../modal/ActionsModal';

enum SearchType {
  BY_TOURNAMENT = 'BY_TOURNAMENT',
  BY_CLUB = 'BY_CLUB',
  BY_NATIONAL_TEAM = 'BY_NATIONAL_TEAM',
  ALL = 'ALL',
}

interface FindOtherFixturesModalProps {
  onClose: () => void;
  onFixturesSelect: (fixture: Array<Fixture>) => void;
}

const FindOtherFixturesModal = ({ onClose, onFixturesSelect }: FindOtherFixturesModalProps) => {
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const [searchType, setSearchType] = useState<SearchType>(SearchType.ALL);
  const [showTournamentsModal, setShowTournamentsModal] = useState<boolean>(false);
  const [showTeamsModal, setShowTeamsModal] = useState<boolean>(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedTournament, setSelectedTournament] = useState<string | null>(null);
  const [availableFixtureGroups, setAvailableFixtureGroups] = useState<Array<FixtureGroup>>([]);
  const [searchLoading, setSearchLoading] = useState<boolean>(true);
  const [selectedFixtures, setSelectedFixtures] = useState<Array<Fixture>>([]);

  useSingleEffect(() => {
    fetchFixtures();
  });

  const fetchFixtures = async () => {
    try {
      const data = await getDocs(collection(db, CollectionEnum.FIXTURES));
      const fixturesResponse = withDocumentIdOnObject<FixturesCollectionResponse>(data.docs[0]);

      const upcomingFixtures = fixturesResponse.fixtures.filter((f) => new Date(f.kickOffTime) >= new Date());
      // const fixturesSortedByTournament = upcomingFixtures.sort((a, b) => a.tournament.localeCompare(b.tournament));
      const fixtureGroups = getFixtureGroups(upcomingFixtures);

      setAvailableFixtureGroups(fixtureGroups);
    } catch (err) {
      errorNotify('Något gick fel när matcherna skulle hämtas');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectFixture = (fixture: Fixture) => {
    setSelectedFixtures((prev) => {
      const index = prev.findIndex((f) => f.id === fixture.id);
      if (index >= 0) {
        return prev.filter((f) => f.id !== fixture.id);
      }
      return [...prev, fixture];
    });
  };

  // styla om matcherna som visas när man skapar sin gameweek
  // Fixa filter i denna modal
  // fixa filter på admin => Matcher

  return (
    <>
      <ActionsModal
        title="Hitta matcher"
        size="l"
        onCancelClick={onClose}
        mobileFullScreen
        headerDivider
        actionButtonLabel={`Lägg till matcher (${selectedFixtures.length})`}
        actionButtonDisabled={searchLoading || selectedFixtures.length === 0}
        actionButtonStartIcon={<Plus size={20} weight="bold" color={theme.colors.white} />}
        onActionClick={() => onFixturesSelect(selectedFixtures)}
        loading={searchLoading}
      >
        <ModalContent>
          {searchLoading && <NormalTypography variant="m" color={theme.colors.silverDark}>Laddar matcher...</NormalTypography>}
          {availableFixtureGroups.length > 0 && !searchLoading && (
            <MainContent>
              <HeadingsTypography variant="h5">Tillgängliga matcher</HeadingsTypography>
              <AvailableFixturesContainer>
                {availableFixtureGroups.map((fixtureGroup) => (
                  <FixturesContainer>
                    <Section
                      flexDirection="row"
                      padding={theme.spacing.xxxs}
                      backgroundColor={theme.colors.silverLight}
                      borderRadius={`${theme.borderRadius.m} ${theme.borderRadius.m} 0 0`}
                      alignItems="center"
                      justifyContent="center"
                      gap="xxxs"
                    >
                      <EmphasisTypography variant="m" color={theme.colors.textDefault}>{fixtureGroup.tournament}</EmphasisTypography>
                      <Avatar
                        src={getTournamentIcon(fixtureGroup.tournament)}
                        size={AvatarSize.S}
                        objectFit="contain"
                      />
                    </Section>
                    {fixtureGroup.fixtures
                      .sort((a: Fixture, b: Fixture) => new Date(a.kickOffTime).getTime() - new Date(b.kickOffTime).getTime())
                      .map((fixture: Fixture, index: number, array: Array<any>) => (
                        <>
                          <UpcomingFixturePreview
                            fixture={fixture}
                            useShortNames={isMobile}
                            alwaysClickable
                            showDay
                            onSelectFixture={() => handleSelectFixture(fixture)}
                          />
                          {index !== array.length - 1 && <Divider color={theme.colors.silverLight} />}
                        </>
                      ))}
                  </FixturesContainer>
                ))}
              </AvailableFixturesContainer>
            </MainContent>
          )}
          {!searchLoading && availableFixtureGroups.length === 0 && (
            <NormalTypography variant="m" color={theme.colors.silverDark}>Inga matcher tillgängliga</NormalTypography>
          )}
        </ModalContent>
      </ActionsModal>
      {showTournamentsModal && (
        <SelectTournamentModal
          onClose={() => setShowTournamentsModal(false)}
          onSave={(tournament) => setSelectedTournament(tournament)}
          teamType={TeamType.ALL}
        />
      )}
      {showTeamsModal && (
        <SelectTeamModal
          onClose={() => setShowTeamsModal(false)}
          onSave={(team) => setSelectedTeam(team)}
          teamType={searchType === SearchType.BY_CLUB ? TeamType.CLUBS : TeamType.NATIONS}
          value={selectedTeam ?? undefined}
        />
      )}
    </>
  );
};

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.m};
  flex-grow: 1;
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.s};
  flex-grow: 1;
`;

const AvailableFixturesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.m};
  width: 100%;
  box-sizing: border-box;
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const FixturesContainer = styled.div`
  display: flex;
  /* gap: ${theme.spacing.s}; */
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

export default FindOtherFixturesModal;
