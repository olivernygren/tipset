import React, { useState } from 'react';
import styled from 'styled-components';
import {
  CheckCircle, Circle,
} from '@phosphor-icons/react';
import Modal from '../modal/Modal';
import { devices, theme } from '../../theme';
import Button from '../buttons/Button';
import { EmphasisTypography, HeadingsTypography, NormalTypography } from '../typography/Typography';
import { TournamentsEnum } from '../../utils/Team';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';
import Input from '../input/Input';
import { TeamType } from '../../utils/Fixture';
import IconButton from '../buttons/IconButton';
import Avatar, { AvatarSize } from '../avatar/Avatar';

interface SelectTournamentModalProps {
  onClose: () => void;
  onSave: (tournament: string) => void;
  defaultValue?: string;
  teamType: TeamType;
}

enum TournamentCountryFiltersEnum {
  ENGLAND = 'England',
  SPAIN = 'Spanien',
  ITALY = 'Italien',
  GERMANY = 'Tyskland',
  FRANCE = 'Frankrike',
  SWEDEN = 'Sverige',
  EUROPE = 'Europa',
  NATIONAL = 'Landslag',
}

const SelectTournamentModal = ({
  onClose, onSave, defaultValue, teamType,
}:SelectTournamentModalProps) => {
  const originalTournaments = Object.values(TournamentsEnum);
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const [tournaments, setTournaments] = useState(originalTournaments);
  const [selectedTournament, setSelectedTournament] = useState<string | undefined>(defaultValue);
  const [searchValue, setSearchValue] = useState('');

  const getNationalTeamTournaments = () => originalTournaments.filter((tournament) => tournament.includes(TournamentsEnum.WORLD_CUP)
      || tournament.includes(TournamentsEnum.WORLD_CUP_QUALIFIERS)
      || tournament.includes(TournamentsEnum.EUROS)
      || tournament.includes(TournamentsEnum.EUROS_QUALIFIERS)
      || tournament.includes(TournamentsEnum.NATIONS_LEAGUE));

  const getTournamentsByCountry = (country: TournamentCountryFiltersEnum) => {
    // if (teamType === TeamType.NATIONS) {
    //   return originalTournaments.filter((tournament) => tournament.includes(TournamentsEnum.WORLD_CUP)
    //   || tournament.includes(TournamentsEnum.WORLD_CUP_QUALIFIERS)
    //   || tournament.includes(TournamentsEnum.EUROS)
    //   || tournament.includes(TournamentsEnum.EUROS_QUALIFIERS)
    //   || tournament.includes(TournamentsEnum.NATIONS_LEAGUE));
    // }

    switch (country) {
      case TournamentCountryFiltersEnum.ENGLAND:
        return originalTournaments.filter((tournament) => tournament.includes(TournamentsEnum.PREMIER_LEAGUE) || tournament.includes(TournamentsEnum.FA_CUP) || tournament.includes(TournamentsEnum.CARABAO_CUP) || tournament.includes(TournamentsEnum.CHAMPIONSHIP));
      case TournamentCountryFiltersEnum.SPAIN:
        return originalTournaments.filter((tournament) => tournament.includes(TournamentsEnum.LA_LIGA) || tournament.includes(TournamentsEnum.COPA_DEL_REY) || tournament.includes(TournamentsEnum.SUPERCOPA));
      case TournamentCountryFiltersEnum.ITALY:
        return originalTournaments.filter((tournament) => tournament.includes(TournamentsEnum.SERIE_A) || tournament.includes(TournamentsEnum.COPPA_ITALIA) || tournament.includes(TournamentsEnum.SUPERCOPPA_ITALIANA));
      case TournamentCountryFiltersEnum.GERMANY:
        return originalTournaments.filter((tournament) => tournament.includes(TournamentsEnum.BUNDESLIGA) || tournament.includes(TournamentsEnum.DFB_POKAL) || tournament.includes(TournamentsEnum.BUNDESLIGA_2));
      case TournamentCountryFiltersEnum.FRANCE:
        return originalTournaments.filter((tournament) => tournament.includes(TournamentsEnum.LIGUE_1));
      case TournamentCountryFiltersEnum.SWEDEN:
        return originalTournaments.filter((tournament) => tournament.includes(TournamentsEnum.ALLSVENSKAN));
      case TournamentCountryFiltersEnum.EUROPE:
        return originalTournaments.filter((tournament) => tournament.includes(TournamentsEnum.CHAMPIONS_LEAGUE) || tournament.includes(TournamentsEnum.EUROPA_LEAGUE) || tournament.includes(TournamentsEnum.CONFERENCE_LEAGUE));
      case TournamentCountryFiltersEnum.NATIONAL:
        return teamType === TeamType.CLUBS ? [] : getNationalTeamTournaments();
      default:
        return [];
    }
  };

  const handleSearch = (value: string) => {
    if (value.length < 2) {
      setTournaments(originalTournaments);
      return;
    }

    const filteredTournaments = originalTournaments.filter((tournament) => tournament.toLowerCase().includes(value.toLowerCase()));
    setTournaments(filteredTournaments);
  };

  const getTournamentIcon = (tournament: string) => {
    switch (tournament) {
      case TournamentsEnum.PREMIER_LEAGUE:
        return '/images/tournaments/premier-league.png';
      case TournamentsEnum.FA_CUP:
        return '/images/tournaments/fa-cup.png';
      case TournamentsEnum.CARABAO_CUP:
        return '/images/tournaments/carabao-cup.png';
      case TournamentsEnum.CHAMPIONSHIP:
        return '/images/tournaments/championship.png';
      case TournamentsEnum.LA_LIGA:
        return '/images/tournaments/la-liga.png';
      case TournamentsEnum.COPA_DEL_REY:
        return '/images/tournaments/copa-del-rey.png';
      case TournamentsEnum.SUPERCOPA:
        return '/images/tournaments/supercopa.svg';
      case TournamentsEnum.SERIE_A:
        return '/images/tournaments/serie-a.png';
      case TournamentsEnum.SUPERCOPPA_ITALIANA:
        return '/images/tournaments/supercoppa.png';
      case TournamentsEnum.COPPA_ITALIA:
        return '/images/tournaments/coppa-italia.jpg';
      case TournamentsEnum.BUNDESLIGA:
        return '/images/tournaments/bundesliga.png';
      case TournamentsEnum.DFB_POKAL:
        return '/images/tournaments/dfb-pokal.png';
      case TournamentsEnum.BUNDESLIGA_2:
        return '/images/tournaments/2-bundesliga.png';
      case TournamentsEnum.LIGUE_1:
        return '/images/tournaments/ligue-1.jpg';
      case TournamentsEnum.CHAMPIONS_LEAGUE:
        return '/images/tournaments/champions-league.png';
      case TournamentsEnum.EUROPA_LEAGUE:
        return '/images/tournaments/europa-league.png';
      case TournamentsEnum.CONFERENCE_LEAGUE:
        return '/images/tournaments/conference-league.png';
      case TournamentsEnum.ALLSVENSKAN:
        return '/images/tournaments/allsvenskan.webp';
      case TournamentsEnum.NATIONS_LEAGUE:
        return '/images/tournaments/nations-league.avif';
      case TournamentsEnum.WORLD_CUP:
      case TournamentsEnum.WORLD_CUP_QUALIFIERS:
        return '/images/tournaments/world-cup.jpg';
      case TournamentsEnum.EUROS:
      case TournamentsEnum.EUROS_QUALIFIERS:
        return '/images/tournaments/euros.webp';
      default:
        return '';
    }
  };

  const getTournament = (tournament: string) => (
    <TournamentItem
      isSelected={selectedTournament === tournament}
      onClick={() => setSelectedTournament(tournament)}
    >
      <TournamentInfo>
        <Avatar
          src={getTournamentIcon(tournament)}
          size={AvatarSize.S}
          objectFit="contain"
        />
        <NormalTypography variant="m" onClick={() => setSelectedTournament(tournament)}>
          {tournament}
        </NormalTypography>
      </TournamentInfo>
      <IconButtonContainer onClick={(e) => e.stopPropagation()}>
        <IconButton
          icon={selectedTournament && selectedTournament === tournament ? <CheckCircle size={24} weight="fill" /> : <Circle size={24} />}
          colors={
          selectedTournament && selectedTournament === tournament ? {
            normal: theme.colors.primary,
            hover: theme.colors.primary,
            active: theme.colors.primary,
          } : {
            normal: theme.colors.silverDarker,
            hover: theme.colors.textDefault,
            active: theme.colors.textDefault,
          }
        }
          onClick={() => setSelectedTournament(tournament)}
        />
      </IconButtonContainer>
    </TournamentItem>
  );

  return (
    <Modal
      onClose={onClose}
      title="Välj turnering"
      mobileFullScreen
      headerDivider
      noPadding
    >
      <ModalToolBar>
        <ModalToolBarTopRow>
          <Input
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.currentTarget.value);
              handleSearch(e.currentTarget.value);
            }}
            placeholder="Sök turnering"
            compact={isMobile}
            fullWidth
            autoFocus
          />
          {/* <TextButton
            icon={showFilters ? <XCircle size={24} color={theme.colors.primary} /> : <Funnel size={24} color={theme.colors.primary} />}
            onClick={() => setShowFilters(!showFilters)}
            noPadding={isMobile}
          >
            Filtrera
          </TextButton> */}
        </ModalToolBarTopRow>
      </ModalToolBar>
      <ModalContent>
        <HeadingsTypography variant="h4">Turneringar</HeadingsTypography>
        <AllTournaments>
          {(teamType === TeamType.CLUBS || teamType === TeamType.ALL) && searchValue.length < 2 && Object.values(TournamentCountryFiltersEnum).map((country) => (
            <CountrysTournaments>
              <EmphasisTypography variant="m">
                {country}
              </EmphasisTypography>
              <TournamentsList>
                {getTournamentsByCountry(country).map((tournament) => getTournament(tournament))}
              </TournamentsList>
            </CountrysTournaments>
          ))}
          {teamType === TeamType.NATIONS && searchValue.length < 2 && (
            <TournamentsList>
              {getNationalTeamTournaments().map((tournament) => getTournament(tournament))}
            </TournamentsList>
          )}
          {searchValue.length > 1 && (
            <TournamentsList>
              {tournaments.map((tournament) => getTournament(tournament))}
            </TournamentsList>
          )}
        </AllTournaments>
      </ModalContent>
      <BottomContainer>
        <ButtonsContainer>
          <Button
            variant="secondary"
            onClick={onClose}
            fullWidth
          >
            Avbryt
          </Button>
          <Button
            onClick={() => {
              if (selectedTournament) {
                onSave(selectedTournament);
              }
              onClose();
            }}
            fullWidth
            disabled={!selectedTournament}
          >
            Välj turnering
          </Button>
        </ButtonsContainer>
      </BottomContainer>
    </Modal>
  );
};

const ModalToolBar = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  border-bottom: 1px solid ${theme.colors.silverLight};
  padding: ${theme.spacing.s} ${theme.spacing.m};
`;

const ModalToolBarTopRow = styled.div`
  width: 100%;
  box-sizing: border-box;
  gap: ${theme.spacing.s};
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media ${devices.tablet} {
    gap: ${theme.spacing.xs};
  }
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

const AllTournaments = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.m};
`;

const CountrysTournaments = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  /* padding-bottom: ${theme.spacing.s}; */
`;

const TournamentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xxs};
  /* padding-bottom: ${theme.spacing.s}; */
`;

const TournamentItem = styled.div<{ isSelected?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 ${theme.spacing.xs} 0 ${theme.spacing.xxxs};
  box-shadow: 0px 2px 0px rgba(0, 0, 0, 0.08);
  border-radius: ${theme.borderRadius.m};
  background-color: ${({ isSelected }) => (isSelected ? theme.colors.primaryFade : theme.colors.silverBleach)};
  cursor: pointer;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid ${({ isSelected }) => (isSelected ? theme.colors.primaryLighter : theme.colors.silverLight)};
  transition: background-color 0.2s;
`;

const TournamentInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xxxs};
`;

const IconButtonContainer = styled.div``;

const BottomContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xxs};
  width: 100%;
  box-sizing: border-box;
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

export default SelectTournamentModal;
