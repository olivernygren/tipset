import { LeagueGameWeek, PredictionLeague, PredictionLeagueStanding } from '../../utils/League';
import styled from 'styled-components';
import { ArrowCircleRight, PlusCircle } from '@phosphor-icons/react';
import { theme, devices } from '../../theme';
import { getUserStandingPositionInLeague } from '../../utils/firebaseHelpers';
import Button from '../buttons/Button';
import { Section } from '../section/Section';
import { EmphasisTypography, NormalTypography, HeadingsTypography } from '../typography/Typography';
import { LeagueTabs } from '../../pages/admin/leagues/[leagueId]';
import { useEffect, useState } from 'react';
import FixturePreview from '../game/FixturePreview';
import { Divider } from '../Divider';
import FixtureResultPreview from '../game/FixtureResultPreview';
import { useUser } from '../../context/UserContext';

interface LeagueOverviewProps {
  league: PredictionLeague;
  isCreator: boolean;
  currentUserId: string;
  sortedLeagueStandings: Array<PredictionLeagueStanding>;
  onChangeTab: (tab: LeagueTabs) => void;
}

const LeagueOverview = ({ league, isCreator, currentUserId, sortedLeagueStandings, onChangeTab }: LeagueOverviewProps) => {
  const { user } = useUser();

  const [currentGameWeek, setCurrentGameWeek] = useState<LeagueGameWeek | undefined>(undefined);
  const [previousGameWeek, setPreviousGameWeek] = useState<LeagueGameWeek | undefined>(undefined);

  useEffect(() => {
    if (league && league.gameWeeks && league.gameWeeks.length > 0) {
      const currentGameWeek = league.gameWeeks.find((gameWeek) => {
        const now = new Date();
        return new Date(gameWeek.startDate) < now && (new Date(gameWeek.deadline) > now || gameWeek.hasBeenCorrected === false);
      });

      if (currentGameWeek) {
        setCurrentGameWeek(currentGameWeek);
      }

      const previousGameWeek = league.gameWeeks.find((gameWeek) => {
        const now = new Date();
        return new Date(gameWeek.startDate) < now && new Date(gameWeek.deadline) < now && gameWeek.hasBeenCorrected === true;
      });

      if (previousGameWeek) {
        setPreviousGameWeek(previousGameWeek);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getFormattedDeadline = () => {
    if (!league) return '';

    const deadline = new Date(league.deadlineToJoin);
    const day = deadline.getDate();
    const month = deadline.toLocaleString('default', { month: 'long' });
    const year = deadline.getFullYear();
    const hours = deadline.getHours();
    const minutes = deadline.getMinutes();

    return `${day} ${month} ${year} (${hours}:${minutes})`;
  }

  const getUserLeagueStandingsItem = (position: number, place?: PredictionLeagueStanding) => {
    if (!place) return null;
    const isLoggedInUser = place.userId === currentUserId;

    return (
      <UserLeaguePosition isLoggedInUser={isLoggedInUser}>
        <EmphasisTypography variant='m' color={theme.colors.textDefault}>
          {position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : `${position} -`} {place.username} {place.userId === currentUserId ? '(Du)' : null}
        </EmphasisTypography>
        <RightAlignedGridItem>
          <NormalTypography variant='m' color={theme.colors.textDefault}>
            {place.correctResults}
          </NormalTypography>
        </RightAlignedGridItem>
        <RightAlignedGridItem>
          <NormalTypography variant='m' color={theme.colors.textDefault}>
            {place.points} p
          </NormalTypography>
        </RightAlignedGridItem>
      </UserLeaguePosition>
    )
  };

  return (
    <>
      <OverviewGrid>
        <GridSection>
          <HeadingsTypography variant='h3'>Kommande matcher</HeadingsTypography>
          {currentGameWeek ? (
            <Section gap='xxxs' height='100%'>
              {currentGameWeek.games.fixtures.map((fixture) => (
                <FixturePreview
                  fixture={fixture} 
                  hidePredictions={new Date(fixture.kickOffTime) > new Date()}
                />
              ))}
              {currentGameWeek.games.fixtures.length > 0 && currentGameWeek.deadline && new Date(currentGameWeek.deadline) > new Date() && (
                <MarginTopButton>
                  <Button onClick={() => onChangeTab(LeagueTabs.MATCHES)} endIcon={<ArrowCircleRight weight='fill' size={24} color={theme.colors.white} />}>
                    Tippa matcher
                  </Button>
                </MarginTopButton>
              )}
            </Section>
          ) : (
            <>
              <NormalTypography variant='m' color={theme.colors.textLight}>Inga omgångar finns</NormalTypography>
              {isCreator && (
                <MarginTopButton>
                  <Button onClick={() => onChangeTab(LeagueTabs.MATCHES)} icon={<PlusCircle size={24} color={theme.colors.white} />}>
                    Skapa omgång
                  </Button>
                </MarginTopButton>
              )}
            </>
          )}
        </GridSection>
        <GridSection>
          <TableSectionHeader>
            <HeadingsTypography variant='h3'>Tabell</HeadingsTypography>
            {league.standings && league.standings.length > 0 && (
              <>
                <EmphasisTypography variant='l' color={theme.colors.textLight}>Din placering: {getUserStandingPositionInLeague(currentUserId, sortedLeagueStandings)}</EmphasisTypography>
                {/* Show separate user placing somewhere if they are outside the top 5 */}
                {/* {getUserLeaguePosition(league.standings.find((place) => place.userId === currentUserId))} */}
              </>
            )}
          </TableSectionHeader>
          {league.standings && league.standings.length > 0 ? (
            <LeagueStandings>
              <LeagueStandingsHeader>
                <EmphasisTypography variant='s' color={theme.colors.textLight}>Namn</EmphasisTypography>
                <RightAlignedGridItem>
                  <EmphasisTypography variant='s' color={theme.colors.textLight} align='right'>Korrekta resultat</EmphasisTypography>
                </RightAlignedGridItem>
                <RightAlignedGridItem>
                  <EmphasisTypography variant='s' color={theme.colors.textLight} align='right'>Poäng</EmphasisTypography>
                </RightAlignedGridItem>
              </LeagueStandingsHeader>
              {sortedLeagueStandings.map((place, index) => getUserLeagueStandingsItem(index + 1, place))}
            </LeagueStandings>
          ) : (
            <NormalTypography variant='m' color={theme.colors.silverDarker}>Ingen tabell finns</NormalTypography>
          )}
        </GridSection>
        <GridSection>
          <HeadingsTypography variant='h3'>Förra omgången</HeadingsTypography>
          {previousGameWeek ? (
            <Section gap='s' backgroundColor={theme.colors.silverLighter} borderRadius={theme.borderRadius.m}>
              <Section justifyContent='space-between' alignItems='center' flexDirection='row' padding={`${theme.spacing.s} ${theme.spacing.s} 0 ${theme.spacing.s}`}>
                <HeadingsTypography variant='h6' color={theme.colors.primaryDark}>Omgång {previousGameWeek.round}</HeadingsTypography>
                <Section flexDirection='row' gap='s' alignItems='center' fitContent>
                  <NormalTypography variant='m' color={theme.colors.textLight}>{new Date(previousGameWeek.deadline).toLocaleDateString()}</NormalTypography>
                  <RoundPointsContainer>
                    <EmphasisTypography variant='m' color={theme.colors.gold}>
                      {previousGameWeek.games.predictions.filter((p) => p.userId === user?.documentId).reduce((acc, curr) => acc + (curr.points?.total ?? 0), 0)} poäng
                    </EmphasisTypography>
                  </RoundPointsContainer>
                </Section>
              </Section>
              <Divider color={theme.colors.silver} />
              <Section gap='xxs' padding={`0 ${theme.spacing.s} ${theme.spacing.s} ${theme.spacing.s}`}>
                {previousGameWeek.games.fixtures.map((fixture) => (
                  <FixtureResultPreview 
                    fixture={fixture}
                    predictions={previousGameWeek.games.predictions.filter((prediction) => prediction.fixtureId === fixture.id)}
                    compact
                  />
                ))}
              </Section>
            </Section>
          ) : (
            <NormalTypography variant='m' color={theme.colors.textLight}>Ingen tidigare omgång finns</NormalTypography>
          )}
        </GridSection>
        <GridSection>
          <HeadingsTypography variant='h3'>Information</HeadingsTypography>
          {league.description && (
            <Section gap='xxxs'>
              <EmphasisTypography variant='s' color={theme.colors.textLight}>Beskrivning</EmphasisTypography>
              <NormalTypography variant='m'>{league.description}</NormalTypography>
            </Section>
          )}
          <Section gap='xxxs'>
            <EmphasisTypography variant='s' color={theme.colors.textLight}>Inbjudningskod</EmphasisTypography>
            <NormalTypography variant='m'>{league.inviteCode}</NormalTypography>
          </Section>
          <Section gap='xxxs'>
            <EmphasisTypography variant='s' color={theme.colors.textLight}>Deadline för att gå med</EmphasisTypography>
            <NormalTypography variant='m'>{getFormattedDeadline()}</NormalTypography>
          </Section>
        </GridSection>
      </OverviewGrid>
    </>
  )
};

const OverviewGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto;
  gap: ${theme.spacing.s};

  @media ${devices.tablet} {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: repeat(2, auto);
  }
`;

const GridSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.s};
  background-color: ${theme.colors.white};
  padding: ${theme.spacing.m};
  border-radius: ${theme.borderRadius.m};
  max-height: 500px;
  overflow-y: auto;
  min-height: 240px;
`;

const MarginTopButton = styled.div`
  margin-top: auto;
`;

const LeagueStandings = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: repeat(5, auto);
  column-gap: ${theme.spacing.xs};
  row-gap: ${theme.spacing.xxxs};
  width: 100%;
  box-sizing: border-box;
`;

const UserLeaguePosition = styled.div<{isLoggedInUser: boolean}>`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: ${theme.spacing.xxs};
  align-items: center;
  padding: ${theme.spacing.xxs};
  border-radius: ${theme.borderRadius.xs};
  background-color: ${theme.colors.silverLighter};
  box-sizing: border-box;
  border: ${({ isLoggedInUser }) => isLoggedInUser ? `2px solid ${theme.colors.primary}` : 'none'};
`;

const LeagueStandingsHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: ${theme.spacing.xxs};
  align-items: center;
  padding: 0 ${theme.spacing.xxs} ${theme.spacing.xxs} ${theme.spacing.xxs};
  border-radius: ${theme.borderRadius.xs};
  background-color: ${theme.colors.white};
`;

const RightAlignedGridItem = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const TableSectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  padding-bottom: ${theme.spacing.xs};
  border-bottom: 1px solid ${theme.colors.silverLight};
`;

const RoundPointsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${theme.colors.primaryDark};
  border-radius: ${theme.borderRadius.s};
  padding: ${theme.spacing.xxs} ${theme.spacing.xs};
`;

export default LeagueOverview;