import { addDoc, collection } from 'firebase/firestore';
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

interface CreateTeamModalProps {
  onClose: () => void;
  refetchTeams: () => void;
}

const CreateTeamModal = ({ onClose, refetchTeams }: CreateTeamModalProps) => {
  const [newTeamName, setNewTeamName] = useState<string>('');
  const [newTeamShortName, setNewTeamShortName] = useState<string>('');
  const [newTeamLogoUrl, setNewTeamLogoUrl] = useState<string>('');
  const [newTeamPrimaryColor, setNewTeamPrimaryColor] = useState<string>('');
  const [newTeamStadium, setNewTeamStadium] = useState<string>('');
  const [newTeamCountry, setNewTeamCountry] = useState<string>('');

  const [creationLoading, setCreationLoading] = useState<boolean>(false);

  const isValid = newTeamName && newTeamLogoUrl && newTeamPrimaryColor && newTeamStadium && newTeamCountry;

  const handleCreateTeam = async () => {
    setCreationLoading(true);

    const newTeamObject: Team = {
      name: newTeamName,
      shortName: newTeamShortName,
      logoUrl: newTeamLogoUrl,
      teamPrimaryColor: newTeamPrimaryColor,
      stadium: newTeamStadium,
      country: newTeamCountry,
      players: [],
    };

    if (!isValid) {
      errorNotify('Fyll i nödvändig information');
      return;
    }

    try {
      await addDoc(collection(db, CollectionEnum.TEAMS), newTeamObject);
      refetchTeams();
    } catch (error) {
      errorNotify('Något gick fel');
    } finally {
      setCreationLoading(false);
      onClose();
    }
  };

  return (
    <Modal
      title="Skapa nytt lag"
      onClose={onClose}
      size="m"
      mobileBottomSheet
    >
      <Form>
        <Section flexDirection="row" gap="s">
          <Input
            label="Lagets namn"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            fullWidth
          />
          <Input
            label="Kort namn"
            value={newTeamShortName}
            onChange={(e) => setNewTeamShortName(e.target.value)}
            fullWidth
          />
        </Section>
        <Section flexDirection="row" gap="s">
          <Input
            label="Logo-URL"
            value={newTeamLogoUrl}
            onChange={(e) => setNewTeamLogoUrl(e.target.value)}
            fullWidth
          />
          <Input
            label="Primärfärg"
            value={newTeamPrimaryColor}
            onChange={(e) => setNewTeamPrimaryColor(e.target.value)}
            fullWidth
          />
        </Section>
        <Section flexDirection="row" gap="s">
          <Input
            label="Arena"
            value={newTeamStadium}
            onChange={(e) => setNewTeamStadium(e.target.value)}
            fullWidth
          />
          <Input
            label="Land"
            value={newTeamCountry}
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
          onClick={handleCreateTeam}
          fullWidth
          disabled={!isValid || creationLoading}
          loading={creationLoading}
        >
          Skapa
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

export default CreateTeamModal;
