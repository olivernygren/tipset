import {
  addDoc, collection, doc, updateDoc,
} from 'firebase/firestore';
import React, { useState } from 'react';
import styled from 'styled-components';
import { db } from '../../config/firebase';
import { theme } from '../../theme';
import { CollectionEnum } from '../../utils/Firebase';
import { Team } from '../../utils/Team';
import { errorNotify } from '../../utils/toast/toastHelpers';
import Button from '../buttons/Button';
import Input from '../input/Input';
import Modal from '../modal/Modal';
import { Section } from '../section/Section';

interface EditTeamModalProps {
  onClose: () => void;
  refetchTeam: () => void;
  team: Team | null;
}

const EditTeamModal = ({ onClose, refetchTeam, team }: EditTeamModalProps) => {
  const [teamName, setNewTeamName] = useState<string>(team?.name ?? '');
  const [teamShortName, setNewTeamShortName] = useState<string>(team?.shortName ?? '');
  const [teamLogoUrl, setNewTeamLogoUrl] = useState<string>(team?.logoUrl ?? '');
  const [teamPrimaryColor, setNewTeamPrimaryColor] = useState<string>(team?.teamPrimaryColor ?? '');
  const [teamStadium, setNewTeamStadium] = useState<string>(team?.stadium ?? '');
  const [teamCountry, setNewTeamCountry] = useState<string>(team?.country ?? '');

  const [creationLoading, setCreationLoading] = useState<boolean>(false);

  const isValid = teamName && teamLogoUrl && teamPrimaryColor && teamStadium && teamCountry;

  console.log(team);

  const handleUpdateTeam = async () => {
    if (!team || !team.documentId) {
      errorNotify('Något gick fel');
      return;
    }

    setCreationLoading(true);

    const updatedTeam: Team = {
      name: teamName,
      shortName: teamShortName,
      logoUrl: teamLogoUrl,
      teamPrimaryColor,
      stadium: teamStadium,
      country: teamCountry,
      players: team?.players ?? [],
    };

    if (!isValid) {
      errorNotify('Fyll i nödvändig information');
      return;
    }

    try {
      await updateDoc(doc(db, CollectionEnum.TEAMS, team.documentId), updatedTeam as any);
      onClose();
      refetchTeam();
    } catch (error) {
      console.log(error);

      errorNotify('Något gick fel');
    } finally {
      setCreationLoading(false);
    }
  };

  return (
    <Modal
      title="Redigera lag"
      onClose={onClose}
      size="m"
      mobileBottomSheet
    >
      <Form>
        <Section flexDirection="row" gap="s">
          <Input
            label="Lagets namn"
            value={teamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            fullWidth
          />
          <Input
            label="Kort namn"
            value={teamShortName}
            onChange={(e) => setNewTeamShortName(e.target.value)}
            fullWidth
          />
        </Section>
        <Section flexDirection="row" gap="s">
          <Input
            label="Logo-URL"
            value={teamLogoUrl}
            onChange={(e) => setNewTeamLogoUrl(e.target.value)}
            fullWidth
          />
          <Input
            label="Primärfärg"
            value={teamPrimaryColor}
            onChange={(e) => setNewTeamPrimaryColor(e.target.value)}
            fullWidth
          />
        </Section>
        <Section flexDirection="row" gap="s">
          <Input
            label="Arena"
            value={teamStadium}
            onChange={(e) => setNewTeamStadium(e.target.value)}
            fullWidth
          />
          <Input
            label="Land"
            value={teamCountry}
            onChange={(e) => setNewTeamCountry(e.target.value)}
            fullWidth
          />
        </Section>
      </Form>
      <ModalButtons>
        <Button
          variant="secondary"
          onClick={onClose}
          fullWidth
        >
          Avbryt
        </Button>
        <Button
          variant="primary"
          onClick={handleUpdateTeam}
          fullWidth
          disabled={!isValid || creationLoading}
          loading={creationLoading}
        >
          Uppdatera
        </Button>
      </ModalButtons>
    </Modal>
  );
};

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.s};
`;

const ModalButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.s};
  align-items: center;
`;

export default EditTeamModal;
