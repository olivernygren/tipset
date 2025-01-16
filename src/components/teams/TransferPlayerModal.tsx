import React, { useState } from 'react';
import styled from 'styled-components';
import {
  collection, doc, getDocs, query, updateDoc, where,
} from 'firebase/firestore';
import { Player } from '../../utils/Players';
import { Team } from '../../utils/Team';
import Modal from '../modal/Modal';
import { EmphasisTypography, NormalTypography } from '../typography/Typography';
import Avatar, { AvatarSize } from '../avatar/Avatar';
import { Section } from '../section/Section';
import { theme } from '../../theme';
import ClubAvatar from '../avatar/ClubAvatar';
import Button from '../buttons/Button';
import SelectImitation from '../input/SelectImitation';
import SelectTeamModal from '../game/SelectTeamModal';
import { TeamType } from '../../utils/Fixture';
import { CollectionEnum } from '../../utils/Firebase';
import { db } from '../../config/firebase';
import { errorNotify, successNotify } from '../../utils/toast/toastHelpers';
import { withDocumentIdOnObject } from '../../utils/helpers';

interface TransferPlayerModalProps {
  player: Player | null;
  currentTeam: Team | null;
  onClose: () => void;
  refetch: () => void;
}

const TransferPlayerModal = ({
  player, currentTeam, onClose, refetch,
}: TransferPlayerModalProps) => {
  const [newTeam, setNewTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedTeamModalOpen, setSelectedTeamModalOpen] = useState<boolean>(false);

  const fetchTeamByName = async (teamName: string) => {
    const teamsRef = collection(db, CollectionEnum.TEAMS);
    const q = query(teamsRef, where('name', '==', teamName));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const teamDoc = querySnapshot.docs[0];
      const teamData = withDocumentIdOnObject<Team>(teamDoc);

      setNewTeam(teamData);
    }
  };

  const handleTransferPlayer = async () => {
    if (!player || !newTeam || !currentTeam) {
      return;
    }

    setLoading(true);

    try {
      const currentTeamPlayers = currentTeam.players?.filter((p) => p.id !== player.id) ?? [];
      const newTeamPlayers = newTeam.players ? [...newTeam.players, player] : [player];

      const updatedCurrentTeam = {
        ...currentTeam,
        players: currentTeamPlayers,
      };

      const updatedNewTeam = {
        ...newTeam,
        players: newTeamPlayers,
      };

      await updateDoc(doc(db, CollectionEnum.TEAMS, currentTeam.documentId ?? ''), updatedCurrentTeam);
      await updateDoc(doc(db, CollectionEnum.TEAMS, newTeam.documentId ?? ''), updatedNewTeam);

      successNotify('Spelaren har bytt lag');
      onClose();
      refetch();
    } catch (error) {
      errorNotify('Något gick fel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        title="Övergång av spelare"
        onClose={onClose}
        mobileFullScreen
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
              size={AvatarSize.L}
              showBorder
              noPadding
              objectFit="cover"
              backgroundColor={theme.colors.silverLight}
              customBorderWidth={1}
            />
            <Section>
              <EmphasisTypography variant="m">{player?.name}</EmphasisTypography>
              <Section flexDirection="row" alignItems="center" gap="xxxs">
                <NormalTypography variant="s" color={theme.colors.silverDarker}>{currentTeam?.name}</NormalTypography>
                <ClubAvatar
                  logoUrl={currentTeam?.logoUrl ?? ''}
                  clubName={currentTeam?.name ?? ''}
                  size={AvatarSize.XS}
                />
              </Section>
            </Section>
          </Section>
          <Section gap="xxs">
            <EmphasisTypography variant="m">Välj ny klubb</EmphasisTypography>
            <SelectImitation
              value={newTeam?.name ?? ''}
              placeholder="Välj"
              onClick={() => setSelectedTeamModalOpen(true)}
              fullWidth
            />
          </Section>
        </ModalContent>
        <ModalButtons>
          <Button
            variant="secondary"
            onClick={onClose}
            fullWidth
          >
            Avbryt
          </Button>
          <Button
            onClick={handleTransferPlayer}
            disabled={!newTeam || loading}
            fullWidth
            loading={loading}
          >
            Bekräfta övergång
          </Button>
        </ModalButtons>
      </Modal>
      {selectedTeamModalOpen && (
        <SelectTeamModal
          teamType={TeamType.CLUBS}
          value={newTeam ?? undefined}
          onClose={() => setSelectedTeamModalOpen(false)}
          onSave={(team) => {
            // setNewTeam(team);
            fetchTeamByName(team.name);
            setSelectedTeamModalOpen(false);
          }}
        />
      )}
    </>
  );
};

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.m};
  flex-grow: 1;
`;

const ModalButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.s};
  align-items: center;
  margin-top: auto;
`;

export default TransferPlayerModal;
