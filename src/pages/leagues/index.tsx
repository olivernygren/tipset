import { getDocs, collection, where, query, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react'
import { auth, db } from '../../config/firebase';
import { CollectionEnum } from '../../utils/Firebase';
import { generateLeagueInviteCode, withDocumentIdOnObjectsInArray, withDocumentIdOnObject } from '../../utils/helpers';
import { CreatePredictionLeagueInput, PredictionLeague } from '../../utils/League';
import styled from 'styled-components';
import { theme } from '../../theme';
import { HeadingsTypography, NormalTypography } from '../../components/typography/Typography';
import { Section } from '../../components/section/Section';
import Button from '../../components/buttons/Button';
import { PlusCircle, UserPlus } from '@phosphor-icons/react';
import Modal from '../../components/modal/Modal';
import Page from '../../components/Page';
import Input from '../../components/input/Input';

const PredictionLeaguesPage = () => {
  const [fetchLoading, setFetchLoading] = useState(true);
  const [participantLeagues, setParticipantLeagues] = useState<Array<PredictionLeague>>([]);
  const [creatorLeagues, setCreatorLeagues] = useState<Array<PredictionLeague>>([]);
  const [newLeagueName, setNewLeagueName] = useState<string>('');
  const [newLeagueDescription, setNewLeagueDescription] = useState<string>('');
  const [showCreateLeagueModal, setShowCreateLeagueModal] = useState<boolean>(false);
  const [showJoinLeagueModal, setShowJoinLeagueModal] = useState<boolean>(false);
  const [joinLeagueCodeValue, setJoinLeagueCodeValue] = useState<string>('');
  const [showJoinLeagueError, setShowJoinLeagueError] = useState<string>('');

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

      // if (participantLeagues.length === 0 && creatorLeagues.length === 0) {
      //   setShowJoinLeagueModal(true);
      // }
    } catch (err) {
      console.error(err);
      setFetchLoading(false);
    }
  };

  const handleCreateLeague = async () => {
    const today = new Date();
    const oneMonthFromNow = new Date(today.setMonth(today.getMonth() + 1));

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
  };

  const getLeagueByInvitationCode = async (inviteCode: string) => {
    const q = query(collection(db, CollectionEnum.LEAGUES), where("inviteCode", "==", inviteCode));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const leagueDoc = querySnapshot.docs[0];
      return leagueDoc;
    } else {
      console.log('No such document!');
      return null;
    }
  }

  const handleJoinLeague = async () => {
    setShowJoinLeagueError('');
  
    const leagueDoc = await getLeagueByInvitationCode(joinLeagueCodeValue);
  
    if (!leagueDoc) {
      setShowJoinLeagueError('Felaktig inbjudningskod');
      return;
    }
  
    const leagueData = withDocumentIdOnObject<PredictionLeague>(leagueDoc);
  
    console.log(leagueData);
    console.log('currentUserId', currentUserId);
  
    if (leagueData.participants.includes(currentUserId)) {
      console.log('already in league');
      setShowJoinLeagueError('Du är redan med i denna liga');
      return;
    }
  
    try {
      await updateDoc(leagueDoc.ref, { participants: [...leagueData.participants, currentUserId] });
      setShowJoinLeagueModal(false);
      fetchLeagues();
    } catch (e) {
      console.error(e);
      setShowJoinLeagueError('Ett fel uppstod. Försök igen');
    }
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
        {fetchLoading ? <NormalTypography variant='m'>Laddar ligor...</NormalTypography> : (
          <>
            <Section gap='s'>
              <HeadingsTypography variant='h3'>Dina skapade ligor</HeadingsTypography>
              <LeaguesContainer>
                {creatorLeagues.length > 0 ? creatorLeagues.map((league) => (
                  <LeagueCard key={league.documentId}>
                    <HeadingsTypography variant='h4'>{league.name}</HeadingsTypography>
                    <Section gap='s'>
                      <NormalTypography variant='s' color={theme.colors.textLighter}>{league.description}</NormalTypography>
                    </Section>
                  </LeagueCard>
                )) : (
                  <NormalTypography variant='m'>Du har inte skapat några ligor ännu.</NormalTypography>
                )}
              </LeaguesContainer>
            </Section>
            <Section gap='s'>
              <HeadingsTypography variant='h3'>Andra ligor du deltar i</HeadingsTypography>
              <LeaguesContainer>
                {participantLeagues.length > 0 ? participantLeagues.map((league) => (
                  <LeagueCard key={league.documentId}>
                    <HeadingsTypography variant='h4'>{league.name}</HeadingsTypography>
                    <Section gap='s'>
                      <NormalTypography variant='s' color={theme.colors.textLighter}>{league.description}</NormalTypography>
                    </Section>
                  </LeagueCard>
                )) : (
                  <NormalTypography variant='m'>Du har inte gått med i några ligor ännu.</NormalTypography>
                )}
              </LeaguesContainer>
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
              <Button variant='primary' onClick={handleCreateLeague} disabled={newLeagueName.length === 0}fullWidth>
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
              value={joinLeagueCodeValue}
              onChange={(e) => setJoinLeagueCodeValue(e.currentTarget.value)}
              fullWidth
            />
            {showJoinLeagueError.length > 0 && (
              <NormalTypography variant='s' color={theme.colors.red}>{showJoinLeagueError}</NormalTypography>
            )}
            <ModalButtons>
              <Button variant='secondary' onClick={() => setShowJoinLeagueModal(false)} fullWidth>
                Avbryt
              </Button>
              <Button variant='primary' onClick={handleJoinLeague} disabled={joinLeagueCodeValue.length === 0} fullWidth>
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

const LeagueCard = styled.div`
  background-color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.m};
  padding: ${theme.spacing.m};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.s};
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xxs};
  width: 100%;
  box-sizing: border-box;
`;

const ModalButtons = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  width: 100%;
  box-sizing: border-box;
`;

export default PredictionLeaguesPage;

  // render leagues that user is part of (fetch multiple league docs where uid is in participants array)
  // if no leagues, show input to enter league invitation code or create league

  // create /league/:id page
  // render league info, participants, matches, predictions
  // if uid is in participants array, show content - if not, show button to accept invitation

  // when joining league, add uid to participants array and add league id to user "leagues" field?