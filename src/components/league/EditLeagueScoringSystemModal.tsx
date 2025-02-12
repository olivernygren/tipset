import React, { useState } from 'react';
import { CheckCircle, Circle } from '@phosphor-icons/react';
import styled from 'styled-components';
import { LeagueScoringSystemValues, ScoringSystemTemplates } from '../../utils/League';
import { theme } from '../../theme';
import { Divider } from '../Divider';
import ActionsModal from '../modal/ActionsModal';
import { Section } from '../section/Section';
import { NormalTypography, HeadingsTypography, EmphasisTypography } from '../typography/Typography';
import { bullseyeScoringSystem, gamblerScoringSystem } from '../../utils/helpers';
import Input from '../input/Input';

interface EditLeagueScoringSystemModalProps {
  onClose: () => void;
  onSave: (scoringSystem: LeagueScoringSystemValues) => void;
  scoringSystem?: LeagueScoringSystemValues;
}

const EditLeagueScoringSystemModal = ({ onClose, scoringSystem, onSave }: EditLeagueScoringSystemModalProps) => {
  const [selectedScoringSystem, setSelectedScoringSystem] = useState<ScoringSystemTemplates | undefined>();
  const [scoringSystemValues, setScoringSystemValues] = useState<LeagueScoringSystemValues>({
    correctOutcome: scoringSystem?.correctOutcome || bullseyeScoringSystem.correctOutcome,
    correctResult: scoringSystem?.correctResult || bullseyeScoringSystem.correctResult,
    correctGoalDifference: scoringSystem?.correctGoalDifference || bullseyeScoringSystem.correctGoalDifference,
    correctGoalsByTeam: scoringSystem?.correctGoalsByTeam || bullseyeScoringSystem.correctGoalsByTeam,
    correctGoalScorerDefender: scoringSystem?.correctGoalScorerDefender || bullseyeScoringSystem.correctGoalScorerDefender,
    correctGoalScorerMidfielder: scoringSystem?.correctGoalScorerMidfielder || bullseyeScoringSystem.correctGoalScorerMidfielder,
    correctGoalScorerForward: scoringSystem?.correctGoalScorerForward || bullseyeScoringSystem.correctGoalScorerForward,
    oddsBetween3And4: scoringSystem?.oddsBetween3And4 || bullseyeScoringSystem.oddsBetween3And4,
    oddsBetween4And6: scoringSystem?.oddsBetween4And6 || bullseyeScoringSystem.oddsBetween4And6,
    oddsBetween6And10: scoringSystem?.oddsBetween6And10 || bullseyeScoringSystem.oddsBetween6And10,
    oddsAvobe10: scoringSystem?.oddsAvobe10 || bullseyeScoringSystem.oddsAvobe10,
    firstTeamToScore: scoringSystem?.firstTeamToScore || bullseyeScoringSystem.firstTeamToScore,
    goalFest: scoringSystem?.goalFest || bullseyeScoringSystem.goalFest,
    underdogBonus: scoringSystem?.underdogBonus || bullseyeScoringSystem.underdogBonus,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleTemplateClick = (template: ScoringSystemTemplates) => {
    setSelectedScoringSystem(template);
    setScoringSystemValues(template === ScoringSystemTemplates.GAMBLER ? gamblerScoringSystem : bullseyeScoringSystem);
  };

  const getMinMaxValue = (value: keyof LeagueScoringSystemValues) => {
    switch (value) {
      case 'correctOutcome':
        return { min: 1, max: 3 };
      case 'correctResult':
        return { min: 0, max: 1 };
      case 'correctGoalDifference':
        return { min: 0, max: 1 };
      case 'correctGoalsByTeam':
        return { min: 0, max: 1 };
      case 'correctGoalScorerDefender':
        return { min: 0, max: 8 };
      case 'correctGoalScorerMidfielder':
        return { min: 0, max: 5 };
      case 'correctGoalScorerForward':
        return { min: 0, max: 3 };
      case 'oddsBetween3And4':
        return { min: 0, max: 3 };
      case 'oddsBetween4And6':
        return { min: 0, max: 6 };
      case 'oddsBetween6And10':
        return { min: 0, max: 10 };
      case 'oddsAvobe10':
        return { min: 0, max: 16 };
      case 'firstTeamToScore':
        return { min: 0, max: 3 };
      case 'goalFest':
        return { min: 0, max: 4 };
      case 'underdogBonus':
        return { min: 0, max: 6 };
      default:
        return { min: 0, max: 1 };
    }
  };

  const getMinMaxContainer = (value: keyof LeagueScoringSystemValues) => {
    const { min, max } = getMinMaxValue(value);

    return (
      <MinMaxContainer>
        <EmphasisTypography variant="m" color={theme.colors.silverDarker} noWrap>
          {`Mellan ${min} - ${max}`}
        </EmphasisTypography>
      </MinMaxContainer>
    );
  };

  const getPointsAdjustmentContainer = (options: {
    label: string,
    description: string,
    value: keyof LeagueScoringSystemValues,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    suggestion?: string,
  }) => {
    const {
      label, description, value, onChange, suggestion,
    } = options;

    const { min, max } = getMinMaxValue(value);

    return (
      <PointsAdjustmentContainer>
        <Section gap="xxs" fitContent>
          <EmphasisTypography variant="m">{label}</EmphasisTypography>
          <NormalTypography variant="s" color={theme.colors.textLight}>
            {description}
          </NormalTypography>
          {suggestion && (
            <EmphasisTypography variant="s" color={theme.colors.goldDarker}>
              {suggestion}
            </EmphasisTypography>
          )}
        </Section>
        <Section fitContent flexDirection="row" gap="m" alignItems="center">
          {getMinMaxContainer(value)}
          <Section fitContent>
            <Input
              type="number"
              value={scoringSystemValues[value].toString()}
              onChange={(e) => onChange(e)}
              maxWidth="100px"
              min={min}
              max={max}
            />
          </Section>
        </Section>
      </PointsAdjustmentContainer>
    );
  };

  return (
    <ActionsModal
      size="l"
      title="Poängsystem"
      onActionClick={() => onSave(scoringSystemValues)}
      onCancelClick={onClose}
      actionButtonLabel="Spara"
      mobileFullScreen
      headerDivider
    >
      <Section gap="l">
        <NormalTypography variant="m">Här kan du manuellt justera antal poäng som delas ut, eller välja ett färdigt system.</NormalTypography>
        <Section gap="s">
          <Section gap="xxs">
            <HeadingsTypography variant="h5">Välj färdigt system</HeadingsTypography>
            <NormalTypography variant="m" color={theme.colors.textLight}>Poängen appliceras automatiskt utefter vald mall nedan och kan sedan justeras manuellt eller sparas.</NormalTypography>
          </Section>
          <ScoringSystemSelector>
            <ScoringSystemOption
              border
              selected={selectedScoringSystem === ScoringSystemTemplates.GAMBLER}
              onClick={() => handleTemplateClick(ScoringSystemTemplates.GAMBLER)}
            >
              {selectedScoringSystem === ScoringSystemTemplates.GAMBLER ? (
                <CheckCircle size={24} weight="fill" color={theme.colors.primary} />
              ) : (
                <Circle size={24} color={theme.colors.silverDark} />
              )}
              <Section gap="xxxs">
                <EmphasisTypography variant="m" color={theme.colors.textDefault}>“Gambler”</EmphasisTypography>
                <NormalTypography variant="s" color={selectedScoringSystem === ScoringSystemTemplates.GAMBLER ? theme.colors.primaryDark : theme.colors.silverDark}>
                  Ger lite större utdelningar och gynnar de som vågar satsa på ett oväntat resultat.
                </NormalTypography>
              </Section>
            </ScoringSystemOption>
            <ScoringSystemOption
              selected={selectedScoringSystem === ScoringSystemTemplates.BULLSEYE}
              onClick={() => handleTemplateClick(ScoringSystemTemplates.BULLSEYE)}
            >
              {selectedScoringSystem === ScoringSystemTemplates.BULLSEYE ? (
                <CheckCircle size={24} weight="fill" color={theme.colors.primary} />
              ) : (
                <Circle size={24} color={theme.colors.silverDark} />
              )}
              <Section gap="xxxs">
                <EmphasisTypography variant="m">“Bullseye”</EmphasisTypography>
                <NormalTypography variant="s" color={selectedScoringSystem === ScoringSystemTemplates.BULLSEYE ? theme.colors.primaryDark : theme.colors.silverDark}>
                  Ger lite mindre utdelningar och gynnar de som prickar exakt rätt.
                </NormalTypography>
              </Section>
            </ScoringSystemOption>
          </ScoringSystemSelector>
        </Section>
        <Section gap="s">
          <Section gap="xxs">
            <HeadingsTypography variant="h5">Manuell justering</HeadingsTypography>
            <NormalTypography variant="m" color={theme.colors.textLight}>
              Är det något du inte vill ska ge poängutdelning - sätt värdet till 0.
            </NormalTypography>
          </Section>
          <Divider />
          {getPointsAdjustmentContainer({
            label: 'Korrekt utfall',
            description: 'Antal poäng som delas ut för korrekt utfall (1/X/2).',
            value: 'correctOutcome',
            onChange: (e) => setScoringSystemValues({ ...scoringSystemValues, correctOutcome: parseInt(e.currentTarget.value) }),
          })}
          <Divider />
          {getPointsAdjustmentContainer({
            label: 'Korrekt mål för ett av lagen',
            description: 'Antal poäng som delas ut för att ha tippat rätt antal mål för ett av lagen.',
            value: 'correctGoalsByTeam',
            onChange: (e) => setScoringSystemValues({ ...scoringSystemValues, correctGoalsByTeam: parseInt(e.currentTarget.value) }),
          })}
          <Divider />
          {getPointsAdjustmentContainer({
            label: 'Korrekt målskillnad',
            description: 'Antal poäng som delas ut för att ha tippat rätt målskillnad mellan lagen.',
            value: 'correctGoalDifference',
            onChange: (e) => setScoringSystemValues({ ...scoringSystemValues, correctGoalDifference: parseInt(e.currentTarget.value) }),
          })}
          <Divider />
          {getPointsAdjustmentContainer({
            label: 'Korrekt resultat',
            description: 'Antal extra poäng som delas ut för att ha tippat exakt rätt resultat.',
            suggestion: 'Tips: Detta är endast en extra-poäng. Korrekta resultat belönas även genom poäng för korrekt utfall, korrekt mål av hemmalag, korrekt mål av bortalag samt korrekt målskillnad.',
            value: 'correctResult',
            onChange: (e) => setScoringSystemValues({ ...scoringSystemValues, correctResult: parseInt(e.currentTarget.value) }),
          })}
          <Divider />
          {getPointsAdjustmentContainer({
            label: 'Korrekt målskytt (försvarare)',
            description: 'Antal poäng som delas ut för att ha tippat rätt målskytt bland försvarare.',
            value: 'correctGoalScorerDefender',
            onChange: (e) => setScoringSystemValues({ ...scoringSystemValues, correctGoalScorerDefender: parseInt(e.currentTarget.value) }),
          })}
          <Divider />
          {getPointsAdjustmentContainer({
            label: 'Korrekt målskytt (mittfältare)',
            description: 'Antal poäng som delas ut för att ha tippat rätt målskytt bland mittfältare.',
            value: 'correctGoalScorerMidfielder',
            onChange: (e) => setScoringSystemValues({ ...scoringSystemValues, correctGoalScorerMidfielder: parseInt(e.currentTarget.value) }),
          })}
          <Divider />
          {getPointsAdjustmentContainer({
            label: 'Korrekt målskytt (anfallare)',
            description: 'Antal poäng som delas ut för att ha tippat rätt målskytt bland anfallare.',
            value: 'correctGoalScorerForward',
            onChange: (e) => setScoringSystemValues({ ...scoringSystemValues, correctGoalScorerForward: parseInt(e.currentTarget.value) }),
          })}
          <Divider />
          {getPointsAdjustmentContainer({
            label: 'Första lag att göra mål',
            description: 'Antal poäng som delas ut för att ha tippat rätt lag att göra första målet i matchen.',
            value: 'firstTeamToScore',
            onChange: (e) => setScoringSystemValues({ ...scoringSystemValues, firstTeamToScore: parseInt(e.currentTarget.value) }),
          })}
          <Divider />
          {getPointsAdjustmentContainer({
            label: 'Målfest',
            description: 'Antal poäng som delas ut för att ha tippat rätt resultat med 5 mål eller fler i matchen.',
            value: 'goalFest',
            onChange: (e) => setScoringSystemValues({ ...scoringSystemValues, goalFest: parseInt(e.currentTarget.value) }),
          })}
          <Divider />
          {getPointsAdjustmentContainer({
            label: 'Underdog bonus',
            description: 'Antal poäng som delas ut för att vara ensam om att ha tippat rätt resultat i en match.',
            value: 'underdogBonus',
            onChange: (e) => setScoringSystemValues({ ...scoringSystemValues, underdogBonus: parseInt(e.currentTarget.value) }),
          })}
          <Divider />
          {getPointsAdjustmentContainer({
            label: 'Odds 3.00 - 3.99',
            description: 'Antal poäng som delas ut för att ha tippat rätt utfall med odds mellan 3.00 - 3.99.',
            value: 'oddsBetween3And4',
            onChange: (e) => setScoringSystemValues({ ...scoringSystemValues, oddsBetween3And4: parseInt(e.currentTarget.value) }),
          })}
          <Divider />
          {getPointsAdjustmentContainer({
            label: 'Odds 4.00 - 5.99',
            description: 'Antal poäng som delas ut för att ha tippat rätt utfall med odds mellan 4.00 - 5.99.',
            value: 'oddsBetween4And6',
            onChange: (e) => setScoringSystemValues({ ...scoringSystemValues, oddsBetween4And6: parseInt(e.currentTarget.value) }),
          })}
          <Divider />
          {getPointsAdjustmentContainer({
            label: 'Odds 6.00 - 9.99',
            description: 'Antal poäng som delas ut för att ha tippat rätt utfall med odds mellan 6.00 - 9.99.',
            value: 'oddsBetween6And10',
            onChange: (e) => setScoringSystemValues({ ...scoringSystemValues, oddsBetween6And10: parseInt(e.currentTarget.value) }),
          })}
          <Divider />
          {getPointsAdjustmentContainer({
            label: 'Odds 10.00+',
            description: 'Antal poäng som delas ut för att ha tippat rätt utfall med odds över 10.00.',
            value: 'oddsAvobe10',
            onChange: (e) => setScoringSystemValues({ ...scoringSystemValues, oddsAvobe10: parseInt(e.currentTarget.value) }),
          })}
          <Divider />
        </Section>
      </Section>
    </ActionsModal>
  );
};

const ScoringSystemSelector = styled.div`
  display: flex;
  background-color: ${theme.colors.silverBleach};
  border: 1px solid ${theme.colors.silverLight};
  border-radius: ${theme.borderRadius.m};
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
  box-shadow: 0px 3px 0px 0px ${theme.colors.silverLighter};
`;

const ScoringSystemOption = styled.div<{ selected: boolean, border?: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.xs};
  background-color: ${({ selected }) => (selected ? theme.colors.primaryFade : theme.colors.silverBleach)};
  cursor: pointer;
  transition: background-color 0.2s;
  flex: 1;
  ${({ border }) => border && `border-right: 1px solid ${theme.colors.silverLight};`}

  > section {
    padding-top: 2px;
  }

  &:hover {
    background-color: ${({ selected }) => (selected ? theme.colors.primaryFade : theme.colors.silverLighter)};
  }
`;

const PointsAdjustmentContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing.s};
  width: 100%;
  box-sizing: border-box;
`;

const MinMaxContainer = styled.div<{ highlight?: boolean }>`
  display: flex;
  align-items: center;
  border: 1px solid ${theme.colors.silverLight};
  background-color: ${theme.colors.silverLighter};
  border-radius: ${theme.borderRadius.m};
  overflow: hidden;
  padding: ${theme.spacing.xs};
`;

export default EditLeagueScoringSystemModal;
