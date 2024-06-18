import React, { useEffect, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { auth, db } from '../../../config/firebase';
import { generateLeagueInviteCode, withDocumentId } from '../../../utils/helpers';
import { Section } from '../../../components/section/Section';
import { theme } from '../../../theme';
import { HeadingsTypography, NormalTypography } from '../../../components/typography/Typography';
import styled from 'styled-components';
import IconButton from '../../../components/buttons/IconButton';
import { Trash } from '@phosphor-icons/react';
import { PredictionLeague, PredictionLeagueInput } from '../../../utils/League';
import { CollectionEnum } from '../../../utils/Firebase';
import Button from '../../../components/buttons/Button';
import Input from '../../../components/input/Input';

const AdminLeaguesPage = () => {
  const [leagues, setLeagues] = useState<Array<PredictionLeague>>([]);
  const [showCreateLeagueForm, setShowCreateLeagueForm] = useState<boolean>(false);
  const [leagueName, setLeagueName] = useState('');
  const [leagueDescription, setLeagueDescription] = useState('');

  const leagueCollectionRef = collection(db, CollectionEnum.LEAGUES);

  useEffect(() => {
    fetchLeagues();
  }, [])

  const fetchLeagues = async () => {
    try {
      const data = await getDocs(collection(db, CollectionEnum.LEAGUES));
      const leagues = withDocumentId<PredictionLeague>(data.docs);
      setLeagues(leagues);
    } catch (err) {
      console.error(err);
    }
  }

  const handleDeleteLeague = async (documentId: string) => {
    const leagueDoc = doc(db, 'leagues', documentId);
    await deleteDoc(leagueDoc);
    fetchLeagues(); 
  }

  // create /leagues page
  // render leagues that user is part of (fetch multiple league docs where uid is in participants array)
  // if no leagues, show input to enter league invitation code or create league

  // create /league/:id page
  // render league info, participants, matches, predictions
  // if uid is in participants array, show content - if not, show button to accept invitation

  // when joining league, add uid to participants array and add league id to user "leagues" field?

  const handleCreateLeague = async () => {
    if (leagueName.length === 0) return;

    const newLeague: PredictionLeagueInput = {
      name: leagueName,
      description: leagueDescription,
      creatorId: auth?.currentUser?.uid ?? '',
      participants: [auth?.currentUser?.uid ?? '']
    }

    try {
      await addDoc(leagueCollectionRef, {
        ...newLeague,
        inviteCode: generateLeagueInviteCode()
      });
      setShowCreateLeagueForm(false);
      fetchLeagues();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Section padding={theme.spacing.l} gap='l'>
      <HeadingsTypography variant='h2'>Ligor</HeadingsTypography>
      <Table>
        <TableHeader>
          <NormalTypography variant='s' color={theme.colors.textLight}>Namn</NormalTypography>
          <NormalTypography variant='s' color={theme.colors.textLight}>Inbjudningskod</NormalTypography>
          <NormalTypography variant='s' color={theme.colors.textLight}>Antal spelare</NormalTypography>
        </TableHeader>
        {leagues.length > 0 ? leagues.map((league) => (
          <TableRow key={league.documentId}>
            <NormalTypography variant='m'>{league.name}</NormalTypography>
            <NormalTypography variant='m'>{league.inviteCode}</NormalTypography>
            <NormalTypography variant='m'>{league.participants?.length}</NormalTypography>
            <IconButton 
              icon={<Trash size={20} weight='fill' />}
              colors={{ normal: theme.colors.red, hover: theme.colors.redDark, active: theme.colors.redDarker }}
              onClick={() => handleDeleteLeague(league.documentId)}
            />
          </TableRow>
        )) : (
          <TableRow>
            <NormalTypography variant='m'>Inga ligor hittades</NormalTypography>
          </TableRow>
        )}
      </Table>
      <Button 
        variant={showCreateLeagueForm ? 'secondary' : 'primary'} 
        size='m'
        onClick={() => setShowCreateLeagueForm(!showCreateLeagueForm)}
      >
        {showCreateLeagueForm ? 'Stäng' : 'Skapa liga'}
      </Button>
      {showCreateLeagueForm && (
        <Section gap='s'>
          <HeadingsTypography variant='h5'>Skapa liga</HeadingsTypography>
          <Input
            type='text'
            placeholder='Namn'
            value={leagueName}
            onChange={(e) => setLeagueName(e.currentTarget.value)}
          />
          <Input
            type='text'
            placeholder='Beskrivning'
            value={leagueDescription}
            onChange={(e) => setLeagueDescription(e.currentTarget.value)}
          />
          <Button variant='primary' size='m' onClick={handleCreateLeague}>Skapa</Button>
        </Section>
      )}
    </Section>
  )
};

const Table = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  background-color: ${theme.colors.white};
  gap: ${theme.spacing.xxs};
  border-radius: ${theme.borderRadius.m};
  padding: ${theme.spacing.xxs};
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 44px;
  padding: ${theme.spacing.xs} 0;
  margin: 0 ${theme.spacing.xs};
  border-bottom: 1px solid ${theme.colors.silverLight};
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 44px;
  padding: 0 ${theme.spacing.xs};
  align-items: center;
  height: 48px;
`;

export default AdminLeaguesPage;