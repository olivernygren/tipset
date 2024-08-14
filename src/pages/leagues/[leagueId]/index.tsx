import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  deleteDoc, doc, getDoc, updateDoc,
} from 'firebase/firestore';
import {
  ArrowLeft, CaretDown, DotsThree, PencilSimple, SoccerBall, SquaresFour, Trash, UserList,
  X,
} from '@phosphor-icons/react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import Page from '../../../components/Page';
import { auth, db } from '../../../config/firebase';
import { CollectionEnum } from '../../../utils/Firebase';
import { PredictionLeague, PredictionLeagueStanding, leagueMaximumParticipants } from '../../../utils/League';
import { withDocumentIdOnObject } from '../../../utils/helpers';
import { EmphasisTypography, HeadingsTypography, NormalTypography } from '../../../components/typography/Typography';
import { Section } from '../../../components/section/Section';
import { devices, theme } from '../../../theme';
import IconButton from '../../../components/buttons/IconButton';
import ContextMenu from '../../../components/menu/ContextMenu';
import ContextMenuOption from '../../../components/menu/ContextMenuOption';
import { RoutesEnum } from '../../../utils/Routes';
import { useUser } from '../../../context/UserContext';
import TextButton from '../../../components/buttons/TextButton';
import Button from '../../../components/buttons/Button';
import { getLeagueByInvitationCode, getSortedLeagueStandings } from '../../../utils/firebaseHelpers';
// eslint-disable-next-line import/no-cycle
import LeagueOverview from '../../../components/league/LeagueOverview';
import FixturesView from '../../../components/league/FixturesView';
import ParticipantsView from '../../../components/league/ParticipantsView';
import EditLeagueView from '../../../components/league/EditLeagueView';
import { errorNotify } from '../../../utils/toast/toastHelpers';
import useResizeListener, { DeviceSizes } from '../../../utils/hooks/useResizeListener';
import CustomSkeleton, { ParagraphSkeleton } from '../../../components/skeleton/CustomSkeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export enum LeagueTabs {
  OVERVIEW = 'OVERVIEW',
  MATCHES = 'MATCHES',
  PARTICIPANTS = 'PARTICIPANTS',
  EDIT = 'EDIT',
}

const PredictionLeaguePage = () => {
  const navigate = useNavigate();
  const { user, hasAdminRights } = useUser();
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const [tabs, setTabs] = useState([LeagueTabs.OVERVIEW, LeagueTabs.MATCHES, LeagueTabs.PARTICIPANTS]);
  const [league, setLeague] = useState<PredictionLeague | undefined>();
  const [initialFetchLoading, setInitialFetchLoading] = useState<boolean>(true);
  const [contextMenuOpen, setContextMenuOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<LeagueTabs>(LeagueTabs.OVERVIEW);
  const [isParticipant, setIsParticipant] = useState<boolean>(false);
  const [joinLeagueLoading, setJoinLeagueLoading] = useState<boolean>(false);
  const [showJoinLeagueError, setShowJoinLeagueError] = useState<string>('');
  const [sortedLeagueStandings, setSortedLeagueStandings] = useState<Array<PredictionLeagueStanding>>([]);
  const [mobileTabsMenuOpen, setMobileTabsMenuOpen] = useState<boolean>(false);

  const leagueIdFromUrl = window.location.pathname.split('/')[2];
  const currentUserId = auth.currentUser?.uid ?? '';
  const isCreator = league?.creatorId === currentUserId;

  useEffect(() => {
    fetchLeagueData();
  }, []);

  useEffect(() => {
    if (!initialFetchLoading && league && currentUserId) {
      const isUserParticipant = league.participants.includes(currentUserId);
      setIsParticipant(isUserParticipant);
      setSortedLeagueStandings(getSortedLeagueStandings(league.standings));

      if (league.creatorId === currentUserId || hasAdminRights) {
        setTabs([LeagueTabs.OVERVIEW, LeagueTabs.MATCHES, LeagueTabs.PARTICIPANTS, LeagueTabs.EDIT]);
      }
    }
  }, [currentUserId, initialFetchLoading, league]);

  const fetchLeagueData = async () => {
    const docRef = doc(db, CollectionEnum.LEAGUES, leagueIdFromUrl);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const leagueData = withDocumentIdOnObject<PredictionLeague>(docSnap);
      setLeague(leagueData);
      setInitialFetchLoading(false);
    } else {
      console.log('No such document!');
    }
  };

  const handleDeleteLeague = async () => {
    if (!league) {
      console.log('No league found');
      return;
    }

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

    if (leagueData.participants.length >= leagueMaximumParticipants) {
      setShowJoinLeagueError('Ligan har redan full kapacitet');
      setJoinLeagueLoading(false);
      return;
    }

    const newParticipantStandingsObj: PredictionLeagueStanding = {
      userId: currentUserId,
      username: user.lastname ? `${user.firstname} ${user.lastname}` : user.firstname,
      points: 0,
      correctResults: 0,
    };

    try {
      await updateDoc(leagueDoc.ref, {
        participants: [...leagueData.participants, currentUserId],
        standings: [...leagueData.standings, newParticipantStandingsObj],
      });
      fetchLeagueData();
    } catch (e) {
      console.error(e);
      errorNotify('Ett fel uppstod. Försök igen');
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
        return <SoccerBall size={20} weight="fill" color={isActive ? theme.colors.white : theme.colors.textLight} />;
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
            onChangeTab={(tab: LeagueTabs) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0 });
            }}
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

  const getSkeletonHeader = () => (
    <>
      <ParagraphSkeleton height={40} width={195} />
      <CustomSkeleton circle width={46} height={46} />
    </>
  );

  const getSkeletonLoader = () => (
    <Section gap="m">
      {isMobile ? (
        <Section padding={`0 ${theme.spacing.s}`}>
          <CustomSkeleton width="calc(100vw - 32px)" height={48} borderRadius={theme.borderRadius.m} />
        </Section>
      ) : (
        <CustomSkeleton width={1200} height={60} borderRadius={theme.borderRadius.m} />
      )}
      {isMobile ? (
        <Section gap="m">
          <CustomSkeleton width="100vw" height={288} />
          <CustomSkeleton width="100vw" height={288} />
        </Section>
      ) : (
        <Section gap="s">
          <Section gap="s" flexDirection="row">
            <CustomSkeleton width={592} height={376} borderRadius={theme.borderRadius.l} />
            <CustomSkeleton width={592} height={376} borderRadius={theme.borderRadius.l} />
          </Section>
          <Section gap="s" flexDirection="row">
            <CustomSkeleton width={592} height={376} borderRadius={theme.borderRadius.l} />
            <CustomSkeleton width={592} height={376} borderRadius={theme.borderRadius.l} />
          </Section>
        </Section>
      )}
    </Section>
  );

  return (
    <Page fullWidthMobile>
      <BackButtonContainer>
        <TextButton onClick={() => navigate(`/${RoutesEnum.LEAGUES}`)} icon={<ArrowLeft size={20} color={theme.colors.primary} />} noPadding>
          Alla ligor
        </TextButton>
      </BackButtonContainer>
      <PageHeader>
        {initialFetchLoading ? getSkeletonHeader() : (
          <>
            <HeadingsTypography variant="h2">{league?.name}</HeadingsTypography>
            <Section gap="s" flexDirection="row" alignItems="center" fitContent>
              {(isCreator || hasAdminRights) && (
              <>
                <IconButton
                  icon={contextMenuOpen ? <X size={28} /> : <DotsThree size={28} weight="bold" />}
                  colors={{ normal: theme.colors.primary, hover: theme.colors.primaryDark, active: theme.colors.primaryDarker }}
                  onClick={() => setContextMenuOpen(!contextMenuOpen)}
                  showBorder
                  backgroundColor={theme.colors.white}
                />
                {contextMenuOpen && (
                  <ContextMenu positionX="right" positionY="bottom" offsetY={48 + 12} offsetX={0}>
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
          </>
        )}
      </PageHeader>
      {initialFetchLoading ? getSkeletonLoader() : (
        <PageContent>
          {isParticipant && (
          <>
            {isMobile ? (
              <MobileTabs>
                <MobileTabsButton onClick={() => setMobileTabsMenuOpen(!mobileTabsMenuOpen)}>
                  <Section flexDirection="row" alignItems="center" gap="xxs">
                    {getTabIcon(activeTab, true)}
                    <EmphasisTypography variant="m" color={theme.colors.primary}>
                      {getTabText(activeTab)}
                    </EmphasisTypography>
                  </Section>
                  <MobileMenuIcon isOpen={mobileTabsMenuOpen}>
                    <CaretDown size={16} color={theme.colors.primary} weight="bold" />
                  </MobileMenuIcon>
                </MobileTabsButton>
                {mobileTabsMenuOpen && (
                <MobileTabsOptionsMenu
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {tabs.map((tab) => (
                    <MobileMenuOption
                      isActive={activeTab === tab}
                      onClick={() => {
                        setActiveTab(tab);
                        setMobileTabsMenuOpen(false);
                      }}
                    >
                      <EmphasisTypography variant="m" color={activeTab === tab ? theme.colors.white : theme.colors.textDefault}>
                        {getTabText(tab)}
                      </EmphasisTypography>
                      {getTabIcon(tab, activeTab === tab)}
                    </MobileMenuOption>
                  ))}
                </MobileTabsOptionsMenu>
                )}
              </MobileTabs>
            ) : (
              <TabsContainer>
                {tabs.map((tab) => (
                  <Tab active={activeTab === tab} onClick={activeTab === tab ? () => {} : () => setActiveTab(tab)}>
                    {getTabIcon(tab, activeTab === tab)}
                    <EmphasisTypography variant="m" color={activeTab === tab ? theme.colors.white : theme.colors.textLight}>
                      {getTabText(tab)}
                    </EmphasisTypography>
                  </Tab>
                ))}
              </TabsContainer>
            )}
            {getPageContent()}
          </>
          )}
          {!isParticipant && currentUserId && (
          <Section backgroundColor={theme.colors.white} padding={theme.spacing.m} borderRadius={theme.borderRadius.m} gap="m" expandMobile>
            <HeadingsTypography variant="h5">
              {`Vill du gå med i ligan ${league?.name}?`}
            </HeadingsTypography>
            <Button onClick={handleJoinLeague} disabled={joinLeagueLoading} loading={joinLeagueLoading}>
              Acceptera inbjudan
            </Button>
            {showJoinLeagueError.length > 0 && (
            <NormalTypography variant="s" color={theme.colors.red}>{showJoinLeagueError}</NormalTypography>
            )}
          </Section>
          )}
        </PageContent>
      )}
    </Page>
  );
};

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${theme.spacing.m};
  padding: ${theme.spacing.s};
  width: 100%;
  box-sizing: border-box;
  
  @media ${devices.tablet} {
    padding: ${theme.spacing.m} 0;
  }
`;

const BackButtonContainer = styled.div`
  width: 100%;
  box-sizing: border-box;
  padding: 0 0 0 ${theme.spacing.s};

  @media ${devices.tablet} {
    padding: 0;
  }
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

const MobileTabsButton = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  border-radius: ${theme.borderRadius.m};
  background-color: ${theme.colors.white};
  padding: 0 ${theme.spacing.s};

  svg {
    fill: ${theme.colors.primary};
  }
`;

const MobileMenuIcon = styled.div<{ isOpen: boolean }>`
  transition: transform 0.2s;
  transform: ${({ isOpen }) => (isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
`;

const MobileTabs = styled.div`
  position: relative;
  width: 100%;
  box-sizing: border-box;
  padding: 0 ${theme.spacing.s};

  @media ${devices.tablet} {
    padding: 0;
  }
`;

const MobileTabsOptionsMenu = styled(motion.div)`
  position: absolute;
  top: calc(48px + 8px);
  right: ${theme.spacing.s};
  left: ${theme.spacing.s};
  padding: ${theme.spacing.xxxs};
  background-color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.m};
  border: 1px solid ${theme.colors.silverLight};
  height: fit-content;
  z-index: 10;
`;

const MobileMenuOption = styled.div<{ isActive?: boolean }>`
  padding: 0 ${theme.spacing.xs};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: ${theme.borderRadius.s};
  gap: ${theme.spacing.xs};
  height: 40px;
  background-color: ${({ isActive }) => (isActive ? theme.colors.primary : theme.colors.white)};
`;

export default PredictionLeaguePage;
