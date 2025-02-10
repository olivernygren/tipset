import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { updateDoc, doc } from 'firebase/firestore';
import { MinusCircle, WarningDiamond } from '@phosphor-icons/react';
import { theme } from '../../theme';
import {
  convertFotMobMatchToFixture, getFotMobMatchesFromTournamentsAndTeams,
} from '../../utils/fotmobHelpers';
import Textarea from '../textarea/Textarea';
import { FotMobMatch } from '../../utils/Fotmob';
import { errorNotify, successNotify } from '../../utils/toast/toastHelpers';
import { db } from '../../config/firebase';
import { CollectionEnum } from '../../utils/Firebase';
import { Fixture, FixtureGroup } from '../../utils/Fixture';
import { getFixtureGroups, getTournamentIcon } from '../../utils/helpers';
import { Section } from '../section/Section';
import { EmphasisTypography, HeadingsTypography } from '../typography/Typography';
import UpcomingFixturePreview from './UpcomingFixturePreview';
import { Divider } from '../Divider';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';
import ActionsModal from '../modal/ActionsModal';
import IconButton from '../buttons/IconButton';
import Avatar, { AvatarSize } from '../avatar/Avatar';
import InfoDialogue from '../info/InfoDialogue';

interface Props {
  onClose: () => void;
  refetchFixtures: () => void;
  selectedTournamentIds: Array<number>;
  selectedTeamIds: Array<number>;
  collectionDocId: string;
  allFixtures: Array<Fixture>;
}

const CreateFixturesViaFotMobSnippetModal = ({
  onClose, refetchFixtures, selectedTournamentIds, collectionDocId, allFixtures, selectedTeamIds,
}: Props) => {
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const [snippet, setSnippet] = useState<string>('');
  const [creationLoading, setCreationLoading] = useState<boolean>(false);
  const [previewFixtures, setPreviewFixtures] = useState<Array<Fixture>>([]);
  const [availableFixtureGroups, setAvailableFixtureGroups] = useState<Array<FixtureGroup>>([]);
  const [hasAttemptedCreation, setHasAttemptedCreation] = useState<boolean>(false);

  const handleCreateFixturesPreview = () => {
    const allFixtureIds = allFixtures.map((fixture) => fixture.id);
    const filteredFotMobMatches = getFotMobMatchesFromTournamentsAndTeams(JSON.parse(snippet).leagues, selectedTournamentIds, selectedTeamIds);
    const fixtures = filteredFotMobMatches
      .map((match: FotMobMatch) => convertFotMobMatchToFixture(match, allFixtureIds))
      .filter((fixture) => fixture !== null && fixture !== undefined) as Array<Fixture>;

    setHasAttemptedCreation(true);
    setPreviewFixtures(fixtures);
    setAvailableFixtureGroups(getFixtureGroups(fixtures));
  };

  const handleCreateFixtures = async () => {
    setCreationLoading(true);

    try {
      await updateDoc(doc(db, CollectionEnum.FIXTURES, collectionDocId), {
        fixtures: [...allFixtures, ...previewFixtures],
      });
      successNotify('Matcherna skapades');
      onClose();
      refetchFixtures();
    } catch (err) {
      errorNotify('Något gick fel när matchen skulle skapas');
    } finally {
      setCreationLoading(false);
    }
  };

  const handleActionButtonClick = () => {
    if (previewFixtures.length > 0) {
      handleCreateFixtures();
    } else {
      handleCreateFixturesPreview();
    }
  };

  // const getFixturesDateFormatted = (date: string) => {
  //   const fixtureDate = new Date(date);
  //   const day = fixtureDate.getDate();
  //   const weekday = fixtureDate.toLocaleString('default', { weekday: 'long' }).replaceAll('.', '').charAt(0).toUpperCase() + fixtureDate.toLocaleString('default', { weekday: 'long' }).slice(1);
  //   const month = fixtureDate.toLocaleString('default', { month: 'long' }).replaceAll('.', '');
  //   return `${weekday} ${day} ${month}`;
  // };

  return (
    <ActionsModal
      title="Skapa matcher via FotMob-snippet"
      onCancelClick={onClose}
      onActionClick={handleActionButtonClick}
      actionButtonLabel={previewFixtures.length > 0 ? 'Lägg till' : 'Konvertera'}
      actionButtonDisabled={creationLoading}
      loading={creationLoading}
      size="m"
      mobileFullScreen
      headerDivider
    >
      <Content>
        {previewFixtures.length === 0 && (
          <Textarea
            value={snippet}
            onChange={(e) => setSnippet(e.currentTarget.value)}
            placeholder="Klistra in FotMob-snippet här"
            autoFocus
            fullWidth
          />
        )}
        {previewFixtures.length > 0 && (
          <Section flexDirection="row" gap="s" alignItems="center" justifyContent="space-between">
            <HeadingsTypography variant="h4" color={theme.colors.textDefault}>
              {`Förhandsgranskning (${previewFixtures.length} matcher)`}
            </HeadingsTypography>
            <IconButton
              icon={<MinusCircle size={24} />}
              colors={{
                normal: theme.colors.red, hover: theme.colors.redDark, active: theme.colors.redDarker, disabled: theme.colors.silver,
              }}
              onClick={() => setPreviewFixtures([])}
            />
          </Section>
        )}
        {previewFixtures.length > 0 && availableFixtureGroups.map((fixtureGroup) => (
          <FixturesContainer>
            <Section
              flexDirection="row"
              padding={theme.spacing.xxxs}
              backgroundColor={theme.colors.silverLight}
              borderRadius={`${theme.borderRadius.m} ${theme.borderRadius.m} 0 0`}
              alignItems="center"
              justifyContent="center"
              gap="xxxs"
            >
              <EmphasisTypography variant="m" color={theme.colors.textDefault}>{fixtureGroup.tournament}</EmphasisTypography>
              <Avatar
                src={getTournamentIcon(fixtureGroup.tournament)}
                size={AvatarSize.S}
                objectFit="contain"
              />
            </Section>
            {fixtureGroup.fixtures
              .sort((a: Fixture, b: Fixture) => new Date(a.kickOffTime).getTime() - new Date(b.kickOffTime).getTime())
              .map((fixture: Fixture, index: number, array: Array<any>) => (
                <>
                  <UpcomingFixturePreview
                    fixture={fixture}
                    useShortNames={isMobile}
                    backgroundColor={theme.colors.white}
                  />
                  {index !== array.length - 1 && <Divider color={theme.colors.silverLight} />}
                </>
              ))}
          </FixturesContainer>
        ))}
        {hasAttemptedCreation && previewFixtures.length === 0 && (
          <InfoDialogue
            color="red"
            title="Ingen match skapades"
            description="Inga matcher kunde skapas utifrån de filter som finns kring lag och turneringar."
            icon={<WarningDiamond color={theme.colors.redDark} size={24} weight="fill" />}
          />
        )}
      </Content>
    </ActionsModal>
  );
};

const Content = styled.div`
  display: flex;
  gap: ${theme.spacing.s};
  flex-direction: column;
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const FixturesContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
  box-sizing: border-box;
  background-color: ${theme.colors.silverLighter};
  border-radius: ${theme.borderRadius.l};
  overflow: hidden;
  border: 1px solid ${theme.colors.silverLight};
  animation: ${fadeIn} 0.4s ease;
`;

export default CreateFixturesViaFotMobSnippetModal;
