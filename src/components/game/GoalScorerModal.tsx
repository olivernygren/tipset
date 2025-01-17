import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import {
  Ambulance,
  Bandaids,
  CheckCircle, Circle, Funnel, Info, Rectangle, SoccerBall, Virus, XCircle,
} from '@phosphor-icons/react';
import Modal from '../modal/Modal';
import Button from '../buttons/Button';
import {
  GeneralPositionEnum, Player, PlayerStatusEnum,
} from '../../utils/Players';
import { EmphasisTypography, HeadingsTypography, NormalTypography } from '../typography/Typography';
import { devices, theme } from '../../theme';
import IconButton from '../buttons/IconButton';
import {
  defenderGoalPoints, forwardGoalPoints, getSortedPlayerByPosition, midfielderGoalPoints,
} from '../../utils/helpers';
import Avatar, { AvatarSize } from '../avatar/Avatar';
import Input from '../input/Input';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';
import TextButton from '../buttons/TextButton';
import Tag from '../tag/Tag';
import { Section } from '../section/Section';
import { Fixture } from '../../utils/Fixture';
import { getFlagUrlByCountryName, TournamentsEnum } from '../../utils/Team';
import NationAvatar from '../avatar/NationAvatar';
import { FotMobStatListItem, getFotMobGoalStatsUrl } from '../../utils/Fotmob';

interface GoalScorerModalProps {
  onSave: (players: Array<Player | undefined>) => void;
  onClose: () => void;
  homeTeamPlayers: Array<Player>;
  awayTeamPlayers: Array<Player>;
  fixture?: Fixture;
  initialSelectedPlayers?: Array<Player | undefined>;
  multiple?: boolean;
  previousGameWeekPredictedGoalScorers?: Array<Player>;
}

enum FilterEnum {
  DEFENDERS = 'DEFENDERS',
  MIDFIELDERS = 'MIDFIELDERS',
  FORWARDS = 'FORWARDS',
}

interface PlayerGoal {
  teamName: string;
  teamId: string;
  playerName: string;
  playerId: string;
  goals: number;
}

const GoalScorerModal = ({
  onSave,
  onClose,
  initialSelectedPlayers,
  multiple,
  previousGameWeekPredictedGoalScorers,
  homeTeamPlayers,
  awayTeamPlayers,
  fixture,
}: GoalScorerModalProps) => {
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const [playersToShow, setPlayersToShow] = useState<Array<Player>>(homeTeamPlayers);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [selectedGoalScorers, setSelectedGoalScorers] = useState<Array<Player | undefined>>(initialSelectedPlayers || []);
  const [defenders, setDefenders] = useState<Array<Player>>([]);
  const [midfielders, setMidfielders] = useState<Array<Player>>([]);
  const [forwards, setForwards] = useState<Array<Player>>([]);
  const [searchValue, setSearchValue] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Array<FilterEnum>>([FilterEnum.DEFENDERS, FilterEnum.MIDFIELDERS, FilterEnum.FORWARDS]);
  // const [playerRatings, setPlayerRatings] = useState<Array<PlayerRating>>([]);
  const [previouslySelectedGoalScorer, setPreviouslySelectedGoalScorer] = useState<Player | null>(null);
  const [goalStats, setGoalStats] = useState<Array<PlayerGoal>>([]);

  const isPlayerIsSelected = (player: Player) => selectedGoalScorers.some((selectedPlayer) => selectedPlayer && selectedPlayer.id === player.id);
  const wasLastWeeksSelectedGoalScorer = (player: Player) => previousGameWeekPredictedGoalScorers?.some((selectedPlayer) => selectedPlayer.id === player.id && playersToShow.some((playerToShow) => playerToShow.id === player.id));
  const isPlayerItemDisabled = (player: Player) => wasLastWeeksSelectedGoalScorer(player) || player.isInjured || player.isSuspended || player.status === PlayerStatusEnum.INJURED || player.status === PlayerStatusEnum.SUSPENDED;
  // const playerExistsInRatings = (player: Player) => playerRatings.some((rating) => rating.playerName === player.name);
  // const previousGameWeekPredictedGoalScorerExists = previousGameWeekPredictedGoalScorers?.some((player) => playersToShow.some((playerToShow) => playerToShow.id === player.id));

  // useEffect(() => {
  //   const fetchRatings = async () => {
  //     try {
  //       const playerRatingCollectionRef = collection(db, CollectionEnum.PLAYER_RATINGS);
  //       if (!playerRatingCollectionRef) return;

  //       const playerRatingData = await getDocs(playerRatingCollectionRef);
  //       const playerRatings = withDocumentIdOnObjectsInArray<PlayerRating>(playerRatingData.docs);

  //       setPlayerRatings(playerRatings);
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };

  //   fetchRatings();
  // }, []);

  useEffect(() => {
    const fetchGoalStats = async (): Promise<{ homeTeamPlayersStats: Array<FotMobStatListItem>, awayTeamPlayersStats: Array<FotMobStatListItem> }> => {
      // Get fetch url by fixture tournament
      const res = await fetch(getFotMobGoalStatsUrl(fixture?.tournament as TournamentsEnum));
      const data = await res.json();
      const playersList: Array<FotMobStatListItem> = data.TopLists[0].StatList;
      const homeTeamPlayersStats = playersList.filter((player: FotMobStatListItem) => fixture?.homeTeam.name.includes(player.TeamName) || player.TeamId.toString() === fixture?.homeTeam.id?.toString() || player.TeamName === fixture?.homeTeam.fotMobName);
      const awayTeamPlayersStats = playersList.filter((player: FotMobStatListItem) => fixture?.awayTeam.name.includes(player.TeamName) || player.TeamId.toString() === fixture?.awayTeam.id?.toString() || player.TeamName === fixture?.awayTeam.fotMobName);
      return { homeTeamPlayersStats, awayTeamPlayersStats };
    };
    fetchGoalStats().then(({ homeTeamPlayersStats, awayTeamPlayersStats }) => {
      const convertedHomeTeamPlayers: Array<PlayerGoal> = homeTeamPlayersStats.map((player) => ({
        teamName: player.TeamName,
        playerName: player.ParticipantName,
        goals: player.StatValue,
        playerId: player.ParticipantId?.toString() ?? '',
        teamId: player.TeamId?.toString() ?? fixture?.homeTeam.id,
      }));
      const convertedAwayTeamPlayers: Array<PlayerGoal> = awayTeamPlayersStats.map((player) => ({
        teamName: player.TeamName,
        playerName: player.ParticipantName,
        goals: player.StatValue,
        playerId: player.ParticipantId?.toString() ?? '',
        teamId: player.TeamId?.toString() ?? fixture?.awayTeam.id,
      }));

      setGoalStats([...convertedHomeTeamPlayers, ...convertedAwayTeamPlayers]);
    });
  }, []);

  useEffect(() => {
    const hasHomeTeamPlayers = homeTeamPlayers.length > 0;
    const hasAwayTeamPlayers = awayTeamPlayers.length > 0;

    if (hasHomeTeamPlayers) {
      setPlayersToShow(homeTeamPlayers);
      setSelectedTeam('home');
      return;
    }

    if (hasAwayTeamPlayers && !hasHomeTeamPlayers) {
      setPlayersToShow(awayTeamPlayers);
      setSelectedTeam('away');
    }
  }, []);

  useEffect(() => {
    const sortedPlayers = getSortedPlayerByPosition(playersToShow);
    const defenders = sortedPlayers.filter((player) => player.position.general === GeneralPositionEnum.DF);
    const midfielders = sortedPlayers.filter((player) => player.position.general === GeneralPositionEnum.MF);
    const forwards = sortedPlayers.filter((player) => player.position.general === GeneralPositionEnum.FW);

    setDefenders(defenders);
    setMidfielders(midfielders);
    setForwards(forwards);
  }, [playersToShow]);

  useEffect(() => {
    if (previousGameWeekPredictedGoalScorers && previousGameWeekPredictedGoalScorers.length > 0) {
      if (playersToShow.some((player) => previousGameWeekPredictedGoalScorers.some((previousPlayer) => previousPlayer.id === player.id))) {
        const previouslySelectedGoalScorer = previousGameWeekPredictedGoalScorers.find((player) => playersToShow.some((playerToShow) => playerToShow.id === player.id));
        console.log('previouslySelectedGoalScorer', previouslySelectedGoalScorer);

        setPreviouslySelectedGoalScorer(previouslySelectedGoalScorer || null);
      } else {
        setPreviouslySelectedGoalScorer(null);
      }
    }
  }, [playersToShow]);

  const handlePlayerClick = (player: Player) => {
    if (multiple) {
      if (selectedGoalScorers.includes(player)) {
        setSelectedGoalScorers(selectedGoalScorers.filter((selectedPlayer) => selectedPlayer !== player));
      } else {
        setSelectedGoalScorers([...selectedGoalScorers, player]);
      }
    } else {
      setSelectedGoalScorers([player]);
    }
  };

  const handleSearch = (value: string) => {
    const filteredPlayers = playersToShow.filter((player) => player.name.toLowerCase().includes(value.toLowerCase()));
    const sortedPlayers = getSortedPlayerByPosition(filteredPlayers);
    const defenders = sortedPlayers.filter((player) => player.position.general === GeneralPositionEnum.DF);
    const midfielders = sortedPlayers.filter((player) => player.position.general === GeneralPositionEnum.MF);
    const forwards = sortedPlayers.filter((player) => player.position.general === GeneralPositionEnum.FW);

    setDefenders(defenders);
    setMidfielders(midfielders);
    setForwards(forwards);
  };

  const handleFilterTagClick = (filter: FilterEnum) => {
    if (selectedFilters.includes(filter)) {
      setSelectedFilters(selectedFilters.filter((selectedFilter) => selectedFilter !== filter));
    } else {
      setSelectedFilters([...selectedFilters, filter]);
    }
  };

  // const getGoalsScoredForPlayer = (playerName: string) => {
  //   const playerRating = playerRatings.find((rating) => rating.playerName === playerName);
  //   return playerRating ? playerRating.goals : 0;
  // };

  const getPlayer = (player: Player) => (
    <PlayerItem
      key={player.id}
      hasPlayerPicture
      onClick={() => handlePlayerClick(player)}
      isSelected={isPlayerIsSelected(player)}
      disabled={isPlayerItemDisabled(player)}
    >
      <PlayerInfo>
        <AvatarContainer>
          <Avatar
            src={player.externalPictureUrl ?? player.picture ?? '/images/placeholder-fancy.png'}
            alt={player.name}
            size={AvatarSize.M}
            objectFit="cover"
            showBorder
            customBorderWidth={1}
            opacity={isPlayerItemDisabled(player) ? 0.4 : 1}
            backgroundColor={theme.colors.silverLight}
          />
          {!isPlayerItemDisabled(player) && (
            <NationAvatarContainer>
              {player.country && (
                <NationAvatar
                  flagUrl={getFlagUrlByCountryName(player.country)}
                  nationName={player.country as string}
                  size={AvatarSize.XS}
                />
              )}
            </NationAvatarContainer>
          )}
        </AvatarContainer>
        <NormalTypography variant="m" color={isPlayerItemDisabled(player) ? theme.colors.silver : theme.colors.textDefault}>
          {player.name}
        </NormalTypography>
      </PlayerInfo>
      <IconButtonContainer onClick={(e) => e.stopPropagation()}>
        {isPlayerItemDisabled(player) ? (
          <IconContainer>
            {(player.status === PlayerStatusEnum.INJURED) && (
              <Ambulance size={24} color={theme.colors.redDark} weight="fill" />
            )}
            {(player.status === PlayerStatusEnum.SUSPENDED) && (
              <Rectangle style={{ transform: 'rotate(90deg)' }} size={24} color={theme.colors.redDark} weight="fill" />
            )}
          </IconContainer>
        ) : (
          <Flex>
            {/* {playerExistsInRatings(player) && (
              <GoalsScored>
                <NormalTypography variant="s" color={theme.colors.silver}>
                  {getGoalsScoredForPlayer(player.name)}
                </NormalTypography>
                <SoccerBall size={16} color={theme.colors.silver} weight="fill" />
              </GoalsScored>
            )} */}
            {goalStats.find((p) => player.id === p.playerId || player.name === p.playerName) && (
              <GoalsScored>
                <NormalTypography variant="s" color={theme.colors.silver}>
                  {goalStats.find((p) => player.id === p.playerId || player.name === p.playerName)?.goals}
                </NormalTypography>
                <SoccerBall size={16} color={theme.colors.silver} weight="fill" />
              </GoalsScored>
            )}
            {(player.status === PlayerStatusEnum.MAY_BE_INJURED) && (
              <Bandaids size={24} color={theme.colors.gold} weight="fill" />
            )}
            {(player.status === PlayerStatusEnum.ILL) && (
              <Virus size={24} color={theme.colors.primaryDark} weight="fill" />
            )}
            <IconButton
              icon={isPlayerIsSelected(player) ? <CheckCircle size={30} weight="fill" /> : <Circle size={30} />}
              colors={
                isPlayerIsSelected(player) ? {
                  normal: theme.colors.primary,
                  hover: theme.colors.primary,
                  active: theme.colors.primary,
                } : {
                  normal: wasLastWeeksSelectedGoalScorer(player) ? theme.colors.silverLight : theme.colors.silverDarker,
                  hover: wasLastWeeksSelectedGoalScorer(player) ? theme.colors.silverLight : theme.colors.textDefault,
                  active: wasLastWeeksSelectedGoalScorer(player) ? theme.colors.silverLight : theme.colors.textDefault,
                }
              }
              onClick={() => handlePlayerClick(player)}
            />
          </Flex>
        )}
      </IconButtonContainer>
    </PlayerItem>
  );

  const getFilterTag = (filter: FilterEnum) => {
    const getLabel = () => {
      switch (filter) {
        case FilterEnum.DEFENDERS:
          return 'Försvarare';
        case FilterEnum.MIDFIELDERS:
          return 'Mittfältare';
        case FilterEnum.FORWARDS:
          return 'Anfallare';
        default:
          return '';
      }
    };

    return (
      <Tag
        text={getLabel()}
        backgroundColor={theme.colors.primaryFade}
        textAndIconColor={theme.colors.primaryDark}
        size="m"
        icon={
          selectedFilters.includes(filter)
            ? <CheckCircle size={20} weight="fill" color={theme.colors.primaryDark} />
            : <Circle size={20} color={theme.colors.primary} />
        }
        onClick={() => handleFilterTagClick(filter)}
      />
    );
  };

  return (
    <Modal
      title="Välj målskytt"
      onClose={onClose}
      headerDivider
      mobileFullScreen
      noPadding
    >
      <ModalToolBar>
        <ModalToolBarTopRow>
          <Input
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.currentTarget.value);
              handleSearch(e.currentTarget.value);
            }}
            placeholder="Sök spelare"
            compact={isMobile}
            fullWidth
          />
          <TextButton
            icon={showFilters ? <XCircle size={24} color={theme.colors.primary} /> : <Funnel size={24} color={theme.colors.primary} />}
            onClick={() => setShowFilters(!showFilters)}
            noPadding={isMobile}
          >
            Filtrera
          </TextButton>
        </ModalToolBarTopRow>
        {showFilters && (
          <FiltersContainer>
            {getFilterTag(FilterEnum.DEFENDERS)}
            {getFilterTag(FilterEnum.MIDFIELDERS)}
            {getFilterTag(FilterEnum.FORWARDS)}
          </FiltersContainer>
        )}
      </ModalToolBar>
      <ModalContent>
        <TeamTabs>
          {homeTeamPlayers.length > 0 && (
            <TeamTab
              selected={selectedTeam === 'home'}
              onClick={() => {
                setPlayersToShow(homeTeamPlayers);
                setSelectedTeam('home');
              }}
            >
              <EmphasisTypography variant="m" color={selectedTeam === 'home' ? theme.colors.white : theme.colors.silverDarker}>
                {fixture?.homeTeam.name ?? ''}
              </EmphasisTypography>
            </TeamTab>
          )}
          {awayTeamPlayers.length > 0 && (
            <TeamTab
              selected={selectedTeam === 'away'}
              onClick={() => {
                setPlayersToShow(awayTeamPlayers);
                setSelectedTeam('away');
              }}
            >
              <EmphasisTypography variant="m" color={selectedTeam === 'away' ? theme.colors.white : theme.colors.silverDarker}>
                {fixture?.awayTeam.name ?? ''}
              </EmphasisTypography>
            </TeamTab>
          )}
        </TeamTabs>
        {previouslySelectedGoalScorer && (
          <PreviousGoalScorer>
            <Section flexDirection="row" gap="xxs" alignItems="center">
              <Info size={24} color={theme.colors.silverDarker} weight="fill" />
              <HeadingsTypography variant="h6" color={theme.colors.silverDarker}>Välj en ny målskytt</HeadingsTypography>
            </Section>
            <Section flexDirection="column" gap={isMobile ? 'xxs' : 'xxxs'} padding={`0 0 0 ${theme.spacing.l}`}>
              <NormalTypography variant="s" color={theme.colors.silverDarker}>
                Kom ihåg att du inte kan välja samma målskytt som förra omgången
              </NormalTypography>
              <Section flexDirection={isMobile ? 'column' : 'row'} alignItems={isMobile ? 'flex-start' : 'center'} gap="xxxs">
                <NormalTypography variant="s" color={theme.colors.silverDarker}>
                  Förra omgången valde du:
                </NormalTypography>
                <EmphasisTypography variant="s" color={theme.colors.silverDarker}>
                  {previouslySelectedGoalScorer.name}
                </EmphasisTypography>
              </Section>
            </Section>
          </PreviousGoalScorer>
        )}
        {selectedFilters.includes(FilterEnum.DEFENDERS) && defenders.length > 0 && (
          <PositionContainer>
            <HeadingsTypography variant="h5">{`Försvarare (${defenderGoalPoints}p)`}</HeadingsTypography>
            <PlayerList>
              {defenders.map((player) => getPlayer(player))}
            </PlayerList>
          </PositionContainer>
        )}
        {selectedFilters.includes(FilterEnum.MIDFIELDERS) && midfielders.length > 0 && (
          <PositionContainer>
            <HeadingsTypography variant="h5">{`Mittfältare (${midfielderGoalPoints}p)`}</HeadingsTypography>
            <PlayerList>
              {midfielders.map((player) => getPlayer(player))}
            </PlayerList>
          </PositionContainer>
        )}
        {selectedFilters.includes(FilterEnum.FORWARDS) && forwards.length > 0 && (
          <PositionContainer>
            <HeadingsTypography variant="h5">{`Anfallare (${forwardGoalPoints}p)`}</HeadingsTypography>
            <PlayerList>
              {forwards.map((player) => getPlayer(player))}
            </PlayerList>
          </PositionContainer>
        )}
      </ModalContent>
      <ButtonsContainer>
        <Button
          variant="secondary"
          onClick={onClose}
          fullWidth
        >
          Avbryt
        </Button>
        <Button
          onClick={() => {
            onSave(selectedGoalScorers);
            onClose();
          }}
          fullWidth
          disabled={!selectedGoalScorers}
        >
          {multiple ? `Välj spelare (${selectedGoalScorers.length} st)` : 'Välj spelare'}
        </Button>
      </ButtonsContainer>
    </Modal>
  );
};

const ModalToolBar = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  border-bottom: 1px solid ${theme.colors.silverLight};
  padding: ${theme.spacing.s} ${theme.spacing.m};

  @media ${devices.tablet} {
    padding: ${theme.spacing.s} ${theme.spacing.l};
  }
`;

const ModalToolBarTopRow = styled.div`
  width: 100%;
  box-sizing: border-box;
  gap: ${theme.spacing.xs};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.xxs};
  align-items: center;
  flex-wrap: wrap;
`;

const PlayerItem = styled.div<{ hasPlayerPicture: boolean, isSelected?: boolean, disabled?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ hasPlayerPicture }) => (hasPlayerPicture ? `0 ${theme.spacing.xs} 0 ${theme.spacing.xxxs}` : `${theme.spacing.xxs} ${theme.spacing.xs}`)};
  box-shadow: 0px 3px 0px rgba(0, 0, 0, 0.08);
  border-radius: ${theme.borderRadius.m};
  cursor: pointer;
  width: 100%;
  box-sizing: border-box;
  transition: background-color 0.2s;
  
  ${({ disabled, isSelected }) => (disabled ? css`
    background-color: ${theme.colors.silverLighter};
    border: 1px solid ${theme.colors.silverLight};
    pointer-events: none;
  ` : css`
    background-color: ${isSelected ? theme.colors.primaryFade : theme.colors.silverBleach};
    border: 1px solid ${isSelected ? theme.colors.primaryLighter : theme.colors.silverLight};
  `)};
`;

const PlayerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xxxs};
`;

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.m};
  padding: ${theme.spacing.m};
  overflow-y: auto;
  flex-grow: 1;
  
  @media ${devices.tablet} {
    padding: ${theme.spacing.l};
  }
`;

const PositionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

const PlayerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
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

const PreviousGoalScorer = styled.div`
  display: flex;
  gap: ${theme.spacing.xxs};
  flex-direction: column;
  padding: ${theme.spacing.xs};
  border-radius: ${theme.borderRadius.m};
  background-color: ${theme.colors.silverBleach};
  border: 1px solid ${theme.colors.silverLight};
  width: 100%;
  box-sizing: border-box;
`;

const IconContainer = styled.div`
  margin-right: ${theme.spacing.xxs};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Flex = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

const GoalsScored = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xxxs};
  width: fit-content;
`;

const TeamTabs = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xxs};
  padding-bottom: ${theme.spacing.xxs};
  border-bottom: 1px solid ${theme.colors.silverLight};
`;

const TeamTab = styled.div<{ selected?: boolean }>`
  padding: ${theme.spacing.xxs} ${theme.spacing.xs};
  border-radius: ${theme.borderRadius.s};
  background-color: ${({ selected }) => (selected ? theme.colors.primary : theme.colors.silverLighter)};
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ selected }) => (selected ? theme.colors.primary : theme.colors.primaryBleach)};
  }
`;

const AvatarContainer = styled.div`
  height: fit-content;
  width: fit-content;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: ${theme.spacing.xxxs};
`;

const NationAvatarContainer = styled.div<{ disabled?: boolean }>`
  position: absolute;
  bottom: 0px;
  right: 0px;
  opacity: ${({ disabled }) => (disabled ? 0.4 : 1)};
`;

export default GoalScorerModal;
