import { addDoc, collection } from 'firebase/firestore';
import React, { useState } from 'react';
import styled from 'styled-components';
import { db } from '../../config/firebase';
import { theme } from '../../theme';
import { CollectionEnum } from '../../utils/Firebase';
import { errorNotify } from '../../utils/toast/toastHelpers';
import Button from '../buttons/Button';
import Modal from '../modal/Modal';
import Textarea from '../textarea/Textarea';
import { convertFotMobTeamToTeam } from '../../utils/fotmobHelpers';

interface CreateTeamModalProps {
  onClose: () => void;
  refetchTeams: () => void;
}

const CreateTeamViaFotMobSnippetModal = ({ onClose, refetchTeams }: CreateTeamModalProps) => {
  const [snippet, setSnippet] = useState<string>('');

  const [creationLoading, setCreationLoading] = useState<boolean>(false);

  const handleCreateTeam = async () => {
    setCreationLoading(true);

    const newTeamObject = convertFotMobTeamToTeam(JSON.parse(snippet));

    try {
      await addDoc(collection(db, CollectionEnum.TEAMS), newTeamObject);
      refetchTeams();
    } catch (error) {
      console.log(error);

      errorNotify('Något gick fel');
    } finally {
      setCreationLoading(false);
      onClose();
    }
  };

  return (
    <Modal
      title="Skapa nytt lag via FotMob-snippet"
      onClose={onClose}
      size="m"
      mobileBottomSheet
    >
      <Textarea
        value={snippet}
        onChange={(e) => setSnippet(e.currentTarget.value)}
        placeholder="Klistra in FotMob-snippet här"
        autoFocus
        fullWidth
      />
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
          disabled={creationLoading}
          loading={creationLoading}
        >
          Skapa
        </Button>
      </ModalButtons>
    </Modal>
  );
};

const ModalButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.s};
  align-items: center;
`;

export default CreateTeamViaFotMobSnippetModal;
