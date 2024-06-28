import { useNavigate } from 'react-router-dom';
import { getDocs, collection, where, query, addDoc, updateDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react'
import { auth, db } from '../../config/firebase';
import { CollectionEnum } from '../../utils/Firebase';
import { generateLeagueInviteCode, withDocumentIdOnObjectsInArray, withDocumentIdOnObject } from '../../utils/helpers';
import { CreatePredictionLeagueInput, PredictionLeague, PredictionLeagueStanding, leagueMaximalParticipants } from '../../utils/League';
import styled from 'styled-components';
import { theme } from '../../theme';
import { EmphasisTypography, HeadingsTypography, NormalTypography } from '../../components/typography/Typography';
import { Section } from '../../components/section/Section';
import Button from '../../components/buttons/Button';
import { PlusCircle, UserPlus, Users } from '@phosphor-icons/react';
import Modal from '../../components/modal/Modal';
import Page from '../../components/Page';
import Input from '../../components/input/Input';
import { QueryEnum } from '../../utils/Routes';
import { getLeagueByInvitationCode } from '../../utils/firebaseHelpers';
import { useUser } from '../../context/UserContext';

const PredictionLeaguesPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const [fetchLoading, setFetchLoading] = useState(true);
  const [participantLeagues, setParticipantLeagues] = useState<Array<PredictionLeague>>([]);
  const [creatorLeagues, setCreatorLeagues] = useState<Array<PredictionLeague>>([]);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  const fetchLeagues = async () => {    
    try {
      const data = await getDocs(query(collection(db, CollectionEnum.LEAGUES), where("participants", "array-contains", currentUserId)));
      const currentUserLeagues = withDocumentIdOnObjectsInArray<PredictionLeague>(data.docs);      
      
      const creatorLeagues = currentUserLeagues.filter((league) => league.creatorId === currentUserId);
      const participantLeagues = currentUserLeagues.filter((league) => league.participants.includes(currentUserId ?? '---') && league.creatorId !== currentUserId);

      setParticipantLeagues(participantLeagues);
      setCreatorLeagues(creatorLeagues);
      setFetchLoading(false);
    } catch (err) {
      console.error(err);
      setFetchLoading(false);
    }
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
      standings: [],
      deadlineToJoin: oneMonthFromNow.toISOString(),
    }

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

    if (leagueData.participants.length >= leagueMaximalParticipants) {
      setShowJoinLeagueError('Ligan har redan full kapacitet');
      setJoinLeagueLoading(null);
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
        standings: [...leagueData.standings, newParticipantStandingsObj]
      });
      setShowJoinLeagueModal(false);
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
        <HeadingsTypography variant='h4' color={isHovered ? theme.colors.white : theme.colors.textDefault}>{league.name}</HeadingsTypography>
        <Section gap='s'>
          <NormalTypography variant='s' color={isHovered ? theme.colors.textLighter : theme.colors.textLight}>{league.description}</NormalTypography>
        </Section>
        <BottomRow>
          {league.gameWeeks && league.gameWeeks.length > 0 && (
            <HeadingsTypography variant='h6' color={isHovered ? theme.colors.textLighter : theme.colors.textLight}>Matchdag {league.gameWeeks?.length ?? 0}</HeadingsTypography>
          )}
          <UsersTag isHovered={isHovered}>
            <Users size={24} color={isHovered ? theme.colors.white : theme.colors.primary} />
            <EmphasisTypography variant='m' color={isHovered ? theme.colors.white : theme.colors.primary}>{league.participants.length} deltagare</EmphasisTypography>
          </UsersTag>
        </BottomRow>
      </LeagueCard>
    )
  }
  
  return (
    <Page>
      <PageHeader>
        <HeadingsTypography variant='h2'>Ligor</HeadingsTypography>
        <Section gap='s' flexDirection='row' alignItems='center' fitContent>
          <Button 
            variant='primary'
            size='s'
            onClick={() => setShowCreateLeagueModal(true)}
            icon={<PlusCircle size={24} weight='fill' color='white' />}
          >
            Skapa liga
          </Button>
          <Button 
            variant='secondary'
            size='s'
            onClick={() => setShowJoinLeagueModal(true)}
            icon={<UserPlus size={24} color={theme.colors.primary} />}
          >
            Gå med i liga
          </Button>
        </Section>
      </PageHeader>
      <Section gap="l" padding={`${theme.spacing.m} 0`}>
        {fetchLoading && <NormalTypography variant='m'>Laddar ligor...</NormalTypography>}
        {!fetchLoading && [...creatorLeagues, ...participantLeagues].length > 0 && (
          <>
            {creatorLeagues.length > 0 && (
              <Section gap='s'>
                <HeadingsTypography variant='h3'>Dina skapade ligor</HeadingsTypography>
                <LeaguesContainer>
                  {creatorLeagues.map((league) => getLeagueCard(league))}
                </LeaguesContainer>
              </Section>
            )}
            {participantLeagues.length > 0 && (
              <Section gap='s'>
                <HeadingsTypography variant='h3'>Ligor du deltar i</HeadingsTypography>
                <LeaguesContainer>
                  {participantLeagues.map((league) => getLeagueCard(league))}
                </LeaguesContainer>
              </Section>
            )}
          </>
        )}
        {!fetchLoading && [...creatorLeagues, ...participantLeagues].length === 0 && (
          <>
            <NormalTypography variant='m'>Du är inte med i några ligor ännu.</NormalTypography>
            <Section flexDirection='row' gap='l'>
              <Section backgroundColor={theme.colors.white} padding={theme.spacing.m} borderRadius={theme.borderRadius.l} gap="m">
                <HeadingsTypography variant='h3'>Gå med i liga</HeadingsTypography>
                <Input
                  label='Ange inbjudningskod'
                  type='text'
                  placeholder='t.ex. KNT342G9'
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
              <Section backgroundColor={theme.colors.white} padding={theme.spacing.m} borderRadius={theme.borderRadius.l} gap="m">
                <HeadingsTypography variant='h3'>Skapa liga</HeadingsTypography>
                <Button 
                  onClick={() => setShowCreateLeagueModal(true)}
                >
                  Skapa liga
                </Button>
              </Section>
            </Section>
          </>
        )}
      </Section>
      {showCreateLeagueModal && (
        <Modal
          size='s'
          title='Skapa liga'
          onClose={() => setShowCreateLeagueModal(false)}
        >
          <Section gap='m'>
            <Input
              label='Namn'
              type='text'
              value={newLeagueName}
              onChange={(e) => setNewLeagueName(e.currentTarget.value)}
              fullWidth
              maxLength={30}
            />
            <Input
              label='Beskrivning'
              type='text'
              value={newLeagueDescription}
              onChange={(e) => setNewLeagueDescription(e.currentTarget.value)}
              fullWidth
            />
            <ModalButtons>
              <Button variant='secondary' onClick={() => setShowCreateLeagueModal(false)} fullWidth>
                Avbryt
              </Button>
              <Button
                variant='primary'
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
          size='s'
          title='Gå med i liga'
          onClose={() => setShowJoinLeagueModal(false)}
        >
          <Section gap='m'>
            <Input
              label='Inbjudningskod'
              type='text'
              placeholder='t.ex. DHU8M2GL'
              value={joinLeagueCodeValueInModal}
              onChange={(e) => setJoinLeagueCodeValueInModal(e.currentTarget.value)}
              fullWidth
            />
            {showJoinLeagueError.length > 0 && (
              <NormalTypography variant='s' color={theme.colors.red}>{showJoinLeagueError}</NormalTypography>
            )}
            <ModalButtons>
              <Button variant='secondary' onClick={() => setShowJoinLeagueModal(false)} fullWidth>
                Avbryt
              </Button>
              <Button
                variant='primary'
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
  )
};

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${theme.spacing.m};
  border-bottom: 1px solid ${theme.colors.silver};
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
  border-radius: ${theme.borderRadius.m};
  padding: ${theme.spacing.m};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.s};
  cursor: pointer;
  min-height: 250px;
  box-sizing: border-box;
`;

const ModalButtons = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  width: 100%;
  box-sizing: border-box;
`;

const UsersTag = styled.div<{ isHovered: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  background-color: ${({ isHovered }) => isHovered ? theme.colors.primaryDarker : theme.colors.primaryBleach};
  padding: ${theme.spacing.xxs} ${theme.spacing.xs};
  border-radius: ${theme.borderRadius.m};
  width: fit-content;
`;

const BottomRow = styled.div`
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

export default PredictionLeaguesPage;

  // if no leagues, show input to enter league invitation code or create league

  // /league/:id page
  // render league info, participants, matches, predictions
  // if uid is in participants array, show content - if not, show button to accept invitation

  // when joining league, add uid to participants array and add league id to user "leagues" field?