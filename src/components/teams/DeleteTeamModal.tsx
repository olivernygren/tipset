import React, { useState } from 'react';
import { Trash } from '@phosphor-icons/react';
import { deleteDoc, doc } from 'firebase/firestore';
import { Team } from '../../utils/Team';
import { db } from '../../config/firebase';
import { theme } from '../../theme';
import { CollectionEnum } from '../../utils/Firebase';
import { errorNotify } from '../../utils/toast/toastHelpers';
import Button from '../buttons/Button';
import Input from '../input/Input';
import Modal from '../modal/Modal';
import { Section } from '../section/Section';
import { NormalTypography } from '../typography/Typography';

interface DeleteTeamModalProps {
  onClose: () => void;
  team: Team | null;
}

const DeleteTeamModal = ({ onClose, team }: DeleteTeamModalProps) => {
  const [deleteTeamInputValue, setDeleteTeamInputValue] = useState<string>('');
  const [deleteTeamLoading, setDeleteTeamLoading] = useState<boolean>(false);

  const handleDeleteTeam = async () => {
    setDeleteTeamLoading(true);

    try {
      await deleteDoc(doc(db, CollectionEnum.TEAMS, team?.documentId ?? ''));
      onClose();
      window.location.assign('/admin/players');
    } catch (e) {
      errorNotify('Något gick fel, försök igen senare');
    } finally {
      setDeleteTeamLoading(false);
    }
  };
  return (
    <Modal
      title="Radera lag"
      onClose={onClose}
      size="s"
    >
      <Section gap="m">
        <Section gap="xs">
          <NormalTypography variant="m">
            Vill du radera laget permanent? Detta kan ej ångras!
          </NormalTypography>
          <NormalTypography variant="m">
            Fyll i lagets namn för att bekräfta att du vill radera den.
          </NormalTypography>
        </Section>
        <Input
          value={deleteTeamInputValue}
          onChange={(e) => setDeleteTeamInputValue(e.target.value)}
          placeholder={team?.name}
          fullWidth
        />
        <Section flexDirection="row" gap="xs" alignItems="center">
          <Button
            onClick={onClose}
            variant="secondary"
            fullWidth
            color="red"
            textColor={theme.colors.red}
          >
            Avbryt
          </Button>
          <Button
            onClick={handleDeleteTeam}
            variant="primary"
            fullWidth
            color="red"
            disabled={deleteTeamInputValue !== team?.name}
            icon={<Trash size={20} color="white" weight="fill" />}
            loading={deleteTeamLoading}
          >
            Radera lag
          </Button>
        </Section>
      </Section>
    </Modal>
  );
};

export default DeleteTeamModal;
