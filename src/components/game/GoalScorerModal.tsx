import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import {
  Ambulance,
  Bandaids,
  CheckCircle, Circle, Funnel, Info, Square, XCircle,
} from '@phosphor-icons/react';
import Modal from '../modal/Modal';
import Button from '../buttons/Button';
import { GeneralPositionEnum, Player } from '../../utils/Players';
import { EmphasisTypography, HeadingsTypography, NormalTypography } from '../typography/Typography';
import { devices, theme } from '../../theme';
import IconButton from '../buttons/IconButton';
import { defenderGoalPoints, forwardGoalPoints, midfielderGoalPoints } from '../../utils/helpers';
import Avatar, { AvatarSize } from '../avatar/Avatar';
import Input from '../input/Input';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';
import TextButton from '../buttons/TextButton';
import Tag from '../tag/Tag';
import { Section } from '../section/Section';

interface GoalScorerModalProps {
  onSave: (players: Array<Player | undefined>) => void;
  onClose: () => void;
  players: Array<Player>;
  initialSelectedPlayers?: Array<Player | undefined>;
  multiple?: boolean;
  previousGameWeekPredictedGoalScorer?: Player | undefined;
}

enum FilterEnum {
  DEFENDERS = 'DEFENDERS',
  MIDFIELDERS = 'MIDFIELDERS',
  FORWARDS = 'FORWARDS',
}

const GoalScorerModal = ({
  onSave, onClose, players, initialSelectedPlayers, multiple, previousGameWeekPredictedGoalScorer,
}: GoalScorerModalProps) => {
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const [selectedGoalScorers, setSelectedGoalScorers] = useState<Array<Player | undefined>>(initialSelectedPlayers || []);
  const [defenders, setDefenders] = useState<Array<Player>>([]);
  const [midfielders, setMidfielders] = useState<Array<Player>>([]);
  const [forwards, setForwards] = useState<Array<Player>>([]);
  const [searchValue, setSearchValue] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Array<FilterEnum>>([FilterEnum.DEFENDERS, FilterEnum.MIDFIELDERS, FilterEnum.FORWARDS]);

  const isPlayerIsSelected = (player: Player) => selectedGoalScorers.some((selectedPlayer) => selectedPlayer && selectedPlayer.id === player.id);
  const wasLastWeeksSelectedGoalScorer = (player: Player) => previousGameWeekPredictedGoalScorer && previousGameWeekPredictedGoalScorer.id === player.id;
  const isPlayerItemDisabled = (player: Player) => wasLastWeeksSelectedGoalScorer(player) || player.isInjured || player.isSuspended;

  useEffect(() => {
    const defenders = players.filter((player) => player.position.general === GeneralPositionEnum.DF);
    const midfielders = players.filter((player) => player.position.general === GeneralPositionEnum.MF);
    const forwards = players.filter((player) => player.position.general === GeneralPositionEnum.FW);

    setDefenders(defenders);
    setMidfielders(midfielders);
    setForwards(forwards);
  }, [players]);

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
      onClick={() => handlePlayerClick(player)}
      isSelected={isPlayerIsSelected(player)}
      disabled={isPlayerItemDisabled(player)}
    >
      <PlayerInfo>
        {player.picture && (
          <Avatar
            src={player.picture}
            alt={player.name}
            size={AvatarSize.M}
            objectFit="cover"
            showBorder
            opacity={isPlayerItemDisabled(player) ? 0.4 : 1}
          />
        )}
        <NormalTypography variant="m" color={isPlayerItemDisabled(player) ? theme.colors.silver : theme.colors.textDefault}>
          {player.name}
        </NormalTypography>
      </PlayerInfo>
      <IconButtonContainer onClick={(e) => e.stopPropagation()}>
        {isPlayerItemDisabled(player) ? (
          <IconContainer>
            {player.isInjured && (
              <Ambulance size={24} color={theme.colors.redDark} weight="fill" />
            )}
            {player.isSuspended && (
              <Square size={24} color={theme.colors.redDark} weight="fill" />
            )}
          </IconContainer>
        ) : (
          <Flex>
            {player.mayBeInjured && (
              <Bandaids size={24} color={theme.colors.gold} weight="fill" />
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
        {previousGameWeekPredictedGoalScorer && (
          <PreviousGoalScorer>
            <Section flexDirection="row" gap="xxs" alignItems="center">
              <Info size={24} color={theme.colors.silverDarker} weight="fill" />
              <HeadingsTypography variant="h6" color={theme.colors.silverDarker}>Välj en ny målskytt</HeadingsTypography>
            </Section>
            <Section flexDirection="column" gap={isMobile ? 'xxs' : 'xxxs'} padding={`0 0 0 ${theme.spacing.l}`}>
              <NormalTypography variant="s" color={theme.colors.silverDarker}>
                Kom ihåg att du inte kan välja samma målskytt som förra omgången
              </NormalTypography>
              <Section flexDirection={isMobile ? 'column' : 'row'} alignItems={isMobile ? 'flex-start' : 'center'} gap={isMobile ? 'xxxs' : 'xxs'}>
                <NormalTypography variant="s" color={theme.colors.silverDarker}>
                  Förra omgången valde du:
                </NormalTypography>
                <EmphasisTypography variant="s" color={theme.colors.silverDarker}>
                  {previousGameWeekPredictedGoalScorer.name}
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

export default GoalScorerModal;
