import styled from 'styled-components';
import Page from '../../components/Page';
import { theme } from '../../theme';
import GamePredictor from '../../components/game/GamePredictor';
import { Fixture, FixtureOutcomeEnum } from '../../utils/Fixture';
import { Section } from '../../components/section/Section';
import { HeadingsTypography } from '../../components/typography/Typography';
import { Divider } from '../../components/Divider';
import { getTeamByName } from '../../utils/Team';

const MockGame1: Fixture = {
  homeTeam: getTeamByName('Arsenal')!,
  awayTeam: getTeamByName('Ipswich')!,
  stadium: 'Emirates Stadium',
  tournament: 'Premier League',
  homeTeamForm: [FixtureOutcomeEnum.LOSS, FixtureOutcomeEnum.WIN, FixtureOutcomeEnum.DRAW, FixtureOutcomeEnum.WIN, FixtureOutcomeEnum.NONE],
  awayTeamForm: [FixtureOutcomeEnum.WIN, FixtureOutcomeEnum.LOSS, FixtureOutcomeEnum.LOSS, FixtureOutcomeEnum.WIN, FixtureOutcomeEnum.NONE],
  kickOffTime: new Date('2024-10-10T18:15:00'),
  shouldPredictGoalScorer: true,
}

const MockGame2: Fixture = {
  homeTeam: getTeamByName('IFK Göteborg')!,
  awayTeam: getTeamByName('Västerås SK')!,
  stadium: 'Gamla Ullevi',
  tournament: 'Allsvenskan',
  homeTeamForm: [FixtureOutcomeEnum.WIN, FixtureOutcomeEnum.LOSS, FixtureOutcomeEnum.WIN, FixtureOutcomeEnum.DRAW, FixtureOutcomeEnum.NONE],
  awayTeamForm: [FixtureOutcomeEnum.WIN, FixtureOutcomeEnum.DRAW, FixtureOutcomeEnum.WIN, FixtureOutcomeEnum.DRAW, FixtureOutcomeEnum.NONE],
  kickOffTime: new Date('2024-10-10T15:00:00'),
  shouldPredictGoalScorer: false,
}

const HomePage = () => {
  return (
    <Page user={undefined}>
      <Section gap='l'>
        <HeadingsTypography variant='h1'>Tipset</HeadingsTypography>
        <Section gap='s'>
          <HeadingsTypography variant='h3'>Matcher att tippa</HeadingsTypography>
          <Wrapper>
            <Section 
              backgroundColor={theme.colors.white}
              borderRadius={theme.borderRadius.m}
              padding={theme.spacing.m}
              gap='s'
            >
              <HeadingsTypography variant='h4'>Match 1</HeadingsTypography>
              <Divider />
              <GamePredictor
                gameNumber={1}
                game={MockGame1} 
                onResultUpdate={(homeGoals, awayGoals) => console.log(homeGoals, awayGoals)}
                onPlayerPredictionUpdate={(player) => console.log(player)}
              />
            </Section>
            <Section
              backgroundColor={theme.colors.white}
              borderRadius={theme.borderRadius.m}
              padding={theme.spacing.m}
              gap='s'
            >
              <HeadingsTypography variant='h4'>Match 2</HeadingsTypography>
              <Divider />
              <GamePredictor
                gameNumber={2}
                game={MockGame2} 
                onResultUpdate={(homeGoals, awayGoals) => console.log(homeGoals, awayGoals)}
                onPlayerPredictionUpdate={(player) => console.log(player)}
              />
            </Section>
          </Wrapper>
        </Section>
      </Section>
    </Page>
  )
}

const Wrapper = styled.div`
  display: flex;
  gap: ${theme.spacing.l};
  width: 100%;
`;

export default HomePage;