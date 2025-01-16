import React, { useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ArrowLeft, CheckCircle } from '@phosphor-icons/react';
import styled, { css } from 'styled-components';
import { Section } from '../section/Section';
import { LeagueGameWeek, PredictionLeague } from '../../utils/League';
import { EmphasisTypography, NormalTypography } from '../typography/Typography';
import Button from '../buttons/Button';
import { Divider } from '../Divider';
import { db } from '../../config/firebase';
import { CollectionEnum } from '../../utils/Firebase';
import { withDocumentIdOnObject } from '../../utils/helpers';
import { errorNotify } from '../../utils/toast/toastHelpers';
import { devices, theme } from '../../theme';
import { Fixture, FixtureInput, TeamType } from '../../utils/Fixture';
import { Team } from '../../utils/Team';
import ClubAvatar from '../avatar/ClubAvatar';
import NationAvatar from '../avatar/NationAvatar';
import { AvatarSize } from '../avatar/Avatar';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';
import EditFixtureModal from '../game/EditFixtureModal';

interface EditGameWeekViewProps {
  gameWeek: LeagueGameWeek;
  onClose: () => void;
  refetch: () => void;
}

const EditGameWeekView = ({ gameWeek, onClose, refetch }: EditGameWeekViewProps) => {
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const [updateLoading, setUpdateLoading] = useState<boolean>(false);
  const [editFixture, setEditFixture] = useState<Fixture | null>(null);
  const [gameWeekFixtures, setGameWeekFixtures] = useState(gameWeek.games.fixtures);
  const [gameWeekPredictions, setGameWeekPredictions] = useState(gameWeek.games.predictions);

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
      games: {
        ...gameWeek.games,
        fixtures: gameWeekFixtures,
        predictions: gameWeekPredictions,
      },
    };

    // Lägg till match i omgången

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
      console.error(error);
    }

    setUpdateLoading(false);
    onClose();
    refetch();
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
      {index < gameWeek.games.fixtures.length - 1 && <Divider />}
    </>
  );

  return (
    <>
      <Section gap="m">
        <Divider />
        <FixtureList>
          <Section
            padding={theme.spacing.xs}
            backgroundColor={theme.colors.silverLight}
            borderRadius={`${theme.borderRadius.m} ${theme.borderRadius.m} 0 0`}
            alignItems="center"
          >
            <EmphasisTypography variant="m" color={theme.colors.textDefault}>{`Redigera omgång ${gameWeek.round}`}</EmphasisTypography>
          </Section>
          {gameWeekFixtures.map((fixture, index) => getFixtureItem(fixture, index))}
        </FixtureList>
        <Section flexDirection="row" gap="xs" alignItems="center">
          <Button
            variant="secondary"
            onClick={onClose}
            icon={<ArrowLeft size={24} color={theme.colors.primary} />}
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
  overflow: hidden;
  border: 1px solid ${theme.colors.silverLight};
  box-shadow: 0px 3px 0px 0px ${theme.colors.silverLight};
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

export default EditGameWeekView;
