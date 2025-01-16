import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  CheckCircle, CheckSquare, PlusCircle, Square,
  Trash,
} from '@phosphor-icons/react';
import { theme } from '../../theme';
import { EmphasisTypography } from '../typography/Typography';
import { Fixture, TeamType } from '../../utils/Fixture';
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

interface CreateFixtureModalProps {
  onClose: () => void;
  onSave: (fixture: Fixture) => void;
  onDeleteFixture: () => void;
  fixture: Fixture;
}

const EditFixtureModal = ({
  onClose, onSave, onDeleteFixture, fixture,
}: CreateFixtureModalProps) => {
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const [homeTeam, setHomeTeam] = useState<Team | undefined>(fixture?.homeTeam);
  const [awayTeam, setAwayTeam] = useState<Team | undefined>(fixture?.awayTeam);
  const [stadium, setStadium] = useState<string>(fixture?.stadium ?? '');
  const [tournament, setTournament] = useState<string>(fixture?.tournament ?? '');
  const [kickoffDateTime, setKickoffDateTime] = useState<Date>(fixture?.kickOffTime ? new Date(fixture.kickOffTime) : new Date());
  const [shouldPredictGoalScorer, setShouldPredictGoalScorer] = useState<boolean>(fixture?.shouldPredictGoalScorer ?? false);
  const [fixtureNickname, setFixtureNickname] = useState<string>(fixture?.fixtureNickname ?? '');
  const [includeStats, setIncludeStats] = useState<boolean>(fixture?.includeStats ?? true);

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

  const handleResetFixture = () => {
    setHomeTeam(undefined);
    setAwayTeam(undefined);
    setStadium('');
    setTournament('');
    setKickoffDateTime(new Date());
    setShouldPredictGoalScorer(false);
    setFixtureNickname('');
  };

  const handleSaveFixture = () => {
    const updatedFixture: Fixture = {
      ...fixture,
      id: fixture?.id ?? '',
      teamType: fixture?.teamType ?? TeamType.CLUBS,
      homeTeam: homeTeam!,
      awayTeam: awayTeam!,
      stadium,
      tournament,
      kickOffTime: kickoffDateTime.toISOString(),
      shouldPredictGoalScorer,
      fixtureNickname,
      includeStats,
    };

    onSave(updatedFixture);
    handleResetFixture();
  };

  return (
    <Modal
      title="Redigera match"
      onClose={onClose}
      mobileFullScreen
      size="m"
    >
      <AddFixtureContainer>
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
        <Section flexDirection={isMobile ? 'column' : 'row'} gap={isMobile ? 'm' : 'l'} alignItems="center">
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
        <Section flexDirection={isMobile ? 'column' : 'row'} gap={isMobile ? 'm' : 'l'} alignItems="center">
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
        <Section gap="xxs">
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
            color="red"
            variant="primary"
            size="m"
            icon={<Trash size={24} color={theme.colors.white} weight="fill" />}
            fullWidth
            onClick={() => {
              onDeleteFixture();
              onClose();
              handleResetFixture();
            }}
          >
            Ta bort match
          </Button>
          <Button
            size="m"
            onClick={handleSaveFixture}
            icon={<CheckCircle size={24} color={theme.colors.white} weight="fill" />}
            disabled={isAddFixtureButtonDisabled}
            fullWidth
          >
            Spara
          </Button>
        </Section>
      </AddFixtureContainer>
      {showSelectTeamModal && (
        <SelectTeamModal
          onClose={() => setShowSelectTeamModal(null)}
          onSave={(team) => handleSelectTeam(team, showSelectTeamModal === 'home')}
          teamType={fixture.teamType ?? TeamType.CLUBS}
          value={showSelectTeamModal === 'home' ? homeTeam : awayTeam}
          title={showSelectTeamModal === 'home' ? 'Välj hemmalag' : 'Välj bortalag'}
        />
      )}
      {selectTournamentModalOpen && (
        <SelectTournamentModal
          onClose={() => setSelectTournamentModalOpen(false)}
          onSave={(tournament) => setTournament(tournament)}
          teamType={fixture.teamType ?? TeamType.CLUBS}
          defaultValue={tournament}
        />
      )}
    </Modal>
  );
};

const AddFixtureContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.m};
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

export default EditFixtureModal;
