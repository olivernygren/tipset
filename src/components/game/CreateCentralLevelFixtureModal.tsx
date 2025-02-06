import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { CheckSquare, PlusCircle, Square } from '@phosphor-icons/react';
import { devices, theme } from '../../theme';
import { EmphasisTypography, HeadingsTypography } from '../typography/Typography';
import { FixtureInput, TeamType } from '../../utils/Fixture';
import { Team } from '../../utils/Team';
import { hasInvalidTeamName } from '../../utils/helpers';
import Button from '../buttons/Button';
import CustomDatePicker from '../input/DatePicker';
import Input from '../input/Input';
import SelectImitation from '../input/SelectImitation';
import Modal from '../modal/Modal';
import { Section } from '../section/Section';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';
import SelectTeamModal from './SelectTeamModal';
import SelectTournamentModal from './SelectTournamentModal';
import IconButton from '../buttons/IconButton';
import { generateRandomID } from '../../utils/firebaseHelpers';

interface CreateCentralLevelFixtureModalProps {
  onClose: () => void;
  onCreateFixture?: (fixture: FixtureInput) => void;
  loading?: boolean;
}

const CreateCentralLevelFixtureModal = ({
  onClose, onCreateFixture, loading,
}: CreateCentralLevelFixtureModalProps) => {
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const [teamType, setTeamType] = useState<TeamType>(TeamType.CLUBS);
  const [homeTeam, setHomeTeam] = useState<Team | undefined>();
  const [awayTeam, setAwayTeam] = useState<Team | undefined>();
  const [stadium, setStadium] = useState<string>('');
  const [tournament, setTournament] = useState<string>('');
  const [kickoffDateTime, setKickoffDateTime] = useState<Date>(new Date());
  const [shouldPredictGoalScorer, setShouldPredictGoalScorer] = useState<boolean>(false);
  const [fixtureNickname, setFixtureNickname] = useState<string>('');
  const [includeStats, setIncludeStats] = useState<boolean>(true);

  const [showSelectTeamModal, setShowSelectTeamModal] = useState<'home' | 'away' | null>(null);
  const [selectTournamentModalOpen, setSelectTournamentModalOpen] = useState<boolean>(false);

  const isAddFixtureButtonDisabled = !homeTeam
    || hasInvalidTeamName(homeTeam?.name)
    || !awayTeam
    || hasInvalidTeamName(awayTeam?.name)
    || homeTeam === awayTeam
    || !stadium
    || !tournament
    || !kickoffDateTime;

  const handleCreateFixture = async () => {
    const fixtureInput = {
      id: generateRandomID(),
      teamType,
      homeTeam: homeTeam!,
      awayTeam: awayTeam!,
      stadium,
      tournament,
      kickOffTime: kickoffDateTime.toISOString(),
      shouldPredictGoalScorer,
      fixtureNickname,
      includeStats,
    };

    if (onCreateFixture) {
      onCreateFixture(fixtureInput);
      onClose();
      handleResetNewFixture();
    }
  };

  const handleSelectTeam = (team: Team | undefined, isHomeTeam: boolean) => {
    if (!team) return;

    if (isHomeTeam) {
      setHomeTeam(team);
      setStadium(team.stadium ?? '');
    } else {
      setAwayTeam(team);
    }
  };

  const handleUpdateKickoffTime = (date: Date) => {
    setKickoffDateTime(date);
  };

  const handleResetNewFixture = () => {
    setHomeTeam(undefined);
    setAwayTeam(undefined);
    setStadium('');
    setTournament('');
    setKickoffDateTime(new Date());
    setShouldPredictGoalScorer(false);
    setFixtureNickname('');
  };

  return (
    <Modal
      title="Skapa match"
      onClose={onClose}
      mobileFullScreen
      size="m"
      headerDivider
    >
      <AddFixtureContainer>
        <TeamTypeSelectorContainer>
          <HeadingsTypography variant="h5">Typ av lag</HeadingsTypography>
          <Section flexDirection="row" gap="xs" fitContent={!isMobile}>
            <TeamTypeSelectorButton
              isSelected={teamType === TeamType.CLUBS}
              onClick={() => {
                setTeamType(TeamType.CLUBS);
                handleResetNewFixture();
              }}
            >
              <EmphasisTypography variant="m" color={teamType === TeamType.CLUBS ? theme.colors.primary : theme.colors.silver}>Klubblag</EmphasisTypography>
            </TeamTypeSelectorButton>
            <TeamTypeSelectorButton
              isSelected={teamType === TeamType.NATIONS}
              onClick={() => {
                setTeamType(TeamType.NATIONS);
                handleResetNewFixture();
              }}
            >
              <EmphasisTypography variant="m" color={teamType === TeamType.NATIONS ? theme.colors.primary : theme.colors.silver}>Landslag</EmphasisTypography>
            </TeamTypeSelectorButton>
          </Section>
        </TeamTypeSelectorContainer>
        <Section flexDirection={isMobile ? 'column' : 'row'} gap={isMobile ? 's' : 'm'} alignItems="center">
          <Section gap="xxs">
            <EmphasisTypography variant="s">Hemmalag</EmphasisTypography>
            <SelectImitation
              value={homeTeam?.name ?? ''}
              placeholder="Välj lag"
              onClick={() => setShowSelectTeamModal('home')}
              fullWidth
            />
          </Section>
          <Section gap="xxs">
            <EmphasisTypography variant="s">Bortalag</EmphasisTypography>
            <SelectImitation
              value={awayTeam?.name ?? ''}
              placeholder="Välj lag"
              onClick={() => setShowSelectTeamModal('away')}
              fullWidth
            />
          </Section>
        </Section>
        <Section flexDirection={isMobile ? 'column' : 'row'} gap={isMobile ? 's' : 'm'} alignItems="center">
          <Input
            label="Arena"
            value={stadium}
            onChange={(e) => setStadium(e.currentTarget.value)}
            fullWidth
          />
          <CustomDatePicker
            label="Avsparkstid"
            selectedDate={kickoffDateTime}
            onChange={(date) => handleUpdateKickoffTime(date!)}
            fullWidth
            minDate={new Date()}
          />
        </Section>
        <Section flexDirection={isMobile ? 'column' : 'row'} gap={isMobile ? 's' : 'm'} alignItems="center">
          <Section gap="xxs">
            <EmphasisTypography variant="s">Turnering</EmphasisTypography>
            <SelectImitation
              value={tournament}
              placeholder="Välj turnering"
              onClick={() => setSelectTournamentModalOpen(true)}
              fullWidth
            />
          </Section>
          <Input
            label="Smeknamn på match"
            value={fixtureNickname}
            onChange={(e) => setFixtureNickname(e.currentTarget.value)}
            fullWidth
          />
        </Section>
        <Section gap="xs" padding={`${theme.spacing.xxs} 0`}>
          <OptionalInclusionContainer onClick={() => setIncludeStats(!includeStats)}>
            <IconButton
              icon={includeStats ? <CheckSquare size={24} color={undefined} weight="fill" /> : <Square size={24} color={undefined} />}
              onClick={(e) => {
                e.stopPropagation();
                setIncludeStats(!includeStats);
              }}
              colors={includeStats ? { normal: theme.colors.primary, hover: theme.colors.primaryDark, active: theme.colors.primaryDark } : { normal: theme.colors.silver, hover: theme.colors.silverDark, active: theme.colors.silverDark }}
            />
            <EmphasisTypography variant="m">Inkludera statistik</EmphasisTypography>
          </OptionalInclusionContainer>
          <OptionalInclusionContainer onClick={() => setShouldPredictGoalScorer(!shouldPredictGoalScorer)}>
            <IconButton
              icon={shouldPredictGoalScorer ? <CheckSquare size={24} color={undefined} weight="fill" /> : <Square size={24} color={undefined} />}
              onClick={(e) => {
                e.stopPropagation();
                setShouldPredictGoalScorer(!shouldPredictGoalScorer);
              }}
              colors={shouldPredictGoalScorer ? { normal: theme.colors.primary, hover: theme.colors.primaryDark, active: theme.colors.primaryDark } : { normal: theme.colors.silver, hover: theme.colors.silverDark, active: theme.colors.silverDark }}
            />
            <EmphasisTypography variant="m" noWrap>Tippa målskytt</EmphasisTypography>
          </OptionalInclusionContainer>
        </Section>
        <Section flexDirection="row" alignItems="center" gap="xxs">
          <Button
            variant="secondary"
            size="m"
            fullWidth
            onClick={() => {
              onClose();
              handleResetNewFixture();
            }}
          >
            Avbryt
          </Button>
          <Button
            size="m"
            onClick={handleCreateFixture}
            icon={<PlusCircle size={20} color={theme.colors.white} />}
            disabled={isAddFixtureButtonDisabled || loading}
            fullWidth
            loading={loading}
          >
            Skapa match
          </Button>
        </Section>
      </AddFixtureContainer>
      {showSelectTeamModal && (
        <SelectTeamModal
          onClose={() => setShowSelectTeamModal(null)}
          onSave={(team) => handleSelectTeam(team, showSelectTeamModal === 'home')}
          teamType={teamType}
          value={showSelectTeamModal === 'home' ? homeTeam : awayTeam}
          title={showSelectTeamModal === 'home' ? 'Välj hemmalag' : 'Välj bortalag'}
        />
      )}
      {selectTournamentModalOpen && (
        <SelectTournamentModal
          onClose={() => setSelectTournamentModalOpen(false)}
          onSave={(tournament) => setTournament(tournament)}
          teamType={teamType}
          defaultValue={tournament}
        />
      )}
    </Modal>
  );
};

const TeamTypeSelectorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.s};
  background-color: ${theme.colors.silverBleach};
  padding: ${theme.spacing.s};
  border-radius: ${theme.borderRadius.m};
  border: 1px solid ${theme.colors.silverLight};
  
  @media ${devices.tablet} {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const TeamTypeSelectorButton = styled.div<{ isSelected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xxs};
  border-radius: ${theme.borderRadius.s};
  border: 2px solid ${({ isSelected }) => (isSelected ? theme.colors.primary : theme.colors.silver)};
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  flex: 1;

  :hover {
    border-color: ${({ isSelected }) => (isSelected ? theme.colors.primary : theme.colors.primaryLight)};

    ${EmphasisTypography} {
      color: ${({ isSelected }) => (isSelected ? theme.colors.primary : theme.colors.primaryLight)};
    }
  }

  @media ${devices.tablet} {
    flex: unset;
  }
`;

const AddFixtureContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.s};
  width: 100%;
  box-sizing: border-box;
`;

const OptionalInclusionContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xxs};
  width: 100%;
  box-sizing: border-box;
  background-color: ${theme.colors.silverBleach};
  padding: ${theme.spacing.xxs};
  border-radius: ${theme.borderRadius.m};
  border: 1px solid ${theme.colors.silverLight};
  cursor: pointer;
  transition: 0.15s ease-in-out;

  &:hover {
    border-color: ${theme.colors.primaryLighter};
    background-color: ${theme.colors.primaryFade};
  }
`;

export default CreateCentralLevelFixtureModal;
