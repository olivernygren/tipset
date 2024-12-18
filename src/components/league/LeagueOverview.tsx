import styled from 'styled-components';
import {
  ArrowCircleRight, Coins, Fire, FireSimple, PencilSimple, PlusCircle, Target, TrendUp,
} from '@phosphor-icons/react';
import React, { useEffect, useState } from 'react';
import { LeagueGameWeek, PredictionLeague, PredictionLeagueStanding } from '../../utils/League';
import { theme, devices } from '../../theme';
import { getUserStandingPositionInLeague } from '../../utils/firebaseHelpers';
import Button from '../buttons/Button';
import { Section } from '../section/Section';
import { EmphasisTypography, NormalTypography, HeadingsTypography } from '../typography/Typography';
// eslint-disable-next-line import/no-cycle
import { LeagueTabs } from '../../pages/leagues/[leagueId]';
import { Divider } from '../Divider';
import { useUser } from '../../context/UserContext';
import IconButton from '../buttons/IconButton';
import PredictionsModal from './PredictionsModal';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';
import { Fixture } from '../../utils/Fixture';
import CompactFixtureResult from '../game/CompactFixtureResult';
import UpcomingFixturePreview from '../game/UpcomingFixturePreview';

interface LeagueOverviewProps {
  league: PredictionLeague;
  isCreator: boolean;
  currentUserId: string;
  sortedLeagueStandings: Array<PredictionLeagueStanding>;
  onChangeTab: (tab: LeagueTabs) => void;
}

const LeagueOverview = ({
  league, isCreator, currentUserId, sortedLeagueStandings, onChangeTab,
}: LeagueOverviewProps) => {
  const { user, hasAdminRights } = useUser();
  const isMobile = useResizeListener(DeviceSizes.MOBILE);
  const isMobileDevice = useResizeListener(DeviceSizes.MOBILE_DEVICE);

  const [currentGameWeek, setCurrentGameWeek] = useState<LeagueGameWeek | undefined>(undefined);
  const [previousGameWeek, setPreviousGameWeek] = useState<LeagueGameWeek | undefined>(undefined);
  const [upcomingGameWeek, setUpcomingGameWeek] = useState<LeagueGameWeek | undefined>(undefined);
  const [showCurrentFixturePredictionsModal, setShowCurrentFixturePredictionModal] = useState<string | null>(null);
  const [showPreviousFixturePredictionsModal, setShowPreviousFixturePredictionsModal] = useState<string | null>(null);

  useEffect(() => {
    if (league && league.gameWeeks && league.gameWeeks.length > 0) {
      const currentGameWeek = league.gameWeeks.find((gameWeek) => {
        const now = new Date();
        return new Date(gameWeek.startDate) < now && !gameWeek.hasBeenCorrected && !gameWeek.hasEnded;
      });

      if (currentGameWeek) {
        setCurrentGameWeek(currentGameWeek);
      }

      const previousGameWeek = league.gameWeeks
        .filter((gameWeek) => {
          const now = new Date();
          return new Date(gameWeek.startDate) < now && gameWeek.hasBeenCorrected === true && gameWeek.hasEnded === true;
        })
        .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0];

      if (previousGameWeek) {
        setPreviousGameWeek(previousGameWeek);
      }

      const upcomingGameWeek = league.gameWeeks
        .find((gameWeek) => {
          const now = new Date();
          return new Date(gameWeek.startDate) > now;
        });

      if (upcomingGameWeek) {
        setUpcomingGameWeek(upcomingGameWeek);
      }
    }
  }, []);

  const getFormattedDeadline = () => {
    if (!league) return '';

    const deadline = new Date(league.deadlineToJoin);
    const day = deadline.getDate();
    const month = deadline.toLocaleString('default', { month: 'long' });
    const year = deadline.getFullYear();
    const hours = String(deadline.getHours()).padStart(2, '0');
    const minutes = String(deadline.getMinutes()).padStart(2, '0');

    return `${day} ${month} ${year} (${hours}:${minutes})`;
  };

  const getNextGameWeekStartDate = () => {
    if (!upcomingGameWeek) return '';
    const startDate = new Date(upcomingGameWeek.startDate);
    const day = startDate.getDate();
    const month = startDate.toLocaleString('default', { month: 'short' }).replaceAll('.', '');
    const hours = `${startDate.getHours() < 10 ? `0${startDate.getHours()}` : startDate.getHours()}`;
    const minutes = `${startDate.getMinutes() < 10 ? `0${startDate.getMinutes()}` : startDate.getMinutes()}`;
    return `${day} ${month} ${hours}:${minutes}`;
  };

  const getFixturesDateFormatted = (date: string) => {
    const fixtureDate = new Date(date);
    const day = fixtureDate.getDate();
    const weekday = fixtureDate.toLocaleString('default', { weekday: 'long' }).replaceAll('.', '').charAt(0).toUpperCase() + fixtureDate.toLocaleString('default', { weekday: 'long' }).slice(1);
    const month = fixtureDate.toLocaleString('default', { month: 'long' }).replaceAll('.', '');
    return `${weekday} ${day} ${month}`;
  };

  const groupFixturesByDate = (fixtures: Array<Fixture>) => {
    const groupedFixtures = new Map();

    fixtures.forEach((fixture) => {
      const date = new Date(fixture.kickOffTime).toLocaleDateString();
      if (!groupedFixtures.has(date)) {
        groupedFixtures.set(date, []);
      }
      groupedFixtures.get(date).push(fixture);
    });

    return groupedFixtures;
  };

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
    <>
      <Wrapper>
        <GridSection>
          {league.hasEnded ? (
            <>
              <HeadingsTypography variant="h3">Kommande matcher</HeadingsTypography>
              <NormalTypography variant="m" color={theme.colors.textLight}>Ligan har avslutats</NormalTypography>
            </>
          ) : (
            <>
              <HeadingsTypography variant="h3">
                {currentGameWeek && !currentGameWeek.games.fixtures.some((fixture) => fixture.kickOffTime && new Date(fixture.kickOffTime) > new Date()) ? 'Aktuella matcher' : 'Kommande matcher'}
              </HeadingsTypography>
              {currentGameWeek && (
                <Section gap="xxxs" height="100%">
                  <FixturesContainer>
                    {Array.from(groupFixturesByDate(currentGameWeek.games.fixtures).entries()).map(([date, fixtures]) => (
                      <UpcomingFixturesDateContainer>
                        <Section
                          padding={theme.spacing.xs}
                          backgroundColor={theme.colors.silverLight}
                          borderRadius={`${theme.borderRadius.m} ${theme.borderRadius.m} 0 0`}
                          alignItems="center"
                        >
                          <EmphasisTypography variant="m" color={theme.colors.textDefault}>{getFixturesDateFormatted(date)}</EmphasisTypography>
                        </Section>
                        {fixtures
                          .sort((a: Fixture, b: Fixture) => new Date(a.kickOffTime).getTime() - new Date(b.kickOffTime).getTime())
                          .map((fixture: Fixture, index: number, array: Array<any>) => (
                            <>
                              <UpcomingFixturePreview
                                fixture={fixture}
                                onShowPredictionsClick={() => setShowCurrentFixturePredictionModal(fixture.id)}
                                useShortNames={isMobile}
                              />
                              {index !== array.length - 1 && <Divider color={theme.colors.silverLight} />}
                            </>
                          ))}
                      </UpcomingFixturesDateContainer>
                    ))}
                  </FixturesContainer>
                  {currentGameWeek.games.fixtures.length > 0 && currentGameWeek.games.fixtures.some((fixture) => fixture.kickOffTime && new Date(fixture.kickOffTime) > new Date()) && (
                    <MarginTopButton>
                      <Button onClick={() => onChangeTab(LeagueTabs.MATCHES)} endIcon={<ArrowCircleRight weight="fill" size={24} color={theme.colors.white} />}>
                        Tippa matcher
                      </Button>
                    </MarginTopButton>
                  )}
                </Section>
              )}
              {!currentGameWeek && upcomingGameWeek && (
                <NormalTypography variant="m" color={theme.colors.textLight}>{`Nästa omgång kan tippas fr.o.m ${getNextGameWeekStartDate()}`}</NormalTypography>
              )}
              {!currentGameWeek && !upcomingGameWeek && (
                <>
                  <NormalTypography variant="m" color={theme.colors.textLight}>Ingen omgång är aktiv just nu</NormalTypography>
                  {isCreator && (
                    <MarginTopButton>
                      <Button onClick={() => onChangeTab(LeagueTabs.MATCHES)} icon={<PlusCircle size={24} color={theme.colors.white} />}>
                        Skapa omgång
                      </Button>
                    </MarginTopButton>
                  )}
                </>
              )}
            </>
          )}
        </GridSection>
        <GridRow>
          <GridSection>
            <TableSectionHeader>
              <HeadingsTypography variant="h3">Tabell</HeadingsTypography>
              {league.standings && league.standings.length > 0 && (
              <>
                <EmphasisTypography variant="m" color={theme.colors.textLight}>
                  {`Din placering: ${getUserStandingPositionInLeague(currentUserId, sortedLeagueStandings)}`}
                </EmphasisTypography>
                {/* Show separate user placing somewhere if they are outside the top 5 */}
                {/* {getUserLeaguePosition(league.standings.find((place) => place.userId === currentUserId))} */}
              </>
              )}
            </TableSectionHeader>
            {league.standings && league.standings.length > 0 ? (
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
            ) : (
              <NormalTypography variant="m" color={theme.colors.silverDarker}>Ingen tabell finns</NormalTypography>
            )}
          </GridSection>
          <GridSection>
            <HeadingsTypography variant="h3">Förra omgången</HeadingsTypography>
            {previousGameWeek ? (
              <PreviousRoundCard>
                <Section
                  justifyContent="space-between"
                  alignItems="flex-start"
                  flexDirection="row"
                  backgroundColor={theme.colors.silverLighter}
                  borderRadius={`${theme.borderRadius.l} ${theme.borderRadius.l} 0 0`}
                >
                  <Section padding={theme.spacing.s} fitContent>
                    <EmphasisTypography variant="m" color={theme.colors.textDefault}>
                      {`Omgång ${previousGameWeek.round}`}
                    </EmphasisTypography>
                  </Section>
                  <RoundPointsContainer>
                    <EmphasisTypography variant="m" color={theme.colors.textDefault}>
                      {previousGameWeek.games.predictions.filter((p) => p.userId === user?.documentId).reduce((acc, curr) => acc + (curr.points?.total ?? 0), 0)}
                      {' '}
                      poäng
                    </EmphasisTypography>
                  </RoundPointsContainer>
                </Section>
                {/* <Divider color={theme.colors.silverLight} /> */}
                <Section
                  gap="xxs"
                  padding={`${theme.spacing.xs}`}
                  backgroundColor={theme.colors.white}
                >
                  {previousGameWeek.games.fixtures
                    .sort((a, b) => new Date(a.kickOffTime).getTime() - new Date(b.kickOffTime).getTime())
                    .map((fixture) => (
                      <CompactFixtureResult
                        fixture={fixture}
                        predictions={previousGameWeek.games.predictions.filter((prediction) => prediction.fixtureId === fixture.id)}
                        onModalOpen={() => setShowPreviousFixturePredictionsModal(fixture.id)}
                      />
                    ))}
                </Section>
              </PreviousRoundCard>
            ) : (
              <NormalTypography variant="m" color={theme.colors.textLight}>Ingen tidigare omgång finns</NormalTypography>
            )}
          </GridSection>
        </GridRow>
        <GridSection>
          <Section justifyContent="space-between" alignItems="center" flexDirection="row">
            <HeadingsTypography variant="h3">Information</HeadingsTypography>
            {(isCreator || hasAdminRights) && !league.hasEnded && (
              <IconButton
                onClick={() => onChangeTab(LeagueTabs.EDIT)}
                icon={<PencilSimple size={24} />}
                colors={{ normal: theme.colors.primary, hover: theme.colors.primaryDark, active: theme.colors.primaryDarker }}
              />
            )}
          </Section>
          {league.description && (
            <Section gap="xxxs">
              <EmphasisTypography variant="s" color={theme.colors.textLight}>Beskrivning</EmphasisTypography>
              <NormalTypography variant="m">{league.description}</NormalTypography>
            </Section>
          )}
          <Section gap="xxxs">
            <EmphasisTypography variant="s" color={theme.colors.textLight}>Inbjudningskod</EmphasisTypography>
            <NormalTypography variant="m">{league.inviteCode}</NormalTypography>
          </Section>
          <Section gap="xxxs">
            <EmphasisTypography variant="s" color={theme.colors.textLight}>Deadline för att gå med</EmphasisTypography>
            <NormalTypography variant="m">{getFormattedDeadline()}</NormalTypography>
          </Section>
        </GridSection>
      </Wrapper>
      {showCurrentFixturePredictionsModal && (
        <PredictionsModal
          predictions={currentGameWeek?.games.predictions.filter((prediction) => prediction.fixtureId === showCurrentFixturePredictionsModal) ?? []}
          onClose={() => setShowCurrentFixturePredictionModal(null)}
          fixture={currentGameWeek?.games.fixtures.find((fixture) => fixture.id === showCurrentFixturePredictionsModal) || previousGameWeek?.games.fixtures.find((fixture) => fixture.id === showCurrentFixturePredictionsModal)}
        />
      )}
      {showPreviousFixturePredictionsModal && (
        <PredictionsModal
          predictions={previousGameWeek?.games.predictions.filter((prediction) => prediction.fixtureId === showPreviousFixturePredictionsModal) ?? []}
          onClose={() => setShowPreviousFixturePredictionsModal(null)}
          fixture={previousGameWeek?.games.fixtures.find((fixture) => fixture.id === showPreviousFixturePredictionsModal) || previousGameWeek?.games.fixtures.find((fixture) => fixture.id === showPreviousFixturePredictionsModal)}
        />
      )}
    </>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.m};
`;

const GridRow = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto;
  column-gap: ${theme.spacing.m};
  row-gap: ${theme.spacing.m};
  
  @media ${devices.laptop} {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: repeat(2, auto);
    column-gap: ${theme.spacing.m};
    row-gap: 0;
  }
`;

const GridSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.s};
  background-color: ${theme.colors.white};
  padding: ${theme.spacing.m} ${theme.spacing.s};
  border-radius: 0;
  max-height: 500px;
  overflow-y: auto;
  min-height: 240px;
  
  @media ${devices.tablet} {
    border-radius: ${theme.borderRadius.l};
    padding: ${theme.spacing.m};
  }
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
  gap: ${theme.spacing.xxs};
  justify-content: center;
  background-color: ${theme.colors.gold};
  border-radius: 0 ${theme.borderRadius.m} 0 ${theme.borderRadius.xl};
  padding: ${theme.spacing.xxs} ${theme.spacing.xs} ${theme.spacing.xxs} ${theme.spacing.s};
`;

const FixturesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.s};
  width: 100%;
  box-sizing: border-box;
  margin-bottom: ${theme.spacing.s};
`;

const PreviousRoundCard = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${theme.colors.silverLighter};
  border-radius: ${theme.borderRadius.l};
  width: 100%;
  box-sizing: border-box;
  border: 2px solid ${theme.colors.gold};
  overflow: hidden;
`;

const UpcomingFixturesDateContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
  box-sizing: border-box;
  background-color: ${theme.colors.silverLighter};
  border-radius: ${theme.borderRadius.l};
  overflow: hidden;
  border: 1px solid ${theme.colors.silverLight};
`;

export default LeagueOverview;
