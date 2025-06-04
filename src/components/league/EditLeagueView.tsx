import React, { useState } from 'react';
import { updateDoc, doc } from 'firebase/firestore';
import styled from 'styled-components';
import { LeagueScoringSystemValues, PredictionLeague } from '../../utils/League';
import { devices, theme } from '../../theme';
import { Section } from '../section/Section';
import { HeadingsTypography, NormalTypography } from '../typography/Typography';
import Input from '../input/Input';
import CustomDatePicker from '../input/DatePicker';
import Button from '../buttons/Button';
import { CollectionEnum } from '../../utils/Firebase';
import { db } from '../../config/firebase';
import { errorNotify, successNotify } from '../../utils/toast/toastHelpers';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';
import Textarea from '../textarea/Textarea';
import { Divider } from '../Divider';
import ActionsModal from '../modal/ActionsModal';
import InfoDialogue from '../info/InfoDialogue';
import EditLeagueScoringSystemModal from './EditLeagueScoringSystemModal';
import EditChipCountModal from './EditChipCountModal';

interface EditLeagueViewProps {
  league: PredictionLeague;
  isCreator: boolean;
  refetchLeague: () => void;
}

const EditLeagueView = ({ league, refetchLeague, isCreator }: EditLeagueViewProps) => {
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const [name, setName] = useState<string>(league.name);
  const [description, setDescription] = useState<string>(league.description);
  const [deadlineToJoin, setDeadlineToJoin] = useState(new Date(league.deadlineToJoin));
  const [slackChannelUrl, setSlackChannelUrl] = useState<string>(league.slackChannelUrl || '');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [showEndLeagueConfirmationModal, setShowEndLeagueConfirmationModal] = useState<boolean>(false);
  const [endLeagueLoading, setEndLeagueLoading] = useState(false);
  const [editBasicInformationModalOpen, setEditBasicInformationModalOpen] = useState<boolean>(false);
  const [editScoringSystemModalOpen, setEditScoringSystemModalOpen] = useState<boolean>(false);
  const [editChipCountModalOpen, setEditChipCountModalOpen] = useState<boolean>(false);

  if (!isCreator) return null;

  const handleUpdateLeague = async () => {
    setUpdateLoading(true);

    const updatedLeague = {
      ...league,
      name,
      description,
      deadlineToJoin: deadlineToJoin.toISOString(),
      slackChannelUrl,
    };

    try {
      await updateDoc(doc(db, CollectionEnum.LEAGUES, league.documentId), updatedLeague);
      setEditBasicInformationModalOpen(false);
      successNotify('Ligan uppdaterad');
      refetchLeague();
    } catch (error) {
      errorNotify('Ett fel uppstod');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleEndLeague = async () => {
    setEndLeagueLoading(true);

    const updatedGameWeeks = league.gameWeeks?.map((gameWeek) => ({
      ...gameWeek,
      hasEnded: true,
    }));

    const updatedLeague = {
      ...league,
      gameWeeks: updatedGameWeeks,
      hasEnded: true,
    };

    try {
      await updateDoc(doc(db, CollectionEnum.LEAGUES, league.documentId), updatedLeague);
      refetchLeague();
      setShowEndLeagueConfirmationModal(false);
      successNotify('Ligan avslutad');
    } catch (error) {
      errorNotify('Ett fel uppstod');
    }

    setEndLeagueLoading(false);
  };

  const handleSaveScoringSystem = async (scoringSystem: LeagueScoringSystemValues) => {
    setUpdateLoading(true);

    const updatedLeague = {
      ...league,
      scoringSystem,
    };

    try {
      await updateDoc(doc(db, CollectionEnum.LEAGUES, league.documentId), updatedLeague);
      setEditScoringSystemModalOpen(false);
      successNotify('Poängsystemet uppdaterat');
      refetchLeague();
    } catch (error) {
      errorNotify('Ett fel uppstod');
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <>
      <Section
        backgroundColor={theme.colors.white}
        padding={`${theme.spacing.m} ${theme.spacing.m} ${theme.spacing.xxxs} ${theme.spacing.m}`}
        gap="m"
        borderRadius={theme.borderRadius.m}
      >
        <HeadingsTypography variant="h3">Redigera liga</HeadingsTypography>
        <Section>
          <Divider />
          <Container>
            <ContainerText>
              <HeadingsTypography variant="h5">Grundinformation</HeadingsTypography>
              <NormalTypography variant="m" color={theme.colors.silverDark}>Redigera namn, beskrivning och deadline att gå med i ligan.</NormalTypography>
            </ContainerText>
            <Button
              variant="secondary"
              onClick={() => setEditBasicInformationModalOpen(true)}
              size="m"
              fullWidth={isMobile}
            >
              Redigera
            </Button>
          </Container>
          {/* <Container>
            <ContainerText>
              <HeadingsTypography variant="h5">Matchpreferenser</HeadingsTypography>
              <NormalTypography variant="m" color={theme.colors.silverDark}>Redigera dina preferenser för matcherna som ska tippas för att underlätta skapandet.</NormalTypography>
            </ContainerText>
            <Button
              variant="secondary"
              onClick={() => setEditBasicInformationModalOpen(true)}
              size="m"
            >
              Redigera
            </Button>
          </Container> */}
          {!league.hasEnded && (
            <>
              <Divider />
              <Container>
                <ContainerText>
                  <HeadingsTypography variant="h5">Poängsystem</HeadingsTypography>
                  <NormalTypography variant="m" color={theme.colors.silverDark}>Uppdatera poängutdelning för matcher.</NormalTypography>
                </ContainerText>
                <Button
                  variant="secondary"
                  onClick={() => setEditScoringSystemModalOpen(true)}
                  size="m"
                  fullWidth={isMobile}
                >
                  Uppdatera
                </Button>
              </Container>
              <Divider />
              <Container>
                <ContainerText>
                  <HeadingsTypography variant="h5">Chip</HeadingsTypography>
                  <NormalTypography variant="m" color={theme.colors.silverDark}>Ändra antalet tillåtna chip per spelare</NormalTypography>
                </ContainerText>
                <Button
                  variant="secondary"
                  onClick={() => setEditChipCountModalOpen(true)}
                  size="m"
                  fullWidth={isMobile}
                >
                  Redigera
                </Button>
              </Container>
              <Divider />
              <Container>
                <ContainerText>
                  <HeadingsTypography variant="h5">Avsluta liga</HeadingsTypography>
                  <NormalTypography variant="m" color={theme.colors.silverDark}>Avsluta ligan om det inte ska tippas några fler omgångar.</NormalTypography>
                </ContainerText>
                <Button
                  color="red"
                  onClick={() => setShowEndLeagueConfirmationModal(true)}
                  fullWidth={isMobile}
                >
                  Avsluta liga
                </Button>
              </Container>
            </>
          )}
        </Section>
      </Section>
      {editBasicInformationModalOpen && (
        <ActionsModal
          title="Grundinformation"
          onCancelClick={() => setEditBasicInformationModalOpen(false)}
          onActionClick={handleUpdateLeague}
          actionButtonLabel="Spara"
          size="m"
          mobileFullScreen
          loading={updateLoading}
          actionButtonDisabled={name.length === 0}
          headerDivider
        >
          <Section gap="m">
            <InputContainer>
              <Input
                label="Namn"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                maxLength={30}
              />
              <CustomDatePicker
                label="Deadline att gå med"
                selectedDate={deadlineToJoin}
                onChange={(date) => setDeadlineToJoin(date!)}
                fullWidth
                minDate={new Date()}
              />
            </InputContainer>
            <Input
              label="Länk till Slack-kanal"
              value={slackChannelUrl}
              onChange={(e) => setSlackChannelUrl(e.target.value)}
              fullWidth
            />
            <Textarea
              label="Beskrivning"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              maxLength={100}
            />
          </Section>
        </ActionsModal>
      )}
      {editScoringSystemModalOpen && (
        <EditLeagueScoringSystemModal
          onClose={() => setEditScoringSystemModalOpen(false)}
          onSave={(scoringSystem) => handleSaveScoringSystem(scoringSystem)}
          scoringSystem={league.scoringSystem}
          saveLoading={updateLoading}
        />
      )}
      {showEndLeagueConfirmationModal && (
        <ActionsModal
          size="m"
          onCancelClick={() => setShowEndLeagueConfirmationModal(false)}
          title="Avsluta ligan"
          onActionClick={handleEndLeague}
          actionButtonLabel="Avsluta ligan"
          actionButtonColor="red"
          mobileBottomSheet
          loading={endLeagueLoading}
        >
          <Section gap="m">
            <InfoDialogue
              title="Avsluta liga"
              description="Att avsluta en liga innebär att inga fler omgångar kan skapas och inga fler poäng kommer delas ut. Du kommer fortfarande kunna se ligans tidigare omgångar och allas poäng."
              color="red"
            />
            <NormalTypography variant="m">Är du säker på att du vill avsluta ligan? Detta går inte att ångra.</NormalTypography>
          </Section>
        </ActionsModal>
      )}
      {editChipCountModalOpen && (
        <EditChipCountModal
          onClose={() => setEditChipCountModalOpen(false)}
          league={league}
          refetchLeague={refetchLeague}
        />
      )}
    </>
  );
};

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.s};
  width: 100%;

  @media ${devices.tablet} {
    flex-direction: row;
    gap: ${theme.spacing.m};
    align-items: flex-start;
    box-sizing: border-box;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: ${theme.spacing.s};
  box-sizing: border-box;
  padding: ${theme.spacing.m} 0;
  
  @media ${devices.tablet} {
    align-items: center;
    flex-direction: row;
  }
`;

const ContainerText = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xxs};
  flex: 1;
`;

export default EditLeagueView;
