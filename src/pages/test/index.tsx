import React, { useState } from 'react'
import styled from 'styled-components';
import { Divider } from '../../components/Divider';
import Page from '../../components/Page';
import Button from '../../components/buttons/Button';
import Checkbox from '../../components/input/Checkbox';
import Input from '../../components/input/Input';
import Select from '../../components/input/Select';
import { Section } from '../../components/section/Section';
import { HeadingsTypography, NormalTypography, EmphasisTypography } from '../../components/typography/Typography';
import { theme } from '../../theme';
import { Player, getPlayersByGeneralPosition, GeneralPositionEnum, getPlayerById } from '../../utils/Players';

const TestPage = () => {
  const [homeGoals, setHomeGoals] = useState<string>('');
  const [awayGoals, setAwayGoals] = useState<string>('');
  const [resultHomeGoals, setResultHomeGoals] = useState<string>('');
  const [resultAwayGoals, setResultAwayGoals] = useState<string>('');
  const [predictedPlayerToScore, setPredictedPlayerToScore] = useState<Player | undefined>(undefined);
  const [correctPlayerPrediction, setCorrectPlayerPrediction] = useState<boolean>(false);
  const [points, setPoints] = useState<number>(0);
  const [correctPredictionPoints, setCorrectPredictionPoints] = useState<Array<{ prediction: string, pointsGained: number }>>([]);

  const handleCalculatePoints = () => {
    if (homeGoals === '' || awayGoals === '' || resultHomeGoals === '' || resultAwayGoals === '') {
      return;
    }

    let totalPoints: number = 0;
    let correctPredictions: Array<{ prediction: string, pointsGained: number }> = [];

    const correctHomeGoals = homeGoals === resultHomeGoals;
    const correctAwayGoals = awayGoals === resultAwayGoals;
    
    const predictedGoalDifference = parseInt(homeGoals) - parseInt(awayGoals);
    const actualGoalDifference = parseInt(resultHomeGoals) - parseInt(resultAwayGoals);
    const correctGoalDifference = predictedGoalDifference === actualGoalDifference;

    const homeWinPredicted = parseInt(homeGoals) > parseInt(awayGoals);
    const awayWinPredicted = parseInt(homeGoals) < parseInt(awayGoals);
    const drawPredicted = parseInt(homeGoals) === parseInt(awayGoals);
    const wasHomeWin = parseInt(resultHomeGoals) > parseInt(resultAwayGoals);
    const wasAwayWin = parseInt(resultHomeGoals) < parseInt(resultAwayGoals);
    const wasDraw = parseInt(resultHomeGoals) === parseInt(resultAwayGoals);

    if (homeWinPredicted && wasHomeWin) {
      console.log('home win, + 1');
      totalPoints += 1;
      correctPredictions.push({ prediction: 'Hemmalag vinst', pointsGained: 1 });
    }

    if (awayWinPredicted && wasAwayWin) {
      console.log('away win, + 1');
      totalPoints += 1;
      correctPredictions.push({ prediction: 'Bortalag vinst', pointsGained: 1 });
    }

    if (drawPredicted && wasDraw) {
      console.log('draw, + 1');
      totalPoints += 1;
      correctPredictions.push({ prediction: 'Oavgjort', pointsGained: 1 });
    }
    
    if (correctHomeGoals) {
      console.log('correct home goals, + 1');
      totalPoints += 1;
      correctPredictions.push({ prediction: 'Antal mål av hemmalaget', pointsGained: 1 });
    }

    if (correctAwayGoals) {
      console.log('correct away goals, + 1');
      totalPoints += 1;
      correctPredictions.push({ prediction: 'Antal mål av bortalaget', pointsGained: 1 });
    }
    
    if (correctGoalDifference) {
      console.log('correct goal difference, + 1');
      totalPoints += 1;
      correctPredictions.push({ prediction: 'Korrekt målskillnad', pointsGained: 1 });
    }

    if (correctPlayerPrediction) {
      const playerPoints = getPlayerToScorePoints();
      totalPoints += playerPoints;
      correctPredictions.push({ prediction: 'Rätt målskytt', pointsGained: playerPoints });
    }

    setPoints(totalPoints);
    setCorrectPredictionPoints(correctPredictions);
  };

  const handleResetAll = () => {
    setHomeGoals('');
    setAwayGoals('');
    setResultHomeGoals('');
    setResultAwayGoals('');
    setPoints(0);
    setCorrectPredictionPoints([]);
    setCorrectPlayerPrediction(false);
  };

  const getOptionItem = (player: Player) => {
    return {
      value: player.id,
      label: player.name,
    }
  }

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
  }

  const getPlayerToScorePoints = () => {
    if (!predictedPlayerToScore) return 0;

    switch (predictedPlayerToScore.position.general) {
      case GeneralPositionEnum.DF:
        return 6;
      case GeneralPositionEnum.MF:
        return 3;
      case GeneralPositionEnum.FW:
        return 2;
      default:
        return 0;
    }
  }

  return (
    <Page user={undefined}>
      <Wrapper>
        <HeadingsTypography variant="h1">Tipset</HeadingsTypography>
        <Section 
          backgroundColor={theme.colors.white}
          padding={theme.spacing.m}
          borderRadius={theme.borderRadius.l}
          gap='m'
        >
          <HeadingsTypography variant='h4'>Nästa match</HeadingsTypography>
          <Select 
            options={[]}
            optionGroups={getOptionGroups()}
            value={predictedPlayerToScore?.id || ''}
            onChange={(value) => setPredictedPlayerToScore(getPlayerById(value))}
          />
          <MatchContainer>
            <NormalTypography variant='m'>Arsenal</NormalTypography>
            <Input
              value={homeGoals}
              onChange={(e) => setHomeGoals(e.currentTarget.value)}
              placeholder='0'
              maxWidth='50px'
              textAlign='center'
              fontSize='30px'
              fontWeight='600'
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
            <NormalTypography variant='m'>Tottenham</NormalTypography>
          </MatchContainer>
          {/* ============================================================================================================ */}
          <Divider />
          <HeadingsTypography variant='h4'>Verkligt resultat</HeadingsTypography>
          <MatchContainer>
            <NormalTypography variant='m'>Arsenal</NormalTypography>
            <Input
              value={resultHomeGoals}
              onChange={(e) => setResultHomeGoals(e.currentTarget.value)}
              placeholder='0'
              maxWidth='50px'
              textAlign='center'
              fontSize='30px'
              fontWeight='600'
            />
            <Input
              value={resultAwayGoals}
              onChange={(e) => setResultAwayGoals(e.currentTarget.value)}
              placeholder='0'
              maxWidth='50px'
              textAlign='center'
              fontSize='30px'
              fontWeight='600'
            />
            <NormalTypography variant='m'>Tottenham</NormalTypography>
          </MatchContainer>
          <Checkbox 
            checked={correctPlayerPrediction} 
            onChange={(wasChecked) => setCorrectPlayerPrediction(wasChecked)}
            label='Rätt målskytt'
          />
          <Divider />
          <Button
            onClick={handleCalculatePoints}
          >
            Räkna poäng
          </Button>
          <EmphasisTypography variant='m'>Totala poäng för matchen: {points}</EmphasisTypography>
          {correctPredictionPoints.length > 0 && (
            <Section>
              {correctPredictionPoints.map((correctPrediction) => (
                <Section gap='xs' flexDirection='row'>
                  <NormalTypography variant='m'>{correctPrediction.prediction}</NormalTypography>
                  <EmphasisTypography variant='m'>{correctPrediction.pointsGained}</EmphasisTypography>
                </Section>
              ))}
            </Section>
          )}
          <Button
            onClick={handleResetAll}
            variant='secondary'
            // color={theme.colors.primary}
          >
            Återställ
          </Button>
        </Section>
      </Wrapper>
    </Page>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.l};
`;

const MatchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.m};
`;

export default TestPage;