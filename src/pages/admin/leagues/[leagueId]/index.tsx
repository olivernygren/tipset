import React, { useEffect, useState } from 'react'
import Page from '../../../../components/Page';
import { useNavigate } from 'react-router-dom';
import { deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../../../config/firebase';
import { CollectionEnum } from '../../../../utils/Firebase';
import { PredictionLeague, PredictionLeagueStanding, leagueMaximalParticipants } from '../../../../utils/League';
import { withDocumentIdOnObject } from '../../../../utils/helpers';
import { EmphasisTypography, HeadingsTypography, NormalTypography } from '../../../../components/typography/Typography';
import { ArrowLeft, DotsThree, GridFour, PencilSimple, PlusCircle, SoccerBall, SquaresFour, Trash, UserList } from '@phosphor-icons/react';
import styled from 'styled-components';
import { Section } from '../../../../components/section/Section';
import { devices, theme } from '../../../../theme';
import IconButton from '../../../../components/buttons/IconButton';
import ContextMenu from '../../../../components/menu/ContextMenu';
import ContextMenuOption from '../../../../components/menu/ContextMenuOption';
import { RoutesEnum } from '../../../../utils/Routes';
import { useUser } from '../../../../context/UserContext';
import { motion } from 'framer-motion';
import { get } from 'http';
import TextButton from '../../../../components/buttons/TextButton';
import Button from '../../../../components/buttons/Button';
import { getLeagueByInvitationCode } from '../../../../utils/firebaseHelpers';

enum Tabs {
  OVERVIEW = 'OVERVIEW',
  MATCHES = 'MATCHES',
  PARTICIPANTS = 'PARTICIPANTS',
  EDIT = 'EDIT',
}

const tabs = [
  Tabs.OVERVIEW,
  Tabs.MATCHES,
  Tabs.PARTICIPANTS,
  Tabs.EDIT,
];

const PredictionLeaguePage = () => {
  const navigate = useNavigate();
  const { user, hasAdminRights } = useUser();

  console.log(user);

  const [league, setLeague] = useState<PredictionLeague | undefined>();
  const [initialFetchLoading, setInitialFetchLoading] = useState<boolean>(true);
  const [contextMenuOpen, setContextMenuOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<Tabs>(Tabs.OVERVIEW);
  const [isParticipant, setIsParticipant] = useState<boolean>(false);
  const [joinLeagueLoading, setJoinLeagueLoading] = useState<boolean>(false);
  const [showJoinLeagueError, setShowJoinLeagueError] = useState<string>('');

  const leagueIdFromUrl = window.location.pathname.split('/')[2];
  const currentUserId = auth.currentUser?.uid ?? '';
  const isCreator = league?.creatorId === currentUserId;

  useEffect(() => {
    fetchLeagueData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  useEffect(() => {
    if (!initialFetchLoading && league && currentUserId) {
      const isUserParticipant = league.participants.includes(currentUserId);
      setIsParticipant(isUserParticipant);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId, initialFetchLoading, league]);
  
  const fetchLeagueData = async () => {
    const docRef = doc(db, CollectionEnum.LEAGUES, leagueIdFromUrl);
    const docSnap = await getDoc(docRef);
  
    if (docSnap.exists()) {
      const leagueData = withDocumentIdOnObject<PredictionLeague>(docSnap);
      setLeague(leagueData);
      setInitialFetchLoading(false);
    } else {
      console.log("No such document!");
    }
  };

  const handleDeleteLeague = async () => {
    if (!league) {
      console.log('No league found');
      return;
    };

    if (league.creatorId !== currentUserId) {
      console.log('You are not the creator of this league');
      return;
    }
  
    try {      
      const leagueDoc = doc(db, CollectionEnum.LEAGUES, league.documentId);
      await deleteDoc(leagueDoc);
      setContextMenuOpen(false);
      navigate(`/${RoutesEnum.LEAGUES}`);
    } catch (error) {
      console.log('Error deleting league', error);
    }
  };

  const handleJoinLeague = async () => {
    console.log(league, currentUserId, user);
    if (!league || !currentUserId || !user) return;

    setJoinLeagueLoading(true);
    setShowJoinLeagueError('');

    const leagueDoc = await getLeagueByInvitationCode(league?.inviteCode ?? '');
  
    if (!leagueDoc) {
      setShowJoinLeagueError('Felaktig inbjudningskod');
      return;
    }
  
    const leagueData = withDocumentIdOnObject<PredictionLeague>(leagueDoc);
  
    if (leagueData.participants.includes(currentUserId)) {
      setShowJoinLeagueError('Du är redan med i denna liga');
      setJoinLeagueLoading(false);
      return;
    }

    if (new Date(leagueData.deadlineToJoin) < new Date()) {
      setShowJoinLeagueError('Deadline för att gå med i denna liga har passerat');
      setJoinLeagueLoading(false);
      return;
    }

    if (leagueData.participants.length >= leagueMaximalParticipants) {
      setShowJoinLeagueError('Ligan har redan full kapacitet');
      setJoinLeagueLoading(false);
      return;
    }

    const newParticipantStandingsObj: PredictionLeagueStanding = {
      userId: currentUserId,
      username: user.lastname ? `${user.firstname} ${user.lastname}` : user.firstname,
      points: 0,
      position: leagueData.participants.length + 1,
      correctResults: 0,
    }
  
    try {
      await updateDoc(leagueDoc.ref, { 
        participants: [...leagueData.participants, currentUserId],
        standings: [...leagueData.standings, newParticipantStandingsObj],
      });
      fetchLeagueData();
    } catch (e) {
      console.error(e);
      setShowJoinLeagueError('Ett fel uppstod. Försök igen');
    }

    setJoinLeagueLoading(false);
  };

  console.log(league);

  const getTabText = (tab: Tabs) => {
    switch (tab) {
      case Tabs.OVERVIEW:
        return 'Översikt';
      case Tabs.MATCHES:
        return 'Matcher';
      case Tabs.PARTICIPANTS:
        return 'Deltagare';
      case Tabs.EDIT:
        return 'Redigera';
      default:
        return '';
    }
  };

  const getTabIcon = (tab: Tabs, isActive: boolean) => {
    switch (tab) {
      case Tabs.OVERVIEW:
        return <SquaresFour size={20} color={isActive ? theme.colors.white : theme.colors.silverDarker} />;
      case Tabs.MATCHES:
        return <SoccerBall size={20} weight='fill' color={isActive ? theme.colors.white : theme.colors.silverDarker} />;
      case Tabs.PARTICIPANTS:
        return <UserList size={20} color={isActive ? theme.colors.white : theme.colors.silverDarker} />;
      case Tabs.EDIT:
        return <PencilSimple size={20} color={isActive ? theme.colors.white : theme.colors.silverDarker} />;
      default:
        return null;
    }
  };

  // also add a invitation link to the league in the information section

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

  const getUserLeaguePosition = (place: PredictionLeagueStanding) => (
    <UserLeaguePosition>
      <EmphasisTypography variant='m'>{place.position === 1 ? '🥇' : place.position === 2 ? '🥈' : place.position === 3 ? '🥉' : `${place.position} -`} {place.username}</EmphasisTypography>
      <RightAlignedGridItem>
        <NormalTypography variant='m'>{place.correctResults}</NormalTypography>
      </RightAlignedGridItem>
      <RightAlignedGridItem>
        <NormalTypography variant='m'>{place.points} p</NormalTypography>
      </RightAlignedGridItem>
    </UserLeaguePosition>
  )
  
  const getPageContent = () => {
    if (!league) return null;

    switch (activeTab) {
      case Tabs.OVERVIEW:
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
                  <NormalTypography variant='m' color={theme.colors.silverDarker}>Inga omgångar finns</NormalTypography>
                  {isCreator && (
                    <MarginTopButton>
                      <Button icon={<PlusCircle size={24} color={theme.colors.white} />}>
                        Skapa omgång
                      </Button>
                    </MarginTopButton>
                  )}
                </>
              )}
            </GridSection>
            <GridSection>
              <HeadingsTypography variant='h3'>Tabell</HeadingsTypography>
              {league.standings && league.standings.length > 0 ? (
                <LeagueStandings>
                  <LeagueStandingsHeader>
                    <EmphasisTypography variant='s' color={theme.colors.textLight}>Namn</EmphasisTypography>
                    <RightAlignedGridItem>
                      <EmphasisTypography variant='s' color={theme.colors.textLight}>Rätt resultat</EmphasisTypography>
                    </RightAlignedGridItem>
                    <RightAlignedGridItem>
                      <EmphasisTypography variant='s' color={theme.colors.textLight}>Poäng</EmphasisTypography>
                    </RightAlignedGridItem>
                  </LeagueStandingsHeader>
                  {league.standings.sort((a, b) => a.position - b.position).map((place) => getUserLeaguePosition(place))}
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
                <NormalTypography variant='m' color={theme.colors.silverDarker}>Ingen tidigare omgång finns</NormalTypography>
              )}
            </GridSection>
            <GridSection>
              <HeadingsTypography variant='h3'>Information</HeadingsTypography>
              {league.description && (
                <Section gap='xxxs'>
                  <EmphasisTypography variant='s' color={theme.colors.silverDarker}>Beskrivning</EmphasisTypography>
                  <NormalTypography variant='m'>{league.description}</NormalTypography>
                </Section>
              )}
              <Section gap='xxxs'>
                <EmphasisTypography variant='s' color={theme.colors.silverDarker}>Inbjudningskod</EmphasisTypography>
                <NormalTypography variant='m'>{league.inviteCode}</NormalTypography>
              </Section>
              <Section gap='xxxs'>
                <EmphasisTypography variant='s' color={theme.colors.silverDarker}>Deadline för att gå med</EmphasisTypography>
                <NormalTypography variant='m'>{getFormattedDeadline()}</NormalTypography>
              </Section>
            </GridSection>
          </OverviewGrid>
        );
      case Tabs.MATCHES:
        return (
          <></>
        );
      case Tabs.PARTICIPANTS:
        return (
          <></>
        );
      case Tabs.EDIT:
        return (
          <></>
        );
      default:
        return null;
    }
  };

  return (
    <Page>
      <TextButton onClick={() => navigate(`/${RoutesEnum.LEAGUES}`)} icon={<ArrowLeft size={20} color={theme.colors.primary} />} noPadding>
        Alla ligor
      </TextButton>
      <PageHeader>
        <HeadingsTypography variant='h2'>{league?.name}</HeadingsTypography>
        <Section gap='s' flexDirection='row' alignItems='center' fitContent>
          {(isCreator || hasAdminRights) && (
            <>
              <IconButton 
                icon={<DotsThree size={30} />} 
                colors={{ normal: theme.colors.primary, hover: theme.colors.primaryDark, active: theme.colors.primaryDarker }} 
                backgroundColor={theme.colors.primaryBleach} 
                onClick={() => setContextMenuOpen(!contextMenuOpen)}
                shape='square'
              />
              {contextMenuOpen && (
                <ContextMenu positionX='right' positionY='bottom' offsetY={48 + 12} offsetX={0}>
                  <ContextMenuOption
                    icon={<Trash size={24} color={theme.colors.red} />}
                    onClick={() => handleDeleteLeague()}
                    label="Radera liga"
                    color={theme.colors.red}
                  />
                </ContextMenu>
              )}
            </>
          )}
        </Section>
      </PageHeader>
      {initialFetchLoading ? <p>Laddar...</p> : (
        <PageContent>
          {isParticipant ? (
            <>
              <TabsContainer>
                {tabs.map((tab) => (
                  <Tab active={activeTab === tab}>
                    {getTabIcon(tab, activeTab === tab)}
                    <EmphasisTypography variant='m' color={activeTab === tab ? theme.colors.white : theme.colors.silverDarker}>
                      {getTabText(tab)}
                    </EmphasisTypography>
                  </Tab>
                ))}
              </TabsContainer>
              {getPageContent()}
            </>
          ) : (
            <Section backgroundColor={theme.colors.white} padding={theme.spacing.m} borderRadius={theme.borderRadius.m} gap='m'>
              <HeadingsTypography variant='h5'>Vill du gå med i ligan {league?.name}?</HeadingsTypography>
              <Button onClick={handleJoinLeague} disabled={joinLeagueLoading} loading={joinLeagueLoading}>
                Acceptera inbjudan
              </Button>
              {showJoinLeagueError.length > 0 && (
                <NormalTypography variant='s' color={theme.colors.red}>{showJoinLeagueError}</NormalTypography>
              )}
            </Section>
          )}
        </PageContent>
      )}
    </Page>
  )
};

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${theme.spacing.m};
  padding: ${theme.spacing.s} 0;
`;

const PageContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.m};
`;

const TabsContainer = styled.div`
  background-color: ${theme.colors.white};
  display: flex;
  gap: ${theme.spacing.xxs};
  padding: ${theme.spacing.xs};
  border-radius: ${theme.borderRadius.m};
  width: 100%;
  box-sizing: border-box;
`;

const Tab = styled(motion.div)<{ active?: boolean }>`
  padding: ${theme.spacing.xxs} ${theme.spacing.xs};
  border-radius: ${theme.borderRadius.s};
  background-color: ${({ active }) => (active ? theme.colors.primary : theme.colors.white)};
  cursor: pointer;
  transition: background-color 0.2s;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.xxs};

  &:hover {
    background-color: ${theme.colors.primaryBleach};

    ${EmphasisTypography} {
      color: ${theme.colors.primaryDarker};
    }

    svg {
      fill: ${theme.colors.primaryDarker};
    }
  }
`;

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

const UserLeaguePosition = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: ${theme.spacing.xxs};
  align-items: center;
  padding: ${theme.spacing.xxs};
  border-radius: ${theme.borderRadius.xs};
  background-color: ${theme.colors.silverLighter};
`;

const LeagueStandingsHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: ${theme.spacing.xxs};
  align-items: center;
  padding: ${theme.spacing.xxs};
  border-radius: ${theme.borderRadius.xs};
  background-color: ${theme.colors.white};
`;

const RightAlignedGridItem = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export default PredictionLeaguePage;