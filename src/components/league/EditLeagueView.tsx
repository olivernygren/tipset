import React, { useState } from 'react';
import { updateDoc, doc } from 'firebase/firestore';
import styled from 'styled-components';
import { CaretRight } from '@phosphor-icons/react';
import { PredictionLeague } from '../../utils/League';
import { devices, theme } from '../../theme';
import { Section } from '../section/Section';
import { HeadingsTypography, NormalTypography } from '../typography/Typography';
import Input from '../input/Input';
import CustomDatePicker from '../input/DatePicker';
import Button from '../buttons/Button';
import { CollectionEnum } from '../../utils/Firebase';
import { db } from '../../config/firebase';
import Modal from '../modal/Modal';
import { errorNotify, successNotify } from '../../utils/toast/toastHelpers';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';
import Textarea from '../textarea/Textarea';
import { Divider } from '../Divider';
import IconButton from '../buttons/IconButton';
import ActionsModal from '../modal/ActionsModal';
import InfoDialogue from '../info/InfoDialogue';

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
  const [updateLoading, setUpdateLoading] = useState(false);
  const [showEndLeagueConfirmationModal, setShowEndLeagueConfirmationModal] = useState<boolean>(false);
  const [endLeagueLoading, setEndLeagueLoading] = useState(false);
  const [editBasicInformationModalOpen, setEditBasicInformationModalOpen] = useState<boolean>(false);

  if (!isCreator) return null;

  const handleUpdateLeague = async () => {
    setUpdateLoading(true);

    const updatedLeague = {
      ...league,
      name,
      description,
      deadlineToJoin: deadlineToJoin.toISOString(),
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
            >
              Redigera
            </Button>
          </Container>
          <Divider />
          {!league.hasEnded && (
            <>
              <Container>
                <ContainerText>
                  <HeadingsTypography variant="h5">Poängsystem</HeadingsTypography>
                  <NormalTypography variant="m" color={theme.colors.silverDark}>Uppdatera poängutdelning för matcher.</NormalTypography>
                </ContainerText>
                <Button
                  variant="secondary"
                  onClick={() => setEditBasicInformationModalOpen(true)}
                  size="m"
                >
                  Uppdatera
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
      {showEndLeagueConfirmationModal && (
        <Modal
          size="m"
          onClose={() => setShowEndLeagueConfirmationModal(false)}
          title="Avsluta ligan"
          mobileBottomSheet
        >
          <Section gap="m">
            <InfoDialogue
              title="Avsluta liga"
              description="Att avsluta en liga innebär att inga fler omgångar kan skapas och inga fler poäng kommer delas ut. Du kommer fortfarande kunna se ligans tidigare omgångar och allas poäng."
              color="red"
            />
            <NormalTypography variant="m">Är du säker på att du vill avsluta ligan? Detta går inte att ångra.</NormalTypography>
          </Section>
          <Section gap="xs" flexDirection="row" alignItems="center">
            <Button
              variant="secondary"
              onClick={() => setShowEndLeagueConfirmationModal(false)}
              fullWidth
            >
              Avbryt
            </Button>
            <Button
              variant="primary"
              color="red"
              onClick={handleEndLeague}
              fullWidth
              loading={endLeagueLoading}
            >
              Avsluta ligan
            </Button>
          </Section>
        </Modal>
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
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  padding: ${theme.spacing.m} 0;
`;

const ContainerText = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xxs};
  flex: 1;
`;

export default EditLeagueView;
