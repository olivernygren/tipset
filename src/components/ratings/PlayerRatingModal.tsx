import React, { useState } from 'react';
import styled from 'styled-components';
import {
  addDoc, collection, doc, updateDoc,
} from 'firebase/firestore';
import { CheckCircle, Circle } from '@phosphor-icons/react';
import { Player, PlayerRating, PlayerRatingInput } from '../../utils/Players';
import Modal from '../modal/Modal';
import { devices, theme } from '../../theme';
import { HeadingsTypography, NormalTypography } from '../typography/Typography';
import { Team } from '../../utils/Team';
import Button from '../buttons/Button';
import { db } from '../../config/firebase';
import { CollectionEnum } from '../../utils/Firebase';
import { errorNotify, successNotify } from '../../utils/toast/toastHelpers';
import IconButton from '../buttons/IconButton';
import Input from '../input/Input';

interface PlayerRatingModalProps {
  onClose: () => void;
  player: Player;
  playerRatingObject: PlayerRating | undefined;
  ratings: Array<PlayerRating>;
  opponent?: Team | undefined;
  gameDate?: Date;
}

const PlayerRatingModal = ({
  onClose, player, playerRatingObject, opponent, ratings, gameDate,
}: PlayerRatingModalProps) => {
  const [startingAppearance, setStartingAppearance] = useState<boolean>(false);
  const [substituteAppearance, setSubstituteAppearance] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(0);
  const [goalsScored, setGoalsScored] = useState<number>(0);
  const [assists, setAssists] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  console.log('keke', setRating, setGoalsScored, setAssists, ratings);

  const handleSavePlayerRating = async () => {
    if (!opponent || !gameDate) {
      errorNotify('Välj motståndare och datum för matchen');
      return;
    }

    setLoading(true);

    try {
      if (!playerRatingObject) {
        const newPlayerRatingObject: PlayerRatingInput = {
          playerId: player.id,
          playerName: player.name,
          startingAppearances: startingAppearance ? 1 : 0,
          substituteAppearances: substituteAppearance ? 1 : 0,
          ratings: [
            {
              date: gameDate.toUTCString(),
              rating,
              opponent: opponent?.name ?? '',
            },
          ],
          goals: goalsScored,
          assists,
        };

        await addDoc(collection(db, CollectionEnum.PLAYER_RATINGS), newPlayerRatingObject);

        onClose();
        successNotify(`Spelarbetyg sparat för ${player.name}`);
        setLoading(false);
        return;
      }

      if (playerRatingObject) {
        if (playerRatingObject.ratings.some((rating) => new Date(rating.date) === gameDate && rating.opponent === opponent?.name)) {
          const updatedRatings = playerRatingObject.ratings.map((rating) => {
            if (new Date(rating.date) === gameDate && rating.opponent === opponent?.name) {
              return {
                ...rating,
                rating,
              };
            }
            return rating;
          });

          await updateDoc(doc(db, CollectionEnum.PLAYER_RATINGS, playerRatingObject.documentId), {
            ...playerRatingObject,
            ratings: updatedRatings,
          });

          onClose();
          successNotify(`Spelarbetyg uppdaterat för ${player.name}`);
          setLoading(false);
          return;
        }

        const updatedPlayerRatingObject: PlayerRatingInput = {
          playerId: player.id,
          playerName: player.name,
          startingAppearances: startingAppearance ? (playerRatingObject?.startingAppearances ?? 0) + 1 : playerRatingObject?.startingAppearances,
          substituteAppearances: substituteAppearance ? (playerRatingObject?.substituteAppearances ?? 0) + 1 : playerRatingObject?.substituteAppearances,
          ratings: [
            ...playerRatingObject.ratings,
            {
              date: gameDate.toUTCString(),
              rating,
              opponent: opponent?.name ?? '',
            },
          ],
          goals: playerRatingObject.goals + goalsScored,
          assists: playerRatingObject.assists + assists,
        };

        await updateDoc(doc(db, CollectionEnum.PLAYER_RATINGS, playerRatingObject.documentId), {
          ...updatedPlayerRatingObject,
        });

        onClose();
        successNotify(`Spelarbetyg uppdaterat för ${player.name}`);
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleSelectAppearance = (type: 'starting' | 'substitute' | 'none') => {
    if (type === 'starting') {
      setStartingAppearance(!startingAppearance);
      setSubstituteAppearance(false);
    } else if (type === 'substitute') {
      setSubstituteAppearance(!substituteAppearance);
      setStartingAppearance(false);
    } else {
      setStartingAppearance(false);
      setSubstituteAppearance(false);
    }
  };

  return (
    <Modal
      title={player.name}
      onClose={onClose}
      mobileBottomSheet
      noPadding
      headerDivider
    >
      <ModalContent>
        {gameDate && opponent && (
          <OpponentContainer>
            <HeadingsTypography variant="h5">Motståndare</HeadingsTypography>
            <NormalTypography variant="m">{opponent.name}</NormalTypography>
          </OpponentContainer>
        )}
        <HeadingsTypography variant="h4">Spelminuter</HeadingsTypography>
        <AppearanceSelectionContainer>
          <AppearanceSelector onClick={() => handleSelectAppearance('starting')} isSelected={startingAppearance}>
            <NormalTypography variant="m">Startade matchen</NormalTypography>
            <IconButtonContainer onClick={(e) => e.stopPropagation()}>
              <IconButton
                icon={startingAppearance ? <CheckCircle size={24} weight="fill" color={theme.colors.primary} /> : <Circle size={24} color={theme.colors.primary} />}
                colors={
                startingAppearance ? {
                  normal: theme.colors.primary,
                  hover: theme.colors.primary,
                  active: theme.colors.primary,
                } : {
                  normal: theme.colors.silverDarker,
                  hover: theme.colors.textDefault,
                  active: theme.colors.textDefault,
                }
              }
                onClick={() => handleSelectAppearance('starting')}
              />
            </IconButtonContainer>
          </AppearanceSelector>
          <AppearanceSelector onClick={() => handleSelectAppearance('substitute')} isSelected={substituteAppearance}>
            <NormalTypography variant="m">Hoppade in</NormalTypography>
            <IconButtonContainer onClick={(e) => e.stopPropagation()}>
              <IconButton
                icon={substituteAppearance ? <CheckCircle size={24} weight="fill" color={theme.colors.primary} /> : <Circle size={24} color={theme.colors.primary} />}
                colors={
                substituteAppearance ? {
                  normal: theme.colors.primary,
                  hover: theme.colors.primary,
                  active: theme.colors.primary,
                } : {
                  normal: theme.colors.silverDarker,
                  hover: theme.colors.textDefault,
                  active: theme.colors.textDefault,
                }
              }
                onClick={() => handleSelectAppearance('substitute')}
              />
            </IconButtonContainer>
          </AppearanceSelector>
          <AppearanceSelector onClick={() => handleSelectAppearance('none')} isSelected={!startingAppearance && !substituteAppearance}>
            <NormalTypography variant="m">Spelade inte</NormalTypography>
            <IconButtonContainer onClick={(e) => e.stopPropagation()}>
              <IconButton
                icon={!(startingAppearance || substituteAppearance) ? <CheckCircle size={24} weight="fill" color={theme.colors.primary} /> : <Circle size={24} color={theme.colors.primary} />}
                colors={
                !(startingAppearance || substituteAppearance) ? {
                  normal: theme.colors.primary,
                  hover: theme.colors.primary,
                  active: theme.colors.primary,
                } : {
                  normal: theme.colors.silverDarker,
                  hover: theme.colors.textDefault,
                  active: theme.colors.textDefault,
                }
              }
                onClick={() => handleSelectAppearance('none')}
              />
            </IconButtonContainer>
          </AppearanceSelector>
        </AppearanceSelectionContainer>
        <HeadingsTypography variant="h4">Betyg & Statistik</HeadingsTypography>
        <InputsContainer>
          <Input
            label="Mål"
            type="number"
            value={goalsScored.toString()}
            onChange={(e) => setGoalsScored(Number(e.target.value))}
            fullWidth
          />
          <Input
            label="Assist"
            type="number"
            value={assists.toString()}
            onChange={(e) => setAssists(Number(e.target.value))}
            fullWidth
          />
          <Input
            label="Betyg"
            type="number"
            value={rating.toString()}
            onChange={(e) => setRating(Number(e.target.value))}
            fullWidth
          />
        </InputsContainer>
        {/* <CardGrid>
          <Card>
            <HeadingsTypography variant="h5" color={theme.colors.silverDark}>Nationalitet</HeadingsTypography>
            <NationAvatar
              flagUrl={getFlagUrlByCountryName(player.country)}
              nationName={player.country as string}
              size={AvatarSize.L}
            />
          </Card>
        </CardGrid> */}
      </ModalContent>
      <ButtonsContainer>
        <Button
          onClick={onClose}
          variant="secondary"
          fullWidth
        >
          Avbryt
        </Button>
        <Button
          onClick={handleSavePlayerRating}
          fullWidth
          loading={loading}
          disabled={loading || (!startingAppearance && !substituteAppearance) || !rating}
        >
          Spara
        </Button>
      </ButtonsContainer>
    </Modal>
  );
};

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.m};
  padding: ${theme.spacing.m};
  flex-grow: 1;
  overflow-y: auto;
`;

const AppearanceSelectionContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.xxs};
  flex-direction: column;
`;

const AppearanceSelector = styled.div<{ isSelected?: boolean }>`
  display: flex;
  gap: ${theme.spacing.xs};
  justify-content: space-between;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid ${({ isSelected }) => (isSelected ? theme.colors.primaryLighter : theme.colors.silverLight)};
  padding: ${theme.spacing.xxs} ${theme.spacing.xs};
  border-radius: ${theme.borderRadius.m};
  transition: all 0.2s ease-in-out;
  background-color: ${({ isSelected }) => (isSelected ? theme.colors.primaryFade : theme.colors.silverBleach)};
  box-shadow: 0px 2px 0px rgba(0, 0, 0, 0.08);
  flex: 1;
  cursor: pointer;
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  border-top: 1px solid ${theme.colors.silverLight};
  width: 100%;
  box-sizing: border-box;
  padding: ${theme.spacing.s} ${theme.spacing.s} ${theme.spacing.m} ${theme.spacing.s};

  @media ${devices.tablet} {
    padding: ${theme.spacing.m};
  }
`;

const IconButtonContainer = styled.div``;

const InputsContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.s};
  align-items: center;
  width: 100%;
  box-sizing: border-box;
`;

const OpponentContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.s};
  align-items: center;
  background-color: ${theme.colors.silverLighter};
  border-radius: ${theme.borderRadius.m};
  width: 100%;
  box-sizing: border-box;
  padding: ${theme.spacing.m} ${theme.spacing.s};
  justify-content: space-between;
`;

// const CardGrid = styled.div`
//   display: grid;
//   grid-template-columns: 1fr 1fr;
//   grid-template-rows: auto;
//   gap: ${theme.spacing.s};
// `;

// const Card = styled.div`
//   width: 100%;
//   background-color: ${theme.colors.silverLighter};
//   border-radius: ${theme.borderRadius.m};
//   box-shadow: 0px 3px 0px rgba(0, 0, 0, 0.08);
//   display: flex;
//   gap: ${theme.spacing.m};
//   padding: ${theme.spacing.m};
//   align-items: flex-end;
//   box-sizing: border-box;
// `;

export default PlayerRatingModal;