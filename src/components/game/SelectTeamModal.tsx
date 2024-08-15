import React, { useState } from 'react';
import styled from 'styled-components';
import {
  CaretDown,
  CheckCircle,
  Circle,
} from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import {
  getAllNationsObject, getFlagUrlByCountryName, getTeamsObjectByCountry, Team,
} from '../../utils/Team';
import { TeamType } from '../../utils/Fixture';
import Modal from '../modal/Modal';
import { theme, devices } from '../../theme';
import Button from '../buttons/Button';
import Input from '../input/Input';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';
import { HeadingsTypography, NormalTypography } from '../typography/Typography';
import NationAvatar from '../avatar/NationAvatar';
import { AvatarSize } from '../avatar/Avatar';
import IconButton from '../buttons/IconButton';
import ClubAvatar from '../avatar/ClubAvatar';

interface SelectTeamModalProps {
  value: Team | undefined;
  onSave: (team: Team) => void;
  onClose: () => void;
  teamType: TeamType;
  isHomeTeam: boolean;
}

const SelectTeamModal = ({
  value, onSave, onClose, teamType, isHomeTeam,
}: SelectTeamModalProps) => {
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const originalTeams = teamType === TeamType.NATIONS ? getAllNationsObject() : getTeamsObjectByCountry();
  const [teams, setTeams] = useState(originalTeams);
  const [selectedTeam, setSelectedTeam] = useState<Team | undefined>(value);
  const [searchValue, setSearchValue] = useState('');
  // const [showFilters, setShowFilters] = useState(false);
  const [expandedCountries, setExpandedCountries] = useState<Array<string>>([]); // Object.keys(teams)

  const handleSearch = (value: string) => {
    setExpandedCountries(Object.keys(originalTeams));

    if (value.length < 2) {
      setTeams(originalTeams);
      setExpandedCountries([]);
      return;
    }

    const filteredTeamsByCountry: { [key: string]: Team[] } = {};

    Object.entries(originalTeams).forEach(([country, teamList]) => {
      const filteredTeams = teamList.filter((team) => team.name.toLowerCase().includes(value.toLowerCase()));

      if (filteredTeams.length > 0) {
        filteredTeamsByCountry[country] = filteredTeams;
      }
    });

    setTeams(filteredTeamsByCountry);
  };

  const handleToggleExpandCountry = (country: string) => {
    if (expandedCountries.includes(country)) {
      setExpandedCountries(expandedCountries.filter((c) => c !== country));
    } else {
      setExpandedCountries([...expandedCountries, country]);
    }
  };

  const getTeam = (team: Team) => (
    <TeamItem isSelected={selectedTeam?.name === team.name} onClick={() => setSelectedTeam(team)}>
      <TeamInfo>
        {teamType === TeamType.NATIONS ? (
          <NationAvatar
            flagUrl={team.logoUrl}
            nationName={team.name}
            size={AvatarSize.S}
          />
        ) : (
          <ClubAvatar
            logoUrl={team.logoUrl}
            clubName={team.name}
            size={AvatarSize.S}
          />
        )}
        <NormalTypography variant="m">
          {team.name}
        </NormalTypography>
      </TeamInfo>
      <IconButtonContainer onClick={(e) => e.stopPropagation()}>
        <IconButton
          icon={selectedTeam && selectedTeam.name === team.name ? <CheckCircle size={24} weight="fill" /> : <Circle size={24} />}
          colors={
          selectedTeam && selectedTeam.name === team.name ? {
            normal: theme.colors.primary,
            hover: theme.colors.primary,
            active: theme.colors.primary,
          } : {
            normal: theme.colors.silverDarker,
            hover: theme.colors.textDefault,
            active: theme.colors.textDefault,
          }
        }
          onClick={() => setSelectedTeam(team)}
        />
      </IconButtonContainer>
    </TeamItem>
  );

  return (
    <Modal
      title={isHomeTeam ? 'Välj hemmalag' : 'Välj bortalag'}
      onClose={onClose}
      headerDivider
      mobileFullScreen
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
            placeholder="Sök lag"
            compact={isMobile}
            fullWidth
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
        {Object.entries(teams).map(([country, teamList]) => (
          <CountrysTeamsContainer key={country}>
            <CountryHeader isNation={teamType === TeamType.NATIONS} onClick={() => handleToggleExpandCountry(country)}>
              <Country>
                <HeadingsTypography variant="h4">
                  {country}
                </HeadingsTypography>
                {teamType === TeamType.CLUBS && (
                  <NationAvatar
                    flagUrl={getFlagUrlByCountryName(country)}
                    nationName={country}
                    size={AvatarSize.S}
                  />
                )}
              </Country>
              <IconButtonContainer isExpanded={expandedCountries.includes(country)} onClick={(e) => e.stopPropagation()}>
                <IconButton
                  icon={<CaretDown size={20} weight="bold" />}
                  colors={{ normal: theme.colors.silverDarker, hover: theme.colors.textDefault, active: theme.colors.textDefault }}
                  onClick={() => handleToggleExpandCountry(country)}
                />
              </IconButtonContainer>
            </CountryHeader>
            {expandedCountries.includes(country) && (
              <TeamsList
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {teamList.map((team) => getTeam(team))}
              </TeamsList>
            )}
          </CountrysTeamsContainer>
        ))}
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
              onSave(selectedTeam as Team);
              onClose();
            }}
            fullWidth
            disabled={!selectedTeam}
          >
            Välj lag
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

  @media ${devices.tablet} {
    padding: ${theme.spacing.s} ${theme.spacing.l};
  }
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
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.m};
  overflow-y: auto;
  flex-grow: 1;
  
  @media ${devices.tablet} {
    padding: ${theme.spacing.l};
  }
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

const CountrysTeamsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xxs};
`;

const CountryHeader = styled.div<{ isNation: boolean }>`
  display: flex;
  gap: ${theme.spacing.xxs};
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  padding: ${({ isNation }) => (isNation ? '10px' : theme.spacing.xxxs)} ${theme.spacing.xs};
  border-radius: ${theme.borderRadius.m};
  background-color: ${theme.colors.silverLighter};
  cursor: pointer;
`;

const Country = styled.div`
  display: flex;
  gap: ${theme.spacing.xxs};
  align-items: center;
  flex: 1;
`;

const TeamsList = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xxs};
  padding-bottom: ${theme.spacing.s};
`;

const TeamItem = styled.div<{ isSelected?: boolean }>`
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

const TeamInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xxxs};
`;

const IconButtonContainer = styled.div<{ isExpanded?: boolean }>`
  transition: all 0.2s;
  transform: ${({ isExpanded }) => (isExpanded ? 'rotate(180deg)' : 'rotate(0deg)')};
`;

const BottomContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xxs};
  width: 100%;
  box-sizing: border-box;
`;

export default SelectTeamModal;
