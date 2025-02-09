import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  Globe,
  Plus,
  ShieldPlus,
  XCircle,
} from '@phosphor-icons/react';
import {
  collection, getDocs,
} from 'firebase/firestore';
import { useSingleEffect } from 'react-haiku';
import { devices, theme } from '../../theme';
import { Section } from '../section/Section';
import { EmphasisTypography, HeadingsTypography, NormalTypography } from '../typography/Typography';
import { Team, TournamentsEnum } from '../../utils/Team';
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
import Button from '../buttons/Button';
import IconButton from '../buttons/IconButton';
import TextButton from '../buttons/TextButton';

// enum SearchType {
//   BY_TOURNAMENT = 'BY_TOURNAMENT',
//   BY_CLUB = 'BY_CLUB',
//   BY_NATIONAL_TEAM = 'BY_NATIONAL_TEAM',
//   ALL = 'ALL',
// }

interface FindOtherFixturesModalProps {
  onClose: () => void;
  onFixturesSelect: (fixture: Array<Fixture>) => void;
  alreadySelectedFixtures: Array<Fixture>;
  minDate?: Date;
}

const FindOtherFixturesModal = ({
  onClose, onFixturesSelect, minDate, alreadySelectedFixtures,
}: FindOtherFixturesModalProps) => {
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const [filterByTeams, setFilterByTeams] = useState<Array<Team>>([]);
  const [filterByTournaments, setFilterByTournaments] = useState<Array<TournamentsEnum>>([]);
  const [showTournamentsModal, setShowTournamentsModal] = useState<boolean>(false);
  const [showTeamsModal, setShowTeamsModal] = useState<boolean>(false);
  const [availableFixtureGroups, setAvailableFixtureGroups] = useState<Array<FixtureGroup>>([]);
  const [allDefaultFixtureGroups, setAllDefaultFixtureGroups] = useState<Array<FixtureGroup>>([]);
  const [searchLoading, setSearchLoading] = useState<boolean>(true);
  const [selectedFixtures, setSelectedFixtures] = useState<Array<Fixture>>([]);

  const dateForUpcomingFixtures = minDate ?? new Date();

  useSingleEffect(() => {
    fetchFixtures();
  });

  useEffect(() => {
    if (filterByTeams.length === 0 && filterByTournaments.length === 0) {
      setAvailableFixtureGroups(availableFixtureGroups);
      return;
    }

    const hasAppliedTournamentFilters = filterByTournaments.length > 0;
    const hasAppliedTeamFilters = filterByTeams.length > 0;
    const hasAppliedBothTypesOfFilters = hasAppliedTournamentFilters && hasAppliedTeamFilters;

    const filteredFixtures = allDefaultFixtureGroups.map((fixtureGroup) => {
      const filteredFixtures = fixtureGroup.fixtures.filter((f) => {
        if (hasAppliedBothTypesOfFilters) {
          return filterByTeams.some((t) => t.id === f.homeTeam.id || t.id === f.awayTeam.id || t.name === f.homeTeam.name || t.name === f.awayTeam.name) && filterByTournaments.includes(fixtureGroup.tournament as TournamentsEnum);
        }

        if (hasAppliedTournamentFilters) {
          return filterByTournaments.includes(fixtureGroup.tournament as TournamentsEnum);
        }

        return filterByTeams.some((t) => t.id === f.homeTeam.id || t.id === f.awayTeam.id || t.name === f.homeTeam.name || t.name === f.awayTeam.name);
      });

      return {
        ...fixtureGroup,
        fixtures: filteredFixtures,
      };
    }).filter((fixtureGroup) => fixtureGroup.fixtures.length > 0);

    setAvailableFixtureGroups(filteredFixtures);
  }, [filterByTeams, filterByTournaments]);

  const fetchFixtures = async () => {
    try {
      const data = await getDocs(collection(db, CollectionEnum.FIXTURES));
      const fixturesResponse = withDocumentIdOnObject<FixturesCollectionResponse>(data.docs[0]);

      const upcomingFixtures = fixturesResponse.fixtures.filter((f) => new Date(f.kickOffTime) >= dateForUpcomingFixtures);
      const fixtureGroups = getFixtureGroups(upcomingFixtures);

      setAvailableFixtureGroups(fixtureGroups);

      if (allDefaultFixtureGroups.length === 0) {
        setAllDefaultFixtureGroups(fixtureGroups);
      }
    } catch (err) {
      errorNotify('Något gick fel när matcherna skulle hämtas');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectFixture = (fixture: Fixture) => {
    if (alreadySelectedFixtures.some((f) => f.id === fixture.id)) {
      return;
    }
    setSelectedFixtures((prev) => {
      const index = prev.findIndex((f) => f.id === fixture.id);
      if (index >= 0) {
        return prev.filter((f) => f.id !== fixture.id);
      }
      return [...prev, fixture];
    });
  };

  const handleClearFilters = () => {
    setFilterByTeams([]);
    setFilterByTournaments([]);
    setAvailableFixtureGroups(allDefaultFixtureGroups);
  };

  const handleRemoveFilter = (filter: string) => {
    const combinedFilters = [...filterByTeams.map((t) => t.name), ...filterByTournaments];

    if (combinedFilters.length === 1) {
      handleClearFilters();
      return;
    }

    if (filterByTournaments.includes(filter as TournamentsEnum)) {
      setFilterByTournaments(filterByTournaments.filter((t) => t !== filter as TournamentsEnum));
    }

    if (filterByTeams.some((t) => t.name === filter)) {
      setFilterByTeams(filterByTeams.filter((t) => t.name !== filter));
    }
  };

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
          {(availableFixtureGroups.length > 0 || [...filterByTeams, ...filterByTournaments].length > 0) && !searchLoading && (
            <MainContent>
              <Header>
                <HeadingsTypography variant="h5">Tillgängliga matcher</HeadingsTypography>
                <Section flexDirection="row" gap="s" alignItems="center" fitContent>
                  {(filterByTeams.length > 0 || filterByTournaments.length > 0) && !isMobile && (
                    <TextButton
                      icon={<XCircle size={20} color={theme.colors.red} weight="fill" />}
                      color="red"
                      onClick={handleClearFilters}
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
                </Section>
                {(filterByTeams.length > 0 || filterByTournaments.length > 0) && isMobile && (
                  <TextButton
                    icon={<XCircle size={20} color={theme.colors.red} weight="fill" />}
                    color="red"
                    onClick={handleClearFilters}
                    noPadding
                  >
                    Rensa filter
                  </TextButton>
                )}
              </Header>
              {[...filterByTeams, ...filterByTournaments].length > 0 && (
                <>
                  <Divider />
                  <ActiveFiltersContainer>
                    {filterByTournaments.map((tournament) => (
                      <ActiveFilter>
                        <EmphasisTypography variant="m" color={theme.colors.textDefault}>{tournament}</EmphasisTypography>
                        <IconButton
                          onClick={() => handleRemoveFilter(tournament)}
                          colors={{ normal: theme.colors.silverDark, hover: theme.colors.silverDarker, active: theme.colors.silverDarker }}
                          icon={<XCircle size={20} weight="fill" />}
                        />
                      </ActiveFilter>
                    ))}
                    {filterByTeams.map((team) => (
                      <ActiveFilter>
                        <EmphasisTypography variant="m" color={theme.colors.textDefault}>{team.name}</EmphasisTypography>
                        <IconButton
                          onClick={() => handleRemoveFilter(team.name)}
                          colors={{ normal: theme.colors.silverDark, hover: theme.colors.silverDarker, active: theme.colors.silverDarker }}
                          icon={<XCircle size={20} weight="fill" />}
                        />
                      </ActiveFilter>
                    ))}
                  </ActiveFiltersContainer>
                  <Divider />
                </>
              )}
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
                            alreadySelectedFixtures={alreadySelectedFixtures}
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
          onSaveMultiple={(tournaments) => setFilterByTournaments(tournaments)}
          alreadySelectedTournaments={filterByTournaments}
          teamType={TeamType.ALL}
          multiple
        />
      )}
      {showTeamsModal && (
        <SelectTeamModal
          onClose={() => setShowTeamsModal(false)}
          onSaveMultipleTeams={(teams) => setFilterByTeams(teams)}
          teamType={TeamType.ALL}
          value={undefined}
          alreadySelectedMultipleTeams={filterByTeams}
          multiple
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

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.s};
  width: 100%;
  
  @media ${devices.tablet} {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.s};
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

const ActiveFiltersContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.s};
  flex-wrap: wrap;
`;

const ActiveFilter = styled.div`
  display: flex;
  gap: ${theme.spacing.xxxs};
  align-items: center;
  background-color: ${theme.colors.silverLighter};
  padding: ${theme.spacing.xxxs} ${theme.spacing.xxs} ${theme.spacing.xxxs} ${theme.spacing.xs};
  border-radius: 100px;
  border: 1px solid ${theme.colors.silverLight};
`;

export default FindOtherFixturesModal;
