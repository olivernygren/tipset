import { useState } from 'react'
import { Section } from '../section/Section';
import { EmphasisTypography, NormalTypography } from '../typography/Typography';
import { Fixture, Prediction, TeamType } from '../../utils/Fixture';
import { GeneralPositionEnum, Player, getPlayerById, getPlayersByGeneralPosition } from '../../utils/Players';
import { AvatarSize } from '../avatar/Avatar';
import { MapPin } from '@phosphor-icons/react';
import { theme } from '../../theme';
import { Team } from '../../utils/Team';
import styled from 'styled-components';
import { Divider } from '../Divider';
// import FormIcon from '../form/FormIcon';
import Select from '../input/Select';
import Button from '../buttons/Button';
import ClubAvatar from '../avatar/ClubAvatar';
import NationAvatar from '../avatar/NationAvatar';
import GoalsInput from './GoalsInput';

interface GamePredictorProps {
  game: Fixture;
  gameNumber: number;
  onResultUpdate: (gameNumber: number, homeGoals: string, awayGoals: string) => void;
  onPlayerPredictionUpdate: (gameNumber: number, player: Player | undefined) => void;
  onSave: (homeGoals: string, awayGoals: string, predictedPlayerToScore?: Player) => void;
  hasPredicted?: boolean;
  predictionValue?: Prediction;
  loading?: boolean;
}

const GamePredictor = ({ 
  game, gameNumber, onPlayerPredictionUpdate, onResultUpdate, onSave, hasPredicted, predictionValue, loading,
}: GamePredictorProps) => {
  const [homeGoals, setHomeGoals] = useState<string>(predictionValue?.homeGoals.toString() ?? '');
  const [awayGoals, setAwayGoals] = useState<string>(predictionValue?.awayGoals.toString() ?? '');
  const [predictedPlayerToScore, setPredictedPlayerToScore] = useState<Player | undefined>(predictionValue && predictionValue.goalScorer ? predictionValue.goalScorer : undefined);

  const getTeam = (team: Team, isAwayTeam: boolean) => {
    const name = team.name;
    const logoUrl = team.logoUrl ?? team.relativeLogoUrl;

    return (
      <TeamContainer team={isAwayTeam ? 'away' : 'home'}>
        <AvatarAndTeamName>
          {game.teamType === TeamType.CLUBS ? (
            <ClubAvatar 
              clubName={name}
              logoUrl={logoUrl} 
              size={AvatarSize.L}
              showBorder={hasPredicted}
              isDarkMode={hasPredicted}
            />
          ) : (
            <NationAvatar
              nationName={name}
              flagUrl={logoUrl}
              size={AvatarSize.L}
              isDarkMode={hasPredicted}
            />
          )}
          <EmphasisTypography variant='m' color={hasPredicted ? theme.colors.white : theme.colors.textDefault}>
            {name}
          </EmphasisTypography>
        </AvatarAndTeamName>
        {/* {getTeamForm(isAwayTeam)} */}
      </TeamContainer>
    )
  };

  // const getTeamForm = (isAwayTeam: boolean) => {
  //   const form = isAwayTeam ? game.awayTeamForm : game.homeTeamForm;
  //   return (
  //     <Section flexDirection='row' gap='xxxs' justifyContent={isAwayTeam ? 'flex-start' : 'flex-end'}>
  //       {form.map((outcome, index) => (
  //         <FormIcon key={index} outcome={outcome} />
  //       ))}
  //     </Section>
  //   )
  // }

  const handleIncreaseGoals = (team: 'home' | 'away') => {
    let updatedHomeGoals = homeGoals;
    let updatedAwayGoals = awayGoals;

    if (team === 'home') {
      if (homeGoals === '') {
        updatedHomeGoals = '0';
        setHomeGoals('0');
        return;
      };
      updatedHomeGoals = (parseInt(homeGoals) + 1).toString();
      setHomeGoals((oldstate) => (parseInt(oldstate) + 1).toString());
    } else {
      if (awayGoals === '') {
        updatedAwayGoals = '0';
        setAwayGoals('0');
        return;
      };
      updatedAwayGoals = (parseInt(awayGoals) + 1).toString();
      setAwayGoals((oldstate) => (parseInt(oldstate) + 1).toString());
    }
    onResultUpdate(gameNumber, updatedHomeGoals, updatedAwayGoals);
  }

  const handleDecreaseGoals = (team: 'home' | 'away') => {
    let updatedHomeGoals = homeGoals;
    let updatedAwayGoals = awayGoals;

    if (team === 'home') {
      if (homeGoals === '') {
        updatedHomeGoals = '0';
        setHomeGoals('0');
        return;
      };
      updatedHomeGoals = (parseInt(homeGoals) - 1).toString();
      setHomeGoals((oldstate) => (parseInt(oldstate) - 1).toString());
    } else {
      if (awayGoals === '') {
        updatedAwayGoals = '0';
        setAwayGoals('0');
        return;
      };
      updatedAwayGoals = (parseInt(awayGoals) - 1).toString();
      setAwayGoals((oldstate) => (parseInt(oldstate) - 1).toString());
    };
    onResultUpdate(gameNumber, updatedHomeGoals, updatedAwayGoals);
  };

  const getKickoffTime = () => {
    const weekday = new Date(game.kickOffTime).toLocaleDateString('sv-SE', { weekday: 'long', });
    const weekdayCapitalized = weekday.charAt(0).toUpperCase() + weekday.slice(1);
    const date = new Date(game.kickOffTime).toLocaleDateString('sv-SE', { day: 'numeric', month: 'long' });
    const time = new Date(game.kickOffTime).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });

    return `${weekdayCapitalized} ${date} ${time}`;
  };

  const getOptionItem = (player: Player) => {
    return {
      value: player.id,
      label: player.name,
    }
  };

  const getOptionGroups = () => {
    const defenders = getPlayersByGeneralPosition(GeneralPositionEnum.DF);
    const midfielders = getPlayersByGeneralPosition(GeneralPositionEnum.MF);
    const forwards = getPlayersByGeneralPosition(GeneralPositionEnum.FW);

    return [
      {
        label: 'Välj spelare',
        options: [{ value: 'Välj spelare', label: 'Välj spelare' }]
      },
      {
        label: 'Försvarare (8p)',
        options: defenders.map(getOptionItem)
      },
      {
        label: 'Mittfältare (4p)',
        options: midfielders.map(getOptionItem)
      },
      {
        label: 'Anfallare (3p)',
        options: forwards.map(getOptionItem)
      }
    ]
  };

  const getTextColor = () => {
    return hasPredicted ? theme.colors.white : theme.colors.textDefault;
  }

  const handleInputChange = (team: 'home' | 'away', value: string) => {
    if (value !== '' && !/^[0-9]$/.test(value)) {
      return;
    }
    if (team === 'home') {
      setHomeGoals(value);
    } else {
      setAwayGoals(value);
    }
    onResultUpdate(gameNumber, homeGoals, awayGoals);
  }

  const handleSave = () => {
    onSave(homeGoals, awayGoals, predictedPlayerToScore);
  };

  const handleUpdatePlayerPrediction = (player?: Player) => {
    if (!player) return;
    setPredictedPlayerToScore(player);
    onPlayerPredictionUpdate(gameNumber, player);
  }
  
  return (
    <Card hasPredicted={hasPredicted}>
      <CardHeader>
        <Section flexDirection='row' gap='xxxs' alignItems='center' fitContent>
          <MapPin size={16} weight="fill" color={getTextColor()} />
          <NormalTypography variant='s' align='center' color={getTextColor()}>{game.stadium}</NormalTypography>
        </Section>
        <NormalTypography variant='s' color={getTextColor()}>•</NormalTypography>
        <NormalTypography variant='s' align='center' color={getTextColor()}>{getKickoffTime()}</NormalTypography>
        <NormalTypography variant='s' color={getTextColor()}>•</NormalTypography>
        <NormalTypography variant='s' align='center' color={getTextColor()}>{game.tournament}</NormalTypography>
      </CardHeader>
      <Divider color={hasPredicted ? theme.colors.primaryLight : theme.colors.silverLighter} />
      <GameWrapper>
        {getTeam(game.homeTeam, false)}
        <GoalsInput
          team='home'
          goals={homeGoals}
          onIncrease={() => handleIncreaseGoals('home')}
          onDecrease={() => handleDecreaseGoals('home')}
          onInputChange={(value) => handleInputChange('home', value)}
          hasPredicted={hasPredicted}
        />
        <NormalTypography variant='l' color={hasPredicted ? theme.colors.white : theme.colors.textDefault}>–</NormalTypography>
        <GoalsInput
          team='away'
          goals={awayGoals}
          onIncrease={() => handleIncreaseGoals('away')}
          onDecrease={() => handleDecreaseGoals('away')}
          onInputChange={(value) => handleInputChange('away', value)}
          hasPredicted={hasPredicted}
        />
        {getTeam(game.awayTeam, true)}
      </GameWrapper>
      {game.shouldPredictGoalScorer && (
        <>
          <Divider color={hasPredicted ? theme.colors.primaryLight : theme.colors.silverLighter} />
          <GoalScorerSection>
            <EmphasisTypography variant='m' color={hasPredicted ? theme.colors.white : theme.colors.textDefault}>Välj målskytt i matchen</EmphasisTypography>
            <Select 
              options={[]}
              optionGroups={getOptionGroups()}
              value={predictedPlayerToScore?.id || ''}
              onChange={(value) => handleUpdatePlayerPrediction(getPlayerById(value))}
            />
          </GoalScorerSection>
          <Divider color={hasPredicted ? theme.colors.primaryLight : theme.colors.silverLighter} />
        </>
      )}
      <SaveButtonSection hasPredicted={hasPredicted}>
        <Button 
          variant='primary' 
          onClick={handleSave} 
          color={hasPredicted ? "gold" : "primary"}
          loading={loading}
          disabledInvisible={homeGoals === '' || awayGoals === '' || loading}
          textColor={hasPredicted ? theme.colors.textDefault : theme.colors.white}
          fullWidth 
        >
          Spara
        </Button>
      </SaveButtonSection>
    </Card>
  )
}

const Card = styled.div<{ hasPredicted?: boolean }>`
  border-radius: ${theme.borderRadius.m};
  border: 2px solid ${({ hasPredicted }) => hasPredicted ? theme.colors.gold : theme.colors.primary};
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  background-color: ${({ hasPredicted }) => hasPredicted ? theme.colors.primary : theme.colors.white};
  width: 100%;
  box-sizing: border-box;
`;

const CardHeader = styled.div`
  display: flex;
  gap: ${theme.spacing.s};
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.s};
  width: 100%;
  box-sizing: border-box;
`;

const GameWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto auto 1fr;
  gap: ${theme.spacing.s};
  align-items: center;
  justify-items: center;
  width: 100%;
  margin: auto 0;
  padding: ${theme.spacing.s} 0;
`;

const TeamContainer = styled.div<{team: 'home' | 'away'}>`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xxxs};
  width: 100%;
  align-items: ${({ team }) => team === 'home' ? 'flex-end' : 'flex-start'};
  padding-left: ${({ team }) => team === 'home' ? '0' : theme.spacing.s};
  padding-right: ${({ team }) => team === 'away' ? '0' : theme.spacing.s};
`;

const AvatarAndTeamName = styled.div`
  display: flex;
  gap: ${theme.spacing.xxxs};
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
  align-items: center;
`;

const GoalScorerSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.s};
  width: 100%;
  box-sizing: border-box;
`;

const SaveButtonSection = styled.div<{ hasPredicted?: boolean }>`
  background-color: ${({ hasPredicted }) => hasPredicted ? theme.colors.gold : theme.colors.primary};
  width: 100%;
  margin-top: auto;
`;

export default GamePredictor;