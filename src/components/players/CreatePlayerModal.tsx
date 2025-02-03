import React, { useState } from 'react';
import styled from 'styled-components';
import {
  doc, getDoc, updateDoc,
} from 'firebase/firestore';
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
import { createRandomPlayerId, getExactPositionOptions, withDocumentIdOnObject } from '../../utils/helpers';
import { errorNotify, successNotify } from '../../utils/toast/toastHelpers';
import { db } from '../../config/firebase';
import { CollectionEnum } from '../../utils/Firebase';
import { Team } from '../../utils/Team';

interface CreatePlayerModalProps {
  onClose: () => void;
  refetchPlayers: () => void;
  teamId: string;
}

const CreatePlayerModal = ({ onClose, refetchPlayers, teamId }: CreatePlayerModalProps) => {
  const [newPlayerName, setNewPlayerName] = useState<string>('');
  const [newPlayerGeneralPosition, setNewPlayerGeneralPosition] = useState<GeneralPositionEnum>(GeneralPositionEnum.GK);
  const [newPlayerSpecificPosition, setNewPlayerSpecificPosition] = useState<ExactPositionEnum>(ExactPositionEnum.GK);
  const [newPlayerCustomId, setNewPlayerCustomId] = useState<string>('');
  const [newPlayerImageFilePath, setNewPlayerImageFilePath] = useState<string>('');
  const [newPlayerExternalPictureURL, setNewPlayerExternalPictureURL] = useState<string>('');
  const [newPlayerCountry, setNewPlayerCountry] = useState<string>('');
  const [newPlayerBirthDate, setNewPlayerBirthDate] = useState<Date>(new Date());
  const [newPlayerNumber, setNewPlayerNumber] = useState<number>(1);
  const [createPlayerLoading, setCreatePlayerLoading] = useState<boolean>(false);

  const isValid = newPlayerName && newPlayerCountry;

  const handleCreatePlayer = async () => {
    setCreatePlayerLoading(true);

    const newPlayerObject: Player = {
      id: newPlayerCustomId.length > 0 ? newPlayerCustomId : createRandomPlayerId(),
      name: newPlayerName,
      position: {
        general: newPlayerGeneralPosition,
        exact: newPlayerSpecificPosition,
      },
      country: newPlayerCountry as CountryEnum,
      ...(newPlayerImageFilePath && { picture: `/images/players/${newPlayerImageFilePath}` }),
      ...(newPlayerBirthDate && { birthDate: newPlayerBirthDate.toISOString() }),
      ...(newPlayerNumber && { number: newPlayerNumber }),
      ...(newPlayerExternalPictureURL && { externalPictureUrl: newPlayerExternalPictureURL }),
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
          players: [...teamData.players ?? [], newPlayerObject],
        };

        await updateDoc(doc(db, CollectionEnum.TEAMS, teamId), updatedTeam);
      }

      successNotify('Spelare skapad');
      refetchPlayers();
    } catch (error) {
      errorNotify('Något gick fel');
    } finally {
      setCreatePlayerLoading(false);
      onClose();
    }
  };

  const handleCloseAndReset = () => {
    onClose();
    setNewPlayerName('');
    setNewPlayerGeneralPosition(GeneralPositionEnum.GK);
    setNewPlayerSpecificPosition(ExactPositionEnum.GK);
    setNewPlayerCustomId('');
    setNewPlayerImageFilePath('');
    setNewPlayerCountry('');
    setNewPlayerBirthDate(new Date());
    setNewPlayerNumber(1);
    setNewPlayerExternalPictureURL('');
    setCreatePlayerLoading(false);
  };

  const handleChangeGeneralPosition = (value: string) => {
    setNewPlayerGeneralPosition(value as GeneralPositionEnum);
    setNewPlayerSpecificPosition(getExactPositionOptions(value as GeneralPositionEnum)[0]);
  };

  return (
    <Modal
      title="Skapa spelare"
      onClose={handleCloseAndReset}
      size="m"
      mobileBottomSheet
    >
      <Form>
        <Input
          label="Namn"
          value={newPlayerName}
          onChange={(e) => setNewPlayerName(e.currentTarget.value)}
          fullWidth
        />
        <Section flexDirection="row" gap="s" alignItems="center">
          <LabeledSelect>
            <EmphasisTypography variant="s">Position (generell)</EmphasisTypography>
            <Select
              value={newPlayerGeneralPosition}
              onChange={(value) => handleChangeGeneralPosition(value as GeneralPositionEnum)}
              options={Object.values(GeneralPositionEnum).map((position) => ({ value: position, label: position }))}
              fullWidth
            />
          </LabeledSelect>
          <LabeledSelect>
            <EmphasisTypography variant="s">Position (exakt)</EmphasisTypography>
            <Select
              value={newPlayerSpecificPosition}
              onChange={(value) => setNewPlayerSpecificPosition(value as ExactPositionEnum)}
              options={getExactPositionOptions(newPlayerGeneralPosition).map((position) => ({ value: position, label: position }))}
              fullWidth
            />
          </LabeledSelect>
        </Section>
        <Section flexDirection="row" gap="s" alignItems="center">
          <Input
            type="number"
            label="Tröjnummer"
            value={newPlayerNumber.toString()}
            onChange={(e) => setNewPlayerNumber(Number(e.currentTarget.value))}
            fullWidth
          />
          <CustomDatePicker
            label="Födelsedatum"
            selectedDate={newPlayerBirthDate}
            onChange={(date) => setNewPlayerBirthDate(date!)}
            fullWidth
            includeTime={false}
          />
          <Input
            label="Land"
            name="new-player-country-input"
            value={newPlayerCountry}
            onChange={(e) => setNewPlayerCountry(e.currentTarget.value)}
            fullWidth
          />
        </Section>
        <Section flexDirection="row" gap="s" alignItems="center">
          <Input
            label="Filnamn lokal bild"
            value={newPlayerImageFilePath}
            onChange={(e) => setNewPlayerImageFilePath(e.currentTarget.value)}
            fullWidth
          />
          <Input
            label="Extern bild-URL"
            value={newPlayerExternalPictureURL}
            onChange={(e) => setNewPlayerExternalPictureURL(e.currentTarget.value)}
            fullWidth
          />
        </Section>
        <Input
          label="Custom ID (valfritt)"
          value={newPlayerCustomId}
          onChange={(e) => setNewPlayerCustomId(e.currentTarget.value)}
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
          onClick={handleCreatePlayer}
          fullWidth
          disabled={!isValid || createPlayerLoading}
          loading={createPlayerLoading}
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

const LabeledSelect = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xxs};
  width: 100%;
  box-sizing: border-box;
`;

export default CreatePlayerModal;
