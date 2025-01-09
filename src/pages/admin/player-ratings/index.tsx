import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  ArrowsDownUp, CheckCircle, Circle, PlusCircle,
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
  getNumberOfAppearancesString, getPlayerMonthlyRating, getPlayerRatingObject, getPlayerSeasonRating, getNumberOfAppearances, getNumberOfAppearancesByMonth,
  getMonthString,
} from '../../../utils/playerRatingHelpers';
import Modal from '../../../components/modal/Modal';
import IconButton from '../../../components/buttons/IconButton';
import Select from '../../../components/input/Select';

enum SortByEnum {
  POSITION = 'Position',
  SEASON_RATING = 'Säsongsbetyg',
  MONTHLY_RATING = 'Månadsbetyg',
  GOALS = 'Mål',
  ASSISTS = 'Assist',
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
  const [sortingModalOpen, setSortingModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());

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
    const numberOfAppearances = getNumberOfAppearances(playerRating);

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
          <NormalTypography variant="m">{sorting === SortByEnum.MONTHLY_RATING ? getNumberOfAppearancesByMonth(playerRating, selectedMonth) : getNumberOfAppearancesString(playerRating)}</NormalTypography>
        </PlayerItemTableCell>
        <PlayerItemTableCell>
          <NormalTypography variant="m">{playerRating?.goals ?? 0}</NormalTypography>
        </PlayerItemTableCell>
        <PlayerItemTableCell>
          <NormalTypography variant="m">{playerRating?.assists ?? 0}</NormalTypography>
        </PlayerItemTableCell>
        <PlayerItemTableCell>
          <EmphasisTypography variant="m">{getPlayerMonthlyRating(playerRating, sorting === SortByEnum.MONTHLY_RATING ? selectedMonth : undefined)}</EmphasisTypography>
        </PlayerItemTableCell>
        <PlayerItemTableCell>
          <EmphasisTypography variant="m" color={theme.colors.primary}>{`${getPlayerSeasonRating(playerRating)}${numberOfAppearances <= 5 && numberOfAppearances > 0 ? ' *' : ''}`}</EmphasisTypography>
        </PlayerItemTableCell>
      </PlayerItem>
    );
  };

  const getSortedByText = () => {
    if (sorting === SortByEnum.POSITION) return 'Sorterad efter position';
    if (sorting === SortByEnum.SEASON_RATING) return 'Sorterad efter säsongsbetyg';
    if (sorting === SortByEnum.MONTHLY_RATING) return `Sorterad efter månadsbetyg (${getMonthString(selectedMonth.toString())})`;
    if (sorting === SortByEnum.GOALS) return 'Sorterad efter antal mål';
    if (sorting === SortByEnum.ASSISTS) return 'Sorterad efter antal assist';
  };

  return (
    <>
      <Section padding={theme.spacing.l} gap="m">
        <PageHeader>
          <HeadingsTypography variant="h2">Spelarbetyg</HeadingsTypography>
          <Section flexDirection="row" alignItems="center" gap="xs" fitContent>
            <Section padding={`0 ${theme.spacing.s} 0 0`}>
              <NormalTypography variant="s" color={theme.colors.silverDark}>{getSortedByText()}</NormalTypography>
            </Section>
            <Button
              variant="secondary"
              icon={<ArrowsDownUp size={24} color={theme.colors.primary} />}
              onClick={() => setSortingModalOpen(true)}
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
            <EmphasisTypography color={theme.colors.silverDark} variant="s">Mål</EmphasisTypography>
          </PlayerItemTableCell>
          <PlayerItemTableCell>
            <EmphasisTypography color={theme.colors.silverDark} variant="s">Assist</EmphasisTypography>
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
        {sorting === SortByEnum.SEASON_RATING && (
          <PlayerList>
            {originalPlayers
              .map((player) => {
                const rating = getPlayerRatingObject(player, ratings);
                const seasonRating = Number(getPlayerSeasonRating(rating) ?? NaN);
                return { player, seasonRating };
              })
              .sort((a, b) => {
                if (Number.isNaN(a.seasonRating)) return 1;
                if (Number.isNaN(b.seasonRating)) return -1;
                return b.seasonRating - a.seasonRating;
              })
              .map(({ player }) => getPlayer(player))}
          </PlayerList>
        )}
        {sorting === SortByEnum.MONTHLY_RATING && (
          <PlayerList>
            {originalPlayers
              .map((player) => {
                const rating = getPlayerRatingObject(player, ratings);
                const monthlyRating = Number(getPlayerMonthlyRating(rating, selectedMonth) ?? NaN);
                return { player, monthlyRating };
              })
              .sort((a, b) => {
                if (Number.isNaN(a.monthlyRating)) return 1;
                if (Number.isNaN(b.monthlyRating)) return -1;
                return b.monthlyRating - a.monthlyRating;
              })
              .map(({ player }) => getPlayer(player))}
          </PlayerList>
        )}
        {sorting === SortByEnum.GOALS && (
          <PlayerList>
            {originalPlayers
              .map((player) => {
                const rating = getPlayerRatingObject(player, ratings);
                return { player, goals: rating?.goals ?? 0 };
              })
              .sort((a, b) => b.goals - a.goals)
              .map(({ player }) => getPlayer(player))}
          </PlayerList>
        )}
        {sorting === SortByEnum.ASSISTS && (
          <PlayerList>
            {originalPlayers
              .map((player) => {
                const rating = getPlayerRatingObject(player, ratings);
                return { player, assists: rating?.assists ?? 0 };
              })
              .sort((a, b) => b.assists - a.assists)
              .map(({ player }) => getPlayer(player))}
          </PlayerList>
        )}
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
      {sortingModalOpen && (
        <Modal
          title="Sortera"
          size="s"
          onClose={() => setSortingModalOpen(false)}
          mobileBottomSheet
        >
          <SortingItemsContainer>
            {Object.values(SortByEnum).map((sortingType) => (
              <>
                <SortingItem isSelected={sortingType === sorting} onClick={() => setSorting(sortingType)}>
                  <NormalTypography variant="m">{sortingType}</NormalTypography>
                  <IconButtonContainer onClick={(e) => e.stopPropagation()}>
                    <IconButton
                      icon={sorting === sortingType ? <CheckCircle size={24} weight="fill" color={theme.colors.primary} /> : <Circle size={24} color={theme.colors.primary} />}
                      colors={sorting === sortingType ? {
                        normal: theme.colors.primary,
                        hover: theme.colors.primary,
                        active: theme.colors.primary,
                      } : {
                        normal: theme.colors.silverDarker,
                        hover: theme.colors.textDefault,
                        active: theme.colors.textDefault,
                      }}
                      onClick={() => setSorting(sortingType)}
                    />
                  </IconButtonContainer>
                </SortingItem>
                {sorting === SortByEnum.MONTHLY_RATING && sortingType === sorting && (
                  <Select
                    value={selectedMonth.toString()}
                    onChange={(value) => setSelectedMonth(parseInt(value))}
                    options={[
                      { label: 'Januari', value: '0' },
                      { label: 'Februari', value: '1' },
                      { label: 'Mars', value: '2' },
                      { label: 'April', value: '3' },
                      { label: 'Maj', value: '4' },
                      { label: 'Juni', value: '5' },
                      { label: 'Juli', value: '6' },
                      { label: 'Augusti', value: '7' },
                      { label: 'September', value: '8' },
                      { label: 'Oktober', value: '9' },
                      { label: 'November', value: '10' },
                      { label: 'December', value: '11' },
                    ]}
                  />
                )}
              </>
            ))}
          </SortingItemsContainer>
        </Modal>
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

const SortingItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  width: 100%;
  box-sizing: border-box;
`;

const SortingItem = styled.div<{ isSelected?: boolean }>`
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

const IconButtonContainer = styled.div``;

export default PlayerRatingsPage;
