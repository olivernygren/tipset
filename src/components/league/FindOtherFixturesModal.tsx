import React, { useState } from 'react';
import styled from 'styled-components';
import { CheckCircle, Circle, MagnifyingGlass } from '@phosphor-icons/react';
import {
  collection, getDocs,
} from 'firebase/firestore';
import Modal from '../modal/Modal';
import { theme } from '../../theme';
import { Section } from '../section/Section';
import IconButton from '../buttons/IconButton';
import { EmphasisTypography, HeadingsTypography, NormalTypography } from '../typography/Typography';
import SelectImitation from '../input/SelectImitation';
import { Team } from '../../utils/Team';
import SelectTournamentModal from '../game/SelectTournamentModal';
import { Fixture, TeamType } from '../../utils/Fixture';
import SelectTeamModal from '../game/SelectTeamModal';
import Button from '../buttons/Button';
import { db } from '../../config/firebase';
import { CollectionEnum } from '../../utils/Firebase';
import { withDocumentIdOnObjectsInArray } from '../../utils/helpers';
import { PredictionLeague } from '../../utils/League';
import { errorNotify } from '../../utils/toast/toastHelpers';

enum SearchType {
  BY_TOURNAMENT = 'BY_TOURNAMENT',
  BY_CLUB = 'BY_CLUB',
  BY_NATIONAL_TEAM = 'BY_NATIONAL_TEAM',
}

interface ExternalFixture {
  fixture: Fixture;
  leagueId: string;
  leagueName: string;
}

interface FindOtherFixturesModalProps {
  onClose: () => void;
}

const FindOtherFixturesModal = ({ onClose }: FindOtherFixturesModalProps) => {
  const [searchType, setSearchType] = useState<SearchType>(SearchType.BY_TOURNAMENT);
  const [showTournamentsModal, setShowTournamentsModal] = useState<boolean>(false);
  const [showTeamsModal, setShowTeamsModal] = useState<boolean>(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedTournament, setSelectedTournament] = useState<string | null>(null);
  const [availableFixtures, setAvailableFixtures] = useState<Array<ExternalFixture>>([]);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);

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

      const fixtures: Array<ExternalFixture> = filteredLeagues
        .map((league) => league.gameWeeks?.map((gameWeek) => gameWeek.games.fixtures.map((fixture) => {
          if (fixture.tournament === selectedTournament && new Date(fixture.kickOffTime) > new Date()) {
            return {
              fixture,
              leagueId: league.documentId,
              leagueName: league.name,
            };
          }
          return undefined;
        })))
        .flat(2)
        .filter((fixture): fixture is ExternalFixture => fixture !== undefined);

      setAvailableFixtures(fixtures);
    } catch (error) {
      errorNotify('Något gick fel vid hämtning av matcher');
    }
  };

  const handleSearchForFixturesByTeam = async (leagues: Array<PredictionLeague>) => {
    try {
      const filteredLeagues = leagues.filter((league) => league.gameWeeks?.some((gameWeek) => gameWeek.games.fixtures.some((fixture) => (searchType === SearchType.BY_CLUB ? fixture.homeTeam.name === selectedTeam?.name || fixture.awayTeam.name === selectedTeam?.name : fixture.homeTeam.name === selectedTeam?.name || fixture.awayTeam.name === selectedTeam?.name) && new Date(fixture.kickOffTime) > new Date())));
      const fixtures: Array<ExternalFixture> = filteredLeagues
        .map((league) => league.gameWeeks?.map((gameWeek) => gameWeek.games.fixtures.map((fixture) => {
          if ((searchType === SearchType.BY_CLUB ? fixture.homeTeam.name === selectedTeam?.name || fixture.awayTeam.name === selectedTeam?.name : fixture.homeTeam.name === selectedTeam?.name || fixture.awayTeam.name === selectedTeam?.name) && new Date(fixture.kickOffTime) > new Date()) {
            return {
              fixture,
              leagueId: league.documentId,
              leagueName: league.name,
            };
          }
          return undefined;
        })))
        .flat(2)
        .filter((fixture): fixture is ExternalFixture => fixture !== undefined);

      setAvailableFixtures(fixtures);
    } catch (error) {
      errorNotify('Något gick fel vid hämtning av matcher');
    }
  };

  const getKickoffDateAndTime = (kickoffTime: string) => {
    const date = new Date(kickoffTime);
    const weekday = date.toLocaleDateString('sv-SE', { weekday: 'short' }).charAt(0).toUpperCase() + date.toLocaleDateString('sv-SE', { weekday: 'short' }).slice(1);
    const day = date.getDate();
    const month = date.toLocaleDateString('sv-SE', { month: 'short' }).replace('.', '');
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${weekday} ${day} ${month} ${hours}:${minutes < 10 ? `0${minutes}` : minutes}`;
  };

  const handleChangeSearchType = (type: SearchType) => {
    setSearchType(type);
    setSelectedTeam(null);
    setSelectedTournament(null);
    setAvailableFixtures([]);
  };

  return (
    <>
      <Modal
        title="Hitta andra matcher"
        onClose={onClose}
      >
        <ModalContent>
          <Section flexDirection="row" alignItems="center" gap="s">
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
          </Section>
          <Section gap="xxs">
            {searchType === SearchType.BY_TOURNAMENT ? (
              <>
                <EmphasisTypography variant="s">Turnering</EmphasisTypography>
                <SelectImitation
                  value={selectedTournament ?? ''}
                  placeholder="Välj turnering"
                  onClick={() => setShowTournamentsModal(true)}
                  fullWidth
                />
              </>
            ) : (
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
            <Section gap="s">
              <HeadingsTypography variant="h5">Tillgängliga matcher</HeadingsTypography>
              <AvailableFixturesContainer>
                {availableFixtures.map((externalFixture) => (
                  <AvailableFixtureItem key={externalFixture.fixture.id}>
                    <EmphasisTypography variant="s">{`${externalFixture.fixture.homeTeam.name} - ${externalFixture.fixture.awayTeam.name}`}</EmphasisTypography>
                    <EmphasisTypography variant="s">{getKickoffDateAndTime(externalFixture.fixture.kickOffTime)}</EmphasisTypography>
                    <HeadingsTypography variant="h6">{externalFixture.leagueName}</HeadingsTypography>
                  </AvailableFixtureItem>
                ))}
              </AvailableFixturesContainer>
            </Section>
          ) : (
            <NormalTypography variant="m" color={theme.colors.silverDark}>Inga matcher tillgängliga</NormalTypography>
          )}
          <Section flexDirection="row" alignItems="center" gap="s">
            <Button
              onClick={onClose}
              variant="secondary"
              fullWidth
            >
              Avbryt
            </Button>
            <Button
              onClick={handleSearchForFixtures}
              variant="primary"
              icon={<MagnifyingGlass size={20} weight="bold" color={theme.colors.white} />}
              fullWidth
              loading={searchLoading}
              disabled={(searchType === SearchType.BY_TOURNAMENT && !selectedTournament) || (searchType !== SearchType.BY_TOURNAMENT && !selectedTeam) || searchLoading}
            >
              Sök
            </Button>
          </Section>
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
  flex: 1;
  gap: ${theme.spacing.xs};
  min-width: 100px;
  padding: ${theme.spacing.s};
  border-radius: ${theme.borderRadius.m};
  background-color: ${theme.colors.silverLighter};
  box-shadow: 0px 2px 0px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: ${theme.colors.primaryFade};
  }
`;

export default FindOtherFixturesModal;
