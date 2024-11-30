import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { PencilSimple } from '@phosphor-icons/react';
import { Fixture, FixtureOutcomeEnum, TeamType } from '../../utils/Fixture';
import { LeagueGameWeek, PredictionLeague } from '../../utils/League';
import Modal from '../modal/Modal';
import { theme, devices } from '../../theme';
import { EmphasisTypography, HeadingsTypography, NormalTypography } from '../typography/Typography';
import {
  getTeamByName, getTeamPrimaryColorByName, Team, TournamentsEnum,
} from '../../utils/Team';
import { AvatarSize } from '../avatar/Avatar';
import ClubAvatar from '../avatar/ClubAvatar';
import NationAvatar from '../avatar/NationAvatar';
import FormIcon, { getOutcomeBackgroundColor } from '../form/FormIcon';
import MockedStandingsRow from '../stats/MockedStandingsRow';
import { getIsBottomOfLeague } from '../../utils/helpers';
import Button from '../buttons/Button';
import EditFixtureStatsModalContent from './EditFixtureStatsModalContent';
import { Divider } from '../Divider';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';

interface NewFixtureStatsModalProps {
  fixture: Fixture;
  onClose: () => void;
  isLeagueCreator?: boolean;
  league: PredictionLeague;
  ongoingGameWeek: LeagueGameWeek | undefined;
  refetchLeague: () => void;
}

const NewFixtureStatsModal = ({
  fixture, onClose, isLeagueCreator, league, ongoingGameWeek, refetchLeague,
}: NewFixtureStatsModalProps) => {
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const [showEditView, setShowEditView] = useState<boolean>(false);
  const [homeTeamInsights] = useState<Array<string>>(fixture.previewStats?.homeTeam?.insights ?? []);
  const [awayTeamInsights] = useState<Array<string>>(fixture.previewStats?.awayTeam?.insights ?? []);

  const getTeamAvatar = (isAwayTeam: boolean, customTeam?: Team, customSize?: AvatarSize) => {
    const team = customTeam || (isAwayTeam ? fixture.awayTeam : fixture.homeTeam);

    if (fixture.teamType === TeamType.CLUBS) {
      return (
        <ClubAvatar
          clubName={team.name}
          logoUrl={team.logoUrl}
          size={customSize ?? AvatarSize.M}
        />
      );
    }

    return (
      <NationAvatar
        nationName={team.name}
        flagUrl={team.logoUrl}
        size={customSize ?? AvatarSize.XXL}
      />
    );
  };

  const getLastUpdatedDate = () => {
    const lastUpdated = fixture.previewStats?.lastUpdated;
    if (!lastUpdated) {
      return 'Ingen statistik tillgänglig ännu';
    }

    const date = new Date(lastUpdated);
    const day = date.getDate();
    const month = date.toLocaleDateString('sv-SE', { month: 'long' }).replace('.', '');
    const formattedDate = `${day} ${month}`;

    return `Senast uppdaterad: ${formattedDate}`;
  };

  const getForm = (isHomeTeam: boolean) => {
    const previewStats = isHomeTeam ? fixture.previewStats?.homeTeam : fixture.previewStats?.awayTeam;
    return previewStats?.form.map((outcome, index) => (
      <FormIconContainer key={`${index}-${outcome}`}>
        <FormIcon
          outcome={outcome as FixtureOutcomeEnum}
          showBorder={index === 4}
        />
      </FormIconContainer>
    ));
  };

  const getStandings = (isHomeTeam: boolean) => {
    if (!fixture.previewStats) return null;

    const team = isHomeTeam ? fixture.homeTeam : fixture.awayTeam;
    const previewStats = isHomeTeam ? fixture.previewStats.homeTeam : fixture.previewStats.awayTeam;

    const isTopOfTable = previewStats.standingsPosition === '1';
    const isBottomOfTable = getIsBottomOfLeague(parseInt(previewStats.standingsPosition ?? ''), fixture.tournament as TournamentsEnum);

    return (
      <>
        {!isTopOfTable && (
          <MockedStandingsRow type="top" position={parseInt(previewStats.standingsPosition ?? '') - (isBottomOfTable ? 2 : 1)} backgroundColor="silver" />
        )}
        {isBottomOfTable && (
          <MockedStandingsRow type="full" position={parseInt(previewStats.standingsPosition ?? '') - 1} backgroundColor="silver" />
        )}
        <StandingsRow>
          <StandingsPosition>
            <EmphasisTypography variant="s" color={theme.colors.primaryDark}>{previewStats.standingsPosition}</EmphasisTypography>
          </StandingsPosition>
          <StandingsRowTeam>
            {getTeamAvatar(false, team, AvatarSize.XS)}
            <NormalTypography variant="s">{team.name}</NormalTypography>
          </StandingsRowTeam>
          <EmphasisTypography variant="s" color={theme.colors.silverDark}>{`${previewStats.standingsPoints} p`}</EmphasisTypography>
        </StandingsRow>
        {isTopOfTable && (
          <MockedStandingsRow type="full" position={parseInt(previewStats.standingsPosition ?? '') + 1} backgroundColor="silver" />
        )}
        {!isBottomOfTable && (
          <MockedStandingsRow type="bottom" position={parseInt(previewStats.standingsPosition ?? '') + (isTopOfTable ? 2 : 1)} backgroundColor="silver" />
        )}
      </>
    );
  };

  const getLastFixtureResult = (isHomeTeam: boolean) => {
    let lastFixture;

    if (isHomeTeam) {
      lastFixture = fixture.previewStats?.homeTeam.lastFixture;
    } else {
      lastFixture = fixture.previewStats?.awayTeam.lastFixture;
    }

    if (!lastFixture) {
      return null;
    }

    return (
      <LastGameContainer>
        <EmphasisTypography variant="m">Senaste matchen</EmphasisTypography>
        <LastGameOpponent>
          <NormalTypography variant="s">vs</NormalTypography>
          {getTeamAvatar(!isHomeTeam, getTeamByName(lastFixture?.opponent ?? ''))}
        </LastGameOpponent>
        <LastGameResult outcome={lastFixture?.outcome ?? FixtureOutcomeEnum.DRAW}>
          <EmphasisTypography variant="s" color={theme.colors.white}>
            {`${lastFixture?.result?.homeTeamGoals || 0} - ${lastFixture?.result?.awayTeamGoals || 0}`}
          </EmphasisTypography>
        </LastGameResult>
      </LastGameContainer>
    );
  };

  const getTeamInsights = (isHomeTeam: boolean) => {
    const team = isHomeTeam ? fixture.homeTeam : fixture.awayTeam;
    const teamInsights = isHomeTeam ? homeTeamInsights : awayTeamInsights;

    if (!teamInsights || teamInsights.length === 0) return null;

    return (
      <InsightsList>
        {teamInsights.map((insight, index) => (
          <InsightCard key={index}>
            <InsightCardColorStripe color={getTeamPrimaryColorByName(team.name)} />
            <NormalTypography variant="s">{insight}</NormalTypography>
          </InsightCard>
        ))}
      </InsightsList>
    );
  };

  const getTeamStatsCard = (teamParam: 'home' | 'away') => {
    const team = teamParam === 'home' ? fixture.homeTeam : fixture.awayTeam;
    const teamPreviewStats = teamParam === 'home' ? fixture.previewStats?.homeTeam : fixture.previewStats?.awayTeam;

    const fixtureHasStandings = Boolean(fixture.previewStats && teamPreviewStats?.standingsPosition && teamPreviewStats?.standingsPosition && teamPreviewStats?.standingsPoints && teamPreviewStats?.standingsPoints);
    const fixtureHasForm = fixture.previewStats && teamPreviewStats?.form && teamPreviewStats?.form;
    const fixtureHasLastGame = fixture.previewStats && (teamPreviewStats?.lastFixture && teamPreviewStats?.lastFixture);
    const fixtureHasInsights = fixture.previewStats && (teamPreviewStats?.insights || teamPreviewStats?.insights);

    return (
      <Card>
        <CardHeader>
          <HeadingsTypography variant="h4" color={theme.colors.textDefault}>{team.name}</HeadingsTypography>
          <TeamLogoWrapper>
            <TeamLogo src={team.logoUrl} alt={team.name} />
          </TeamLogoWrapper>
        </CardHeader>
        <CardContent>
          <Statistic>
            <EmphasisTypography variant="m">Form</EmphasisTypography>
            <FormIcons>
              {fixtureHasForm ? getForm(teamParam === 'home') : (
                Array.from({ length: 5 }, (_, index) => (
                  <FormIconContainer key={index}>
                    <FormIcon outcome={FixtureOutcomeEnum.NONE} />
                  </FormIconContainer>
                ))
              )}
            </FormIcons>
          </Statistic>
          {fixtureHasStandings && (
            <>
              <Divider />
              <Statistic>
                <StatisticHeading>
                  <EmphasisTypography variant="m">Tabellplacering</EmphasisTypography>
                  <NormalTypography variant="s" color={theme.colors.silverDark}>{fixture.tournament}</NormalTypography>
                </StatisticHeading>
                {getStandings(teamParam === 'home')}
              </Statistic>
            </>
          )}
          {fixtureHasLastGame && (
            <>
              <Divider />
              <Statistic>
                {getLastFixtureResult(teamParam === 'home')}
              </Statistic>
            </>
          )}
          {fixtureHasInsights && (
            <>
              <Divider />
              <Statistic>
                <EmphasisTypography variant="m">Insikter</EmphasisTypography>
                {getTeamInsights(teamParam === 'home')}
              </Statistic>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Modal
      onClose={onClose}
      size="l"
      title={showEditView ? 'Redigera statistik' : 'Statistik'}
      disclaimer={!isMobile ? getLastUpdatedDate() : undefined}
      mobileFullScreen
      headerDivider
      noPadding
    >
      {showEditView && isLeagueCreator ? (
        <EditFixtureStatsModalContent
          fixture={fixture}
          onCloseEditView={() => setShowEditView(false)}
          onCloseModal={onClose}
          league={league}
          ongoingGameWeek={ongoingGameWeek}
          refetchLeague={refetchLeague}
        />
      ) : (
        <ModalContent>
          <CardsContainer>
            {getTeamStatsCard('home')}
            {getTeamStatsCard('away')}
          </CardsContainer>
          {isLeagueCreator && (
            <Button
              variant="secondary"
              icon={<PencilSimple size={20} weight="bold" color={theme.colors.primary} />}
              onClick={() => setShowEditView(true)}
            >
              Redigera
            </Button>
          )}
        </ModalContent>
      )}
    </Modal>
  );
};

const ModalContent = styled.div`
  display: flex;
  gap: ${theme.spacing.m};
  flex-direction: column;
  padding: ${theme.spacing.xl} ${theme.spacing.m} ${theme.spacing.m} ${theme.spacing.m};

  @media ${devices.tablet} {
    padding: ${theme.spacing.xl} ${theme.spacing.l} ${theme.spacing.l} ${theme.spacing.l};
  }
`;

const CardsContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.m};
  width: 100%;
  flex-direction: column;
  
  @media ${devices.tablet} {
    flex-direction: row;
  }
`;

const Card = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  background-color: ${theme.colors.silverBleach};
  border-radius: ${theme.borderRadius.l};
  border: 1px solid ${theme.colors.silverLighter};
  box-shadow: 0px 3px 0px 0px rgba(0,0,0,0.07);
  position: relative;
  z-index: 1;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${theme.spacing.s};
  width: 100%;
  box-sizing: border-box;
  background-color: ${theme.colors.silverLighter};
  border-radius: ${theme.borderRadius.m} ${theme.borderRadius.m} 0 0;
  padding: ${theme.spacing.s};
`;

const StatisticHeading = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xxxs};
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.s};
  padding: ${theme.spacing.s} ${theme.spacing.s};
`;

const TeamLogoWrapper = styled.div`
  background-color: transparent;
  
  @media ${devices.tablet} {
    position: absolute;
    right: ${theme.spacing.s};
    z-index: 0;
    top: -${theme.spacing.m};
  }
`;

const TeamLogo = styled.img`
  object-fit: contain;
  height: 36px;
  width: 36px;
  
  @media ${devices.tablet} {
    height: 90px;
    width: 90px;
  }
`;

const Statistic = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xxs};
`;

const FormIcons = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xxs};
`;

const FormIconContainer = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`;

const StandingsRow = styled.div<{ isMock?: boolean }>`
  background-color: ${theme.colors.silverLighter};
  padding: ${theme.spacing.xxs};
  border-radius: ${theme.borderRadius.s};
  display: flex;
  gap: ${theme.spacing.xxs};
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  border: 1px solid ${theme.colors.silverLight};

  ${({ isMock }) => isMock && css`
    background-image: linear-gradient(90deg, #FFFFFF 0%, #FFFFFF 100%);
  `}
`;

const StandingsRowTeam = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xxs};
  flex: 1;
`;

const StandingsPosition = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${theme.colors.silverLight};
  border-radius: ${theme.borderRadius.xs};
  width: 24px;
  height: 24px;
`;

const InsightCard = styled.div<{ isEditing?: boolean }>`
  background-color: ${theme.colors.white};
  position: relative;
  ${({ isEditing }) => (isEditing ? css`
    padding: 6px ${theme.spacing.xxxs} ${theme.spacing.xxxs} ${theme.spacing.s};
    ` : css`
    padding: ${theme.spacing.xxs} ${theme.spacing.xs} ${theme.spacing.xxs} ${theme.spacing.s};
  `)}
  border-radius: ${theme.borderRadius.s};
  border: 1px solid ${theme.colors.silverLight};
  box-sizing: border-box;
  width: 100%;
  display: flex;
  gap: ${theme.spacing.xxs};
  align-items: center;
  overflow: hidden;

  ${NormalTypography} {
    flex: 1;
  }
`;

const InsightCardColorStripe = styled.div<{ color: string }>`
  background-color: ${({ color }) => color};
  width: 6px;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  box-shadow: 1px 0px 4px rgba(0, 0, 0, 0.1);
`;

const InsightsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xxs};
  width: 100%;
  box-sizing: border-box;
`;

const LastGameResult = styled.div<{ outcome: FixtureOutcomeEnum }>`
  background-color: ${({ outcome }) => getOutcomeBackgroundColor(outcome)};
  padding: ${theme.spacing.xxxs} ${theme.spacing.xxs};
  border-radius: ${theme.borderRadius.s};
  display: flex;
  align-items: center;
`;

const LastGameOpponent = styled.div`
  display: flex;
  align-items: center;
`;

const LastGameContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.xxs};
  align-items: center;
  border-radius: ${theme.borderRadius.s};

  ${EmphasisTypography} {
    flex: 1;
  }
`;

export default NewFixtureStatsModal;
