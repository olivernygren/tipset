import React, { useState } from 'react';
import styled from 'styled-components';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Player, PlayerStatusEnum } from '../../utils/Players';
import Modal from '../modal/Modal';
import { theme } from '../../theme';
import Avatar, { AvatarSize } from '../avatar/Avatar';
import { Section } from '../section/Section';
import { EmphasisTypography, NormalTypography } from '../typography/Typography';
import Button from '../buttons/Button';
import { Team } from '../../utils/Team';
import { getPlayerStatusName, withDocumentIdOnObject } from '../../utils/helpers';
import { db } from '../../config/firebase';
import { CollectionEnum } from '../../utils/Firebase';
import { errorNotify } from '../../utils/toast/toastHelpers';

interface EditPlayerStatusModalProps {
  onClose: () => void;
  refetchPlayers: () => void;
  player: Player | null;
  teamId: string;
}

const EditPlayerStatusModal = ({
  onClose, refetchPlayers, player, teamId,
}: EditPlayerStatusModalProps) => {
  const [currentStatus, setCurrentStatus] = useState<PlayerStatusEnum>(player?.status ?? PlayerStatusEnum.AVAILABLE);
  const [loading, setLoading] = useState<boolean>(false);

  const handleUpdatePlayerStatus = async () => {
    setLoading(true);

    if (!player) {
      return;
    }

    const playerObject: Player = {
      ...player,
      status: currentStatus,
    };

    try {
      const teamDoc = await getDoc(doc(db, CollectionEnum.TEAMS, teamId));
      const teamData = withDocumentIdOnObject<Team>(teamDoc);

      if (teamData) {
        const updatedTeam = {
          ...teamData,
          players: teamData.players?.map((p) => (p.id === player.id ? playerObject : p)),
        };

        await updateDoc(doc(db, CollectionEnum.TEAMS, teamId), updatedTeam);
      }

      refetchPlayers();
    } catch (error) {
      errorNotify('Något gick fel');
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <Modal
      title="Ändra status för spelare"
      onClose={onClose}
    >
      <ModalContent>
        <Section
          flexDirection="row"
          gap="xxxs"
          alignItems="center"
          backgroundColor={theme.colors.silverLighter}
          padding={`${theme.spacing.xxxs} ${theme.spacing.m} ${theme.spacing.xxxs} ${theme.spacing.xxxs}`}
          borderRadius={theme.borderRadius.m}
        >
          <Avatar
            src={player?.externalPictureUrl ?? player?.picture ?? '/images/players/placeholder-fancy.png'}
            alt={player?.name}
            size={AvatarSize.M}
            showBorder
            noPadding
            objectFit="cover"
            backgroundColor={theme.colors.silverLight}
          />
          <EmphasisTypography variant="m">{player?.name}</EmphasisTypography>
        </Section>
        <StatusCards>
          {Object.values(PlayerStatusEnum).map((status) => (
            <StatusOptionCard
              key={status}
              selected={currentStatus === status}
              onClick={() => setCurrentStatus(status)}
            >
              <NormalTypography variant="m" color={theme.colors.textDefault}>
                {getPlayerStatusName(status)}
              </NormalTypography>
            </StatusOptionCard>
          ))}
        </StatusCards>
        <Button
          fullWidth
          onClick={handleUpdatePlayerStatus}
          loading={loading}
          disabled={loading}
        >
          Spara
        </Button>
      </ModalContent>
    </Modal>
  );
};

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.s};
`;

const StatusOptionCard = styled.div<{ selected: boolean }>`
  display: flex;
  align-items: center;
  padding: ${theme.spacing.s};
  border-radius: ${theme.borderRadius.m};
  background-color: ${({ selected }) => (selected ? theme.colors.primaryBleach : theme.colors.white)};
  border: 1px solid ${({ selected }) => (selected ? theme.colors.primaryLight : theme.colors.silverLight)};
  box-shadow: 0px 2px 0px 0px rgba(0, 0, 0, 0.06);
  color: ${({ selected }) => (selected ? theme.colors.white : theme.colors.black)};
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;

  &:hover {
    background-color: ${({ selected }) => (selected ? theme.colors.primaryBleach : theme.colors.silverLighter)};
    color: ${theme.colors.white};
  }
`;

const StatusCards = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xxs};
`;

export default EditPlayerStatusModal;
