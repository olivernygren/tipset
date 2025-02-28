import React, { useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import {
  ArrowLeft, ChartBar, CheckCircle, DotsThree, Hammer, MagnifyingGlass, PencilSimple, Trash,
} from '@phosphor-icons/react';
import styled, { css } from 'styled-components';
import { Section } from '../section/Section';
import { LeagueGameWeek, PredictionLeague } from '../../utils/League';
import { EmphasisTypography, NormalTypography } from '../typography/Typography';
import Button from '../buttons/Button';
import { Divider } from '../Divider';
import { db } from '../../config/firebase';
import { CollectionEnum } from '../../utils/Firebase';
import { withDocumentIdOnObject } from '../../utils/helpers';
import { errorNotify, successNotify } from '../../utils/toast/toastHelpers';
import { devices, theme } from '../../theme';
import {
  Fixture, FixtureInput, FixturePreviewStats, TeamType,
} from '../../utils/Fixture';
import { Team } from '../../utils/Team';
import ClubAvatar from '../avatar/ClubAvatar';
import NationAvatar from '../avatar/NationAvatar';
import { AvatarSize } from '../avatar/Avatar';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';
import EditFixtureModal from '../game/EditFixtureModal';
import IconButton from '../buttons/IconButton';
import CreateFixtureModal from '../game/CreateFixtureModal';
import CustomDatePicker from '../input/DatePicker';
import Modal from '../modal/Modal';
import ContextMenu from '../menu/ContextMenu';
import ContextMenuOption from '../menu/ContextMenuOption';
import FindOtherFixturesModal from './FindOtherFixturesModal';
import FixtureStatsModal from '../game/FixtureStatsModal';

interface EditGameWeekViewProps {
  gameWeek: LeagueGameWeek;
  league?: PredictionLeague;
  minDate?: Date;
  onClose: () => void;
  refetch: () => void;
}

const EditGameWeekView = ({
  gameWeek, onClose, refetch, minDate, league,
}: EditGameWeekViewProps) => {
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const [updateLoading, setUpdateLoading] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [editFixture, setEditFixture] = useState<Fixture | null>(null);
  const [gameWeekFixtures, setGameWeekFixtures] = useState(gameWeek.games.fixtures.sort((a, b) => new Date(a.kickOffTime).getTime() - new Date(b.kickOffTime).getTime()));
  const [gameWeekPredictions, setGameWeekPredictions] = useState(gameWeek.games.predictions);
  const [showCreateFixtureModal, setShowCreateFixtureModal] = useState<boolean>(false);
  const [gameWeekStartDate, setGameWeekStartDate] = useState<Date | null>(new Date(gameWeek.startDate));
  const [confirmDeleteGameWeekModalOpen, setConfirmDeleteGameWeekModalOpen] = useState<boolean>(false);
  const [findExternalFixturesModalOpen, setFindExternalFixturesModalOpen] = useState<boolean>(false);
  const [showFixtureContextMenu, setShowFixtureContextMenu] = useState<string | null>(null);
  const [showGameWeekContextMenu, setShowGameWeekShowContextMenu] = useState<boolean>(false);
  const [showEditStatsModal, setShowEditStatsModal] = useState<string | null>(null);

  const handleUpdateFixture = (updatedFixture: FixtureInput) => {
    const updatedFixtures = gameWeekFixtures.map((fixture) => {
      if (fixture.id === updatedFixture.id) {
        return {
          ...fixture,
          ...updatedFixture,
        };
      }
      return fixture;
    });

    setGameWeekFixtures(updatedFixtures);
    setEditFixture(null);
  };

  const handleDeleteFixture = (fixture?: Fixture) => {
    const fixtureToUse = fixture || editFixture;
    const hasBeenCorrected = gameWeekFixtures.some((fixture) => fixture.id === fixtureToUse?.id && Boolean(fixture.finalResult));

    if (hasBeenCorrected) {
      errorNotify('Matchen har redan gett poängutdelning');
      return;
    }

    const updatedFixtures = gameWeekFixtures.filter((fixture) => fixture.id !== fixtureToUse?.id);
    const updatedPredictions = gameWeek.games.predictions.filter((prediction) => prediction.fixtureId !== fixtureToUse?.id);

    setGameWeekFixtures(updatedFixtures);
    setGameWeekPredictions(updatedPredictions);
    setEditFixture(null);
  };

  const handleUpdateFixtureStats = (fixtureId: string, updatedFixtureObj: Fixture) => {
    const updatedFixtures = gameWeekFixtures.map((fixture) => {
      if (fixture.id === fixtureId) {
        return updatedFixtureObj;
      }
      return fixture;
    });

    setGameWeekFixtures(updatedFixtures);
    setEditFixture(null);
  };

  const handleUpdateGameWeek = async () => {
    setUpdateLoading(true);

    const updatedGameWeek = {
      ...gameWeek,
      ...(gameWeekStartDate && { startDate: gameWeekStartDate.toISOString() }),
      games: {
        ...gameWeek.games,
        fixtures: gameWeekFixtures,
        predictions: gameWeekPredictions,
      },
    };

    try {
      const leagueDoc = await getDoc(doc(db, CollectionEnum.LEAGUES, gameWeek.leagueId));
      const leagueData = withDocumentIdOnObject<PredictionLeague>(leagueDoc);

      const updatedGameWeeks = leagueData.gameWeeks?.map((week) => {
        if (week.round === gameWeek.round) {
          return updatedGameWeek;
        }
        return week;
      });

      await updateDoc(doc(db, CollectionEnum.LEAGUES, gameWeek.leagueId), {
        gameWeeks: updatedGameWeeks,
      });
    } catch (error) {
      errorNotify('Något gick fel när omgången skulle uppdateras');
    }

    setUpdateLoading(false);
    onClose();
    refetch();
  };

  const handleDeleteGameWeek = async () => {
    setDeleteLoading(true);

    const fixtureInGameWeekHasBeenCorrected = gameWeekFixtures.some((fixture) => Boolean(fixture.finalResult));

    if (fixtureInGameWeekHasBeenCorrected) {
      errorNotify('En eller flera matcher i omgången har redan gett poängutdelning');
      setDeleteLoading(false);
      return;
    }

    try {
      const leagueDoc = await getDoc(doc(db, CollectionEnum.LEAGUES, gameWeek.leagueId));
      const leagueData = withDocumentIdOnObject<PredictionLeague>(leagueDoc);

      const updatedGameWeeks = leagueData.gameWeeks?.filter((week) => week.round !== gameWeek.round);

      await updateDoc(doc(db, CollectionEnum.LEAGUES, gameWeek.leagueId), {
        gameWeeks: updatedGameWeeks,
      });

      successNotify('Omgången har raderats');
      setConfirmDeleteGameWeekModalOpen(false);
      onClose();
      refetch();
    } catch (error) {
      errorNotify('Något gick fel när omgången skulle raderas');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getTeamAvatar = (team: Team, fixture: Fixture) => (fixture.teamType === TeamType.CLUBS ? (
    <ClubAvatar
      logoUrl={team.logoUrl}
      clubName={team.name}
      size={isMobile ? AvatarSize.XS : AvatarSize.S}
    />
  ) : (
    <NationAvatar
      flagUrl={team.logoUrl}
      nationName={team.name}
      size={isMobile ? AvatarSize.XS : AvatarSize.S}
    />
  ));

  const getKickoffTime = (kickoffTime: string) => {
    const date = new Date(kickoffTime);
    const day = date.getDate();
    const month = date.toLocaleDateString('sv-SE', { month: 'short' }).replace('.', '');
    const hours = date.getHours();
    const minutes = date.getMinutes();

    if (isMobile) {
      return `${day} ${month}`;
    }

    return `${day} ${month} ${hours}:${minutes < 10 ? `0${minutes}` : minutes}`;
  };

  const getFixtureContextMenu = (fixture: Fixture) => (
    <ContextMenu
      positionX="right"
      positionY="top"
      offsetY={-4}
      offsetX={isMobile ? -48 : -56}
      onClose={() => setShowFixtureContextMenu(null)}
    >
      <ContextMenuOption
        icon={<Hammer size={24} color={theme.colors.textDefault} />}
        onClick={() => {
          setEditFixture(fixture);
          setShowFixtureContextMenu(null);
        }}
        label="Redigera match"
        color={theme.colors.textDefault}
      />
      {fixture.includeStats && (
        <ContextMenuOption
          icon={<ChartBar size={24} color={theme.colors.textDefault} />}
          onClick={() => {
            setShowEditStatsModal(fixture.id);
            setShowFixtureContextMenu(null);
          }}
          label="Matchstatistik"
          color={theme.colors.textDefault}
        />
      )}
      <ContextMenuOption
        icon={<Trash size={24} color={theme.colors.red} />}
        onClick={() => {
          handleDeleteFixture(fixture);
          setShowFixtureContextMenu(null);
        }}
        label="Ta bort"
        color={theme.colors.red}
      />
    </ContextMenu>
  );

  const getFixtureItem = (fixture: Fixture, index: number) => {
    const fixtureHasKickedOff = new Date(fixture.kickOffTime) < new Date();
    return (
      <>
        <FixtureItem
          key={fixture.id}
          isLastItem={index === gameWeekFixtures.length - 1}
          useHoverEffect={false}
        >
          <Teams>
            <TeamContainer isHomeTeam>
              <NormalTypography variant={isMobile ? 's' : 'm'} align="right">
                {isMobile && Boolean(fixture.homeTeam.shortName) ? fixture.homeTeam.shortName : fixture.homeTeam.name}
              </NormalTypography>
              {getTeamAvatar(fixture.homeTeam, fixture)}
            </TeamContainer>
            <NormalTypography variant={isMobile ? 'xs' : 's'} color={theme.colors.textLight}>
              {getKickoffTime(fixture.kickOffTime)}
            </NormalTypography>
            <TeamContainer>
              {getTeamAvatar(fixture.awayTeam, fixture)}
              <NormalTypography variant={isMobile ? 's' : 'm'}>
                {isMobile && Boolean(fixture.awayTeam.shortName) ? fixture.awayTeam.shortName : fixture.awayTeam.name}
              </NormalTypography>
            </TeamContainer>
          </Teams>
          {!fixtureHasKickedOff && (
            <>
              <ContextMenuButtonWrapper>
                <IconButton
                  icon={<DotsThree size={24} weight="bold" />}
                  colors={{ normal: theme.colors.silverDarker, hover: theme.colors.textDefault }}
                  backgroundColor={{ normal: showFixtureContextMenu === fixture.id ? theme.colors.silverLight : 'transparent', hover: theme.colors.silverLight }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (showFixtureContextMenu === fixture.id) {
                      setShowFixtureContextMenu(null);
                    } else {
                      setShowFixtureContextMenu(fixture.id);
                    }
                  }}
                />
              </ContextMenuButtonWrapper>
              {showFixtureContextMenu === fixture.id && getFixtureContextMenu(fixture)}
            </>
          )}
        </FixtureItem>
        {index < gameWeekFixtures.length - 1 && <Divider />}
      </>
    );
  };

  return (
    <>
      <Section gap="m">
        <Divider />
        <CustomDatePicker
          label="Startdatum för omgången (kan tippas fr.o.m)"
          selectedDate={gameWeekStartDate || new Date()}
          onChange={(date) => setGameWeekStartDate(date)}
          minDate={minDate}
        />
        <FixtureList>
          <FixtureListHeader>
            <div />
            <EmphasisTypography
              variant="m"
              color={theme.colors.textDefault}
              align="center"
            >
              {`Redigera omgång ${gameWeek.round}`}
            </EmphasisTypography>
            <IconButton
              icon={<PencilSimple size={24} />}
              colors={{ normal: theme.colors.textDefault, hover: theme.colors.textDefault }}
              backgroundColor={{ normal: showGameWeekContextMenu ? theme.colors.silver : 'transparent', hover: theme.colors.silver }}
              onClick={() => setShowGameWeekShowContextMenu(!showGameWeekContextMenu)}
            />
            {showGameWeekContextMenu && (
              <ContextMenu
                onClose={() => setShowGameWeekShowContextMenu(false)}
                positionX="right"
                positionY="top"
                offsetY={(48 * 2) + 4}
                offsetX={isMobile ? -48 : -56}
              >
                <ContextMenuOption
                  icon={<MagnifyingGlass size={24} color={theme.colors.textDefault} />}
                  onClick={() => {
                    setFindExternalFixturesModalOpen(true);
                    setShowGameWeekShowContextMenu(false);
                  }}
                  label="Hitta fler matcher"
                  color={theme.colors.textDefault}
                />
                <ContextMenuOption
                  icon={<Hammer size={24} color={theme.colors.textDefault} />}
                  onClick={() => {
                    setShowCreateFixtureModal(true);
                    setShowGameWeekShowContextMenu(false);
                  }}
                  label="Lägg till match"
                  color={theme.colors.textDefault}
                />
                <ContextMenuOption
                  icon={<Trash size={24} color={theme.colors.red} />}
                  onClick={() => {
                    setConfirmDeleteGameWeekModalOpen(true);
                    setShowGameWeekShowContextMenu(false);
                  }}
                  label="Ta bort omgång"
                  color={theme.colors.red}
                />
              </ContextMenu>
            )}
          </FixtureListHeader>
          {gameWeekFixtures.map((fixture, index) => getFixtureItem(fixture, index))}
        </FixtureList>
        <Section flexDirection="row" gap="xs" alignItems="center">
          <Button
            variant="secondary"
            onClick={onClose}
            icon={<ArrowLeft size={20} color={theme.colors.primary} />}
          >
            Tillbaka
          </Button>
          <Button
            onClick={handleUpdateGameWeek}
            loading={updateLoading}
            disabled={updateLoading}
            icon={<CheckCircle size={24} color={theme.colors.white} weight="fill" />}
            fullWidth={isMobile}
          >
            Spara ändringar
          </Button>
        </Section>
      </Section>
      {editFixture && (
        <EditFixtureModal
          fixture={editFixture}
          onClose={() => setEditFixture(null)}
          onSave={(fixtureInput) => handleUpdateFixture(fixtureInput)}
          onDeleteFixture={handleDeleteFixture}
          minDate={minDate}
          league={league}
        />
      )}
      {showCreateFixtureModal && (
        <CreateFixtureModal
          allNewGameWeekFixtures={gameWeekFixtures}
          onClose={() => setShowCreateFixtureModal(false)}
          onUpdateAllNewGameWeekFixtures={(newFixtures) => setGameWeekFixtures(newFixtures)}
          minDate={minDate}
        />
      )}
      {findExternalFixturesModalOpen && (
        <FindOtherFixturesModal
          onClose={() => setFindExternalFixturesModalOpen(false)}
          onFixturesSelect={(selectedFixtures) => {
            setGameWeekFixtures([...gameWeekFixtures, ...selectedFixtures].sort((a, b) => new Date(a.kickOffTime).getTime() - new Date(b.kickOffTime).getTime()));
            setFindExternalFixturesModalOpen(false);
          }}
          minDate={minDate}
          alreadySelectedFixtures={gameWeekFixtures}
          leagueScoringSystem={league?.scoringSystem}
        />
      )}
      {confirmDeleteGameWeekModalOpen && (
        <Modal
          size="s"
          title={`Radera omgång ${gameWeek.round}`}
          mobileBottomSheet
          onClose={() => setConfirmDeleteGameWeekModalOpen(false)}
        >
          <NormalTypography variant="m">
            Är du säker på att du vill radera hela omgången?
          </NormalTypography>
          <ModalButtons>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setConfirmDeleteGameWeekModalOpen(false)}
            >
              Nej
            </Button>
            <Button
              fullWidth
              onClick={() => handleDeleteGameWeek()}
              color="red"
              disabled={deleteLoading}
              loading={deleteLoading}
            >
              Ja, radera
            </Button>
          </ModalButtons>
        </Modal>
      )}
      {showEditStatsModal && league && (
        <FixtureStatsModal
          fixture={gameWeekFixtures.find((fixture) => fixture.id === showEditStatsModal)!}
          onClose={() => setShowEditStatsModal(null)}
          onEdit={(fixtureId, updatedFixture) => handleUpdateFixtureStats(fixtureId, updatedFixture)}
          league={league}
          refetchLeague={refetch}
          ongoingGameWeek={gameWeek}
          isLeagueCreator
        />
      )}
    </>
  );
};

const FixtureList = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
  box-sizing: border-box;
  background-color: ${theme.colors.silverLighter};
  border-radius: ${theme.borderRadius.l};
  border: 1px solid ${theme.colors.silverLight};
`;

const FixtureListHeader = styled.div`
  display: grid;
  grid-template-columns: 40px 1fr 40px;
  align-items: center;
  background-color: ${theme.colors.silverLight};
  width: 100%;
  box-sizing: border-box;
  position: relative;
  padding: ${theme.spacing.xxs} ${theme.spacing.xxxs};
  position: relative;
  border-radius: 11px 11px 0 0;
  
  @media ${devices.tablet} {
    padding: ${theme.spacing.xxxs} ${theme.spacing.xs};
  }
`;

const FixtureItem = styled.div<{ isLastItem?: boolean, useHoverEffect?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${theme.colors.silverLighter};
  width: 100%;
  box-sizing: border-box;
  position: relative;
  padding: ${theme.spacing.xs} 0;
  position: relative;
  transition: all 0.2s ease;
  /* cursor: pointer; */

  ${({ isLastItem }) => isLastItem && css`
    border-radius: 0 0 11px 11px;
  `}

  ${({ useHoverEffect }) => useHoverEffect && css`
    &:hover {
      background-color: ${theme.colors.silverLight};
    }
  `}
  
  @media ${devices.tablet} {
    padding: ${theme.spacing.xxxs} 0;
  }
`;

const Teams = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: ${theme.spacing.xxs};
  
  @media ${devices.tablet} {
    gap: ${theme.spacing.s};
    padding: 0;
    min-height: 48px;
  }
`;

const TeamContainer = styled.div<{ isHomeTeam?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xxxs};
  width: fit-content;
  white-space: nowrap;

  ${({ isHomeTeam }) => isHomeTeam && css`
    justify-content: flex-end;
    margin-left: auto;
  `}
`;

const ModalButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  justify-content: center;
`;

const ContextMenuButtonWrapper = styled.div`
  position: absolute;
  top: 50%;
  right: 6px;
  transform: translateY(-50%);
  
  @media ${devices.tablet} {
    right: 12px;
  }
`;

export default EditGameWeekView;
