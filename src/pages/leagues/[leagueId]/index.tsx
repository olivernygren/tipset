import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  deleteDoc, doc, getDoc, updateDoc,
} from 'firebase/firestore';
import {
  Alarm,
  ArrowLeft, CaretDown, CheckCircle, DotsThree, PencilSimple, RocketLaunch, SoccerBall, SquaresFour, Trash, UserList,
  X,
} from '@phosphor-icons/react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import Page from '../../../components/Page';
import { auth, db } from '../../../config/firebase';
import { CollectionEnum } from '../../../utils/Firebase';
import {
  LeagueGameWeek, LeagueTabs, PredictionLeague, PredictionLeagueStanding, leagueMaximumParticipants,
} from '../../../utils/League';
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
import LeagueOverview from '../../../components/league/LeagueOverview';
import FixturesView from '../../../components/league/FixturesView';
import ParticipantsView from '../../../components/league/ParticipantsView';
import EditLeagueView from '../../../components/league/EditLeagueView';
import { errorNotify } from '../../../utils/toast/toastHelpers';
import useResizeListener, { DeviceSizes } from '../../../utils/hooks/useResizeListener';
import CustomSkeleton, { ParagraphSkeleton } from '../../../components/skeleton/CustomSkeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import Modal from '../../../components/modal/Modal';
import Input from '../../../components/input/Input';

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
  const [confirmDeleteModal, setConfirmDeleteModal] = useState<boolean>(false);
  const [deleteLeagueInputValue, setDeleteLeagueInputValue] = useState<string>('');
  const [deleteLeagueLoading, setDeleteLeagueLoading] = useState<boolean>(false);

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
      errorNotify('Ligan kunde inte hittas');
    }
  };

  const handleDeleteLeague = async () => {
    setDeleteLeagueLoading(true);

    if (!league) {
      errorNotify('Ett fel uppstod. Försök igen');
      return;
    }

    if (league.creatorId !== currentUserId) {
      errorNotify('Du har inte behörighet att radera denna liga');
      return;
    }

    try {
      const leagueDoc = doc(db, CollectionEnum.LEAGUES, league.documentId);
      await deleteDoc(leagueDoc);
      setContextMenuOpen(false);
      navigate(`/${RoutesEnum.LEAGUES}`);
    } catch (error) {
      errorNotify('Ett fel uppstod. Försök igen');
    } finally {
      setDeleteLeagueLoading(false);
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

  const getTimeLeftUntilDeadline = (currentGameWeek?: LeagueGameWeek) => {
    if (!currentGameWeek) return 'Ingen omgång aktiv';

    const firstFixture = currentGameWeek.games.fixtures[0];
    const firstFixtureDeadline = new Date(firstFixture.kickOffTime);

    const now = new Date();
    const difference = firstFixtureDeadline.getTime() - now.getTime();

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

    if (currentGameWeek.hasEnded) {
      return 'Avslutad';
    }

    if (difference < 0) {
      return 'Aktiv';
    }

    if (days > 0) {
      if (days === 1) {
        return `${days} dag kvar`;
      }
      return `om ${days} dagar`;
    }

    if (hours > 0) {
      return `om ${hours} h ${minutes} min`;
    }

    if (minutes > 0) {
      return `om ${minutes} min`;
    }

    return 'om >1 min';
  };

  const getCurrentGameWeek = () => {
    let status = '';
    let round = '';

    if (!league || !league.gameWeeks) {
      return null;
    }

    const currentGameWeek = league.gameWeeks.find((gameWeek) => {
      const now = new Date();
      return new Date(gameWeek.startDate) < now && !gameWeek.hasBeenCorrected && !gameWeek.hasEnded;
    });

    if (currentGameWeek) {
      round = `Omgång ${currentGameWeek.round}`;
    } else {
      return null;
    }

    const allFixturesInFuture = currentGameWeek?.games.fixtures.every((fixture) => new Date(fixture.kickOffTime) > new Date());
    const isActive = !currentGameWeek?.hasEnded && !allFixturesInFuture;

    status = `(${isActive ? 'Påbörjad' : getTimeLeftUntilDeadline(currentGameWeek)})`;

    const getIcon = () => {
      if (!currentGameWeek) return null;
      if (currentGameWeek.hasEnded) return <CheckCircle size={24} color={theme.colors.textLight} weight="fill" />;
      if (isActive) return <RocketLaunch size={24} color={theme.colors.primary} weight="fill" />;
      return <Alarm size={24} color={theme.colors.textLight} weight="fill" />;
    };

    return (
      <Section flexDirection="row" alignItems="center" gap="xxs" fitContent>
        {getIcon()}
        <EmphasisTypography variant="m" color={theme.colors.textDefault} noWrap>
          {`${round} `}
        </EmphasisTypography>
        {status.length > 0 && (
          <NormalTypography variant="m" color={theme.colors.textDefault} noWrap>
            {status}
          </NormalTypography>
        )}
      </Section>
    );
  };

  const getTabIcon = (tab: LeagueTabs, isActive: boolean) => {
    switch (tab) {
      case LeagueTabs.OVERVIEW:
        return <SquaresFour size={20} color={isActive ? theme.colors.white : theme.colors.textLight} weight={isActive ? 'fill' : 'regular'} />;
      case LeagueTabs.MATCHES:
        return <SoccerBall size={20} weight="fill" color={isActive ? theme.colors.white : theme.colors.textLight} />;
      case LeagueTabs.PARTICIPANTS:
        return <UserList size={20} color={isActive ? theme.colors.white : theme.colors.textLight} weight={isActive ? 'fill' : 'regular'} />;
      case LeagueTabs.EDIT:
        return <PencilSimple size={20} color={isActive ? theme.colors.white : theme.colors.textLight} weight={isActive ? 'fill' : 'regular'} />;
      default:
        return null;
    }
  };

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
          <Section alignItems="flex-start" gap="m" flexDirection="row">
            <Section gap="xs">
              <Section gap="m" flexDirection="row" alignItems="center">
                <HeadingsTypography variant="h2">{league?.name}</HeadingsTypography>
                {/* {!isMobile && (
                  <NormalTypography variant="m" color={theme.colors.textLight}>
                    {`(${league?.participants.length} deltagare)`}
                  </NormalTypography>
                )} */}
              </Section>
              {/* {isMobile && (
                <EmphasisTypography variant="m" color={theme.colors.textDefault} noWrap>
                  {getCurrentGameWeek()}
                </EmphasisTypography>
              )} */}
            </Section>
            <Section gap="m" flexDirection="row" alignItems="center" fitContent>
              {!isMobile && (
                getCurrentGameWeek()
              )}
              {(isCreator || hasAdminRights) && (
                <>
                  <IconButton
                    icon={contextMenuOpen ? <X size={28} /> : <DotsThree size={28} weight="bold" />}
                    colors={{ normal: theme.colors.primary, hover: theme.colors.primaryDark, active: theme.colors.primaryDarker }}
                    onClick={() => setContextMenuOpen(!contextMenuOpen)}
                    showBorder
                    backgroundColor={{ normal: theme.colors.white }}
                  />
                  {contextMenuOpen && (
                    <ContextMenu onClose={() => setContextMenuOpen(false)} positionX="right" positionY="bottom" offsetY={48 + 12} offsetX={0}>
                      <ContextMenuOption
                        icon={<Trash size={24} color={theme.colors.red} />}
                        onClick={() => setConfirmDeleteModal(true)}
                        label="Radera liga"
                        color={theme.colors.red}
                      />
                    </ContextMenu>
                  )}
                </>
              )}
            </Section>
          </Section>
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
      {confirmDeleteModal && (
        <Modal
          title="Radera liga"
          onClose={() => setConfirmDeleteModal(false)}
          size="s"
        >
          <Section gap="m">
            <Section gap="xs">
              <NormalTypography variant="m">
                Vill du radera ligan permanent? Detta kan ej ångras!
              </NormalTypography>
              <NormalTypography variant="m">
                Fyll i ligans namn för att bekräfta att du vill radera den.
              </NormalTypography>
            </Section>
            <Input
              value={deleteLeagueInputValue}
              onChange={(e) => setDeleteLeagueInputValue(e.target.value)}
              placeholder={league?.name}
              fullWidth
            />
            <Section flexDirection="row" gap="xs" alignItems="center">
              <Button
                onClick={() => setConfirmDeleteModal(false)}
                variant="secondary"
                fullWidth
                color="red"
                textColor={theme.colors.red}
              >
                Avbryt
              </Button>
              <Button
                onClick={handleDeleteLeague}
                variant="primary"
                fullWidth
                color="red"
                disabled={deleteLeagueInputValue !== league?.name}
                icon={<Trash size={20} color="white" weight="fill" />}
                loading={deleteLeagueLoading}
              >
                Radera liga
              </Button>
            </Section>
          </Section>
        </Modal>
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
  position: relative;
`;

// const SantaImage = styled.div`
//   display: none;

//   @media ${devices.laptop} {
//     display: block;
//     position: absolute;
//     bottom: 0px;
//     right: 50px;
//     height: 100px;
//     animation: fadeIn 0.5s ease;

//     > img {
//       width: 100%;
//     }

//     @keyframes fadeIn {
//       from {
//         opacity: 0;
//       }
//       to {
//         opacity: 1;
//       }
//     }
//   }
// `;

const Tab = styled(motion.div)<{ active?: boolean }>`
  padding: ${theme.spacing.xxs} ${theme.spacing.xs};
  border-radius: ${theme.borderRadius.m};
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
  display: flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  height: fit-content;
  
  > svg {
    transition: transform 0.2s;
    transform: ${({ isOpen }) => (isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
  }
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
