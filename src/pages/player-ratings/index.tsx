import React, { useState } from 'react';
import styled from 'styled-components';
import {
  ArrowsDownUp, FloppyDisk, PlusCircle,
} from '@phosphor-icons/react';
import { EmphasisTypography, HeadingsTypography, NormalTypography } from '../../components/typography/Typography';
import { theme } from '../../theme';
import { Section } from '../../components/section/Section';
import { ArsenalPlayers, GeneralPositionEnum, Player } from '../../utils/Players';
import Avatar, { AvatarSize } from '../../components/avatar/Avatar';
import Button from '../../components/buttons/Button';
import SelectTeamModal from '../../components/game/SelectTeamModal';
import { TeamType } from '../../utils/Fixture';
import { getFlagUrlByCountryName, Team } from '../../utils/Team';
import CustomDatePicker from '../../components/input/DatePicker';
import SelectImitation from '../../components/input/SelectImitation';
import NationAvatar from '../../components/avatar/NationAvatar';

enum SortByEnum {
  POSITION = 'Position',
  RATING = 'Rating',
}

const PlayerRatingsPage = () => {
  const originalPlayers = ArsenalPlayers;

  const [sorting, setSorting] = useState<SortByEnum>(SortByEnum.POSITION);
  const [goalKeepers] = useState<Array<Player>>(originalPlayers.filter((player) => player.position.general === GeneralPositionEnum.GK));
  const [defenders] = useState<Array<Player>>(originalPlayers.filter((player) => player.position.general === GeneralPositionEnum.DF));
  const [midfielders] = useState<Array<Player>>(originalPlayers.filter((player) => player.position.general === GeneralPositionEnum.MF));
  const [forwards] = useState<Array<Player>>(originalPlayers.filter((player) => player.position.general === GeneralPositionEnum.FW));
  const [selectOpponentModalOpen, setSelectOpponentModalOpen] = useState<boolean>(false);
  const [showGameContent, setShowGameContent] = useState<boolean>(false);
  const [opponent, setOpponent] = useState<Team | undefined>(undefined);
  const [gameDate, setGameDate] = useState(new Date());

  console.log(setSorting);

  // Skapa PlayerRatings collection

  // Varje objekt i collection ska ha:
  // playerId: string
  // playerName: string
  // startingAppearances: number
  // substituteAppearances: number (startingAppearances + substituteAppearances = totalAppearances)
  // goals: number
  // assists: number
  // ratings: [{ opponent: string, date: Date, rating: number }]

  // Månadsbetyg: (summa av alla ratings för månaden) / antal matcher
  // Säsongsbetyg: (summa av alla ratings för säsongen) / antal matcher

  // När man klickar på knappen "Ny match" ska man kunna välja motståndare
  // Varje spelare kan klickas på för att öppna modal där betyg, mål, assist samt om spelare spelade från start eller som inhoppare kan fyllas i

  const getPlayer = (player: Player) => (
    <PlayerItem key={player.id}>
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
    </PlayerItem>
  );

  return (
    <>
      <Section padding={theme.spacing.l} gap="m">
        <PageHeader>
          <HeadingsTypography variant="h2">Player Ratings</HeadingsTypography>
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
            />
          </GameContainer>
        )}
        <TableHeader>
          <div />
          <EmphasisTypography color={theme.colors.silverDark} variant="s">Spelare</EmphasisTypography>
          <EmphasisTypography color={theme.colors.silverDark} variant="s">Matcher</EmphasisTypography>
          <EmphasisTypography color={theme.colors.silverDark} variant="s">Mål</EmphasisTypography>
          <EmphasisTypography color={theme.colors.silverDark} variant="s">Assist</EmphasisTypography>
          <EmphasisTypography color={theme.colors.silverDark} variant="s">Månadsbetyg</EmphasisTypography>
          <EmphasisTypography color={theme.colors.silverDark} variant="s">Säsongsbetyg</EmphasisTypography>
        </TableHeader>
        {sorting === SortByEnum.POSITION && (
          <>
            <PositionContainer>
              <HeadingsTypography variant="h4">Goalkeepers</HeadingsTypography>
              <PlayerList>
                {goalKeepers.map((player) => getPlayer(player))}
              </PlayerList>
            </PositionContainer>
            <PositionContainer>
              <HeadingsTypography variant="h4">Defenders</HeadingsTypography>
              <PlayerList>
                {defenders.map((player) => getPlayer(player))}
              </PlayerList>
            </PositionContainer>
            <PositionContainer>
              <HeadingsTypography variant="h4">Midfielders</HeadingsTypography>
              <PlayerList>
                {midfielders.map((player) => getPlayer(player))}
              </PlayerList>
            </PositionContainer>
            <PositionContainer>
              <HeadingsTypography variant="h4">Forwards</HeadingsTypography>
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
  grid-template-columns: auto auto 3fr 1fr 1fr 1fr 1fr 1fr;
  align-items: center;
  gap: ${theme.spacing.xxs};
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

const AvatarContainer = styled.div`
  height: fit-content;
  width: fit-content;
  position: relative;
`;

const NationAvatarContainer = styled.div`
  position: absolute;
  bottom: 2px;
  right: 2px;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: auto 3fr 1fr 1fr 1fr 1fr 1fr;
  align-items: flex-end;
  gap: ${theme.spacing.xxxs};
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

export default PlayerRatingsPage;
