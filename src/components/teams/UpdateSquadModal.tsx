import React, { useState } from 'react';
import styled from 'styled-components';
import {
  doc, updateDoc,
} from 'firebase/firestore';
import { theme } from '../../theme';
import { db } from '../../config/firebase';
import { CollectionEnum } from '../../utils/Firebase';
import { convertFotMobTeamToTeam } from '../../utils/fotmobHelpers';
import { errorNotify, successNotify } from '../../utils/toast/toastHelpers';
import Button from '../buttons/Button';
import Modal from '../modal/Modal';
import Textarea from '../textarea/Textarea';
import { Player } from '../../utils/Players';

interface UpdateSquadModalProps {
  teamId: string;
  currentPlayers: Array<Player>;
  onClose: () => void;
  refetchTeam: () => void;
}

const UpdateSquadModal = ({
  teamId, currentPlayers, onClose, refetchTeam,
}: UpdateSquadModalProps) => {
  const [snippet, setSnippet] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);

  const syncSquad = (currentPlayers: Array<Player>, newSquad: Array<Player>): Array<Player> => {
    const newSquadMap = new Map(newSquad.map((player) => [player.id, player]));

    const updatedSquad = currentPlayers.filter((player) => newSquadMap.has(player.id));

    newSquad.forEach((player) => {
      if (!currentPlayers.some((currentPlayer) => currentPlayer.id === player.id)) {
        updatedSquad.push(player);
      }
    });

    return updatedSquad;
  };

  const handleUpdateEntireSquad = async () => {
    setLoading(true);

    try {
      const teamFromSnippet = convertFotMobTeamToTeam(JSON.parse(snippet));
      const newSquad = teamFromSnippet.players ?? [];
      const updatedPlayers = syncSquad(currentPlayers, newSquad);

      await updateDoc(doc(db, CollectionEnum.TEAMS, teamId), {
        players: updatedPlayers,
      });

      successNotify('Truppen uppdaterades');
      refetchTeam();
    } catch (error) {
      errorNotify('Något gick fel');
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <Modal
      title="Uppdatera trupp via FotMob-snippet"
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
          onClick={handleUpdateEntireSquad}
          fullWidth
          disabled={loading}
          loading={loading}
        >
          Uppdatera trupp
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

export default UpdateSquadModal;
