import React, { useState } from 'react'
import { Section } from '../section/Section';
import Input from '../input/Input';
import { EmphasisTypography, NormalTypography } from '../typography/Typography';
import { Fixture } from '../../utils/Fixture';
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
import Button from '../buttons/Button';
import ClubAvatar from '../avatar/ClubAvatar';
import NationAvatar from '../avatar/NationAvatar';
import GoalsInput from './GoalsInput';

interface GamePredictorProps {
  game: Fixture;
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
        {/* <Section flexDirection={isAwayTeam ? 'row-reverse' : 'row'} alignItems='center' gap='xxxs' justifyContent='flex-end'>
          <ClubAvatar 
            clubName={name}
            logoUrl={logoUrl} 
            size={AvatarSize.M}
            showBorder={false}
          />
          <EmphasisTypography variant='m' align={isAwayTeam ? 'left' : 'right'}>{name}</EmphasisTypography>
        </Section> */}
        <AvatarAndTeamName>
          <ClubAvatar 
            clubName={name}
            logoUrl={logoUrl} 
            size={AvatarSize.L}
            showBorder={false}
          />
          {/* <NationAvatar
            nationName={name}
            flagUrl={logoUrl}
            size={AvatarSize.L}
          /> */}
          <EmphasisTypography variant='m'>{name}</EmphasisTypography>
        </AvatarAndTeamName>
        {/* {getTeamForm(isAwayTeam)} */}
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
    fetch('http://localhost:8000/test', {
      method: 'GET', // or 'POST'
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': 'Bearer ' + token // if you have a token
      },
      // body: JSON.stringify(data), // if you're sending data
    })
    .then((response) => response.json())
    .then((data) => console.log(data))
    .catch((error) => {
      console.error('Error:', error);
    });
  }
  
  return (
    <Section gap='xs' alignItems='center'>
      <Section flexDirection='row' gap='s' alignItems='center' justifyContent='center'>
        <Section flexDirection='row' gap='xxxs' alignItems='center' fitContent>
          <MapPin size={16} weight="fill" />
          <NormalTypography variant='s' align='center'>{game.stadium}</NormalTypography>
        </Section>
        <NormalTypography variant='s'>•</NormalTypography>
        <NormalTypography variant='s' align='center'>{getKickoffTime()}</NormalTypography>
        <NormalTypography variant='s'>•</NormalTypography>
        <NormalTypography variant='s' align='center'>{game.tournament}</NormalTypography>
      </Section>
      <Divider />
      <GameWrapper>
        {getTeam(game.homeTeam, false)}
        <GoalsInput
          team='home'
          goals={homeGoals}
          onIncrease={() => handleIncreaseGoals('home')}
          onDecrease={() => handleDecreaseGoals('home')}
          onInputChange={(value) => handleInputChange('home', value)}
        />
        <NormalTypography variant='l'>–</NormalTypography>
        <GoalsInput
          team='away'
          goals={awayGoals}
          onIncrease={() => handleIncreaseGoals('away')}
          onDecrease={() => handleDecreaseGoals('away')}
          onInputChange={(value) => handleInputChange('away', value)}
        />
        {getTeam(game.awayTeam, true)}
      </GameWrapper>
      {game.shouldPredictGoalScorer && (
        <>
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
        </>
      )}
      <Button variant='primary' onClick={handleSave}>Spara</Button>
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
  margin-bottom: ${theme.spacing.xxxs};
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

const AvatarAndTeamName = styled.div`
  display: flex;
  gap: ${theme.spacing.xxxs};
  flex-direction: column;
  justify-content: center;
  /* height: 100%; */
  box-sizing: border-box;
  align-items: center;
`;

export default GamePredictor;