import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  CheckCircle, CheckSquare, Square,
  Trash,
} from '@phosphor-icons/react';
import { theme } from '../../theme';
import { EmphasisTypography } from '../typography/Typography';
import { Fixture, TeamType } from '../../utils/Fixture';
import { Team } from '../../utils/Team';
import { hasInvalidTeamName, isPredictGoalScorerPossibleByTeamNames } from '../../utils/helpers';
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
import InfoDialogue from '../info/InfoDialogue';
import { PredictionLeague } from '../../utils/League';

interface CreateFixtureModalProps {
  onClose: () => void;
  onSave: (fixture: Fixture) => void;
  onDeleteFixture: () => void;
  fixture: Fixture;
  minDate?: Date;
  league?: PredictionLeague;
  isAdminFixturesPage?: boolean;
}

const EditFixtureModal = ({
  onClose, onSave, onDeleteFixture, fixture, minDate, league, isAdminFixturesPage,
}: CreateFixtureModalProps) => {
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const [homeTeam, setHomeTeam] = useState<Team>(fixture.homeTeam);
  const [awayTeam, setAwayTeam] = useState<Team>(fixture.awayTeam);
  const [stadium, setStadium] = useState<string>(fixture?.stadium ?? '');
  const [tournament, setTournament] = useState<string>(fixture?.tournament ?? '');
  const [kickoffDateTime, setKickoffDateTime] = useState<Date>(fixture?.kickOffTime ? new Date(fixture.kickOffTime) : new Date());
  const [isPossibleToPredictGoalScorer, setIsPossibleToPredictGoalScorer] = useState<boolean>(false);
  const [shouldPredictGoalScorer, setShouldPredictGoalScorer] = useState<boolean>(fixture?.shouldPredictGoalScorer ?? false);
  const [fixtureNickname, setFixtureNickname] = useState<string>(fixture?.fixtureNickname ?? '');
  const [includeStats, setIncludeStats] = useState<boolean>(fixture?.includeStats ?? true);
  const [includeFirstTeamToScore, setIncludeFirstTeamToScore] = useState<boolean>(fixture.shouldPredictFirstTeamToScore ?? false);

  const [showSelectTeamModal, setShowSelectTeamModal] = useState<'home' | 'away' | null>(null);
  const [selectTournamentModalOpen, setSelectTournamentModalOpen] = useState<boolean>(false);

  const canIncludeFirstTeamToScore = league?.scoringSystem?.firstTeamToScore !== undefined && league?.scoringSystem?.firstTeamToScore > 0;

  useEffect(() => {
    const anyTeamsPlayersRegistered = isPredictGoalScorerPossibleByTeamNames([homeTeam?.name ?? '', awayTeam?.name ?? '']);

    if (!anyTeamsPlayersRegistered && shouldPredictGoalScorer) {
      setShouldPredictGoalScorer(false);
    }

    setIsPossibleToPredictGoalScorer(anyTeamsPlayersRegistered);
  }, [homeTeam, awayTeam]);

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
      shouldPredictFirstTeamToScore: includeFirstTeamToScore,
      fixtureNickname,
      includeStats,
    };

    onSave(updatedFixture);
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
            minDate={minDate ?? new Date()}
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
        {!isAdminFixturesPage && (
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
            {canIncludeFirstTeamToScore && (
              <OptionalInclusionContainer onClick={() => setIncludeFirstTeamToScore(!includeFirstTeamToScore)}>
                <IconButton
                  icon={includeFirstTeamToScore ? <CheckSquare size={24} color={undefined} weight="fill" /> : <Square size={24} color={undefined} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIncludeFirstTeamToScore(!includeFirstTeamToScore);
                  }}
                  colors={includeFirstTeamToScore ? { normal: theme.colors.primary, hover: theme.colors.primaryDark, active: theme.colors.primaryDark } : { normal: theme.colors.silver, hover: theme.colors.silverDark, active: theme.colors.silverDark }}
                />
                <EmphasisTypography variant="m">Tippa första lag att göra mål</EmphasisTypography>
              </OptionalInclusionContainer>
            )}
            {isPossibleToPredictGoalScorer ? (
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
            ) : (
              <InfoDialogue
                color="silver"
                title="Tippa målskytt ej möjligt"
                description="Målskytt kan endast tippas för utvalda lag som har spelare registrerade i systemet."
              />
            )}
          </Section>
        )}
        <ButtonsContainer>
          <Button
            color="red"
            variant="primary"
            size="m"
            icon={<Trash size={24} color={theme.colors.white} weight="fill" />}
            fullWidth
            onClick={() => {
              onDeleteFixture();
              onClose();
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
        </ButtonsContainer>
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
  gap: ${theme.spacing.s};
  width: 100%;
  box-sizing: border-box;
  flex-grow: 1;
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

const ButtonsContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  width: 100%;
  box-sizing: border-box;
  margin-top: auto;
`;

export default EditFixtureModal;
