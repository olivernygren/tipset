import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { CheckCircle, Circle } from '@phosphor-icons/react';
import Modal from '../modal/Modal';
import Button from '../buttons/Button';
import { GeneralPositionEnum, Player } from '../../utils/Players';
import { HeadingsTypography, NormalTypography } from '../typography/Typography';
import { devices, theme } from '../../theme';
import IconButton from '../buttons/IconButton';
import { defenderGoalPoints, forwardGoalPoints, midfielderGoalPoints } from '../../utils/helpers';
import Avatar, { AvatarSize } from '../avatar/Avatar';

interface GoalScorerModalProps {
  onSave: (player: Player | undefined) => void;
  onClose: () => void;
  players: Array<Player>;
}

const GoalScorerModal = ({ onSave, onClose, players }: GoalScorerModalProps) => {
  const [selectedGoalScorer, setSelectedGoalScorer] = useState<Player | undefined>(undefined);
  const [defenders, setDefenders] = useState<Array<Player>>([]);
  const [midfielders, setMidfielders] = useState<Array<Player>>([]);
  const [forwards, setForwards] = useState<Array<Player>>([]);

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

  return (
    <Modal
      title="Välj målskytt"
      onClose={onClose}
      headerDivider
      mobileBottomSheet
      noPadding
    >
      <ModalContent>
        <PositionContainer>
          <HeadingsTypography variant="h5">{`Försvarare (${defenderGoalPoints}p)`}</HeadingsTypography>
          <PlayerList>
            {defenders.map((player) => getPlayer(player))}
          </PlayerList>
        </PositionContainer>
        <PositionContainer>
          <HeadingsTypography variant="h5">{`Mittfältare (${midfielderGoalPoints}p)`}</HeadingsTypography>
          <PlayerList>
            {midfielders.map((player) => getPlayer(player))}
          </PlayerList>
        </PositionContainer>
        <PositionContainer>
          <HeadingsTypography variant="h5">{`Anfallare (${forwardGoalPoints}p)`}</HeadingsTypography>
          <PlayerList>
            {forwards.map((player) => getPlayer(player))}
          </PlayerList>
        </PositionContainer>
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
          onClick={() => onSave(selectedGoalScorer)}
          fullWidth
          disabled={!selectedGoalScorer}
        >
          Välj spelare
        </Button>
      </ButtonsContainer>
    </Modal>
  );
};

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
