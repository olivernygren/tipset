import React, { useState } from 'react';
import { Section } from '../section/Section';
import { LeagueGameWeek, PredictionLeague } from '../../utils/League';
import { HeadingsTypography } from '../typography/Typography';
import Button from '../buttons/Button';
import { Divider } from '../Divider';
import CustomDatePicker from '../input/DatePicker';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { CollectionEnum } from '../../utils/Firebase';
import { withDocumentIdOnObject } from '../../utils/helpers';

interface EditGameWeekViewProps {
  gameWeek: LeagueGameWeek;
  onClose: () => void;
}

const EditGameWeekView = ({ gameWeek, onClose }: EditGameWeekViewProps) => {
  const [deadline, setDeadline] = useState<Date>(new Date(gameWeek.deadline));
  const [updateLoading, setUpdateLoading] = useState<boolean>(false);

  const handleUpdateGameWeek = async () => {
    setUpdateLoading(true);

    const updatedGameWeek = {
      ...gameWeek,
      deadline: deadline.toISOString()
    }
    
    try {
      const leagueDoc = await getDoc(doc(db, CollectionEnum.LEAGUES, gameWeek.leagueId));
      const leagueData = withDocumentIdOnObject<PredictionLeague>(leagueDoc);
      
      const updatedGameWeeks = leagueData.gameWeeks?.map(week => {
        if (week.round === gameWeek.round) {
          return updatedGameWeek;
        }
        return week;
      });
      
      await updateDoc(doc(db, CollectionEnum.LEAGUES, gameWeek.leagueId), {
        gameWeeks: updatedGameWeeks
      });
    } catch (error) {
      console.error(error);
    }

    setUpdateLoading(false);
    onClose();
  }

  return (
    <Section gap='m'>
      <Divider />
      <HeadingsTypography variant='h5'>Redigera Omgång {gameWeek.round}</HeadingsTypography>
      <Section gap='xs' fitContent>
        <CustomDatePicker
          label='Deadline'
          selectedDate={deadline}
          onChange={(date) => setDeadline(date!)}
          fullWidth
        />
      </Section>
      <Section flexDirection='row' gap='s' alignItems='center'>
        <Button variant="secondary" onClick={onClose}>
          Avbryt
        </Button>
        <Button onClick={handleUpdateGameWeek} loading={updateLoading}>
          Spara ändringar
        </Button>
      </Section>
    </Section>
  )
}

export default EditGameWeekView;