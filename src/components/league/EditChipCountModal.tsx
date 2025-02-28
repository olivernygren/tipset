import React, { useState } from 'react';
import styled from 'styled-components';
import { doc, updateDoc } from 'firebase/firestore';
import { PredictionLeague } from '../../utils/League';
import ActionsModal from '../modal/ActionsModal';
import { EmphasisTypography, NormalTypography } from '../typography/Typography';
import { theme } from '../../theme';
import Input from '../input/Input';
import { Section } from '../section/Section';
import { Divider } from '../Divider';
import { errorNotify, successNotify } from '../../utils/toast/toastHelpers';
import { db } from '../../config/firebase';
import { CollectionEnum } from '../../utils/Firebase';

interface EditChipCountModalProps {
  league: PredictionLeague;
  refetchLeague: () => void;
  onClose: () => void;
}

const EditChipCountModal = ({ league, refetchLeague, onClose }: EditChipCountModalProps) => {
  const [riskTakerChipCount, setRiskTakerChipCount] = useState<number>(league.userChipCounts?.riskTaker || 0);
  const [doubleUpChipCount, setDoubleUpChipCount] = useState<number>(league.userChipCounts?.doubleUp || 0);
  const [goalFestChipCount, setGoalFestChipCount] = useState<number>(league.userChipCounts?.goalFest || 0);
  const [cleanSweepChipCount, setCleanSweepChipCount] = useState<number>(league.userChipCounts?.cleanSweep || 0);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);

  const handleSave = async () => {
    setSaveLoading(true);

    if (riskTakerChipCount < 1 || riskTakerChipCount > 4) {
      errorNotify('Antal Risk Taker-chip måste vara mellan 1 och 4');
      return;
    }

    if (doubleUpChipCount < 1 || doubleUpChipCount > 4) {
      errorNotify('Antal Double Up!-chip måste vara mellan 1 och 4');
      return;
    }

    if (goalFestChipCount < 1 || goalFestChipCount > 10) {
      errorNotify('Antal Goal Fest-chip måste vara mellan 1 och 10');
      return;
    }

    if (cleanSweepChipCount < 1 || cleanSweepChipCount > 4) {
      errorNotify('Antal Clean Sweep-chip måste vara mellan 1 och 4');
      return;
    }

    try {
      await updateDoc(doc(db, CollectionEnum.LEAGUES, league.documentId), {
        userChipCounts: {
          riskTaker: riskTakerChipCount,
          doubleUp: doubleUpChipCount,
          goalFest: goalFestChipCount,
          cleanSweep: cleanSweepChipCount,
        },
      });
      successNotify('Antal tillåtna chip uppdaterat');
      refetchLeague();
      onClose();
    } catch (error) {
      errorNotify('Något gick fel. Försök igen senare.');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <ActionsModal
      title="Redigera antal chip"
      onActionClick={handleSave}
      onCancelClick={onClose}
      actionButtonLabel="Spara"
      headerDivider
      loading={saveLoading}
    >
      <NormalTypography variant="m">
        Här kan du redigera antalet chip som är tillåtna för varje användare i ligan.
      </NormalTypography>
      <InputsContainer>
        <Divider />
        <InputRow>
          <Section gap="xxxs">
            <EmphasisTypography variant="m">Risk Taker</EmphasisTypography>
            <NormalTypography variant="s" color={theme.colors.silverDark}>Dubbla oddsbonuspoäng på alla matcher i omgången</NormalTypography>
          </Section>
          <InputFieldContainer>
            <Input
              fullWidth
              value={riskTakerChipCount.toString()}
              onChange={(e) => setRiskTakerChipCount(Number(e.currentTarget.value))}
              helperText="Mellan 1 och 4"
            />
          </InputFieldContainer>
        </InputRow>
        <Divider />
        <InputRow>
          <Section gap="xxxs">
            <EmphasisTypography variant="m">Double Up!</EmphasisTypography>
            <NormalTypography variant="s" color={theme.colors.silverDark}>Dubbla poäng på hela omgången</NormalTypography>
          </Section>
          <InputFieldContainer>
            <Input
              fullWidth
              value={doubleUpChipCount.toString()}
              onChange={(e) => setDoubleUpChipCount(Number(e.currentTarget.value))}
              helperText="Mellan 1 och 4"
            />
          </InputFieldContainer>
        </InputRow>
        <Divider />
        <InputRow>
          <Section gap="xxxs">
            <EmphasisTypography variant="m">Goal Fest</EmphasisTypography>
            <NormalTypography variant="s" color={theme.colors.silverDark}>Tjäna ett poäng per mål i en vald match i omgången</NormalTypography>
          </Section>
          <InputFieldContainer>
            <Input
              fullWidth
              value={goalFestChipCount.toString()}
              onChange={(e) => setGoalFestChipCount(Number(e.currentTarget.value))}
              helperText="Mellan 1 och 10"
            />
          </InputFieldContainer>
        </InputRow>
        <Divider />
        <InputRow>
          <Section gap="xxxs">
            <EmphasisTypography variant="m">Clean Sweep</EmphasisTypography>
            <NormalTypography variant="s" color={theme.colors.silverDark}>Dubbla poäng för hela omgången om man lyckas tippa rätt på alla utfall i omgången</NormalTypography>
          </Section>
          <InputFieldContainer>
            <Input
              fullWidth
              value={cleanSweepChipCount.toString()}
              onChange={(e) => setCleanSweepChipCount(Number(e.currentTarget.value))}
              helperText="Mellan 1 och 4"
            />
          </InputFieldContainer>
        </InputRow>
      </InputsContainer>
    </ActionsModal>
  );
};

const InputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.s}
`;

const InputRow = styled.div`
  display: flex;
  gap: ${theme.spacing.m};
  align-items: center;
`;

const InputFieldContainer = styled.div`
  max-width: 100px;
`;

export default EditChipCountModal;
