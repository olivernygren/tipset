import { deleteDoc, doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  DotsThree, PencilSimple, Plus, Trash, X,
} from '@phosphor-icons/react';
import { db } from '../../../../config/firebase';
import { CollectionEnum } from '../../../../utils/Firebase';
import { withDocumentIdOnObject } from '../../../../utils/helpers';
import { getFlagUrlByCountryName, Team } from '../../../../utils/Team';
import { theme } from '../../../../theme';
import { EmphasisTypography, HeadingsTypography, NormalTypography } from '../../../../components/typography/Typography';
import { GeneralPositionEnum, Player } from '../../../../utils/Players';
import Button from '../../../../components/buttons/Button';
import ContextMenu from '../../../../components/menu/ContextMenu';
import ContextMenuOption from '../../../../components/menu/ContextMenuOption';
import IconButton from '../../../../components/buttons/IconButton';
import Modal from '../../../../components/modal/Modal';
import { Section } from '../../../../components/section/Section';
import Input from '../../../../components/input/Input';
import { errorNotify } from '../../../../utils/toast/toastHelpers';
import RootToast from '../../../../components/toast/RootToast';
import { Divider } from '../../../../components/Divider';
import CreatePlayerModal from '../../../../components/players/CreatePlayerModal';
import Avatar, { AvatarSize } from '../../../../components/avatar/Avatar';
import NationAvatar from '../../../../components/avatar/NationAvatar';
import {
  getNumberOfAppearancesByMonth, getNumberOfAppearancesString, getPlayerMonthlyRating, getPlayerSeasonRating,
} from '../../../../utils/playerRatingHelpers';

const PlayersByTeamPage = () => {
  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<Array<Player>>([]);

  const [goalKeepers, setGoalKeepers] = useState<Array<Player>>([]);
  const [defenders, setDefenders] = useState<Array<Player>>([]);
  const [midfielders, setMidfielders] = useState<Array<Player>>([]);
  const [forwards, setForwards] = useState<Array<Player>>([]);

  const [contextMenuOpen, setContextMenuOpen] = useState<boolean>(false);
  const [deleteTeamModalOpen, setDeleteTeamModalOpen] = useState<boolean>(false);
  const [deleteTeamInputValue, setDeleteTeamInputValue] = useState<string>('');
  const [deleteTeamLoading, setDeleteTeamLoading] = useState<boolean>(false);
  const [createPlayerModalOpen, setCreatePlayerModalOpen] = useState<boolean>(false);

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

  const handleDeleteTeam = async () => {
    setDeleteTeamLoading(true);

    try {
      await deleteDoc(doc(db, CollectionEnum.TEAMS, teamIdFromUrl));
      setDeleteTeamModalOpen(false);
    } catch (e) {
      errorNotify('Något gick fel, försök igen senare');
    } finally {
      setDeleteTeamLoading(false);
    }
  };

  const getPlayer = (player: Player) => (
    <PlayerItem key={player.id}>
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
    </PlayerItem>
  );

  return (
    <>
      <PageContent>
        <Header>
          <HeadingsTypography variant="h2" as="h1">{team?.name}</HeadingsTypography>
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
                onClick={() => setDeleteTeamModalOpen(true)}
                label="Redigera"
                color={theme.colors.textDefault}
              />
              <ContextMenuOption
                icon={<Trash size={24} color={theme.colors.red} />}
                onClick={() => setDeleteTeamModalOpen(true)}
                label="Radera"
                color={theme.colors.red}
              />
            </ContextMenu>
          )}
        </Header>
        <Divider />
        <Header>
          <HeadingsTypography variant="h3">Spelare</HeadingsTypography>
          <Button
            size="m"
            icon={<Plus size={20} weight="bold" color={theme.colors.white} />}
            variant="primary"
            onClick={() => setCreatePlayerModalOpen(true)}
          >
            Lägg till spelare
          </Button>
        </Header>
        {players.length > 0 ? (
          players.map((player) => (
            <PlayersContainer key={player.id}>
              <PlayersByPositionContainer>
                <PositionHeading>
                  <HeadingsTypography variant="h5">Målvakter</HeadingsTypography>
                  {goalKeepers.length > 0 && (
                    <NormalTypography variant="s" color={theme.colors.textLight}>{`(${goalKeepers.length} st)`}</NormalTypography>
                  )}
                </PositionHeading>
                {goalKeepers.length > 0 ? goalKeepers.map((player) => getPlayer(player)) : <NormalTypography variant="m" color={theme.colors.textLight}>-</NormalTypography>}
              </PlayersByPositionContainer>
              <PlayersByPositionContainer>
                <PositionHeading>
                  <HeadingsTypography variant="h5">Försvarare</HeadingsTypography>
                  {goalKeepers.length > 0 && (
                    <NormalTypography variant="s" color={theme.colors.textLight}>{`(${defenders.length} st)`}</NormalTypography>
                  )}
                </PositionHeading>
                {defenders.length > 0 ? defenders.map((player) => getPlayer(player)) : <NormalTypography variant="m" color={theme.colors.textLight}>-</NormalTypography>}
              </PlayersByPositionContainer>
              <PlayersByPositionContainer>
                <PositionHeading>
                  <HeadingsTypography variant="h5">Mittfältare</HeadingsTypography>
                  {goalKeepers.length > 0 && (
                    <NormalTypography variant="s" color={theme.colors.textLight}>{`(${midfielders.length} st)`}</NormalTypography>
                  )}
                </PositionHeading>
                {midfielders.length > 0 ? midfielders.map((player) => getPlayer(player)) : <NormalTypography variant="m" color={theme.colors.textLight}>-</NormalTypography>}
              </PlayersByPositionContainer>
              <PlayersByPositionContainer>
                <PositionHeading>
                  <HeadingsTypography variant="h5">Anfallare</HeadingsTypography>
                  {goalKeepers.length > 0 && (
                  <NormalTypography variant="s" color={theme.colors.textLight}>{`(${forwards.length} st)`}</NormalTypography>
                  )}
                </PositionHeading>
                {forwards.length > 0 ? forwards.map((player) => getPlayer(player)) : <NormalTypography variant="m" color={theme.colors.textLight}>-</NormalTypography>}
              </PlayersByPositionContainer>
            </PlayersContainer>
          ))
        ) : (
          <NormalTypography variant="m" color={theme.colors.textLight}>Inga spelare</NormalTypography>
        )}
      </PageContent>
      {deleteTeamModalOpen && (
        <Modal
          title="Radera lag"
          onClose={() => setDeleteTeamModalOpen(false)}
          size="s"
        >
          <Section gap="m">
            <Section gap="xs">
              <NormalTypography variant="m">
                Vill du radera laget permanent? Detta kan ej ångras!
              </NormalTypography>
              <NormalTypography variant="m">
                Fyll i lagets namn för att bekräfta att du vill radera den.
              </NormalTypography>
            </Section>
            <Input
              value={deleteTeamInputValue}
              onChange={(e) => setDeleteTeamInputValue(e.target.value)}
              placeholder={team?.name}
              fullWidth
            />
            <Section flexDirection="row" gap="xs" alignItems="center">
              <Button
                onClick={() => setDeleteTeamModalOpen(false)}
                variant="secondary"
                fullWidth
                color="red"
                textColor={theme.colors.red}
              >
                Avbryt
              </Button>
              <Button
                onClick={handleDeleteTeam}
                variant="primary"
                fullWidth
                color="red"
                disabled={deleteTeamInputValue !== team?.name}
                icon={<Trash size={20} color="white" weight="fill" />}
                loading={deleteTeamLoading}
              >
                Radera lag
              </Button>
            </Section>
          </Section>
        </Modal>
      )}
      {createPlayerModalOpen && (
        <CreatePlayerModal
          onClose={() => setCreatePlayerModalOpen(false)}
          teamId={teamIdFromUrl}
          refetchPlayers={fetchTeamById}
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

const PlayersContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.m};
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

const PositionHeading = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xxs};
`;

const PlayersByPositionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

export default PlayersByTeamPage;
