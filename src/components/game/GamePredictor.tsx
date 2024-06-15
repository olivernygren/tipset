import React, { useState } from 'react'
import { Section } from '../section/Section';
import Input from '../input/Input';
import { EmphasisTypography, NormalTypography } from '../typography/Typography';
import { Game } from '../../utils/Game';
import { GeneralPositionEnum, Player, getPlayerById, getPlayersByGeneralPosition } from '../../utils/Players';
import Avatar, { AvatarSize } from '../avatar/Avatar';
import { MapPin, MinusCircle, PlusCircle } from '@phosphor-icons/react';
import IconButton from '../buttons/IconButton';
import { theme } from '../../theme';
import { Team } from '../../utils/Team';
import styled from 'styled-components';
import { Divider } from '../Divider';
import FormIcon from '../form/FormIcon';
import Select from '../input/Select';

interface GamePredictorProps {
  game: Game;
  gameNumber: number;
  onResultUpdate: (gameNumber: number, homeGoals: string, awayGoals: string) => void;
  onPlayerPredictionUpdate: (gameNumber: number, player: Player | undefined) => void;
}

const GamePredictor = ({ game, gameNumber, onPlayerPredictionUpdate, onResultUpdate }: GamePredictorProps) => {
  const [homeGoals, setHomeGoals] = useState<string>('');
  const [awayGoals, setAwayGoals] = useState<string>('');
  const [predictedPlayerToScore, setPredictedPlayerToScore] = useState<Player | undefined>(undefined);

  const getTeam = (team: Team, isAwayTeam: boolean) => {
    const name = team.name;
    const logoUrl = team.logoUrl ?? team.relativeLogoUrl;

    return (
      <TeamContainer team={isAwayTeam ? 'away' : 'home'}>
      {/* <Section gap='xxxs'> */}
        <Section flexDirection={isAwayTeam ? 'row-reverse' : 'row'} alignItems='center' gap='xxs' justifyContent='flex-end'>
          <Avatar src={logoUrl} size={AvatarSize.M} alt={`${name} logo`} />
          <EmphasisTypography variant='l'>{name}</EmphasisTypography>
        </Section>
        {getTeamForm(isAwayTeam)}
      {/* </Section> */}
      </TeamContainer>
    )
  };

  const getTeamForm = (isAwayTeam: boolean) => {
    const form = isAwayTeam ? game.awayTeamForm : game.homeTeamForm;
    return (
      <Section flexDirection='row' gap='xxxs' justifyContent={isAwayTeam ? 'flex-start' : 'flex-end'}>
        {form.map((outcome, index) => (
          <FormIcon key={index} outcome={outcome} />
        ))}
      </Section>
    )
  }

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
    if (team === 'home') {
      if (homeGoals === '') {
        setHomeGoals('0');
        return;
      };
      setHomeGoals((oldstate) => (parseInt(oldstate) - 1).toString());
    } else {
      if (awayGoals === '') {
        setAwayGoals('0');
        return;
      };
      setAwayGoals((oldstate) => (parseInt(oldstate) - 1).toString());
    }
  };

  const getKickoffTime = () => {
    const weekday = game.kickOffTime.toLocaleDateString('sv-SE', { weekday: 'long', });
    const weekdayCapitalized = weekday.charAt(0).toUpperCase() + weekday.slice(1);
    const date = game.kickOffTime.toLocaleDateString('sv-SE', { day: 'numeric', month: 'long' });
    const time = game.kickOffTime.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });

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
        label: 'Försvarare (6p)',
        options: defenders.map(getOptionItem)
      },
      {
        label: 'Mittfältare (3p)',
        options: midfielders.map(getOptionItem)
      },
      {
        label: 'Anfallare (2p)',
        options: forwards.map(getOptionItem)
      }
    ]
  };
  
  return (
    <Section gap='xs' alignItems='center'>
      <Section flexDirection='row' gap='s' alignItems='center' justifyContent='center'>
          <Section flexDirection='row' gap='xxxs' alignItems='center' fitContent>
            <MapPin size={20} weight="fill" />
            <NormalTypography variant='m'>{game.stadium}</NormalTypography>
          </Section>
          <NormalTypography variant='m'>•</NormalTypography>
          <NormalTypography variant='m'>{getKickoffTime()}</NormalTypography>
          <NormalTypography variant='m'>•</NormalTypography>
          <NormalTypography variant='m'>{game.tournament}</NormalTypography>
      </Section>
      <Divider />
      <GameWrapper>
        {getTeam(game.homeTeam, false)}
        <Section alignItems='center' fitContent>
          <IconButton 
            icon={<PlusCircle size={24} />}
            onClick={() => handleIncreaseGoals('home')}
            colors={{ normal: theme.colors.primary, hover: theme.colors.primaryDark, active: theme.colors.primaryDarker, disabled: theme.colors.silver }}
            disabled={homeGoals === '9'}
          />
          <Input
            value={homeGoals}
            onChange={(e) => setHomeGoals(e.currentTarget.value)}
            placeholder='0'
            maxWidth='50px'
            textAlign='center'
            fontSize='30px'
            fontWeight='600'
          />
          <IconButton 
            icon={<MinusCircle size={24} />}
            onClick={() => handleDecreaseGoals('home')}
            colors={{ normal: theme.colors.primary, hover: theme.colors.primaryDark, active: theme.colors.primaryDarker, disabled: theme.colors.silver }}
            disabled={homeGoals === '0' || homeGoals === ''}
          />
        </Section>
        <NormalTypography variant='l'>–</NormalTypography>
        <Section alignItems='center' fitContent>
          <IconButton
            icon={<PlusCircle size={24} />}
            onClick={() => handleIncreaseGoals('away')}
            colors={{ normal: theme.colors.primary, hover: theme.colors.primaryDark, active: theme.colors.primaryDarker, disabled: theme.colors.silver }}
            disabled={awayGoals === '9'}
          />
          <Input
            value={awayGoals}
            onChange={(e) => setAwayGoals(e.currentTarget.value)}
            placeholder='0'
            maxWidth='50px'
            textAlign='center'
            fontSize='30px'
            fontWeight='600'
          />
          <IconButton
            icon={<MinusCircle size={24} />}
            onClick={() => handleDecreaseGoals('away')}
            colors={{ normal: theme.colors.primary, hover: theme.colors.primaryDark, active: theme.colors.primaryDarker, disabled: theme.colors.silver}}
            disabled={awayGoals === '0' || awayGoals === ''}
          />
        </Section>
        {getTeam(game.awayTeam, true)}
      </GameWrapper>
      <Divider />
      <Section flexDirection='row' justifyContent='space-between' padding="12px 0 0 0" alignItems='center'>
        <EmphasisTypography variant='m'>Välj målskytt i matchen</EmphasisTypography>
        <Select 
          options={[]}
          optionGroups={getOptionGroups()}
          value={predictedPlayerToScore?.id || ''}
          onChange={(value) => setPredictedPlayerToScore(getPlayerById(value))}
        />
      </Section>
    </Section>
  )
}

const GameWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto auto 1fr;
  gap: ${theme.spacing.s};
  align-items: center;
  justify-items: center;
  width: 100%;
`;

const KickOffTime = styled.div`
  background-color: ${theme.colors.silverLight};
  padding: ${theme.spacing.xxs} ${theme.spacing.s};
  border-radius: ${theme.borderRadius.s};
  margin-bottom: ${theme.spacing.xxxs};
`;

const StadiumAndTournament = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

const TeamContainer = styled.div<{team: 'home' | 'away'}>`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xxxs};
  width: 100%;
  align-items: ${({ team }) => team === 'home' ? 'flex-end' : 'flex-start'};
  padding-left: ${({ team }) => team === 'home' ? '0' : theme.spacing.m};
  padding-right: ${({ team }) => team === 'away' ? '0' : theme.spacing.m};
`;

export default GamePredictor;