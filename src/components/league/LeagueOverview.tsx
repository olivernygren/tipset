import styled, { keyframes } from 'styled-components';
import {
  ArrowCircleRight, CaretCircleLeft, CaretCircleRight, PencilSimple, PlusCircle,
} from '@phosphor-icons/react';
import React, { useEffect, useState } from 'react';
import {
  LeagueGameWeek, LeagueTabs, PredictionLeague, PredictionLeagueStanding,
} from '../../utils/League';
import { theme, devices } from '../../theme';
import Button from '../buttons/Button';
import { Section } from '../section/Section';
import { EmphasisTypography, NormalTypography, HeadingsTypography } from '../typography/Typography';
import { Divider } from '../Divider';
import { useUser } from '../../context/UserContext';
import IconButton from '../buttons/IconButton';
import PredictionsModal from './PredictionsModal';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';
import { Fixture } from '../../utils/Fixture';
import CompactFixtureResult from '../game/CompactFixtureResult';
import UpcomingFixturePreview from '../game/UpcomingFixturePreview';
import LeagueStandingsTable from '../standings/LeagueStandingsTable';
import { groupFixturesByDate } from '../../utils/helpers';

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

  const [currentGameWeek, setCurrentGameWeek] = useState<LeagueGameWeek | undefined>(undefined);
  const [previousGameWeek, setPreviousGameWeek] = useState<LeagueGameWeek | undefined>(undefined);
  const [upcomingGameWeeks, setUpcomingGameWeeks] = useState<Array<LeagueGameWeek>>([]);
  const [showCurrentFixturePredictionsModal, setShowCurrentFixturePredictionModal] = useState<string | null>(null);
  const [showPreviousFixturePredictionsModal, setShowPreviousFixturePredictionsModal] = useState<string | null>(null);
  const [displayedFixtures, setDisplayedFixtures] = useState<Array<Fixture>>([]);
  const [selectedRound, setSelectedRound] = useState<number | undefined>();

  useEffect(() => {
    if (league && league.gameWeeks && league.gameWeeks.length > 0) {
      const currentGameWeek = league.gameWeeks.find((gameWeek) => {
        const now = new Date();
        return new Date(gameWeek.startDate) < now && !gameWeek.hasBeenCorrected && !gameWeek.hasEnded;
      });

      if (currentGameWeek) {
        setCurrentGameWeek(currentGameWeek);
        setSelectedRound(currentGameWeek.round);
        setDisplayedFixtures(currentGameWeek.games.fixtures);
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

      const upcomingGameWeeks = league.gameWeeks
        .filter((gameWeek) => {
          const now = new Date();
          return new Date(gameWeek.startDate) > now;
        });

      if (upcomingGameWeeks) {
        setUpcomingGameWeeks(upcomingGameWeeks);
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
    if (!upcomingGameWeeks.length) return '';
    const startDate = new Date(upcomingGameWeeks[0].startDate);
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

  const handleShowNextGameWeek = (round: number) => {
    if (selectedRound) {
      setSelectedRound(round);
    }
    if (upcomingGameWeeks.length > 0) {
      const nextGameWeek = upcomingGameWeeks.find((gameWeek) => gameWeek.round === round);
      setDisplayedFixtures(nextGameWeek?.games.fixtures ?? []);
    }
  };

  const handleShowPreviousGameWeek = (round: number) => {
    if (selectedRound) {
      setSelectedRound(round);
    }
    if (round === currentGameWeek?.round) {
      setDisplayedFixtures(currentGameWeek?.games.fixtures ?? []);
    } else {
      const previousGameWeek = league.gameWeeks?.find((gameWeek) => gameWeek.round === round);
      setDisplayedFixtures(previousGameWeek?.games.fixtures ?? []);
    }
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
              <CurrentGameWeekHeader>
                <HeadingsTypography variant="h3">
                  {selectedRound === currentGameWeek?.round ? 'Aktuell omgång' : 'Kommande omgång'}
                </HeadingsTypography>
                {upcomingGameWeeks.length > 0 && displayedFixtures && displayedFixtures.length > 0 && (
                  <CurrentRoundSwitchContainer>
                    <IconButton
                      icon={<CaretCircleLeft size={28} weight="fill" />}
                      onClick={() => handleShowPreviousGameWeek((selectedRound ?? 1) - 1)}
                      colors={{
                        normal: theme.colors.primary, hover: theme.colors.primaryDark, active: theme.colors.primaryDarker, disabled: theme.colors.silverLight,
                      }}
                      disabled={selectedRound === currentGameWeek?.round}
                    />
                    <EmphasisTypography variant="m" color={theme.colors.textDefault}>
                      {`Omgång ${selectedRound}`}
                    </EmphasisTypography>
                    <IconButton
                      icon={<CaretCircleRight size={28} weight="fill" />}
                      onClick={() => handleShowNextGameWeek((selectedRound ?? 1) + 1)}
                      colors={{
                        normal: theme.colors.primary, hover: theme.colors.primaryDark, active: theme.colors.primaryDarker, disabled: theme.colors.silverLight,
                      }}
                      disabled={selectedRound === upcomingGameWeeks[upcomingGameWeeks.length - 1]?.round}
                    />
                  </CurrentRoundSwitchContainer>
                )}
              </CurrentGameWeekHeader>
              {currentGameWeek && (
                <Section gap="xxxs" height="100%">
                  <FixturesContainer>
                    {Array.from(groupFixturesByDate(displayedFixtures).entries()).map(([date, fixtures]) => (
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
                                onShowPredictionsClick={() => {
                                  if (fixture.kickOffTime && new Date(fixture.kickOffTime) < new Date()) {
                                    setShowCurrentFixturePredictionModal(fixture.id);
                                  }
                                }}
                                useShortNames={isMobile}
                              />
                              {index !== array.length - 1 && <Divider color={theme.colors.silverLight} />}
                            </>
                          ))}
                      </UpcomingFixturesDateContainer>
                    ))}
                  </FixturesContainer>
                  {currentGameWeek.games.fixtures.length > 0 && currentGameWeek.games.fixtures.some((fixture) => fixture.kickOffTime && new Date(fixture.kickOffTime) > new Date()) && selectedRound === currentGameWeek.round && (
                    <MarginTopButton>
                      <Button onClick={() => onChangeTab(LeagueTabs.MATCHES)} endIcon={<ArrowCircleRight weight="fill" size={24} color={theme.colors.white} />}>
                        Tippa matcher
                      </Button>
                    </MarginTopButton>
                  )}
                </Section>
              )}
              {!currentGameWeek && upcomingGameWeeks && (
                <NormalTypography variant="m" color={theme.colors.textLight}>{`Nästa omgång kan tippas tidigast ${getNextGameWeekStartDate()}`}</NormalTypography>
              )}
              {!currentGameWeek && !upcomingGameWeeks && (
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
              {/* TODO: EDIT STANDINGS MANUALLY */}
              {/* {(isCreator || hasAdminRights) && (
                <IconButton
                  icon={<PencilSimple size={24} />}
                  onClick={() => {}}
                  colors={{ normal: theme.colors.primary, hover: theme.colors.primaryDark, active: theme.colors.primaryDarker }}
                />
              )} */}
            </TableSectionHeader>
            {league.standings && league.standings.length > 0 ? (
              <LeagueStandingsTable
                sortedLeagueStandings={sortedLeagueStandings}
                currentUserId={currentUserId}
                league={league}
                currentGameWeek={currentGameWeek}
              />
            ) : (
              <NormalTypography variant="m" color={theme.colors.silverDarker}>Ingen tabell finns</NormalTypography>
            )}
          </GridSection>
          <GridSection>
            <Section flexDirection="row" alignItems="center" justifyContent="space-between">
              <HeadingsTypography variant="h3">Förra omgången</HeadingsTypography>
              {/* {(isCreator || hasAdminRights) && previousGameWeek !== undefined && (
                <IconButton
                  icon={<PencilSimple size={24} />}
                  onClick={() => setShowEditLastRoundModal(true)}
                  colors={{ normal: theme.colors.primary, hover: theme.colors.primaryDark, active: theme.colors.primaryDarker }}
                />
              )} */}
            </Section>
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
  max-height: 800px;
  overflow-y: auto;
  min-height: 240px;
  
  @media ${devices.tablet} {
    border-radius: ${theme.borderRadius.l};
    padding: ${theme.spacing.m};
  }
`;

const CurrentGameWeekHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  
  @media ${devices.tablet} {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const CurrentRoundSwitchContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.xxxs};
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  justify-content: space-between;
  border: 1px solid ${theme.colors.silverLight};
  padding: ${theme.spacing.xxxs};
  border-radius: ${theme.borderRadius.m};
  box-shadow: 0px 2px 0px 0px ${theme.colors.silverLighter};
  
  @media ${devices.tablet} {
    border: none;
    box-shadow: none;
    padding: 0;
    width: fit-content;
  }
`;

const MarginTopButton = styled.div`
  margin-top: auto;
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

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
  animation: ${fadeIn} 0.4s ease;
`;

export default LeagueOverview;
