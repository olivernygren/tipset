import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  ArrowsDownUp, FloppyDisk, PlusCircle,
} from '@phosphor-icons/react';
import { collection, getDocs } from 'firebase/firestore';
import { EmphasisTypography, HeadingsTypography, NormalTypography } from '../../../components/typography/Typography';
import { theme } from '../../../theme';
import { Section } from '../../../components/section/Section';
import {
  ArsenalPlayers, GeneralPositionEnum, Player, PlayerRating,
} from '../../../utils/Players';
import Avatar, { AvatarSize } from '../../../components/avatar/Avatar';
import Button from '../../../components/buttons/Button';
import SelectTeamModal from '../../../components/game/SelectTeamModal';
import { TeamType } from '../../../utils/Fixture';
import { getFlagUrlByCountryName, Team } from '../../../utils/Team';
import CustomDatePicker from '../../../components/input/DatePicker';
import SelectImitation from '../../../components/input/SelectImitation';
import NationAvatar from '../../../components/avatar/NationAvatar';
import { CollectionEnum } from '../../../utils/Firebase';
import { db } from '../../../config/firebase';
import { withDocumentIdOnObjectsInArray } from '../../../utils/helpers';
import PlayerRatingModal from '../../../components/ratings/PlayerRatingModal';
import {
  getNumberOfAppearances, getPlayerMonthlyRating, getPlayerRatingObject, getPlayerSeasonRating,
} from '../../../utils/playerRatingHelpers';

enum SortByEnum {
  POSITION = 'Position',
  RATING = 'Rating',
}

const PlayerRatingsPage = () => {
  const originalPlayers = ArsenalPlayers;

  const [ratings, setRatings] = useState<Array<PlayerRating>>([]);
  const [sorting, setSorting] = useState<SortByEnum>(SortByEnum.POSITION);
  const [goalKeepers] = useState<Array<Player>>(originalPlayers.filter((player) => player.position.general === GeneralPositionEnum.GK));
  const [defenders] = useState<Array<Player>>(originalPlayers.filter((player) => player.position.general === GeneralPositionEnum.DF));
  const [midfielders] = useState<Array<Player>>(originalPlayers.filter((player) => player.position.general === GeneralPositionEnum.MF));
  const [forwards] = useState<Array<Player>>(originalPlayers.filter((player) => player.position.general === GeneralPositionEnum.FW));
  const [selectOpponentModalOpen, setSelectOpponentModalOpen] = useState<boolean>(false);
  const [showGameContent, setShowGameContent] = useState<boolean>(false);
  const [opponent, setOpponent] = useState<Team | undefined>(undefined);
  const [gameDate, setGameDate] = useState(new Date());
  const [playerModalOpen, setPlayerModalOpen] = useState<Player | null>(null);

  console.log(setSorting);

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    try {
      const playerRatingCollectionRef = collection(db, CollectionEnum.PLAYER_RATINGS);
      if (!playerRatingCollectionRef) return;

      const playerRatingData = await getDocs(playerRatingCollectionRef);
      const playerRatings = withDocumentIdOnObjectsInArray<PlayerRating>(playerRatingData.docs);

      setRatings(playerRatings);
    } catch (error) {
      console.error(error);
    }
  };

  const getPlayer = (player: Player) => {
    const playerRating = getPlayerRatingObject(player, ratings);

    return (
      <PlayerItem key={player.id} onClick={() => setPlayerModalOpen(player)}>
        <PlayerInfoContainer>
          <AvatarContainer>
            {player.picture && (
            <Avatar
              src={player.picture}
              alt={player.name}
              size={AvatarSize.M}
              objectFit="cover"
              showBorder
            />
            )}
            <NationAvatarContainer>
              {player.country && (
                <NationAvatar
                  flagUrl={getFlagUrlByCountryName(player.country)}
                  nationName={player.country as string}
                  size={AvatarSize.XS}
                />
              )}
            </NationAvatarContainer>
          </AvatarContainer>
          <NormalTypography variant="m">{player.name}</NormalTypography>
          <NormalTypography variant="s" color={theme.colors.silverDark}>{`#${player.number}`}</NormalTypography>
        </PlayerInfoContainer>
        <PlayerItemTableCell>
          <NormalTypography variant="m">{getNumberOfAppearances(playerRating)}</NormalTypography>
        </PlayerItemTableCell>
        <PlayerItemTableCell>
          <NormalTypography variant="m">{playerRating?.assists ?? 0}</NormalTypography>
        </PlayerItemTableCell>
        <PlayerItemTableCell>
          <NormalTypography variant="m">{playerRating?.goals ?? 0}</NormalTypography>
        </PlayerItemTableCell>
        <PlayerItemTableCell>
          <EmphasisTypography variant="m">{getPlayerMonthlyRating(playerRating)}</EmphasisTypography>
        </PlayerItemTableCell>
        <PlayerItemTableCell>
          <EmphasisTypography variant="m" color={theme.colors.primary}>{getPlayerSeasonRating(playerRating)}</EmphasisTypography>
        </PlayerItemTableCell>
      </PlayerItem>
    );
  };

  return (
    <>
      <Section padding={theme.spacing.l} gap="m">
        <PageHeader>
          <HeadingsTypography variant="h2">Spelarbetyg</HeadingsTypography>
          <Section flexDirection="row" alignItems="center" gap="xs" fitContent>
            <Button
              variant="secondary"
              icon={<ArrowsDownUp size={24} color={theme.colors.primary} />}
              onClick={() => console.log('Add new match')}
            >
              Sortera
            </Button>
            <Button
              icon={<PlusCircle size={24} color={theme.colors.white} />}
              onClick={() => setSelectOpponentModalOpen(true)}
            >
              Ny match
            </Button>
          </Section>
        </PageHeader>
        {showGameContent && (
          <GameContainer>
            <SelectContainer>
              <EmphasisTypography color={theme.colors.textDefault} variant="s">Motståndare</EmphasisTypography>
              <SelectImitation
                placeholder="Välj motståndare"
                onClick={() => setSelectOpponentModalOpen(true)}
                value={opponent?.name ?? ''}
                fullWidth
              />
            </SelectContainer>
            <CustomDatePicker
              label="Datum"
              selectedDate={gameDate}
              onChange={(date) => setGameDate(date!)}
              includeTime={false}
              minDate={undefined}
            />
          </GameContainer>
        )}
        <TableHeader>
          <EmphasisTypography color={theme.colors.silverDark} variant="s">Spelare</EmphasisTypography>
          <PlayerItemTableCell>
            <EmphasisTypography color={theme.colors.silverDark} variant="s">Matcher</EmphasisTypography>
          </PlayerItemTableCell>
          <PlayerItemTableCell>
            <EmphasisTypography color={theme.colors.silverDark} variant="s">Assist</EmphasisTypography>
          </PlayerItemTableCell>
          <PlayerItemTableCell>
            <EmphasisTypography color={theme.colors.silverDark} variant="s">Mål</EmphasisTypography>
          </PlayerItemTableCell>
          <PlayerItemTableCell>
            <EmphasisTypography color={theme.colors.silverDark} variant="s">Månadsbetyg</EmphasisTypography>
          </PlayerItemTableCell>
          <PlayerItemTableCell>
            <EmphasisTypography color={theme.colors.silverDark} variant="s">Säsongsbetyg</EmphasisTypography>
          </PlayerItemTableCell>
        </TableHeader>
        {sorting === SortByEnum.POSITION && (
          <>
            <PositionContainer>
              <HeadingsTypography variant="h4">Målvakter</HeadingsTypography>
              <PlayerList>
                {goalKeepers.map((player) => getPlayer(player))}
              </PlayerList>
            </PositionContainer>
            <PositionContainer>
              <HeadingsTypography variant="h4">Försvarare</HeadingsTypography>
              <PlayerList>
                {defenders.map((player) => getPlayer(player))}
              </PlayerList>
            </PositionContainer>
            <PositionContainer>
              <HeadingsTypography variant="h4">Mittfältare</HeadingsTypography>
              <PlayerList>
                {midfielders.map((player) => getPlayer(player))}
              </PlayerList>
            </PositionContainer>
            <PositionContainer>
              <HeadingsTypography variant="h4">Anfallare</HeadingsTypography>
              <PlayerList>
                {forwards.map((player) => getPlayer(player))}
              </PlayerList>
            </PositionContainer>
          </>
        )}
        <Button icon={<FloppyDisk color={theme.colors.white} size={24} />}>
          Spara betyg
        </Button>
      </Section>
      {selectOpponentModalOpen && (
        <SelectTeamModal
          onClose={() => setSelectOpponentModalOpen(false)}
          onSave={(team) => {
            setOpponent(team);
            setShowGameContent(true);
          }}
          value={opponent}
          teamType={TeamType.CLUBS}
          isHomeTeam={false}
        />
      )}
      {playerModalOpen && (
        <PlayerRatingModal
          onClose={() => {
            setPlayerModalOpen(null);
            fetchRatings();
          }}
          player={playerModalOpen}
          playerRatingObject={getPlayerRatingObject(playerModalOpen, ratings)}
          opponent={opponent}
          gameDate={gameDate}
        />
      )}
    </>
  );
};

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${theme.spacing.l};
  width: 100%;
  box-sizing: border-box;
  padding-bottom: ${theme.spacing.m};
`;

const PositionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  width: 100%;
  box-sizing: border-box;
`;

const PlayerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xxs};
  width: 100%;
  box-sizing: border-box;
`;

const PlayerItem = styled.div`
  display: grid;
  grid-template-columns: 1fr 110px 110px 110px 110px 96px;
  align-items: center;
  gap: ${theme.spacing.xl};
  padding: 2px ${theme.spacing.xs} 2px ${theme.spacing.xxs};
  border-radius: ${theme.borderRadius.m};
  background-color: ${theme.colors.white};
  box-shadow: 0px 2px 0px rgba(0, 0, 0, 0.08);
  border: 1px solid ${theme.colors.silverLight};
  width: 100%;
  box-sizing: border-box;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background-color: ${theme.colors.primaryFade};
    border-color: ${theme.colors.primaryLighter};
  }
`;

const PlayerInfoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xxs};
  width: 100%;
  box-sizing: border-box;
`;

const AvatarContainer = styled.div`
  height: fit-content;
  width: fit-content;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NationAvatarContainer = styled.div`
  position: absolute;
  bottom: 0px;
  right: 0px;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 110px 110px 110px 110px 96px;
  align-items: flex-end;
  gap: ${theme.spacing.xl};
  padding: 2px ${theme.spacing.xs} ${theme.spacing.xxs} ${theme.spacing.xxs};
  color: ${theme.colors.white};
  width: 100%;
  box-sizing: border-box;
  border-bottom: 1px solid ${theme.colors.silverLight};
`;

const GameContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.m};
  width: 100%;
  box-sizing: border-box;
  padding: ${theme.spacing.m};
  border-radius: ${theme.borderRadius.m};
  background-color: ${theme.colors.white};
  border: 1px solid ${theme.colors.silverLight};

  ${EmphasisTypography} {
    white-space: nowrap;
  }
`;

const SelectContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xxs};
  min-width: 200px;
`;

const PlayerItemTableCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  box-sizing: border-box;
`;

export default PlayerRatingsPage;
