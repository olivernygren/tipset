import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import {
  CheckCircle, Circle, Funnel, XCircle,
} from '@phosphor-icons/react';
import Modal from '../modal/Modal';
import Button from '../buttons/Button';
import { GeneralPositionEnum, Player } from '../../utils/Players';
import { HeadingsTypography, NormalTypography } from '../typography/Typography';
import { devices, theme } from '../../theme';
import IconButton from '../buttons/IconButton';
import { defenderGoalPoints, forwardGoalPoints, midfielderGoalPoints } from '../../utils/helpers';
import Avatar, { AvatarSize } from '../avatar/Avatar';
import Input from '../input/Input';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';
import TextButton from '../buttons/TextButton';
import Tag from '../tag/Tag';

interface GoalScorerModalProps {
  onSave: (player: Player | undefined) => void;
  onClose: () => void;
  players: Array<Player>;
  initialSelectedPlayer?: Player;
}

enum FilterEnum {
  DEFENDERS = 'DEFENDERS',
  MIDFIELDERS = 'MIDFIELDERS',
  FORWARDS = 'FORWARDS',
}

const GoalScorerModal = ({
  onSave, onClose, players, initialSelectedPlayer,
}: GoalScorerModalProps) => {
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const [selectedGoalScorer, setSelectedGoalScorer] = useState<Player | undefined>(initialSelectedPlayer);
  const [defenders, setDefenders] = useState<Array<Player>>([]);
  const [midfielders, setMidfielders] = useState<Array<Player>>([]);
  const [forwards, setForwards] = useState<Array<Player>>([]);
  const [searchValue, setSearchValue] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Array<FilterEnum>>([FilterEnum.DEFENDERS, FilterEnum.MIDFIELDERS, FilterEnum.FORWARDS]);

  const iconButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const defenders = players.filter((player) => player.position.general === GeneralPositionEnum.DF);
    const midfielders = players.filter((player) => player.position.general === GeneralPositionEnum.MF);
    const forwards = players.filter((player) => player.position.general === GeneralPositionEnum.FW);

    setDefenders(defenders);
    setMidfielders(midfielders);
    setForwards(forwards);
  }, [players]);

  const handleCardClick = (player: Player) => {
    setSelectedGoalScorer(player);
  };

  const handleSearch = (value: string) => {
    const filteredPlayers = players.filter((player) => player.name.toLowerCase().includes(value.toLowerCase()));
    const defenders = filteredPlayers.filter((player) => player.position.general === GeneralPositionEnum.DF);
    const midfielders = filteredPlayers.filter((player) => player.position.general === GeneralPositionEnum.MF);
    const forwards = filteredPlayers.filter((player) => player.position.general === GeneralPositionEnum.FW);

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

  const getPlayer = (player: Player) => (
    <PlayerItem
      key={player.id}
      hasPlayerPicture={Boolean(player.picture)}
      onClick={() => handleCardClick(player)}
      isSelected={selectedGoalScorer && selectedGoalScorer.id === player.id}
    >
      <PlayerInfo>
        {player.picture && (
          <Avatar
            src={player.picture}
            alt={player.name}
            size={AvatarSize.M}
            objectFit="cover"
            showBorder
          />
        )}
        <NormalTypography variant="m" onClick={() => setSelectedGoalScorer(player)}>
          {player.name}
        </NormalTypography>
      </PlayerInfo>
      <IconButtonContainer ref={iconButtonRef}>
        <IconButton
          icon={selectedGoalScorer && selectedGoalScorer.id === player.id ? <CheckCircle size={30} weight="fill" /> : <Circle size={30} />}
          colors={
          selectedGoalScorer && selectedGoalScorer.id === player.id ? {
            normal: theme.colors.primary,
            hover: theme.colors.primary,
            active: theme.colors.primary,
          } : {
            normal: theme.colors.silverDarker,
            hover: theme.colors.textDefault,
            active: theme.colors.textDefault,
          }
        }
          onClick={() => setSelectedGoalScorer(player)}
        />
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
            onSave(selectedGoalScorer);
            onClose();
          }}
          fullWidth
          disabled={!selectedGoalScorer}
        >
          Välj spelare
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

const PlayerItem = styled.div<{ hasPlayerPicture: boolean, isSelected?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ hasPlayerPicture }) => (hasPlayerPicture ? `0 ${theme.spacing.xs} 0 ${theme.spacing.xxxs}` : `${theme.spacing.xxs} ${theme.spacing.xs}`)};
  box-shadow: 0px 3px 0px rgba(0, 0, 0, 0.08);
  border-radius: ${theme.borderRadius.m};
  background-color: ${({ isSelected }) => (isSelected ? theme.colors.primaryFade : theme.colors.silverBleach)};
  cursor: pointer;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid ${({ isSelected }) => (isSelected ? theme.colors.primaryLighter : theme.colors.silverLight)};
  transition: background-color 0.2s;
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

export default GoalScorerModal;
