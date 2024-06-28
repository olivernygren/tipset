import { PredictionLeague, PredictionLeagueStanding } from '../../utils/League';
import styled from 'styled-components';
import { PlusCircle } from '@phosphor-icons/react';
import { theme, devices } from '../../theme';
import { getUserStandingPositionInLeague } from '../../utils/firebaseHelpers';
import Button from '../buttons/Button';
import { Section } from '../section/Section';
import { EmphasisTypography, NormalTypography, HeadingsTypography } from '../typography/Typography';
import { LeagueTabs } from '../../pages/admin/leagues/[leagueId]';

interface LeagueOverviewProps {
  league: PredictionLeague;
  isCreator: boolean;
  currentUserId: string;
  sortedLeagueStandings: Array<PredictionLeagueStanding>;
  onChangeTab: (tab: LeagueTabs) => void;
}

const LeagueOverview = ({ league, isCreator, currentUserId, sortedLeagueStandings, onChangeTab }: LeagueOverviewProps) => {

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
    <OverviewGrid>
      <GridSection>
        <HeadingsTypography variant='h3'>Kommande matcher</HeadingsTypography>
        {league.gameWeeks && league.gameWeeks.length > 0 ? 
          league.gameWeeks.map((gameWeek) => (
            <></>
          )
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
        {league.gameWeeks && league.gameWeeks.length > 0 ? 
          league.gameWeeks.map((gameWeek) => (
            <></>
          )
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
  )
};

const OverviewGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto;
  gap: ${theme.spacing.s};

  @media ${devices.tablet} {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
  }
`;

const GridSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.s};
  background-color: ${theme.colors.white};
  padding: ${theme.spacing.m};
  border-radius: ${theme.borderRadius.m};
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

export default LeagueOverview;