import React, { useState } from 'react';
import styled from 'styled-components';
import {
  CheckCircle, Circle, MagnifyingGlass, Plus,
} from '@phosphor-icons/react';
import {
  collection, getDocs,
} from 'firebase/firestore';
import { useSingleEffect } from 'react-haiku';
import Modal from '../modal/Modal';
import { devices, theme } from '../../theme';
import { Section } from '../section/Section';
import IconButton from '../buttons/IconButton';
import { EmphasisTypography, HeadingsTypography, NormalTypography } from '../typography/Typography';
import SelectImitation from '../input/SelectImitation';
import { Team } from '../../utils/Team';
import SelectTournamentModal from '../game/SelectTournamentModal';
import { Fixture, FixturesCollectionResponse, TeamType } from '../../utils/Fixture';
import SelectTeamModal from '../game/SelectTeamModal';
import Button from '../buttons/Button';
import { db } from '../../config/firebase';
import { CollectionEnum } from '../../utils/Firebase';
import { getTournamentIcon, withDocumentIdOnObject, withDocumentIdOnObjectsInArray } from '../../utils/helpers';
import { PredictionLeague } from '../../utils/League';
import { errorNotify } from '../../utils/toast/toastHelpers';
import ClubAvatar from '../avatar/ClubAvatar';
import NationAvatar from '../avatar/NationAvatar';
import Avatar, { AvatarSize } from '../avatar/Avatar';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';
import UpcomingFixturePreview from '../game/UpcomingFixturePreview';
import { Divider } from '../Divider';

enum SearchType {
  BY_TOURNAMENT = 'BY_TOURNAMENT',
  BY_CLUB = 'BY_CLUB',
  BY_NATIONAL_TEAM = 'BY_NATIONAL_TEAM',
  ALL = 'ALL',
}

interface FixtureGroup {
  tournament: string;
  fixtures: Array<Fixture>;
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
  const [availableFixtures, setAvailableFixtures] = useState<Array<FixtureGroup>>([]);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
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

      setAvailableFixtures(fixtureGroups);
    } catch (err) {
      errorNotify('Något gick fel när matcherna skulle hämtas');
    }
  };

  const getFixtureGroups = (fixtures: Array<Fixture>) => fixtures.reduce((acc, fixture) => {
    const tournamentIndex = acc.findIndex((group) => group.tournament === fixture.tournament);
    if (tournamentIndex >= 0) {
      acc[tournamentIndex].fixtures.push(fixture);
    } else {
      acc.push({ tournament: fixture.tournament, fixtures: [fixture] });
    }
    return acc;
  }, [] as Array<FixtureGroup>);

  const handleSearchForFixtures = async () => {
    setSearchLoading(true);

    try {
      const leaguesRef = collection(db, CollectionEnum.LEAGUES);
      const leaguesSnapshot = await getDocs(leaguesRef);

      const leagues = withDocumentIdOnObjectsInArray<PredictionLeague>(leaguesSnapshot.docs);

      if (searchType === SearchType.BY_TOURNAMENT) {
        handleSearchForFixturesByTournament(leagues);
      } else if (searchType === SearchType.BY_CLUB || searchType === SearchType.BY_NATIONAL_TEAM) {
        handleSearchForFixturesByTeam(leagues);
      }
    } catch (error) {
      console.error('Error fetching fixtures:', error);
      errorNotify('Något gick fel vid hämtning av matcher');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchForFixturesByTournament = async (leagues: Array<PredictionLeague>) => {
    try {
      const filteredLeagues = leagues.filter((league) => league.gameWeeks?.some((gameWeek) => gameWeek.games.fixtures.some((fixture) => fixture.tournament === selectedTournament && new Date(fixture.kickOffTime) > new Date())));

      const fixtures: Array<Fixture> = filteredLeagues
        .map((league) => league.gameWeeks?.map((gameWeek) => gameWeek.games.fixtures.map((fixture) => {
          if (fixture.tournament === selectedTournament && new Date(fixture.kickOffTime) > new Date()) {
            return fixture;
          }
          return undefined;
        })))
        .flat(2)
        .filter((fixture): fixture is Fixture => fixture !== undefined);

      setAvailableFixtures(getFixtureGroups(fixtures));
    } catch (error) {
      errorNotify('Något gick fel vid hämtning av matcher');
    }
  };

  const handleSearchForFixturesByTeam = async (leagues: Array<PredictionLeague>) => {
    try {
      const filteredLeagues = leagues.filter((league) => league.gameWeeks?.some((gameWeek) => gameWeek.games.fixtures.some((fixture) => (searchType === SearchType.BY_CLUB ? fixture.homeTeam.name === selectedTeam?.name || fixture.awayTeam.name === selectedTeam?.name : fixture.homeTeam.name === selectedTeam?.name || fixture.awayTeam.name === selectedTeam?.name) && new Date(fixture.kickOffTime) > new Date())));
      const fixtures: Array<Fixture> = filteredLeagues
        .map((league) => league.gameWeeks?.map((gameWeek) => gameWeek.games.fixtures.map((fixture) => {
          if ((searchType === SearchType.BY_CLUB ? fixture.homeTeam.name === selectedTeam?.name || fixture.awayTeam.name === selectedTeam?.name : fixture.homeTeam.name === selectedTeam?.name || fixture.awayTeam.name === selectedTeam?.name) && new Date(fixture.kickOffTime) > new Date()) {
            return fixture;
          }
          return undefined;
        })))
        .flat(2)
        .filter((fixture): fixture is Fixture => fixture !== undefined);

      setAvailableFixtures(getFixtureGroups(fixtures));
    } catch (error) {
      errorNotify('Något gick fel vid hämtning av matcher');
    }
  };

  const getKickoffDateAndTime = (kickoffTime: string, options?: { dateOnly?: boolean, timeOnly?: boolean }) => {
    const date = new Date(kickoffTime);

    const weekday = date.toLocaleDateString('sv-SE', { weekday: 'short' }).charAt(0).toUpperCase() + date.toLocaleDateString('sv-SE', { weekday: 'short' }).slice(1);
    const day = date.getDate();
    const month = date.toLocaleDateString('sv-SE', { month: 'short' }).replace('.', '');

    const hours = date.getHours();
    const minutes = date.getMinutes();

    if (options && options.dateOnly) return `${weekday} ${day} ${month}`;
    if (options && options.timeOnly) return `${hours}:${minutes < 10 ? `0${minutes}` : minutes}`;

    return `${weekday} ${day} ${month} ${hours}:${minutes < 10 ? `0${minutes}` : minutes}`;
  };

  const handleChangeSearchType = (type: SearchType) => {
    setSearchType(type);
    setSelectedTeam(null);
    setSelectedTournament(null);
  };

  const getAvatar = (team: Team, fixture: Fixture) => (fixture.teamType === TeamType.CLUBS ? (
    <ClubAvatar
      logoUrl={team.logoUrl}
      clubName={team.name}
      size={AvatarSize.S}
    />
  ) : (
    <NationAvatar
      flagUrl={team.logoUrl}
      nationName={team.name}
      size={AvatarSize.S}
    />
  ));

  // gör matcherna visuellt valbara
  // styla om matcherna som visas när man skapar sin gameweek
  // Fixa filter i denna modal
  // fixa filter på admin => Matcher

  return (
    <>
      <Modal
        title="Hitta matcher"
        size="l"
        onClose={onClose}
        mobileFullScreen
      >
        <ModalContent>
          <SearchTypesContainer>
            <SearchTypeItem selected={searchType === SearchType.ALL} onClick={() => handleChangeSearchType(SearchType.ALL)}>
              <IconButton
                icon={searchType === SearchType.ALL ? <CheckCircle size={24} weight="fill" /> : <Circle size={24} />}
                onClick={() => {}}
                colors={{ normal: searchType === SearchType.ALL ? theme.colors.primary : theme.colors.silverDark }}
              />
              <EmphasisTypography variant="m">
                Se alla
              </EmphasisTypography>
            </SearchTypeItem>
            <SearchTypeItem selected={searchType === SearchType.BY_TOURNAMENT} onClick={() => handleChangeSearchType(SearchType.BY_TOURNAMENT)}>
              <IconButton
                icon={searchType === SearchType.BY_TOURNAMENT ? <CheckCircle size={24} weight="fill" /> : <Circle size={24} />}
                onClick={() => {}}
                colors={{ normal: searchType === SearchType.BY_TOURNAMENT ? theme.colors.primary : theme.colors.silverDark }}
              />
              <EmphasisTypography variant="m">
                Välj liga
              </EmphasisTypography>
            </SearchTypeItem>
            <SearchTypeItem selected={searchType === SearchType.BY_CLUB} onClick={() => handleChangeSearchType(SearchType.BY_CLUB)}>
              <IconButton
                icon={searchType === SearchType.BY_CLUB ? <CheckCircle size={24} weight="fill" /> : <Circle size={24} />}
                onClick={() => {}}
                colors={{ normal: searchType === SearchType.BY_CLUB ? theme.colors.primary : theme.colors.silverDark }}
              />
              <EmphasisTypography variant="m">
                Välj klubblag
              </EmphasisTypography>
            </SearchTypeItem>
            <SearchTypeItem selected={searchType === SearchType.BY_NATIONAL_TEAM} onClick={() => handleChangeSearchType(SearchType.BY_NATIONAL_TEAM)}>
              <IconButton
                icon={searchType === SearchType.BY_NATIONAL_TEAM ? <CheckCircle size={24} weight="fill" /> : <Circle size={24} />}
                onClick={() => {}}
                colors={{ normal: searchType === SearchType.BY_NATIONAL_TEAM ? theme.colors.primary : theme.colors.silverDark }}
              />
              <EmphasisTypography variant="m">
                Välj landslag
              </EmphasisTypography>
            </SearchTypeItem>
          </SearchTypesContainer>
          <Section gap="xxs">
            {searchType === SearchType.BY_TOURNAMENT && (
              <>
                <EmphasisTypography variant="s">Turnering</EmphasisTypography>
                <SelectImitation
                  value={selectedTournament ?? ''}
                  placeholder="Välj turnering"
                  onClick={() => setShowTournamentsModal(true)}
                  fullWidth
                />
              </>
            )}
            {(searchType === SearchType.BY_CLUB || searchType === SearchType.BY_NATIONAL_TEAM) && (
              <>
                <EmphasisTypography variant="s">{searchType === SearchType.BY_CLUB ? 'Lag' : 'Nation'}</EmphasisTypography>
                <SelectImitation
                  value={selectedTeam?.name ?? ''}
                  placeholder="Välj lag"
                  onClick={() => setShowTeamsModal(true)}
                  fullWidth
                />
              </>
            )}
          </Section>
          {availableFixtures.length > 0 ? (
            <MainContent>
              <HeadingsTypography variant="h5">Tillgängliga matcher</HeadingsTypography>
              <AvailableFixturesContainer>
                {availableFixtures.map((fixtureGroup) => (
                  <FixturesContainer>
                    <Section
                      flexDirection="row"
                      padding={theme.spacing.xxs}
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
                            onShowPredictionsClick={() => setSelectedFixtures((prev) => [...prev, fixture])}
                          />
                          {index !== array.length - 1 && <Divider color={theme.colors.silverLight} />}
                        </>
                      ))}
                  </FixturesContainer>
                ))}
              </AvailableFixturesContainer>
            </MainContent>
          ) : (
            <NormalTypography variant="m" color={theme.colors.silverDark}>Inga matcher tillgängliga</NormalTypography>
          )}
          <ButtonContainer>
            <Button
              onClick={onClose}
              variant="secondary"
              fullWidth
            >
              Avbryt
            </Button>
            <Button
              onClick={() => onFixturesSelect(selectedFixtures)}
              variant="primary"
              icon={<Plus size={20} weight="bold" color={theme.colors.white} />}
              fullWidth
              loading={searchLoading}
              disabled={searchLoading || selectedFixtures.length === 0}
            >
              {`Lägg till matcher (${selectedFixtures.length})`}
            </Button>
          </ButtonContainer>
        </ModalContent>
      </Modal>
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

const SearchTypesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xxs};

  @media ${devices.tablet} {
    flex-direction: row;
    align-items: center;
  }
`;

const SearchTypeItem = styled.div<{ selected: boolean }>`
  display: flex;
  gap: ${theme.spacing.xxxs};
  align-items: center;
  background-color: ${({ selected }) => (selected ? theme.colors.primaryFade : theme.colors.silverLighter)};
  padding: ${theme.spacing.xxs};
  border-radius: ${theme.borderRadius.s};
  flex: 1;
  border: 1px solid ${({ selected }) => (selected ? theme.colors.primaryLighter : theme.colors.silverLight)};
  transition: all 0.2s ease-in-out;
  box-shadow: 0px 2px 0px rgba(0, 0, 0, 0.1);
  cursor: pointer;

  &:hover {
    background-color: ${theme.colors.primaryFade};
    border-color: ${theme.colors.primaryLighter};
  }
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
  gap: ${theme.spacing.xs};
  width: 100%;
  box-sizing: border-box;
`;

const AvailableFixtureItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  gap: ${theme.spacing.xxs};
  min-width: 100px;
  border-radius: ${theme.borderRadius.l};
  background-color: ${theme.colors.silverLighter};
  border: 1px solid ${theme.colors.silverLight};
  box-shadow: 0px 3px 0px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: ${theme.colors.primaryFade};
    border-color: ${theme.colors.primaryLighter};
  }
`;

const FixtureDate = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: ${theme.spacing.xs};
  border-bottom: 1px solid ${theme.colors.silverLight};
  padding: ${theme.spacing.xs} 0;
`;

const FixtureTeams = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  width: 100%;
  gap: ${theme.spacing.xxs};
  padding-bottom: ${theme.spacing.xxs};
`;

const TeamContainer = styled.div<{ flexEnd?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xxxs};
  width: fit-content;
  white-space: nowrap;
  ${({ flexEnd }) => flexEnd && 'margin-left: auto;'}
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.s};
  padding-right: ${theme.spacing.xxxs};
  margin-top: auto;
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
`;

export default FindOtherFixturesModal;
