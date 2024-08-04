import React, { useState } from 'react';
import { PredictionLeague } from '../../utils/League';
import { devices, theme } from '../../theme';
import { Section } from '../section/Section';
import { HeadingsTypography } from '../typography/Typography';
import Input from '../input/Input';
import CustomDatePicker from '../input/DatePicker';
import Button from '../buttons/Button';
import { CollectionEnum } from '../../utils/Firebase';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import styled from 'styled-components';

interface EditLeagueViewProps {
  league: PredictionLeague;
  isCreator: boolean;
  refetchLeague: () => void;
}

const EditLeagueView = ({ league, refetchLeague, isCreator }: EditLeagueViewProps) => {
  const [name, setName] = useState<string>(league.name);
  const [description, setDescription] = useState<string>(league.description);
  const [deadlineToJoin, setDeadlineToJoin] = useState(new Date(league.deadlineToJoin));
  const [updateLoading, setUpdateLoading] = useState(false);

  if (!isCreator) return <></>;

  const handleUpdateLeague = async () => {
    setUpdateLoading(true);

    const updatedLeague = {
      ...league,
      name,
      description,
      deadlineToJoin: deadlineToJoin.toISOString()
    };

    try {
      await updateDoc(doc(db, CollectionEnum.LEAGUES, league.documentId), updatedLeague);
      refetchLeague();
    } catch (error) {
      console.error(error);
    };

    setUpdateLoading(false);
  };

  return (
    <Section
      backgroundColor={theme.colors.white}
      padding={theme.spacing.m}
      gap='m'
      borderRadius={theme.borderRadius.m}
    >
      <HeadingsTypography variant='h4'>Redigera liga</HeadingsTypography>
      <InputContainer>
        <Input
          label='Namn'
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />
        <Input
          label='Beskrivning'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
        />
        <CustomDatePicker
          label='Deadline att gå med'
          selectedDate={deadlineToJoin}
          onChange={(date) => setDeadlineToJoin(date!)}
          fullWidth
        />
      </InputContainer>
      <Button
        variant='primary'
        onClick={handleUpdateLeague}
        loading={updateLoading}
        disabled={name.length === 0 || deadlineToJoin < new Date()}
      >
        Spara
      </Button>
    </Section>
  )
};

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.s};

  @media ${devices.tablet} {
    flex-direction: row;
    gap: ${theme.spacing.m};
    align-items: center;
  }
`;

export default EditLeagueView;