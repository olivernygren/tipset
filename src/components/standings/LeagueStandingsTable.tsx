import React from 'react';
import { TrendUp, FireSimple, Target } from '@phosphor-icons/react';
import styled from 'styled-components';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';
import { theme, devices } from '../../theme';
import { LeagueGameWeek, PredictionLeague, PredictionLeagueStanding } from '../../utils/League';
import { Section } from '../section/Section';
import { NormalTypography, EmphasisTypography } from '../typography/Typography';

interface LeagueStandingsTableProps {
  sortedLeagueStandings: Array<PredictionLeagueStanding>;
  currentUserId: string;
  league: PredictionLeague;
  currentGameWeek?: LeagueGameWeek;
}

const LeagueStandingsTable = ({
  sortedLeagueStandings, currentUserId, league, currentGameWeek,
}: LeagueStandingsTableProps) => {
  const isMobileDevice = useResizeListener(DeviceSizes.MOBILE_DEVICE);
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const getUserLatestGameWeekTotalPoints = (userId: string) => {
    if (!league || !league.gameWeeks) return 0;

    const previousGameWeek = currentGameWeek ? league.gameWeeks[league.gameWeeks.length - 2] : league.gameWeeks[league.gameWeeks.length - 1];
    const currentGameWeekHasStarted = currentGameWeek && currentGameWeek?.games.predictions.some((g) => g.points !== undefined);
    const pointsHaveBeenAwarded = Boolean(currentGameWeekHasStarted || (previousGameWeek && previousGameWeek?.games.predictions.some((g) => g.points !== undefined)));

    if (!currentGameWeek && (!league.gameWeeks || !league.gameWeeks.length)) return 0;
    if (!pointsHaveBeenAwarded) return 0;

    const gameWeek = currentGameWeekHasStarted ? currentGameWeek : previousGameWeek;
    const userPredictions = gameWeek?.games.predictions.filter((prediction) => prediction.userId === userId);

    return userPredictions?.reduce((acc, curr) => acc + (curr.points?.total ?? 0), 0) ?? '?';
  };

  const getUserLeagueStandingsItem = (position: number, place?: PredictionLeagueStanding) => {
    if (!place) return null;
    const isLoggedInUser = place.userId === currentUserId;

    return (
      <UserLeaguePosition isLoggedInUser={isLoggedInUser}>
        <Section flexDirection="row" alignItems="center" gap="xs" fitContent>
          <NormalTypography variant="m" color={theme.colors.primaryDark}>
            {position}
          </NormalTypography>
          <NormalTypography variant="m" color={theme.colors.textDefault}>
            {`${place.username} ${place.userId === currentUserId ? '(Du)' : ''}`}
          </NormalTypography>
        </Section>
        {!isMobileDevice && (
        <CenteredGridItem>
          <NormalTypography variant="m" color={theme.colors.textLight}>
            {league.gameWeeks && league.gameWeeks.length > 0 ? `${getUserLatestGameWeekTotalPoints(place.userId) > 0 ? '+' : '±'}${getUserLatestGameWeekTotalPoints(place.userId)}` : '-'}
          </NormalTypography>
        </CenteredGridItem>
        )}
        <CenteredGridItem>
          <NormalTypography variant="m" color={theme.colors.textLight}>
            {place.oddsBonusPoints ?? 0}
          </NormalTypography>
        </CenteredGridItem>
        <CenteredGridItem>
          <NormalTypography variant="m" color={theme.colors.textDefault}>
            {place.correctResults}
          </NormalTypography>
        </CenteredGridItem>
        <CenteredGridItem>
          <EmphasisTypography variant="m" color={theme.colors.primary}>
            {place.points}
          </EmphasisTypography>
        </CenteredGridItem>
      </UserLeaguePosition>
    );
  };

  return (
    <LeagueStandings>
      <LeagueStandingsHeader>
        <Section flexDirection="row" alignItems="center" gap="xs" fitContent>
          <EmphasisTypography variant="s" color={theme.colors.textLight}>#</EmphasisTypography>
          <EmphasisTypography variant="s" color={theme.colors.textLight}>Namn</EmphasisTypography>
        </Section>
        {!isMobileDevice && (
          <CenteredGridItem>
            <TrendUp size={20} color={theme.colors.textLight} />
          </CenteredGridItem>
        )}
        <CenteredGridItem>
          <FireSimple size={20} color={theme.colors.textLight} />
        </CenteredGridItem>
        <CenteredGridItem>
          <Target size={20} color={theme.colors.textLight} />
        </CenteredGridItem>
        <CenteredGridItem>
          <EmphasisTypography variant="s" color={theme.colors.textLight} align="center">{isMobile ? 'P' : 'Poäng'}</EmphasisTypography>
        </CenteredGridItem>
      </LeagueStandingsHeader>
      {sortedLeagueStandings.map((place, index) => getUserLeagueStandingsItem(index + 1, place))}
    </LeagueStandings>
  );
};

const LeagueStandings = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: repeat(5, auto);
  column-gap: ${theme.spacing.xs};
  row-gap: ${theme.spacing.xxxs};
  width: 100%;
  box-sizing: border-box;
`;

const LeagueStandingsHeader = styled.div`
  display: grid;
  grid-template-columns: 6fr 1fr 1fr 40px;
  gap: ${theme.spacing.xxs};
  align-items: center;
  padding: 0 ${theme.spacing.xxs} ${theme.spacing.xxs} ${theme.spacing.xxs};
  border-radius: ${theme.borderRadius.xs};
  background-color: ${theme.colors.white};

  @media ${devices.mobileL} {
    grid-template-columns: 5fr 1fr 1fr 1fr 40px;
  }

  @media ${devices.tablet} {
    grid-template-columns: 4fr 1fr 1fr 1fr 50px;
  }
`;

const CenteredGridItem = styled.div`
  display: flex;
  justify-content: center;
`;

const UserLeaguePosition = styled.div<{ isLoggedInUser: boolean }>`
  display: grid;
  grid-template-columns: 6fr 1fr 1fr 40px;
  gap: ${theme.spacing.xxs};
  align-items: center;
  padding: ${theme.spacing.xxs};
  border-radius: ${theme.borderRadius.s};
  background-color: ${({ isLoggedInUser }) => (isLoggedInUser ? theme.colors.primaryFade : theme.colors.silverLighter)};
  box-sizing: border-box;
  grid-auto-flow: column;

  @media ${devices.mobileL} {
    grid-template-columns: 5fr 1fr 1fr 1fr 40px;
  }
 
  @media ${devices.tablet} {
    grid-template-columns: 4fr 1fr 1fr 1fr 50px;
  }
`;

export default LeagueStandingsTable;
