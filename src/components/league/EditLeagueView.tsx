import React, { useState } from 'react';
import { PredictionLeague } from '../../utils/League';
import { devices, theme } from '../../theme';
import { Section } from '../section/Section';
import { HeadingsTypography, NormalTypography } from '../typography/Typography';
import Input from '../input/Input';
import CustomDatePicker from '../input/DatePicker';
import Button from '../buttons/Button';
import { CollectionEnum } from '../../utils/Firebase';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import styled from 'styled-components';
import { Divider } from '../Divider';
import Modal from '../modal/Modal';
import { errorNotify, successNotify } from '../../utils/toast/toastHelpers';

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
  const [showEndLeagueConfirmationModal, setShowEndLeagueConfirmationModal] = useState(false);
  const [endLeagueLoading, setEndLeagueLoading] = useState(false);

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
      successNotify('Ligan uppdaterad');
      refetchLeague();
    } catch (error) {
      errorNotify('Ett fel uppstod')
      console.error(error);
    };

    setUpdateLoading(false);
  };

  const handleEndLeague = async () => {
    setEndLeagueLoading(true);

    const updatedGameWeeks = league.gameWeeks?.map((gameWeek) => {
      return {
        ...gameWeek,
        hasEnded: true
      }
    });

    const updatedLeague = {
      ...league,
      gameWeeks: updatedGameWeeks,
      hasEnded: true
    };

    try {
      await updateDoc(doc(db, CollectionEnum.LEAGUES, league.documentId), updatedLeague);
      refetchLeague();
      setShowEndLeagueConfirmationModal(false);
    } catch (error) {
      errorNotify('Ett fel uppstod')
      console.error(error);
    };

    setEndLeagueLoading(false);
  }

  return (
    <>
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
          disabled={name.length === 0}
        >
          Spara
        </Button>
        <Divider />
        <HeadingsTypography variant='h4'>Avsluta liga</HeadingsTypography>
        <NormalTypography variant='m'>Att avsluta en liga innebär att inga fler omgångar kan skapas och inga fler poäng kommer delas ut. Du kommer fortfarande kunna se ligans tidigare omgångar och allas poäng.</NormalTypography>
        <Button
          color='red'
          onClick={() => setShowEndLeagueConfirmationModal(true)}
        >
          Avsluta liga
        </Button>
      </Section>
      {showEndLeagueConfirmationModal && (
        <Modal
          size="s"
          onClose={() => setShowEndLeagueConfirmationModal(false)}
          title="Dags att avsluta ligan?"
        >
          <NormalTypography variant='m'>Är du säker på att du vill avsluta ligan? Detta går inte att ångra.</NormalTypography>
          <Section gap='xs' flexDirection='row' alignItems='center'>
            <Button
              variant='secondary'
              onClick={() => setShowEndLeagueConfirmationModal(false)}
              fullWidth
            >
              Avbryt
            </Button>
            <Button
              variant='primary'
              color='red'
              onClick={handleEndLeague}
              fullWidth
              loading={endLeagueLoading}
            >
              Avsluta ligan
            </Button>
          </Section>
        </Modal>
      )}
    </>
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
    width: 100%;
    box-sizing: border-box;
  }
`;

export default EditLeagueView;