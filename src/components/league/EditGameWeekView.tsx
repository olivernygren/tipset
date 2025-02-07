import React, { useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import {
  ArrowLeft, CheckCircle, Hammer, MagnifyingGlass, PlusCircle, Trash,
  XCircle,
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
import { Fixture, FixtureInput, TeamType } from '../../utils/Fixture';
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

interface EditGameWeekViewProps {
  gameWeek: LeagueGameWeek;
  minDate?: Date;
  onClose: () => void;
  refetch: () => void;
}

const EditGameWeekView = ({
  gameWeek, onClose, refetch, minDate,
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
  const [selectAddFixtureMethodMenuOpen, setSelectAddFixtureMethodMenuOpen] = useState<boolean>(false);
  const [findExternalFixturesModalOpen, setFindExternalFixturesModalOpen] = useState<boolean>(false);

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

  const handleDeleteFixture = () => {
    const hasBeenCorrected = gameWeekFixtures.some((fixture) => fixture.id === editFixture?.id && Boolean(fixture.finalResult));

    if (hasBeenCorrected) {
      errorNotify('Matchen har redan gett poängutdelning');
      return;
    }

    const updatedFixtures = gameWeekFixtures.filter((fixture) => fixture.id !== editFixture?.id);
    const updatedPredictions = gameWeek.games.predictions.filter((prediction) => prediction.fixtureId !== editFixture?.id);

    setGameWeekFixtures(updatedFixtures);
    setGameWeekPredictions(updatedPredictions);
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
    return `${day} ${month} ${hours}:${minutes < 10 ? `0${minutes}` : minutes}`;
  };

  const getFixtureItem = (fixture: Fixture, index: number) => (
    <>
      <FixtureItem
        key={fixture.id}
        onClick={() => setEditFixture(fixture)}
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
      </FixtureItem>
      {index < gameWeekFixtures.length - 1 && <Divider />}
    </>
  );

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
            <Icons>
              <IconButton
                icon={<Trash size={20} weight="fill" />}
                colors={{ normal: theme.colors.red, hover: theme.colors.redDark }}
                onClick={() => setConfirmDeleteGameWeekModalOpen(true)}
              />
              <IconButton
                icon={selectAddFixtureMethodMenuOpen ? <XCircle size={20} weight="fill" /> : <PlusCircle size={20} weight="fill" />}
                colors={{ normal: theme.colors.primary, hover: theme.colors.primaryDark }}
                onClick={() => setSelectAddFixtureMethodMenuOpen(!selectAddFixtureMethodMenuOpen)}
              />
            </Icons>
            {selectAddFixtureMethodMenuOpen && (
              <ContextMenu positionX="right" positionY="bottom" offsetY={(48 * 2) - 8} offsetX={-24}>
                <ContextMenuOption
                  icon={<MagnifyingGlass size={24} color={theme.colors.textDefault} />}
                  onClick={() => {
                    setFindExternalFixturesModalOpen(true);
                    setSelectAddFixtureMethodMenuOpen(false);
                  }}
                  label="Hitta matcher"
                  color={theme.colors.textDefault}
                />
                <ContextMenuOption
                  icon={<Hammer size={24} color={theme.colors.textDefault} />}
                  onClick={() => {
                    setShowCreateFixtureModal(true);
                    setSelectAddFixtureMethodMenuOpen(false);
                  }}
                  label="Lägg till manuellt"
                  color={theme.colors.textDefault}
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
        />
      )}
      {showCreateFixtureModal && (
        <CreateFixtureModal
          fixture={null}
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
            setGameWeekFixtures([...gameWeekFixtures, ...selectedFixtures]);
            setFindExternalFixturesModalOpen(false);
          }}
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
  overflow: hidden;
  border: 1px solid ${theme.colors.silverLight};
`;

const FixtureListHeader = styled.div`
  display: grid;
  grid-template-columns: 64px 1fr 64px;
  align-items: center;
  background-color: ${theme.colors.silverLight};
  width: 100%;
  box-sizing: border-box;
  position: relative;
  padding: ${theme.spacing.xxs} ${theme.spacing.xs};
  position: relative;
`;

const FixtureItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${theme.colors.silverLighter};
  width: 100%;
  box-sizing: border-box;
  position: relative;
  padding: ${theme.spacing.xs} 0;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    background-color: ${theme.colors.silverLight};
  }
  
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

const Icons = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xxxs};
  margin-left: auto;
`;

const ModalButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  justify-content: center;
`;

export default EditGameWeekView;
