import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getDocs, collection, where, query, addDoc, updateDoc,
} from 'firebase/firestore';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import {
  Medal, PlusCircle, UserPlus, Users,
} from '@phosphor-icons/react';
import { auth, db } from '../../config/firebase';
import { CollectionEnum } from '../../utils/Firebase';
import { generateLeagueInviteCode, withDocumentIdOnObjectsInArray, withDocumentIdOnObject } from '../../utils/helpers';
import {
  CreatePredictionLeagueInput, PredictionLeague, PredictionLeagueStanding, leagueMaximumParticipants,
} from '../../utils/League';
import { devices, theme } from '../../theme';
import { EmphasisTypography, HeadingsTypography, NormalTypography } from '../../components/typography/Typography';
import { Section } from '../../components/section/Section';
import Button from '../../components/buttons/Button';
import Modal from '../../components/modal/Modal';
import Page from '../../components/Page';
import Input from '../../components/input/Input';
import { QueryEnum } from '../../utils/Routes';
import { getLeagueByInvitationCode } from '../../utils/firebaseHelpers';
import { useUser } from '../../context/UserContext';
import { successNotify } from '../../utils/toast/toastHelpers';
import Tag from '../../components/tag/Tag';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';
import IconButton from '../../components/buttons/IconButton';

const PredictionLeaguesPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const [fetchLoading, setFetchLoading] = useState(true);
  const [participantLeagues, setParticipantLeagues] = useState<Array<PredictionLeague>>([]);
  const [creatorLeagues, setCreatorLeagues] = useState<Array<PredictionLeague>>([]);
  const [endedLeagues, setEndedLeagues] = useState<Array<PredictionLeague>>([]);
  const [newLeagueName, setNewLeagueName] = useState<string>('');
  const [newLeagueDescription, setNewLeagueDescription] = useState<string>('');
  const [showCreateLeagueModal, setShowCreateLeagueModal] = useState<boolean>(false);
  const [showJoinLeagueModal, setShowJoinLeagueModal] = useState<boolean>(false);
  const [joinLeagueCodeValueInModal, setJoinLeagueCodeValueInModal] = useState<string>('');
  const [joinLeagueCodeValue, setJoinLeagueCodeValue] = useState<string>('');
  const [showJoinLeagueError, setShowJoinLeagueError] = useState<string>('');
  const [leagueCardHovered, setLeagueCardHovered] = useState<string | undefined>(undefined);
  const [createLeagueLoading, setCreateLeagueLoading] = useState<boolean>(false);
  const [joinLeagueLoading, setJoinLeagueLoading] = useState<string | null>(null);

  const currentUserId = auth.currentUser?.uid ?? '';
  const leagueCollectionRef = collection(db, CollectionEnum.LEAGUES);

  useEffect(() => {
    if (currentUserId) {
      fetchLeagues();
    }
  }, [currentUserId]);

  const fetchLeagues = async () => {
    try {
      const data = await getDocs(query(collection(db, CollectionEnum.LEAGUES), where('participants', 'array-contains', currentUserId)));
      const currentUserLeagues = withDocumentIdOnObjectsInArray<PredictionLeague>(data.docs);

      const allEndedLeagues = currentUserLeagues.filter((league) => league.hasEnded);
      const allCreatorLeagues = currentUserLeagues.filter((league) => league.creatorId === currentUserId && !league.hasEnded).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const allParticipantLeagues = currentUserLeagues.filter((league) => league.participants.includes(currentUserId ?? '---') && league.creatorId !== currentUserId && !league.hasEnded);

      setEndedLeagues(allEndedLeagues);
      setParticipantLeagues(allParticipantLeagues);
      setCreatorLeagues(allCreatorLeagues);
    } catch (err) {
      console.error(err);
    }
    setFetchLoading(false);
  };

  const handleCreateLeague = async () => {
    setCreateLeagueLoading(true);

    const today = new Date();
    const oneMonthFromNow = new Date(today.setMonth(today.getMonth() + 1));

    if (newLeagueName.length === 0) return;

    const newLeague: CreatePredictionLeagueInput = {
      name: newLeagueName,
      description: newLeagueDescription,
      creatorId: auth.currentUser?.uid ?? '',
      participants: [auth.currentUser?.uid ?? ''],
      inviteCode: generateLeagueInviteCode(),
      createdAt: new Date().toISOString(),
      invitedUsers: [],
      standings: [{
        userId: auth.currentUser?.uid ?? '',
        username: (user?.lastname ? `${user?.firstname} ${user?.lastname}` : user?.firstname) ?? '?',
        points: 0,
        correctResults: 0,
      }],
      deadlineToJoin: oneMonthFromNow.toISOString(),
      hasEnded: false,
    };

    try {
      await addDoc(leagueCollectionRef, newLeague);
      setShowCreateLeagueModal(false);
      setShowJoinLeagueModal(false);
      fetchLeagues();
    } catch (e) {
      console.error(e);
    }

    setCreateLeagueLoading(false);
  };

  const handleJoinLeague = async () => {
    console.log(currentUserId, user);

    if (!currentUserId || !user) return;

    setJoinLeagueLoading('modal');
    setShowJoinLeagueError('');

    const code = joinLeagueCodeValueInModal.length > 0 ? joinLeagueCodeValueInModal.trim() : joinLeagueCodeValue.trim();
    const leagueDoc = await getLeagueByInvitationCode(code);

    if (!leagueDoc) {
      setShowJoinLeagueError('Felaktig inbjudningskod');
      return;
    }

    const leagueData = withDocumentIdOnObject<PredictionLeague>(leagueDoc);

    if (leagueData.participants.includes(currentUserId)) {
      setShowJoinLeagueError('Du är redan med i denna liga');
      setJoinLeagueLoading(null);
      return;
    }

    if (new Date(leagueData.deadlineToJoin) < new Date()) {
      setShowJoinLeagueError('Deadline för att gå med i denna liga har passerat');
      setJoinLeagueLoading(null);
      return;
    }

    if (leagueData.participants.length >= leagueMaximumParticipants) {
      setShowJoinLeagueError('Ligan har redan full kapacitet');
      setJoinLeagueLoading(null);
      return;
    }

    if (leagueData.hasEnded) {
      setShowJoinLeagueError('Ligan har redan avslutats');
      setJoinLeagueLoading(null);
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
      setShowJoinLeagueModal(false);
      successNotify(`Du har gått med i ${leagueData.name}`);
      fetchLeagues();
    } catch (e) {
      console.error(e);
      setShowJoinLeagueError('Ett fel uppstod. Försök igen');
    }

    setJoinLeagueLoading(null);
  };

  const getLeagueCard = (league: PredictionLeague) => {
    const isHovered = leagueCardHovered === league.documentId;
    return (
      <LeagueCard
        key={league.documentId}
        whileHover={{ scale: 1.02, backgroundColor: theme.colors.primary }}
        transition={{ duration: 0.2 }}
        onHoverStart={() => setLeagueCardHovered(league.documentId)}
        onHoverEnd={() => setLeagueCardHovered(undefined)}
        onClick={() => navigate(`/${QueryEnum.LEAGUES}/${league.documentId}`)}
      >
        <Section gap="s" flexDirection="row" alignItems="flex-start" justifyContent="space-between">
          <Tag
            text={league.gameWeeks && league.gameWeeks.length > 0 ? `Omgång ${league.gameWeeks.length ?? 0}` : 'Ej startad'}
            textAndIconColor={isHovered ? theme.colors.white : theme.colors.textDefault}
            backgroundColor={isHovered ? theme.colors.primaryDark : theme.colors.silverLighter}
          />
          <PointsContainer isHovered={isHovered}>
            <EmphasisTypography variant="l" color={isHovered ? theme.colors.gold : theme.colors.primary}>{`${league.standings.find((standing) => standing.userId === currentUserId)?.points}p`}</EmphasisTypography>
          </PointsContainer>
        </Section>
        <Section gap="s">
          <EmphasisTypography variant="l" color={isHovered ? theme.colors.gold : theme.colors.textDefault}>{league.name}</EmphasisTypography>
          <NormalTypography variant="m" color={isHovered ? theme.colors.primaryBleach : theme.colors.textLighter}>{league.description}</NormalTypography>
        </Section>
        <BottomRow>
          {league.hasEnded ? (
            <Tag
              text={`Du kom ${league.standings.findIndex((standing) => standing.userId === currentUserId) + 1}a`}
              textAndIconColor={isHovered ? theme.colors.white : theme.colors.primary}
              backgroundColor={isHovered ? theme.colors.primaryLight : theme.colors.primaryFade}
              icon={<Medal size={20} weight="fill" />}
              fullWidth
            />
          ) : (
            <Tag
              text={`${league.participants.length} deltagare`}
              textAndIconColor={isHovered ? theme.colors.white : theme.colors.primary}
              backgroundColor={isHovered ? theme.colors.primaryLight : theme.colors.primaryFade}
              icon={<Users size={20} weight="light" />}
              fullWidth
            />
          )}
        </BottomRow>
      </LeagueCard>
    );
  };

  return (
    <Page>
      <PageHeader>
        <HeadingsTypography variant="h2">Ligor</HeadingsTypography>
        <Section gap={isMobile ? 'xs' : 's'} flexDirection="row" alignItems="center" fitContent>
          {isMobile ? (
            <>
              <IconButton
                icon={<PlusCircle size={28} />}
                onClick={() => setShowCreateLeagueModal(true)}
                backgroundColor={theme.colors.primary}
                colors={{
                  normal: theme.colors.white,
                  disabled: theme.colors.silver,
                }}
                disabled={!currentUserId}
              />
              <IconButton
                icon={<UserPlus size={28} />}
                onClick={() => setShowJoinLeagueModal(true)}
                colors={{
                  normal: theme.colors.primary,
                  hover: theme.colors.primaryDark,
                  active: theme.colors.primaryDarker,
                  disabled: theme.colors.silver,
                }}
                showBorder
                borderColor={theme.colors.primary}
                disabled={!currentUserId}
              />
            </>
          ) : (
            <>
              <Button
                variant="primary"
                size="m"
                onClick={() => setShowCreateLeagueModal(true)}
                icon={<PlusCircle size={24} weight="fill" color="white" />}
                disabled={!currentUserId}
              >
                Skapa liga
              </Button>
              <Button
                variant="secondary"
                size="m"
                onClick={() => setShowJoinLeagueModal(true)}
                icon={<UserPlus size={24} color={!currentUserId ? theme.colors.silverLight : theme.colors.primary} />}
                disabled={!currentUserId}
              >
                Gå med i liga
              </Button>
            </>
          )}
        </Section>
      </PageHeader>
      <Section gap="l" padding={`${theme.spacing.m} 0`}>
        {!currentUserId && (
          <NormalTypography variant="m" color={theme.colors.silverDarker}>Logga in för att se och gå med i ligor</NormalTypography>
        )}
        {fetchLoading && currentUserId && <NormalTypography variant="m">Laddar ligor...</NormalTypography>}
        {!fetchLoading && [...creatorLeagues, ...participantLeagues, ...endedLeagues].length > 0 && (
          <>
            {creatorLeagues.length > 0 && (
              <Section gap="s">
                <HeadingsTypography variant="h3">Dina skapade ligor</HeadingsTypography>
                <LeaguesContainer>
                  {creatorLeagues.map((league) => getLeagueCard(league))}
                </LeaguesContainer>
              </Section>
            )}
            {participantLeagues.length > 0 && (
              <Section gap="s">
                <HeadingsTypography variant="h3">Ligor du deltar i</HeadingsTypography>
                <LeaguesContainer>
                  {participantLeagues.map((league) => getLeagueCard(league))}
                </LeaguesContainer>
              </Section>
            )}
            {endedLeagues.length > 0 && (
              <Section gap="s">
                <HeadingsTypography variant="h3">Avslutade ligor</HeadingsTypography>
                <LeaguesContainer>
                  {endedLeagues.map((league) => getLeagueCard(league))}
                </LeaguesContainer>
              </Section>
            )}
          </>
        )}
        {!fetchLoading && [...creatorLeagues, ...participantLeagues, ...endedLeagues].length === 0 && (
          <>
            <NormalTypography variant="m">Du är inte med i några ligor ännu.</NormalTypography>
            <Section flexDirection="row" gap="l">
              <Section backgroundColor={theme.colors.white} padding={theme.spacing.m} borderRadius={theme.borderRadius.l} gap="m">
                <HeadingsTypography variant="h3">Gå med i liga</HeadingsTypography>
                <Input
                  label="Ange inbjudningskod"
                  type="text"
                  placeholder="t.ex. KNT342G9"
                  value={joinLeagueCodeValue}
                  onChange={(e) => setJoinLeagueCodeValue(e.currentTarget.value)}
                />
                <Button
                  onClick={handleJoinLeague}
                  loading={joinLeagueLoading === 'input'}
                  disabled={joinLeagueCodeValue.length === 0}
                >
                  Gå med
                </Button>
              </Section>
              {/* <Section backgroundColor={theme.colors.white} padding={theme.spacing.m} borderRadius={theme.borderRadius.l} gap="m">
                <HeadingsTypography variant="h3">Skapa liga</HeadingsTypography>
                <Button
                  onClick={() => setShowCreateLeagueModal(true)}
                >
                  Skapa liga
                </Button>
              </Section> */}
            </Section>
          </>
        )}
      </Section>
      {showCreateLeagueModal && (
        <Modal
          size="s"
          title="Skapa liga"
          onClose={() => setShowCreateLeagueModal(false)}
          mobileBottomSheet
        >
          <Section gap="m">
            <Input
              label="Namn"
              type="text"
              value={newLeagueName}
              onChange={(e) => setNewLeagueName(e.currentTarget.value)}
              fullWidth
              maxLength={30}
            />
            <Input
              label="Beskrivning"
              type="text"
              value={newLeagueDescription}
              onChange={(e) => setNewLeagueDescription(e.currentTarget.value)}
              fullWidth
            />
            <ModalButtons>
              <Button variant="secondary" onClick={() => setShowCreateLeagueModal(false)} fullWidth>
                Avbryt
              </Button>
              <Button
                variant="primary"
                onClick={handleCreateLeague}
                disabled={newLeagueName.length === 0}
                loading={createLeagueLoading}
                fullWidth
              >
                Skapa
              </Button>
            </ModalButtons>
          </Section>
        </Modal>
      )}
      {showJoinLeagueModal && (
        <Modal
          size="s"
          title="Gå med i liga"
          onClose={() => setShowJoinLeagueModal(false)}
          mobileBottomSheet
        >
          <Section gap="m">
            <Input
              label="Inbjudningskod"
              type="text"
              placeholder="t.ex. DHU8M2GL"
              value={joinLeagueCodeValueInModal}
              onChange={(e) => setJoinLeagueCodeValueInModal(e.currentTarget.value)}
              fullWidth
            />
            {showJoinLeagueError.length > 0 && (
              <NormalTypography variant="s" color={theme.colors.red}>{showJoinLeagueError}</NormalTypography>
            )}
            <ModalButtons>
              <Button variant="secondary" onClick={() => setShowJoinLeagueModal(false)} fullWidth>
                Avbryt
              </Button>
              <Button
                variant="primary"
                onClick={handleJoinLeague}
                disabled={joinLeagueCodeValueInModal.length === 0}
                loading={joinLeagueLoading === 'modal'}
                fullWidth
              >
                Gå med
              </Button>
            </ModalButtons>
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
  border-bottom: 1px solid ${theme.colors.silverLight};
  padding-bottom: ${theme.spacing.s};
`;

const LeaguesContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  grid-template-rows: auto;
  gap: ${theme.spacing.m};
  width: 100%;
  box-sizing: border-box;
`;

const LeagueCard = styled(motion.div)`
  background-color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.l};
  padding: ${theme.spacing.s};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xxs};
  cursor: pointer;
  min-height: 250px;
  box-sizing: border-box;

  @media ${devices.tablet} {
    padding: ${theme.spacing.m};
  }
`;

const ModalButtons = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  width: 100%;
  box-sizing: border-box;
`;

const BottomRow = styled.div`
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

const PointsContainer = styled.div<{ isHovered: boolean }>`
  width: fit-content;
  min-width: 40px;
  height: 40px;
  padding: ${theme.spacing.xxs};
  border-radius: 100px;
  background-color: ${({ isHovered }) => (isHovered ? theme.colors.primaryDark : theme.colors.silverLighter)};
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default PredictionLeaguesPage;
