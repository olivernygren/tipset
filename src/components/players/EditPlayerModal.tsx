import React, { useState } from 'react';
import styled from 'styled-components';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import {
  GeneralPositionEnum, ExactPositionEnum, Player, CountryEnum,
} from '../../utils/Players';
import Button from '../buttons/Button';
import CustomDatePicker from '../input/DatePicker';
import Input from '../input/Input';
import Select from '../input/Select';
import Modal from '../modal/Modal';
import { Section } from '../section/Section';
import { EmphasisTypography } from '../typography/Typography';
import { theme } from '../../theme';
import { getExactPositionOptions, withDocumentIdOnObject } from '../../utils/helpers';
import { errorNotify } from '../../utils/toast/toastHelpers';
import { db } from '../../config/firebase';
import { CollectionEnum } from '../../utils/Firebase';
import { Team } from '../../utils/Team';
import Avatar, { AvatarSize } from '../avatar/Avatar';

interface EditPlayerModalProps {
  player: Player;
  onClose: () => void;
  refetchPlayers: () => void;
  teamId: string;
}

const EditPlayerModal = ({
  onClose, refetchPlayers, teamId, player,
}: EditPlayerModalProps) => {
  const [playerName, setPlayerName] = useState<string>(player.name ?? '');
  const [playerGeneralPosition, setPlayerGeneralPosition] = useState<GeneralPositionEnum>(player.position.general ?? GeneralPositionEnum.GK);
  const [playerSpecificPosition, setPlayerSpecificPosition] = useState<ExactPositionEnum>(player.position.exact ?? ExactPositionEnum.GK);
  const [playerCustomId, setPlayerCustomId] = useState<string>(player.id ?? '');
  const [playerImageFilePath, setPlayerImageFilePath] = useState<string>(player.picture ?? '');
  const [playerExternalPictureURL, setPlayerExternalPictureURL] = useState<string>(player.externalPictureUrl ?? '');
  const [playerCountry, setPlayerCountry] = useState<string>(player.country ?? '');
  const [playerBirthDate, setPlayerBirthDate] = useState<Date>(player.birthDate ? new Date(player.birthDate) : new Date());
  const [playerNumber, setPlayerNumber] = useState<number>(player.number ?? 1);

  const [editPlayerLoading, setEditPlayerLoading] = useState<boolean>(false);

  const isValid = playerName && (playerImageFilePath || playerExternalPictureURL) && playerCountry;

  const handleUpdatePlayer = async () => {
    setEditPlayerLoading(true);

    const playerObject: Player = {
      id: playerCustomId,
      name: playerName,
      position: {
        general: playerGeneralPosition,
        exact: playerSpecificPosition,
      },
      country: playerCountry as CountryEnum,
      ...(playerImageFilePath && { picture: `/images/players/${playerImageFilePath}` }),
      ...(playerBirthDate && { birthDate: playerBirthDate.toISOString() }),
      ...(playerNumber && { number: playerNumber }),
      ...(playerExternalPictureURL && { externalPictureUrl: playerExternalPictureURL }),
    };

    if (!isValid) {
      errorNotify('Fyll i nödvändig information');
      return;
    }

    try {
      const teamDoc = await getDoc(doc(db, CollectionEnum.TEAMS, teamId));
      const teamData = withDocumentIdOnObject<Team>(teamDoc);

      if (teamData) {
        const updatedTeam = {
          ...teamData,
          players: teamData.players?.map((player) => (player.id === playerCustomId ? playerObject : player)),
        };

        await updateDoc(doc(db, CollectionEnum.TEAMS, teamId), updatedTeam);
      }

      refetchPlayers();
    } catch (error) {
      errorNotify('Något gick fel');
    } finally {
      setEditPlayerLoading(false);
      onClose();
    }
  };

  const handleCloseAndReset = () => {
    onClose();
    setPlayerName('');
    setPlayerGeneralPosition(GeneralPositionEnum.GK);
    setPlayerSpecificPosition(ExactPositionEnum.GK);
    setPlayerCustomId('');
    setPlayerImageFilePath('');
    setPlayerCountry('');
    setPlayerBirthDate(new Date());
    setPlayerNumber(1);
    setPlayerExternalPictureURL('');
    setEditPlayerLoading(false);
  };

  const handleEditPlayerNameValue = (value: string) => {
    setPlayerName(value);
    setPlayerImageFilePath(`${value.toLowerCase().replace(' ', '-')}.png`);
  };

  const handleChangeGeneralPosition = (value: string) => {
    setPlayerGeneralPosition(value as GeneralPositionEnum);
    setPlayerSpecificPosition(getExactPositionOptions(value as GeneralPositionEnum)[0]);
  };

  return (
    <Modal
      title="Redigera spelare"
      onClose={handleCloseAndReset}
      size="m"
      mobileBottomSheet
    >
      <Section
        flexDirection="row"
        gap="xxxs"
        alignItems="center"
        backgroundColor={theme.colors.silverLighter}
        padding={`${theme.spacing.xxxs} ${theme.spacing.m} ${theme.spacing.xxxs} ${theme.spacing.xxxs}`}
        borderRadius={theme.borderRadius.m}
      >
        <Avatar
          src={player.externalPictureUrl ?? player.picture ?? ''}
          alt={player.name}
          size={AvatarSize.M}
          showBorder
          noPadding
          objectFit="cover"
          backgroundColor={theme.colors.silverLight}
        />
        <EmphasisTypography variant="m">{player.name}</EmphasisTypography>
      </Section>
      <Form>
        <Input
          label="Namn"
          value={playerName}
          onChange={(e) => handleEditPlayerNameValue(e.currentTarget.value)}
          fullWidth
        />
        <Section flexDirection="row" gap="s" alignItems="center">
          <LabeledSelect>
            <EmphasisTypography variant="s">Position (generell)</EmphasisTypography>
            <Select
              value={playerGeneralPosition}
              onChange={(value) => handleChangeGeneralPosition(value as GeneralPositionEnum)}
              options={Object.values(GeneralPositionEnum).map((position) => ({ value: position, label: position }))}
              fullWidth
            />
          </LabeledSelect>
          <LabeledSelect>
            <EmphasisTypography variant="s">Position (exakt)</EmphasisTypography>
            <Select
              value={playerSpecificPosition}
              onChange={(value) => setPlayerSpecificPosition(value as ExactPositionEnum)}
              options={getExactPositionOptions(playerGeneralPosition).map((position) => ({ value: position, label: position }))}
              fullWidth
            />
          </LabeledSelect>
        </Section>
        <Section flexDirection="row" gap="s" alignItems="center">
          <Input
            type="number"
            label="Tröjnummer"
            value={playerNumber.toString()}
            onChange={(e) => setPlayerNumber(Number(e.currentTarget.value))}
            fullWidth
          />
          <CustomDatePicker
            label="Födelsedatum"
            selectedDate={playerBirthDate}
            onChange={(date) => setPlayerBirthDate(date!)}
            fullWidth
            includeTime={false}
          />
          <Input
            label="Land"
            name="new-player-country-input"
            value={playerCountry}
            onChange={(e) => setPlayerCountry(e.currentTarget.value)}
            fullWidth
          />
        </Section>
        <Section flexDirection="row" gap="s" alignItems="center">
          <Input
            label="Filnamn lokal bild"
            value={playerImageFilePath}
            onChange={(e) => setPlayerImageFilePath(e.currentTarget.value)}
            fullWidth
          />
          <Input
            label="Extern bild-URL"
            value={playerExternalPictureURL}
            onChange={(e) => setPlayerExternalPictureURL(e.currentTarget.value)}
            fullWidth
          />
        </Section>
        <Input
          label="Custom ID (valfritt)"
          value={playerCustomId}
          onChange={(e) => setPlayerCustomId(e.currentTarget.value)}
          fullWidth
        />
      </Form>
      <ModalButtons>
        <Button
          variant="secondary"
          onClick={handleCloseAndReset}
          fullWidth
        >
          Avbryt
        </Button>
        <Button
          variant="primary"
          onClick={handleUpdatePlayer}
          fullWidth
          disabled={!isValid || editPlayerLoading}
          loading={editPlayerLoading}
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

const LabeledSelect = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xxs};
  width: 100%;
  box-sizing: border-box;
`;

export default EditPlayerModal;
