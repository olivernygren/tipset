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
import { getTournamentIcon } from '../../utils/helpers';

interface SelectTournamentModalProps {
  onClose: () => void;
  onSave?: (tournament: string) => void;
  defaultValue?: string;
  teamType: TeamType;
  multiple?: boolean;
  onSaveMultiple?: (tournaments: Array<TournamentsEnum>) => void;
  alreadySelectedTournaments?: Array<TournamentsEnum>;
}

enum TournamentCountryFiltersEnum {
  ENGLAND = 'England',
  SPAIN = 'Spanien',
  ITALY = 'Italien',
  GERMANY = 'Tyskland',
  FRANCE = 'Frankrike',
  SWEDEN = 'Sverige',
  EUROPE = 'Europa',
  NETHERLANDS = 'Nederländerna',
  PORTUGAL = 'Portugal',
  NATIONAL = 'Landslag',
}

const SelectTournamentModal = ({
  onClose, onSave, defaultValue, teamType, multiple, onSaveMultiple, alreadySelectedTournaments,
}:SelectTournamentModalProps) => {
  const originalTournaments = Object.values(TournamentsEnum);
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const [tournaments, setTournaments] = useState(originalTournaments);
  const [selectedTournament, setSelectedTournament] = useState<string | undefined>(defaultValue);
  const [selectedMultipleTournaments, setSelectedMultipleTournaments] = useState<Array<TournamentsEnum>>(alreadySelectedTournaments ?? []);
  const [searchValue, setSearchValue] = useState('');

  const isSelected = (tournament: string) => ((selectedTournament && selectedTournament === tournament) || selectedMultipleTournaments.includes(tournament as TournamentsEnum));

  const getNationalTeamTournaments = () => originalTournaments.filter((tournament) => tournament.includes(TournamentsEnum.WORLD_CUP)
      || tournament.includes(TournamentsEnum.WORLD_CUP_QUALIFIERS)
      || tournament.includes(TournamentsEnum.EUROS)
      || tournament.includes(TournamentsEnum.EUROS_QUALIFIERS)
      || tournament.includes(TournamentsEnum.NATIONS_LEAGUE));

  const getTournamentsByCountry = (country: TournamentCountryFiltersEnum) => {
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
      case TournamentCountryFiltersEnum.EUROPE:
        return originalTournaments.filter((tournament) => tournament.includes(TournamentsEnum.CHAMPIONS_LEAGUE) || tournament.includes(TournamentsEnum.EUROPA_LEAGUE) || tournament.includes(TournamentsEnum.CONFERENCE_LEAGUE) || tournament.includes(TournamentsEnum.UEFA_SUPER_CUP));
      case TournamentCountryFiltersEnum.SWEDEN:
        return originalTournaments.filter((tournament) => tournament.includes(TournamentsEnum.ALLSVENSKAN));
      case TournamentCountryFiltersEnum.NETHERLANDS:
        return originalTournaments.filter((tournament) => tournament.includes(TournamentsEnum.EREDIVISIE));
      case TournamentCountryFiltersEnum.PORTUGAL:
        return originalTournaments.filter((tournament) => tournament.includes(TournamentsEnum.PRIMEIRA_LIGA));
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

  const handleTournamentClick = (tournament: string) => {
    if (multiple) {
      if (selectedMultipleTournaments.includes(tournament as TournamentsEnum)) {
        setSelectedMultipleTournaments(selectedMultipleTournaments.filter((selectedTournament) => selectedTournament !== tournament));
      } else {
        setSelectedMultipleTournaments([...selectedMultipleTournaments, tournament as TournamentsEnum]);
      }
    } else {
      setSelectedTournament(tournament);
    }
  };

  const getTournament = (tournament: string) => (
    <TournamentItem
      isSelected={isSelected(tournament)}
      onClick={() => handleTournamentClick(tournament)}
    >
      <TournamentInfo>
        <Avatar
          src={getTournamentIcon(tournament)}
          size={AvatarSize.S}
          objectFit="contain"
        />
        <NormalTypography variant="m" onClick={() => handleTournamentClick(tournament)}>
          {tournament}
        </NormalTypography>
      </TournamentInfo>
      <IconButtonContainer onClick={(e) => e.stopPropagation()}>
        <IconButton
          icon={isSelected(tournament) ? <CheckCircle size={24} weight="fill" /> : <Circle size={24} />}
          colors={
            isSelected(tournament) ? {
              normal: theme.colors.primary,
              hover: theme.colors.primary,
              active: theme.colors.primary,
            } : {
              normal: theme.colors.silverDarker,
              hover: theme.colors.textDefault,
              active: theme.colors.textDefault,
            }
        }
          onClick={() => handleTournamentClick(tournament)}
        />
      </IconButtonContainer>
    </TournamentItem>
  );

  const handleSave = () => {
    if (multiple && onSaveMultiple) {
      onSaveMultiple(selectedMultipleTournaments);
    } else if (onSave) {
      onSave(selectedTournament as string);
    }
    onClose();
  };

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
              {(country !== TournamentCountryFiltersEnum.NATIONAL || (country === TournamentCountryFiltersEnum.NATIONAL && teamType !== TeamType.CLUBS)) && (
                <EmphasisTypography variant="m">
                  {country}
                </EmphasisTypography>
              )}
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
            onClick={() => handleSave()}
            fullWidth
            disabled={!selectedTournament && selectedMultipleTournaments.length === 0}
          >
            {multiple ? `Välj turneringar (${selectedMultipleTournaments.length})` : 'Välj turnering'}
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
