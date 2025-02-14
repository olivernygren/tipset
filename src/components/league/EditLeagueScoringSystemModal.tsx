import React, { useState } from 'react';
import { CheckCircle, Circle } from '@phosphor-icons/react';
import styled from 'styled-components';
import { LeagueScoringSystemValues, ScoringSystemTemplates } from '../../utils/League';
import { devices, theme } from '../../theme';
import { Divider } from '../Divider';
import ActionsModal from '../modal/ActionsModal';
import { Section } from '../section/Section';
import { NormalTypography, HeadingsTypography, EmphasisTypography } from '../typography/Typography';
import { bullseyeScoringSystem, gamblerScoringSystem } from '../../utils/helpers';
import Input from '../input/Input';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';

interface EditLeagueScoringSystemModalProps {
  onClose: () => void;
  onSave: (scoringSystem: LeagueScoringSystemValues) => void;
  scoringSystem?: LeagueScoringSystemValues;
  saveLoading?: boolean;
}

const EditLeagueScoringSystemModal = ({
  onClose, scoringSystem, onSave, saveLoading,
}: EditLeagueScoringSystemModalProps) => {
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

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
  const [errors, setErrors] = useState<{ [key: string]: string }>(Object.keys(scoringSystemValues).reduce((acc, key) => ({ ...acc, [key]: '' }), {}));

  const hasErrors = Object.values(errors).some((error) => error.length > 0);

  const handleTemplateClick = (template: ScoringSystemTemplates) => {
    setSelectedScoringSystem(template);
    setScoringSystemValues(template === ScoringSystemTemplates.GAMBLER ? gamblerScoringSystem : bullseyeScoringSystem);
  };

  const handleChangeValue = (value: keyof LeagueScoringSystemValues, newValue: number) => {
    const { min, max } = getMinMaxValue(value);

    setScoringSystemValues({ ...scoringSystemValues, [value]: newValue });

    if (newValue < min || newValue > max) {
      setErrors({ ...errors, [value]: `Värdet måste vara mellan ${min} - ${max}` });
    } else {
      setErrors({ ...errors, [value]: '' });
    }
  };

  const getMinMaxValue = (value: keyof LeagueScoringSystemValues) => {
    switch (value) {
      case 'correctOutcome':
        return { min: 1, max: 3 };
      case 'correctResult':
        return { min: 0, max: 2 };
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
        return { min: 0, max: 2 };
      case 'oddsBetween4And6':
        return { min: 0, max: 6 };
      case 'oddsBetween6And10':
        return { min: 0, max: 10 };
      case 'oddsAvobe10':
        return { min: 0, max: 15 };
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
        <EmphasisTypography variant="m" color={errors[value] && errors[value].length > 0 ? theme.colors.red : theme.colors.silverDarker} noWrap>
          {`Mellan ${min} - ${max}`}
        </EmphasisTypography>
      </MinMaxContainer>
    );
  };

  const getPointsAdjustmentContainer = (options: {
    label: string,
    description: string,
    value: keyof LeagueScoringSystemValues,
    suggestion?: string,
  }) => {
    const {
      label, description, value, suggestion,
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
        <PointsAdjustmentContainerInput>
          {getMinMaxContainer(value)}
          <Input
            type="number"
            value={scoringSystemValues[value].toString()}
            onChange={(e) => {
              handleChangeValue(value, parseInt(e.currentTarget.value));
              setSelectedScoringSystem(undefined);
            }}
            maxWidth={isMobile ? undefined : '100px'}
            error={Boolean(errors[value] && errors[value].length > 0)}
            fullWidth={isMobile}
            min={min}
            max={max}
          />
        </PointsAdjustmentContainerInput>
      </PointsAdjustmentContainer>
    );
  };

  return (
    <ActionsModal
      size="l"
      title="Poängsystem"
      onActionClick={() => onSave(scoringSystemValues)}
      actionButtonDisabled={hasErrors || saveLoading}
      onCancelClick={onClose}
      loading={saveLoading}
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
          })}
          <Divider />
          {getPointsAdjustmentContainer({
            label: 'Korrekt mål för ett av lagen',
            description: 'Antal poäng som delas ut för att ha tippat rätt antal mål för ett av lagen.',
            value: 'correctGoalsByTeam',
          })}
          <Divider />
          {getPointsAdjustmentContainer({
            label: 'Korrekt målskillnad',
            description: 'Antal poäng som delas ut för att ha tippat rätt målskillnad mellan lagen.',
            value: 'correctGoalDifference',
          })}
          <Divider />
          {getPointsAdjustmentContainer({
            label: 'Korrekt resultat',
            description: 'Antal extra poäng som delas ut för att ha tippat exakt rätt resultat.',
            suggestion: 'Tips: Detta är endast en extra-poäng. Korrekta resultat belönas även genom poäng för korrekt utfall, korrekt mål av hemmalag, korrekt mål av bortalag samt korrekt målskillnad.',
            value: 'correctResult',
          })}
          <Divider />
          {getPointsAdjustmentContainer({
            label: 'Första lag att göra mål',
            description: 'Antal poäng som delas ut för att ha tippat rätt lag att göra första målet i matchen.',
            value: 'firstTeamToScore',
          })}
          <Divider />
          {getPointsAdjustmentContainer({
            label: 'Målfest',
            description: 'Antal poäng som delas ut för att ha tippat rätt resultat med 5 mål eller fler i matchen.',
            value: 'goalFest',
          })}
          <Divider />
          {getPointsAdjustmentContainer({
            label: 'Underdog bonus',
            description: 'Antal poäng som delas ut för att vara ensam om att ha tippat rätt resultat i en match.',
            suggestion: 'Tips: Ju fler deltagare som deltar i ligan, desto svårare är det att få denna bonus, och desto högre utdelning bör ges här. Skippa poäng här om ni endast är några få deltagare.',
            value: 'underdogBonus',
          })}
          <Divider />
          {getPointsAdjustmentContainer({
            label: 'Korrekt målskytt (försvarare)',
            description: 'Antal poäng som delas ut för att ha tippat rätt målskytt bland försvarare.',
            value: 'correctGoalScorerDefender',
          })}
          <Divider />
          {getPointsAdjustmentContainer({
            label: 'Korrekt målskytt (mittfältare)',
            description: 'Antal poäng som delas ut för att ha tippat rätt målskytt bland mittfältare.',
            value: 'correctGoalScorerMidfielder',
          })}
          <Divider />
          {getPointsAdjustmentContainer({
            label: 'Korrekt målskytt (anfallare)',
            description: 'Antal poäng som delas ut för att ha tippat rätt målskytt bland anfallare.',
            value: 'correctGoalScorerForward',
          })}
          <Divider />
          {getPointsAdjustmentContainer({
            label: 'Odds 3.00 - 3.99',
            description: 'Antal poäng som delas ut för att ha tippat rätt utfall med odds mellan 3.00 - 3.99.',
            suggestion: 'Tips: Om du inte tänkt lägga till odds för matcherna i ligan, sätt detta värde till 0.',
            value: 'oddsBetween3And4',
          })}
          <Divider />
          {getPointsAdjustmentContainer({
            label: 'Odds 4.00 - 5.99',
            description: 'Antal poäng som delas ut för att ha tippat rätt utfall med odds mellan 4.00 - 5.99.',
            suggestion: 'Tips: Om du inte tänkt lägga till odds för matcherna i ligan, sätt detta värde till 0.',
            value: 'oddsBetween4And6',
          })}
          <Divider />
          {getPointsAdjustmentContainer({
            label: 'Odds 6.00 - 9.99',
            description: 'Antal poäng som delas ut för att ha tippat rätt utfall med odds mellan 6.00 - 9.99.',
            suggestion: 'Tips: Om du inte tänkt lägga till odds för matcherna i ligan, sätt detta värde till 0.',
            value: 'oddsBetween6And10',
          })}
          <Divider />
          {getPointsAdjustmentContainer({
            label: 'Odds 10.00+',
            description: 'Antal poäng som delas ut för att ha tippat rätt utfall med odds över 10.00.',
            suggestion: 'Tips: Om du inte tänkt lägga till odds för matcherna i ligan, sätt detta värde till 0.',
            value: 'oddsAvobe10',
          })}
          <Divider />
        </Section>
      </Section>
    </ActionsModal>
  );
};

const ScoringSystemSelector = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${theme.colors.silverBleach};
  border: 1px solid ${theme.colors.silverLight};
  border-radius: ${theme.borderRadius.m};
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
  box-shadow: 0px 3px 0px 0px ${theme.colors.silverLighter};
  
  @media ${devices.tablet} {
    flex-direction: row;
  }
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
  ${({ border }) => border && `border-bottom: 1px solid ${theme.colors.silverLight};`}

  > section {
    padding-top: 2px;
  }

  &:hover {
    background-color: ${({ selected }) => (selected ? theme.colors.primaryFade : theme.colors.silverLighter)};
  }

  @media ${devices.tablet} {
    border-bottom: none;
    ${({ border }) => border && `border-right: 1px solid ${theme.colors.silverLight};`}
  }
`;

const PointsAdjustmentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.s};
  width: 100%;
  box-sizing: border-box;
  
  @media ${devices.tablet} {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const PointsAdjustmentContainerInput = styled.div`
  display: flex;
  width: 100%;
  box-sizing: border-box;
  gap: ${theme.spacing.s};

  @media ${devices.tablet} {  
    width: fit-content;
    align-items: center;
    gap: ${theme.spacing.m};
  }
`;

const MinMaxContainer = styled.div<{ highlight?: boolean }>`
  display: flex;
  align-items: center;
  border: 1px solid ${theme.colors.silverLight};
  background-color: ${theme.colors.silverLighter};
  border-radius: ${theme.borderRadius.m};
  padding: ${theme.spacing.xs};
`;

export default EditLeagueScoringSystemModal;
