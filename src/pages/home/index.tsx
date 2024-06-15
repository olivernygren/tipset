import styled from 'styled-components';
import Page from '../../components/Page';
import { theme } from '../../theme';
import GamePredictor from '../../components/game/GamePredictor';
import { Game, TeamMatchOutcomeEnum } from '../../utils/Game';
import { Section } from '../../components/section/Section';
import { HeadingsTypography } from '../../components/typography/Typography';
import { Divider } from '../../components/Divider';
import { LeagueEnum, Team, Teams, getTeamByName } from '../../utils/Team';

const MockGame1: Game = {
  homeTeam: getTeamByName('AIK', LeagueEnum.ALLSVENSKAN)!,
  awayTeam: getTeamByName('Djurgården', LeagueEnum.ALLSVENSKAN)!,
  // homeTeam: { name: 'AIK', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5f/AIK_logo.svg/1920px-AIK_logo.svg.png'},
  // awayTeam: { name: 'Djurgården', logoUrl: 'https://www.dif.se/_next/image?url=https%3A%2F%2Fbackend.dif.se%2Fmedia%2Focuga53z%2Fdif_primar_skold_logo_klubbmarke_rgb.png&w=828&q=80'},
  stadium: 'Friends Arena',
  tournament: 'Allsvenskan',
  homeTeamForm: [TeamMatchOutcomeEnum.LOSS, TeamMatchOutcomeEnum.WIN, TeamMatchOutcomeEnum.DRAW, TeamMatchOutcomeEnum.WIN, TeamMatchOutcomeEnum.NONE],
  awayTeamForm: [TeamMatchOutcomeEnum.WIN, TeamMatchOutcomeEnum.LOSS, TeamMatchOutcomeEnum.LOSS, TeamMatchOutcomeEnum.WIN, TeamMatchOutcomeEnum.NONE],
  kickOffTime: new Date('2024-10-10T18:15:00'),
}

const MockGame2: Game = {
  homeTeam: { name: 'IFK Göteborg', logoUrl: 'https://ifkgoteborg.se/wp-content/uploads/2017/09/IFK-logo.png'},
  awayTeam: { name: 'Hammarby', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0a/Hammarby_IF_logo.svg/1920px-Hammarby_IF_logo.svg.png'},
  stadium: 'Gamla Ullevi',
  tournament: 'Allsvenskan',
  homeTeamForm: [TeamMatchOutcomeEnum.WIN, TeamMatchOutcomeEnum.LOSS, TeamMatchOutcomeEnum.WIN, TeamMatchOutcomeEnum.DRAW, TeamMatchOutcomeEnum.NONE],
  awayTeamForm: [TeamMatchOutcomeEnum.WIN, TeamMatchOutcomeEnum.DRAW, TeamMatchOutcomeEnum.WIN, TeamMatchOutcomeEnum.DRAW, TeamMatchOutcomeEnum.NONE],
  kickOffTime: new Date('2024-10-10T15:00:00'),
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