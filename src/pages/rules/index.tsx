import React from 'react'
import Page from '../../components/Page'
import { EmphasisTypography, HeadingsTypography, NormalTypography } from '../../components/typography/Typography'
import { Section } from '../../components/section/Section';
import styled from 'styled-components';
import { theme } from '../../theme';
import { defenderGoalPoints, forwardGoalPoints, midfielderGoalPoints } from '../../utils/helpers';

const RulesPage = () => {
  return (
    <Page>
      <Container>
        <HeadingsTypography variant='h1'>Regler</HeadingsTypography>
        <EmphasisTypography variant='l'>Följande regler gäller i tipset</EmphasisTypography>
        <Section gap='m'>
          <HeadingsTypography variant='h3'>Poäng</HeadingsTypography>
          <NormalTypography variant='m'>För att göra det hela lite extra intressant kan du få poäng på flera olika sätt. Du belönas alltså inte bara för att tippa exakt rätt resultat, eller rätt utfall.</NormalTypography>
          <EmphasisTypography variant='m'>För varje match kan du få poäng enligt följande:</EmphasisTypography>
          <Section gap='s'>
            <NormalTypography variant='m'>1 poäng för rätt utfall (1, X eller 2)</NormalTypography>
            <NormalTypography variant='m'>1 poäng för rätt antal mål av hemmalaget</NormalTypography>
            <NormalTypography variant='m'>1 poäng för rätt antal mål av bortalaget</NormalTypography>
            <NormalTypography variant='m'>1 poäng för rätt målskillnad (t.ex. du tippar 2-1 men matchen slutar 1-0)</NormalTypography>
            <NormalTypography variant='m'>1 extra poäng för exakt rätt resultat</NormalTypography>
            <HeadingsTypography variant='h5'>Poäng för målskytt</HeadingsTypography>
            <NormalTypography variant='m'>Antalet poäng du får om du tippar rätt målskytt i en match avgörs av vilken position spelaren du tippat har. Försvarare har statistiskt sätt minst chans att göra mål, därefter mittfältare och sedan anfallare som oftast gör mål. Du blir alltså belönad om du lyckas pricka in en spelare som statistiskt sätt har en mindre chans att bli målskytt. Poäng delas ut OM spelaren gör mål i matchen, det spelar alltså ingen roll hur många mål spelaren gör.</NormalTypography>
            <NormalTypography variant='m'>{defenderGoalPoints} poäng för försvarare</NormalTypography>
            <NormalTypography variant='m'>{midfielderGoalPoints} poäng för mittfältare</NormalTypography>
            <NormalTypography variant='m'>{forwardGoalPoints} poäng för anfallare</NormalTypography>
          </Section>
          <EmphasisTypography variant='m'>Maxpoäng per match = 10 poäng</EmphasisTypography>
        </Section>
        <Section gap='s'>
          <HeadingsTypography variant='h3'>Tippa matcher</HeadingsTypography>
          <NormalTypography variant='m'>Du kan tippa matcher fram till avsparkstiden. Efter avspark kan du inte längre ändra ditt tips i matchen. Skulle du glömma av att tippa matchen kommer du inte kunna få några poäng.</NormalTypography>
        </Section>
        <Section gap='s'>
          <HeadingsTypography variant='h3'>Tabell</HeadingsTypography>
          <NormalTypography variant='m'>I varje liga kan du följa poängställningen i en tabell. Tabellen sorteras efter antal poäng. Skulle två deltagare ha samma antal poäng sorteras tabellen efter antal korrekta resultat som deltageren tippat. Du som tippar flest antal korrekta resultat kan alltså på detta sätt ha en fördel.</NormalTypography>
        </Section>
      </Container>
    </Page>
  )
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.m};
  max-width: 800px;
  margin: 0 auto;
`;

export default RulesPage;