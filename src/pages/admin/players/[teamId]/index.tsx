import {
  doc, getDoc, updateDoc,
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import {
  Ambulance,
  ArrowBendDoubleUpRight,
  Bandaids,
  CheckCircle,
  DotsThree, Engine, PencilSimple, Plus, Rectangle, Trash, Virus, X,
} from '@phosphor-icons/react';
import { db } from '../../../../config/firebase';
import { CollectionEnum } from '../../../../utils/Firebase';
import {
  getPlayerPositionColor, getPlayerStatusName, getSortedPlayerByPosition, withDocumentIdOnObject,
} from '../../../../utils/helpers';
import { getFlagUrlByCountryName, Team } from '../../../../utils/Team';
import { theme } from '../../../../theme';
import { HeadingsTypography, NormalTypography } from '../../../../components/typography/Typography';
import { GeneralPositionEnum, Player, PlayerStatusEnum } from '../../../../utils/Players';
import Button from '../../../../components/buttons/Button';
import ContextMenu from '../../../../components/menu/ContextMenu';
import ContextMenuOption from '../../../../components/menu/ContextMenuOption';
import IconButton from '../../../../components/buttons/IconButton';
import Modal from '../../../../components/modal/Modal';
import { Section } from '../../../../components/section/Section';
import { errorNotify } from '../../../../utils/toast/toastHelpers';
import RootToast from '../../../../components/toast/RootToast';
import { Divider } from '../../../../components/Divider';
import CreatePlayerModal from '../../../../components/players/CreatePlayerModal';
import Avatar, { AvatarSize } from '../../../../components/avatar/Avatar';
import NationAvatar from '../../../../components/avatar/NationAvatar';
import EditPlayerModal from '../../../../components/players/EditPlayerModal';
import DeleteTeamModal from '../../../../components/teams/DeleteTeamModal';
import EditTeamModal from '../../../../components/teams/EditTeamModal';
import EditPlayerStatusModal from '../../../../components/players/EditPlayerStatusModal';
import TextButton from '../../../../components/buttons/TextButton';

const PlayersByTeamPage = () => {
  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<Array<Player>>([]);

  const [goalKeepers, setGoalKeepers] = useState<Array<Player>>([]);
  const [defenders, setDefenders] = useState<Array<Player>>([]);
  const [midfielders, setMidfielders] = useState<Array<Player>>([]);
  const [forwards, setForwards] = useState<Array<Player>>([]);

  const [contextMenuOpen, setContextMenuOpen] = useState<boolean>(false);
  const [deleteTeamModalOpen, setDeleteTeamModalOpen] = useState<boolean>(false);
  const [editTeamModalOpen, setEditTeamModalOpen] = useState<boolean>(false);
  const [createPlayerModalOpen, setCreatePlayerModalOpen] = useState<boolean>(false);
  const [editPlayerModalOpen, setEditPlayerModalOpen] = useState<boolean>(false);
  const [editPlayer, setEditPlayer] = useState<Player | null>(null);
  const [editPlayerStatus, setEditPlayerStatus] = useState<Player | null>(null);
  const [deletePlayer, setDeletePlayer] = useState<Player | null>(null);
  const [isDeletePlayerModalOpen, setIsDeletePlayerModalOpen] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [deletePlayerLoading, setDeletePlayerLoading] = useState<boolean>(false);
  const [editPlayerStatusModalOpen, setEditPlayerStatusModalOpen] = useState<boolean>(false);

  const teamIdFromUrl = window.location.pathname.split('/')[3];

  useEffect(() => {
    fetchTeamById();
  }, []);

  useEffect(() => {
    if (players.length > 0) {
      setGoalKeepers(players.filter((player) => player.position.general === GeneralPositionEnum.GK));
      setDefenders(players.filter((player) => player.position.general === GeneralPositionEnum.DF));
      setMidfielders(players.filter((player) => player.position.general === GeneralPositionEnum.MF));
      setForwards(players.filter((player) => player.position.general === GeneralPositionEnum.FW));
    }
  }, [players]);

  const fetchTeamById = async () => {
    const docRef = doc(db, CollectionEnum.TEAMS, teamIdFromUrl);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const teamData = withDocumentIdOnObject<Team>(docSnap);
      setTeam(teamData);

      if (teamData.players) {
        setPlayers(teamData.players);
      }
    }
  };

  // Lägg till funktionalitet för transfer av spelare mellan lag samt att ändra status på spelare (skadad, avstängd etc)

  const handleDeletePlayer = async () => {
    if (!deletePlayer) {
      return;
    }

    setDeletePlayerLoading(true);

    const updatedPlayers = players.filter((player) => player.id !== deletePlayer.id);

    try {
      const teamDoc = await getDoc(doc(db, CollectionEnum.TEAMS, teamIdFromUrl));
      const teamData = withDocumentIdOnObject<Team>(teamDoc);

      if (teamData) {
        const updatedTeam = {
          ...teamData,
          players: updatedPlayers,
        };

        await updateDoc(doc(db, CollectionEnum.TEAMS, teamIdFromUrl), updatedTeam);
      }
      setIsDeletePlayerModalOpen(false);
      setDeletePlayer(null);
    } catch (error) {
      errorNotify('Något gick fel');
    } finally {
      setDeletePlayerLoading(false);
      fetchTeamById();
    }
  };

  const getPlayerPictureUrl = (player: Player) => {
    if (player.externalPictureUrl) {
      return player.externalPictureUrl;
    }
    return '/images/placeholder-fancy.png';
  };

  const getStatusTagBgColor = (status: PlayerStatusEnum) => {
    switch (status) {
      case PlayerStatusEnum.AVAILABLE:
        return theme.colors.silverLighter;
      case PlayerStatusEnum.INJURED:
        return theme.colors.redBleach;
      case PlayerStatusEnum.SUSPENDED:
        return theme.colors.silverLighter;
      case PlayerStatusEnum.MAY_BE_INJURED:
        return theme.colors.goldBleach;
      case PlayerStatusEnum.ILL:
        return theme.colors.primaryBleach;
      default:
        return theme.colors.silverLighter;
    }
  };

  const getStatusTagIcon = (status: PlayerStatusEnum) => {
    switch (status) {
      case PlayerStatusEnum.AVAILABLE:
        return null;
        // return <CheckCircle size={20} color={theme.colors.silverDark} weight="fill" />;
      case PlayerStatusEnum.INJURED:
        return <Ambulance size={20} color={theme.colors.redDark} weight="fill" />;
      case PlayerStatusEnum.SUSPENDED:
        return <Rectangle style={{ transform: 'rotate(90deg)' }} size={20} color={theme.colors.red} weight="fill" />;
      case PlayerStatusEnum.MAY_BE_INJURED:
        return <Bandaids size={20} color={theme.colors.goldDark} weight="fill" />;
      case PlayerStatusEnum.ILL:
        return <Virus size={20} color={theme.colors.primaryDark} weight="fill" />;
      default:
        return <Ambulance size={20} color={theme.colors.red} />;
    }
  };

  const getPlayer = (player: Player) => (
    <PlayerItem key={player.id} showHoverEffect={!isEditMode}>
      <PlayerInfoContainer>
        <PlayerPositionTag bgColor={getPlayerPositionColor((player?.position.general ?? '') as GeneralPositionEnum)}>
          <NormalTypography variant="xs" color={theme.colors.white}>{player?.position.exact ?? '?'}</NormalTypography>
        </PlayerPositionTag>
        <AvatarContainer>
          <Avatar
            src={getPlayerPictureUrl(player)}
            alt={player.name}
            size={AvatarSize.M}
            objectFit="cover"
            showBorder
            customBorderWidth={1}
            backgroundColor={theme.colors.silverLight}
          />
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
      {player.status && player.status !== PlayerStatusEnum.AVAILABLE && (
        <AvailabilityTag bgColor={getStatusTagBgColor(player.status ?? PlayerStatusEnum.AVAILABLE)} className="availability-tag">
          <NormalTypography variant="s" color={theme.colors.textDefault}>
            {getPlayerStatusName(player.status ?? PlayerStatusEnum.AVAILABLE)}
          </NormalTypography>
          {getStatusTagIcon(player.status ?? PlayerStatusEnum.AVAILABLE)}
        </AvailabilityTag>
      )}
      {isEditMode && (
        <Section gap="xxs" fitContent flexDirection="row" alignItems="center">
          <TextButton
            color="primary"
            onClick={(e) => {
              e?.stopPropagation();
              setEditPlayerStatus(player);
              setEditPlayerStatusModalOpen(true);
            }}
          >
            Status
          </TextButton>
          <IconButton
            icon={<ArrowBendDoubleUpRight size={20} />}
            colors={{ normal: theme.colors.textDefault }}
            onClick={() => {}}
          />
          <IconButton
            icon={<PencilSimple size={20} />}
            colors={{ normal: theme.colors.textDefault }}
            onClick={(e) => {
              e.stopPropagation();
              setEditPlayer(player);
              setEditPlayerModalOpen(true);
            }}
          />
          <IconButton
            icon={<Trash size={20} />}
            colors={{ normal: theme.colors.red }}
            onClick={(e) => {
              e.stopPropagation();
              setDeletePlayer(player);
              setIsDeletePlayerModalOpen(true);
            }}
          />
        </Section>
      )}
    </PlayerItem>
  );

  const getPlayersByPosition = (players: Array<Player>, title: string) => (
    <PlayersByPositionContainer>
      <PositionHeading>
        <HeadingsTypography variant="h5">{title}</HeadingsTypography>
        <NormalTypography variant="s" color={theme.colors.textLight}>{`(${players.length} st)`}</NormalTypography>
      </PositionHeading>
      {players.length > 0 ? players.map((player) => getPlayer(player)) : (
        <NormalTypography variant="m" color={theme.colors.textLight}>-</NormalTypography>
      )}
    </PlayersByPositionContainer>
  );

  return (
    <>
      <PageContent>
        <Header>
          <TeamNameAndLogo>
            <HeadingsTypography variant="h2" as="h1">{team?.name}</HeadingsTypography>
            <LogoContainer>
              {team?.logoUrl && <TeamLogo src={team?.logoUrl} alt={team?.name} />}
            </LogoContainer>
          </TeamNameAndLogo>
          <IconButton
            icon={contextMenuOpen ? <X size={28} /> : <DotsThree size={28} weight="bold" />}
            colors={{ normal: theme.colors.primary, hover: theme.colors.primaryDark, active: theme.colors.primaryDarker }}
            onClick={() => setContextMenuOpen(!contextMenuOpen)}
            showBorder
            backgroundColor={theme.colors.white}
          />
          {contextMenuOpen && (
            <ContextMenu positionX="right" positionY="bottom" offsetY={94 + 12} offsetX={0}>
              <ContextMenuOption
                icon={<PencilSimple size={24} color={theme.colors.textDefault} />}
                onClick={() => {
                  setEditTeamModalOpen(true);
                  setContextMenuOpen(false);
                }}
                label="Redigera lag"
                color={theme.colors.textDefault}
              />
              <ContextMenuOption
                icon={<Trash size={24} color={theme.colors.red} />}
                onClick={() => {
                  setDeleteTeamModalOpen(true);
                  setContextMenuOpen(false);
                }}
                label="Radera lag"
                color={theme.colors.red}
              />
            </ContextMenu>
          )}
        </Header>
        <Divider />
        <Header>
          <Section gap="xs" fitContent flexDirection="row">
            {players.length > 0 && (
              isEditMode ? (
                <Button
                  size="m"
                  icon={<CheckCircle size={20} weight="bold" color={theme.colors.white} />}
                  variant="primary"
                  onClick={() => setIsEditMode(false)}
                >
                  Slutför
                </Button>
              ) : (
                <Button
                  size="m"
                  icon={<PencilSimple size={20} weight="bold" color={theme.colors.primary} />}
                  variant="secondary"
                  onClick={() => setIsEditMode(true)}
                >
                  Redigera
                </Button>
              )
            )}
            <Button
              size="m"
              icon={<Plus size={20} weight="bold" color={theme.colors.white} />}
              variant="primary"
              onClick={() => setCreatePlayerModalOpen(true)}
              disabled={isEditMode}
            >
              Lägg till spelare
            </Button>
          </Section>
        </Header>
        {players.length > 0 ? (
          <PlayersContainer>
            {getPlayersByPosition(goalKeepers, 'Målvakter')}
            {getPlayersByPosition(getSortedPlayerByPosition(defenders), 'Försvarare')}
            {getPlayersByPosition(getSortedPlayerByPosition(midfielders), 'Mittfältare')}
            {getPlayersByPosition(getSortedPlayerByPosition(forwards), 'Anfallare')}
          </PlayersContainer>
        ) : (
          <NormalTypography variant="m" color={theme.colors.textLight}>Inga spelare</NormalTypography>
        )}
      </PageContent>
      {deleteTeamModalOpen && (
        <DeleteTeamModal
          onClose={() => setDeleteTeamModalOpen(false)}
          team={team}
        />
      )}
      {editTeamModalOpen && (
        <EditTeamModal
          onClose={() => setEditTeamModalOpen(false)}
          team={team}
          refetchTeam={fetchTeamById}
        />
      )}
      {createPlayerModalOpen && (
        <CreatePlayerModal
          onClose={() => setCreatePlayerModalOpen(false)}
          teamId={teamIdFromUrl}
          refetchPlayers={fetchTeamById}
        />
      )}
      {editPlayerModalOpen && (
        <EditPlayerModal
          onClose={() => setEditPlayerModalOpen(false)}
          teamId={teamIdFromUrl}
          refetchPlayers={fetchTeamById}
          player={editPlayer!}
        />
      )}
      {isDeletePlayerModalOpen && (
        <Modal
          title={`Radera ${deletePlayer?.name}`}
          onClose={() => setIsDeletePlayerModalOpen(false)}
          size="s"
        >
          <Section gap="m">
            <NormalTypography variant="m">
              Vill du radera spelaren permanent? Detta kan ej ångras!
            </NormalTypography>
            <Section flexDirection="row" gap="xs" alignItems="center">
              <Button
                onClick={() => setIsDeletePlayerModalOpen(false)}
                variant="secondary"
                fullWidth
                color="red"
                textColor={theme.colors.red}
              >
                Avbryt
              </Button>
              <Button
                onClick={handleDeletePlayer}
                variant="primary"
                fullWidth
                color="red"
                icon={<Trash size={20} color="white" weight="fill" />}
                loading={deletePlayerLoading}
                disabled={deletePlayerLoading}
              >
                {`Radera ${deletePlayer?.name}`}
              </Button>
            </Section>
          </Section>
        </Modal>
      )}
      {editPlayerStatusModalOpen && (
        <EditPlayerStatusModal
          onClose={() => setEditPlayerStatusModalOpen(false)}
          refetchPlayers={fetchTeamById}
          player={editPlayerStatus}
          teamId={teamIdFromUrl}
        />
      )}
      <RootToast />
    </>
  );
};

const PageContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.m};
  padding: ${theme.spacing.l};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${theme.spacing.xs};
  position: relative;
`;

const TeamNameAndLogo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  width: 40px;
`;

const TeamLogo = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const PlayersContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.m};
`;

const PlayerItem = styled.div<{ showHoverEffect: boolean }>`
  display: flex;
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

  ${({ showHoverEffect }) => showHoverEffect && css`
    &:hover {
      background-color: ${theme.colors.primaryFade};
      border-color: ${theme.colors.primaryLighter};
/* 
      .availability-tag {
        background-color: ${theme.colors.primaryBleach};
      } */
    }
  `}
`;

const PlayerInfoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xxs};
  width: 100%;
  box-sizing: border-box;
  flex: 1;
  padding-left: ${theme.spacing.xxs};
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

const NationAvatarContainer = styled.div`
  position: absolute;
  bottom: 0px;
  right: 0px;
`;

const PositionHeading = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xxs};
`;

const PlayersByPositionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xxs};
`;

const PlayerPositionTag = styled.div<{ bgColor: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xxxs} ${theme.spacing.xxs};
  border-radius: ${theme.borderRadius.l};
  background-color: ${({ bgColor }) => bgColor};
`;

const AvailabilityTag = styled.div<{ bgColor: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xxs} ${theme.spacing.xs};
  border-radius: ${theme.borderRadius.m};
  background-color: ${({ bgColor }) => bgColor};
  gap: 6px;
  transition: 0.15s ease;
`;

export default PlayersByTeamPage;
