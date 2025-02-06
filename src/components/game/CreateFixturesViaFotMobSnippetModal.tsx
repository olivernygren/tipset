import React, { useState } from 'react';
import styled from 'styled-components';
import { updateDoc, doc } from 'firebase/firestore';
import { theme } from '../../theme';
import { convertFotMobMatchToFixture, getFotMobMatchesFromSelectedCountries, getFotMobMatchesFromSelectedTournaments } from '../../utils/fotmobHelpers';
import Button from '../buttons/Button';
import Modal from '../modal/Modal';
import Textarea from '../textarea/Textarea';
import { FotMobMatch } from '../../utils/Fotmob';
import { errorNotify, successNotify } from '../../utils/toast/toastHelpers';
import { db } from '../../config/firebase';
import { CollectionEnum } from '../../utils/Firebase';
import { Fixture } from '../../utils/Fixture';

interface Props {
  onClose: () => void;
  refetchFixtures: () => void;
  selectedTournamentIds: Array<number>;
  collectionDocId: string;
  allFixtures: Array<Fixture>;
}

const CreateFixturesViaFotMobSnippetModal = ({
  onClose, refetchFixtures, selectedTournamentIds, collectionDocId, allFixtures,
}: Props) => {
  const [snippet, setSnippet] = useState<string>('');

  const [creationLoading, setCreationLoading] = useState<boolean>(false);

  const handleCreateFixtures = async () => {
    setCreationLoading(true);

    const allFixtureIds = allFixtures.map((fixture) => fixture.id);
    const filteredFotMobMatches = getFotMobMatchesFromSelectedTournaments(JSON.parse(snippet).leagues, selectedTournamentIds);
    const fixtures = filteredFotMobMatches
      .map((match: FotMobMatch) => convertFotMobMatchToFixture(match, allFixtureIds))
      .filter((fixture) => fixture !== null);

    if (fixtures.length === 0) {
      errorNotify('Inga matcher kunde skapas för valda turneringar');
      return;
    }
    console.log(fixtures);

    try {
      await updateDoc(doc(db, CollectionEnum.FIXTURES, collectionDocId), {
        fixtures: [...allFixtures, ...fixtures],
      });
      successNotify('Matcherna skapades');
      onClose();
      refetchFixtures();
    } catch (err) {
      errorNotify('Något gick fel när matchen skulle skapas');
    } finally {
      setCreationLoading(false);
    }
  };

  return (
    <Modal
      title="Skapa matcher via FotMob-snippet"
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
          onClick={handleCreateFixtures}
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

export default CreateFixturesViaFotMobSnippetModal;
