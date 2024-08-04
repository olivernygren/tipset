import { useEffect, useState } from 'react'
import Page from '../../../../components/Page';
import { useNavigate } from 'react-router-dom';
import { deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../../../config/firebase';
import { CollectionEnum } from '../../../../utils/Firebase';
import { PredictionLeague, PredictionLeagueStanding, leagueMaximalParticipants } from '../../../../utils/League';
import { withDocumentIdOnObject } from '../../../../utils/helpers';
import { EmphasisTypography, HeadingsTypography, NormalTypography } from '../../../../components/typography/Typography';
import { ArrowLeft, DotsThree, PencilSimple, SoccerBall, SquaresFour, Trash, UserList } from '@phosphor-icons/react';
import styled, { css } from 'styled-components';
import { Section } from '../../../../components/section/Section';
import { theme } from '../../../../theme';
import IconButton from '../../../../components/buttons/IconButton';
import ContextMenu from '../../../../components/menu/ContextMenu';
import ContextMenuOption from '../../../../components/menu/ContextMenuOption';
import { RoutesEnum } from '../../../../utils/Routes';
import { useUser } from '../../../../context/UserContext';
import { motion } from 'framer-motion';
import TextButton from '../../../../components/buttons/TextButton';
import Button from '../../../../components/buttons/Button';
import { getLeagueByInvitationCode, getSortedLeagueStandings } from '../../../../utils/firebaseHelpers';
import LeagueOverview from '../../../../components/league/LeagueOverview';
import FixturesView from '../../../../components/league/FixturesView';
import ParticipantsView from '../../../../components/league/ParticipantsView';
import EditLeagueView from '../../../../components/league/EditLeagueView';

export enum LeagueTabs {
  OVERVIEW = 'OVERVIEW',
  MATCHES = 'MATCHES',
  PARTICIPANTS = 'PARTICIPANTS',
  EDIT = 'EDIT',
}

const tabs = [
  LeagueTabs.OVERVIEW,
  LeagueTabs.MATCHES,
  LeagueTabs.PARTICIPANTS,
  LeagueTabs.EDIT,
];

const PredictionLeaguePage = () => {
  const navigate = useNavigate();
  const { user, hasAdminRights } = useUser();

  const [league, setLeague] = useState<PredictionLeague | undefined>();
  const [initialFetchLoading, setInitialFetchLoading] = useState<boolean>(true);
  const [contextMenuOpen, setContextMenuOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<LeagueTabs>(LeagueTabs.OVERVIEW);
  const [isParticipant, setIsParticipant] = useState<boolean>(false);
  const [joinLeagueLoading, setJoinLeagueLoading] = useState<boolean>(false);
  const [showJoinLeagueError, setShowJoinLeagueError] = useState<string>('');
  const [sortedLeagueStandings, setSortedLeagueStandings] = useState<Array<PredictionLeagueStanding>>([]);

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
      setSortedLeagueStandings(getSortedLeagueStandings(league.standings));
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

  const getTabText = (tab: LeagueTabs) => {
    switch (tab) {
      case LeagueTabs.OVERVIEW:
        return 'Översikt';
      case LeagueTabs.MATCHES:
        return 'Matcher';
      case LeagueTabs.PARTICIPANTS:
        return 'Deltagare';
      case LeagueTabs.EDIT:
        return 'Redigera';
      default:
        return '';
    }
  };

  const getTabIcon = (tab: LeagueTabs, isActive: boolean) => {
    switch (tab) {
      case LeagueTabs.OVERVIEW:
        return <SquaresFour size={20} color={isActive ? theme.colors.white : theme.colors.textLight} />;
      case LeagueTabs.MATCHES:
        return <SoccerBall size={20} weight='fill' color={isActive ? theme.colors.white : theme.colors.textLight} />;
      case LeagueTabs.PARTICIPANTS:
        return <UserList size={20} color={isActive ? theme.colors.white : theme.colors.textLight} />;
      case LeagueTabs.EDIT:
        return <PencilSimple size={20} color={isActive ? theme.colors.white : theme.colors.textLight} />;
      default:
        return null;
    }
  };

  // also add a invitation link to the league in the information section
  
  const getPageContent = () => {
    if (!league) return null;

    switch (activeTab) {
      case LeagueTabs.OVERVIEW:
        return (
          <LeagueOverview
            league={league}
            isCreator={isCreator}
            currentUserId={currentUserId}
            sortedLeagueStandings={sortedLeagueStandings}
            onChangeTab={(tab: LeagueTabs) => setActiveTab(tab)}
          />
        );
      case LeagueTabs.MATCHES:
        return (
          <FixturesView 
            league={league}
            isCreator={isCreator}
            refetchLeague={fetchLeagueData}
          />
        );
      case LeagueTabs.PARTICIPANTS:
        return (
          <ParticipantsView
            league={league}
            isCreator={isCreator}
            refetchLeague={fetchLeagueData}
          />
        );
      case LeagueTabs.EDIT:
        return (
          <EditLeagueView
            league={league}
            isCreator={isCreator}
            refetchLeague={fetchLeagueData}
          />
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
                  <Tab active={activeTab === tab} onClick={activeTab === tab ? () => {} : () => setActiveTab(tab)}>
                    {getTabIcon(tab, activeTab === tab)}
                    <EmphasisTypography variant='m' color={activeTab === tab ? theme.colors.white : theme.colors.textLight}>
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
  overflow-x: auto;
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

  ${({ active }) => !active && css`  
    &:hover {
      background-color: ${theme.colors.primaryBleach};

      ${EmphasisTypography} {
        color: ${theme.colors.primaryDarker};
      }

      svg {
        fill: ${theme.colors.primaryDarker};
      }
    }
  `}
`;

export default PredictionLeaguePage;