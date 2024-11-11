import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  addDoc, collection, doc, updateDoc,
} from 'firebase/firestore';
import { CheckCircle, Circle } from '@phosphor-icons/react';
import {
  Player, PlayerRating, PlayerRatingInput, Rating,
} from '../../utils/Players';
import Modal from '../modal/Modal';
import { devices, theme } from '../../theme';
import { EmphasisTypography, HeadingsTypography, NormalTypography } from '../typography/Typography';
import { Team } from '../../utils/Team';
import Button from '../buttons/Button';
import { db } from '../../config/firebase';
import { CollectionEnum } from '../../utils/Firebase';
import { errorNotify, successNotify } from '../../utils/toast/toastHelpers';
import IconButton from '../buttons/IconButton';
import Input from '../input/Input';
import { getPlayerMonthlyRating } from '../../utils/playerRatingHelpers';

interface PlayerRatingModalProps {
  onClose: () => void;
  player: Player;
  playerRatingObject: PlayerRating | undefined;
  opponent?: Team | undefined;
  gameDate?: Date;
}

const PlayerRatingModal = ({
  onClose, player, playerRatingObject, opponent, gameDate,
}: PlayerRatingModalProps) => {
  const [startingAppearance, setStartingAppearance] = useState<boolean>(false);
  const [substituteAppearance, setSubstituteAppearance] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(0);
  const [goalsScored, setGoalsScored] = useState<number>(0);
  const [assists, setAssists] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [allPlayerRatings, setAllPlayerRatings] = useState<Array<Array<Rating>>>([[]]);

  useEffect(() => {
    const hasRatingForCurrentGame = playerRatingObject?.ratings.some((rating) => {
      const ratingDate = new Date(rating.date);
      return ratingDate.getDate() === gameDate?.getDate()
         && ratingDate.getMonth() === gameDate?.getMonth()
         && ratingDate.getFullYear() === gameDate?.getFullYear()
         && rating.opponent === opponent?.name;
    });

    if (hasRatingForCurrentGame) {
      const ratingForCurrentGame = playerRatingObject?.ratings.find((rating) => {
        const ratingDate = new Date(rating.date);
        return ratingDate.getDate() === gameDate?.getDate()
           && ratingDate.getMonth() === gameDate?.getMonth()
           && ratingDate.getFullYear() === gameDate?.getFullYear()
           && rating.opponent === opponent?.name;
      });

      if (ratingForCurrentGame) {
        setRating(ratingForCurrentGame.rating);
      }
    }
  }, []);

  useEffect(() => {
    const getPlayerRatings = () => {
      if (!playerRatingObject || !playerRatingObject.ratings || playerRatingObject.ratings.length === 0) return [];

      const ratingsByMonth = new Map<string, Array<Rating>>();

      playerRatingObject.ratings.forEach((rating) => {
        const date = new Date(rating.date);
        const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;

        if (!ratingsByMonth.has(monthYear)) {
          ratingsByMonth.set(monthYear, []);
        }

        ratingsByMonth.get(monthYear)!.push(rating);
      });

      return Array.from(ratingsByMonth.values());
    };

    const ratings = getPlayerRatings();
    setAllPlayerRatings(ratings);
  }, []);

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
          team: 'Arsenal',
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
          team: playerRatingObject.team ?? 'Arsenal',
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
      errorNotify('Något gick fel');
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
          <>
            <OpponentContainer>
              <HeadingsTypography variant="h5">Motståndare</HeadingsTypography>
              <NormalTypography variant="m">{opponent.name}</NormalTypography>
            </OpponentContainer>
            <HeadingsTypography variant="h4">Spelminuter</HeadingsTypography>
            <AppearanceSelectionContainer>
              <AppearanceSelector onClick={() => handleSelectAppearance('starting')} isSelected={startingAppearance}>
                <NormalTypography variant="m">Startade matchen</NormalTypography>
                <IconButtonContainer onClick={(e) => e.stopPropagation()}>
                  <IconButton
                    icon={startingAppearance ? <CheckCircle size={24} weight="fill" color={theme.colors.primary} /> : <Circle size={24} color={theme.colors.primary} />}
                    colors={startingAppearance ? {
                      normal: theme.colors.primary,
                      hover: theme.colors.primary,
                      active: theme.colors.primary,
                    } : {
                      normal: theme.colors.silverDarker,
                      hover: theme.colors.textDefault,
                      active: theme.colors.textDefault,
                    }}
                    onClick={() => handleSelectAppearance('starting')}
                  />
                </IconButtonContainer>
              </AppearanceSelector>
              <AppearanceSelector onClick={() => handleSelectAppearance('substitute')} isSelected={substituteAppearance}>
                <NormalTypography variant="m">Hoppade in</NormalTypography>
                <IconButtonContainer onClick={(e) => e.stopPropagation()}>
                  <IconButton
                    icon={substituteAppearance ? <CheckCircle size={24} weight="fill" color={theme.colors.primary} /> : <Circle size={24} color={theme.colors.primary} />}
                    colors={substituteAppearance ? {
                      normal: theme.colors.primary,
                      hover: theme.colors.primary,
                      active: theme.colors.primary,
                    } : {
                      normal: theme.colors.silverDarker,
                      hover: theme.colors.textDefault,
                      active: theme.colors.textDefault,
                    }}
                    onClick={() => handleSelectAppearance('substitute')}
                  />
                </IconButtonContainer>
              </AppearanceSelector>
              <AppearanceSelector onClick={() => handleSelectAppearance('none')} isSelected={!startingAppearance && !substituteAppearance}>
                <NormalTypography variant="m">Spelade inte</NormalTypography>
                <IconButtonContainer onClick={(e) => e.stopPropagation()}>
                  <IconButton
                    icon={!(startingAppearance || substituteAppearance) ? <CheckCircle size={24} weight="fill" color={theme.colors.primary} /> : <Circle size={24} color={theme.colors.primary} />}
                    colors={!(startingAppearance || substituteAppearance) ? {
                      normal: theme.colors.primary,
                      hover: theme.colors.primary,
                      active: theme.colors.primary,
                    } : {
                      normal: theme.colors.silverDarker,
                      hover: theme.colors.textDefault,
                      active: theme.colors.textDefault,
                    }}
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
          </>
        )}
        {!(gameDate && opponent) && (
          <>
            <NormalTypography variant="m" color={theme.colors.silverDark}>
              Välj motståndare och datum för matchen för att kunna spara spelarbetyg
            </NormalTypography>
            {allPlayerRatings && allPlayerRatings.length > 0 && (
              <>
                <HeadingsTypography variant="h4">Tidigare betyg</HeadingsTypography>
                  {allPlayerRatings.map((monthRating, index) => (
                    <React.Fragment key={index}>
                      {monthRating.length > 0 && (
                        <MonthContainer>
                          <HeadingsTypography variant="h6">{new Date(monthRating[0].date).toLocaleString('default', { month: 'long', year: 'numeric' })}</HeadingsTypography>
                          <RatingsContainer>
                            {monthRating.map((rating) => (
                              <MatchRatingContainer key={rating.date}>
                                <NormalTypography variant="m">{`vs ${rating.opponent}`}</NormalTypography>
                                <NormalTypography variant="m">{rating.rating}</NormalTypography>
                              </MatchRatingContainer>
                            ))}
                          </RatingsContainer>
                          <MonthlyAverageContainer>
                            <EmphasisTypography variant="m" color={theme.colors.white}>Månadens snitt</EmphasisTypography>
                            <HeadingsTypography variant="h6" color={theme.colors.gold}>{getPlayerMonthlyRating(playerRatingObject, new Date(monthRating[0].date).getMonth())}</HeadingsTypography>
                          </MonthlyAverageContainer>
                        </MonthContainer>
                      )}
                    </React.Fragment>
                  ))}
              </>
            )}
          </>
        )}
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

const RatingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xxs};
`;

const MatchRatingContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.s};
  align-items: center;
  justify-content: space-between;
  background-color: ${theme.colors.silverBleach};
  border-radius: ${theme.borderRadius.s};
  padding: ${theme.spacing.xxs} ${theme.spacing.xs};
  box-sizing: border-box;
  border: 1px solid ${theme.colors.silverLight};
  box-shadow: 0px 2px 0px rgba(0, 0, 0, 0.08);
`;

const MonthlyAverageContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.s};
  align-items: center;
  justify-content: space-between;
  background-color: ${theme.colors.primary};
  border-radius: ${theme.borderRadius.s};
  padding: ${theme.spacing.xs};
  box-sizing: border-box;
`;

const MonthContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.s};
  flex-direction: column;
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
