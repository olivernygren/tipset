import React from 'react';
import { min, max } from 'date-fns';
import styled from 'styled-components';
import { LeagueScoringSystemValues } from '../../utils/League';
import { Divider } from '../Divider';
import { devices, theme } from '../../theme';
import Modal from '../modal/Modal';
import { Section } from '../section/Section';
import { EmphasisTypography, NormalTypography, HeadingsTypography } from '../typography/Typography';
import InfoDialogue from '../info/InfoDialogue';

interface Props {
  onClose: () => void;
  scoringSystemValues?: LeagueScoringSystemValues;
}

const ViewScoringSystemModal = ({ onClose, scoringSystemValues }: Props) => {
  if (!scoringSystemValues) {
    return null;
  }

  const getPointsAdjustmentContainer = (options: {
    label: string,
    description: string,
    value: keyof LeagueScoringSystemValues,
    disclaimer?: string,
  }) => {
    const {
      label, description, value, disclaimer,
    } = options;

    return (
      <PointsContainer>
        <Section gap="xxs" fitContent>
          <EmphasisTypography variant="m">{label}</EmphasisTypography>
          <NormalTypography variant="s" color={theme.colors.textLight}>
            {description}
          </NormalTypography>
          {disclaimer && (
            <NormalTypography variant="s" color={theme.colors.textLight}>
              {disclaimer}
            </NormalTypography>
          )}
        </Section>
        <EmphasisTypography variant="m">{`${scoringSystemValues[value].toString()} poäng`}</EmphasisTypography>
      </PointsContainer>
    );
  };

  return (
    <Modal
      onClose={onClose}
      size="l"
      title="Poängsystem"
      mobileFullScreen
      headerDivider
    >
      <Section gap="l">
        <Section gap="s">
          <Section gap="xxs">
            <HeadingsTypography variant="h5">Utdelning av poäng</HeadingsTypography>
            <NormalTypography variant="m" color={theme.colors.textLight}>Utdelning av poäng sker efter varje match enligt poängsystemet nedan.</NormalTypography>
          </Section>
        </Section>
        <InfoDialogue
          title="Unikt poängsystem"
          description="Varje liga kan ha ett unikt poängsystem som skaparen av ligan har valt. Nedan syns det poängsystem som används i denna liga."
          color="silver"
        />
        <Section gap="s">
          <Divider />
          {getPointsAdjustmentContainer({
            label: 'Korrekt utfall',
            description: 'Antal poäng som delas ut för korrekt utfall (1/X/2).',
            value: 'correctOutcome',
          })}
          <Divider />
          {getPointsAdjustmentContainer({
            label: 'Korrekt mål av lag',
            description: 'Antal poäng som delas ut för att ha tippat rätt antal mål för ett av lagen.',
            value: 'correctGoalsByTeam',
            disclaimer: '(Vid korrekt tippat resultat får du alltså denna poäng för båda lagen)',
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
            value: 'correctResult',
            disclaimer: '(Notera att vid korrekt resultat så får du även poäng för korrekt utfall, målskillnad och antal mål av båda lagen)',
          })}
          <Divider />
          {scoringSystemValues.firstTeamToScore > 0 && (
            <>
              {getPointsAdjustmentContainer({
                label: 'Första lag att göra mål',
                description: 'Antal poäng som delas ut för att ha tippat rätt lag att göra första målet i matchen.',
                value: 'firstTeamToScore',
              })}
              <Divider />
            </>
          )}
          {getPointsAdjustmentContainer({
            label: 'Målfest',
            description: 'Antal poäng som delas ut för att ha tippat rätt resultat med 5 mål eller fler i matchen.',
            value: 'goalFest',
          })}
          <Divider />
          {getPointsAdjustmentContainer({
            label: 'Underdog bonus',
            description: 'Antal poäng som delas ut för att vara ensam om att ha tippat rätt resultat i en match.',
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
            value: 'oddsBetween3And4',
          })}
          <Divider />
          {getPointsAdjustmentContainer({
            label: 'Odds 4.00 - 5.99',
            description: 'Antal poäng som delas ut för att ha tippat rätt utfall med odds mellan 4.00 - 5.99.',
            value: 'oddsBetween4And6',
          })}
          <Divider />
          {getPointsAdjustmentContainer({
            label: 'Odds 6.00 - 9.99',
            description: 'Antal poäng som delas ut för att ha tippat rätt utfall med odds mellan 6.00 - 9.99.',
            value: 'oddsBetween6And10',
          })}
          <Divider />
          {getPointsAdjustmentContainer({
            label: 'Odds 10.00+',
            description: 'Antal poäng som delas ut för att ha tippat rätt utfall med odds över 10.00.',
            value: 'oddsAvobe10',
          })}
          <Divider />
        </Section>
      </Section>
    </Modal>
  );
};

const PointsContainer = styled.div`
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

export default ViewScoringSystemModal;
