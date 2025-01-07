import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { PlusCircle } from '@phosphor-icons/react';
import { theme } from '../../theme';
import { EmphasisTypography, NormalTypography } from '../typography/Typography';
import { Fixture, FixtureInput, TeamType } from '../../utils/Fixture';
import { Team } from '../../utils/Team';
import { hasInvalidTeamName } from '../../utils/helpers';
import { PredictionLeague } from '../../utils/League';
import { generateRandomID } from '../../utils/firebaseHelpers';
import { errorNotify } from '../../utils/toast/toastHelpers';
import Button from '../buttons/Button';
import Checkbox from '../input/Checkbox';
import CustomDatePicker from '../input/DatePicker';
import Input from '../input/Input';
import Select from '../input/Select';
import SelectImitation from '../input/SelectImitation';
import Modal from '../modal/Modal';
import { Section } from '../section/Section';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';
import SelectTeamModal from './SelectTeamModal';
import SelectTournamentModal from './SelectTournamentModal';

interface CreateFixtureModalProps {
  onClose: () => void;
  league: PredictionLeague;
  fixture: Fixture | null;
  allNewGameWeekFixtures: Array<Fixture>;
  onUpdateAllNewGameWeekFixtures: React.Dispatch<React.SetStateAction<Array<Fixture>>>;
}

const CreateFixtureModal = ({
  onClose, league, allNewGameWeekFixtures, onUpdateAllNewGameWeekFixtures, fixture,
}: CreateFixtureModalProps) => {
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const [teamType, setTeamType] = useState<TeamType>(fixture?.teamType ?? TeamType.CLUBS);
  const [homeTeam, setHomeTeam] = useState<Team | undefined>(fixture?.homeTeam);
  const [awayTeam, setAwayTeam] = useState<Team | undefined>(fixture?.awayTeam);
  const [stadium, setStadium] = useState<string>(fixture?.stadium ?? '');
  const [tournament, setTournament] = useState<string>(fixture?.tournament ?? '');
  const [kickoffDateTime, setKickoffDateTime] = useState<Date>(fixture?.kickOffTime ? new Date(fixture.kickOffTime) : new Date());
  const [shouldPredictGoalScorer, setShouldPredictGoalScorer] = useState<boolean>(fixture?.shouldPredictGoalScorer ?? false);
  const [goalScorerTeam, setGoalScorerTeam] = useState<Array<string> | null>(fixture?.goalScorerFromTeam ?? null);
  const [fixtureNickname, setFixtureNickname] = useState<string>(fixture?.fixtureNickname ?? '');
  const [includeStats, setIncludeStats] = useState<boolean>(fixture?.includeStats ?? false);

  const [showSelectTeamModal, setShowSelectTeamModal] = useState<'home' | 'away' | null>(null);
  const [selectTournamentModalOpen, setSelectTournamentModalOpen] = useState<boolean>(false);

  const isAddFixtureButtonDisabled = !homeTeam
    || hasInvalidTeamName(homeTeam?.name)
    || !awayTeam
    || hasInvalidTeamName(awayTeam?.name)
    || homeTeam === awayTeam
    || !stadium
    || !tournament
    || !kickoffDateTime
    || (shouldPredictGoalScorer && (!goalScorerTeam || goalScorerTeam.includes('Välj lag')));

  const handleSelectTeam = (team: Team | undefined, isHomeTeam: boolean) => {
    if (!team) return;

    if (isHomeTeam) {
      setHomeTeam(team);
      setStadium(team.stadium ?? '');
    } else {
      setAwayTeam(team);
    }
  };

  const handleAddFixtureToGameWeek = () => {
    if (!homeTeam || !awayTeam || league.hasEnded) return;

    if (allNewGameWeekFixtures.length === 24) {
      errorNotify('Max antal matcher per omgång är 24');
      return;
    }

    const alreadyExistingFixture = allNewGameWeekFixtures.find((f) => f.homeTeam.name === homeTeam.name && f.awayTeam.name === awayTeam.name);

    const newFixtureInput: FixtureInput = {
      id: alreadyExistingFixture ? alreadyExistingFixture.id : generateRandomID(),
      homeTeam,
      awayTeam,
      stadium,
      tournament,
      kickOffTime: new Date(kickoffDateTime).toISOString(),
      shouldPredictGoalScorer,
      ...(shouldPredictGoalScorer && { goalScorerFromTeam: goalScorerTeam }),
      ...(fixtureNickname && { fixtureNickname }),
      teamType,
      includeStats,
    };

    if (alreadyExistingFixture) {
      const updatedFixtures = allNewGameWeekFixtures.map((f) => {
        if (f.id === alreadyExistingFixture.id) {
          return newFixtureInput;
        }
        return f;
      });
      onUpdateAllNewGameWeekFixtures(updatedFixtures);
    } else {
      onUpdateAllNewGameWeekFixtures([...allNewGameWeekFixtures, { ...newFixtureInput }]);
    }

    onClose();
    handleResetNewFixture();
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
    setGoalScorerTeam(null);
    setFixtureNickname('');
  };

  const handleSetGoalScrorerTeam = (selection: string) => {
    if (selection === 'Välj lag') {
      setGoalScorerTeam(null);
      return;
    }
    if (selection === 'Båda lagen') {
      setGoalScorerTeam([homeTeam?.name!, awayTeam?.name!]);
      return;
    }
    setGoalScorerTeam([selection]);
  };

  return (
    <Modal
      title="Lägg till match"
      onClose={onClose}
      mobileFullScreen
    >
      <AddFixtureContainer>
        <Section flexDirection="row" gap="xs">
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
          {!isMobile && (
            <VersusTypography>
              <NormalTypography variant="m">vs</NormalTypography>
            </VersusTypography>
          )}
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
          <Section gap="xxs">
            <EmphasisTypography variant="s">Turnering</EmphasisTypography>
            <SelectImitation
              value={tournament}
              placeholder="Välj turnering"
              onClick={() => setSelectTournamentModalOpen(true)}
              fullWidth
            />
          </Section>
          <CustomDatePicker
            label="Avsparkstid"
            selectedDate={kickoffDateTime}
            onChange={(date) => handleUpdateKickoffTime(date!)}
            fullWidth
            minDate={new Date()}
          />
        </Section>
        <Input
          label="Smeknamn på match"
          value={fixtureNickname}
          onChange={(e) => setFixtureNickname(e.currentTarget.value)}
        />
        <Checkbox
          label="Inkludera statistik"
          checked={includeStats}
          onChange={() => setIncludeStats(!includeStats)}
        />
        <Checkbox
          label="Ska målskytt i matchen tippas?"
          checked={shouldPredictGoalScorer}
          onChange={() => setShouldPredictGoalScorer(!shouldPredictGoalScorer)}
        />
        {shouldPredictGoalScorer && homeTeam && awayTeam && (
        <Section gap="xxs">
          <EmphasisTypography variant="s">Vilket lag ska målskytten tillhöra?</EmphasisTypography>
          <Select
            options={[
              { value: 'Välj lag', label: 'Välj lag' },
              { value: homeTeam.name, label: homeTeam.name },
              { value: awayTeam.name, label: awayTeam.name },
            ]}
            value={goalScorerTeam ? goalScorerTeam[0] : 'Välj lag'}
            onChange={(value) => handleSetGoalScrorerTeam(value)}
            fullWidth={isMobile}
          />
        </Section>
        )}
        <Section flexDirection="row" alignItems="center" gap="xxs">
          <Button
            variant="secondary"
            size="m"
            onClick={() => {
              // setAddFixtureViewOpen(false);
              onClose();
              handleResetNewFixture();
            }}
            fullWidth
          >
            Avbryt
          </Button>
          <Button
            size="m"
            onClick={handleAddFixtureToGameWeek}
            icon={<PlusCircle size={20} color={theme.colors.white} />}
            disabled={isAddFixtureButtonDisabled}
            fullWidth
          >
            Lägg till match
          </Button>
        </Section>
      </AddFixtureContainer>
      {showSelectTeamModal && (
        <SelectTeamModal
          onClose={() => setShowSelectTeamModal(null)}
          onSave={(team) => handleSelectTeam(team, showSelectTeamModal === 'home')}
          teamType={teamType}
          isHomeTeam={showSelectTeamModal === 'home'}
          value={showSelectTeamModal === 'home' ? homeTeam : awayTeam}
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

const VersusTypography = styled.div`
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: end;
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

  :hover {
    border-color: ${({ isSelected }) => (isSelected ? theme.colors.primary : theme.colors.primaryLight)};

    ${EmphasisTypography} {
      color: ${({ isSelected }) => (isSelected ? theme.colors.primary : theme.colors.primaryLight)};
    }
  }
`;

const AddFixtureContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.m};
  width: 100%;
  box-sizing: border-box;
`;

export default CreateFixtureModal;
