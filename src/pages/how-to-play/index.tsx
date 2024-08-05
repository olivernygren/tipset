import Page from '../../components/Page'
import { EmphasisTypography, HeadingsTypography, NormalTypography } from '../../components/typography/Typography'
import { Section } from '../../components/section/Section';
import styled from 'styled-components';
import { theme } from '../../theme';
import { RoutesEnum } from '../../utils/Routes';
import { Divider } from '../../components/Divider';

const HowToPlayPage = () => {
  return (
    <Page>
      <Container>
        <HeadingsTypography variant='h1'>Hur funkar det?</HeadingsTypography>
        <EmphasisTypography variant='l'>Här kan du lära dig hur du börjar tippa matcher i Tipset.</EmphasisTypography>
        <Divider color={theme.colors.silver} />
        <Section gap='m'>
          <HeadingsTypography variant='h3'>Kom igång</HeadingsTypography>
          <NormalTypography variant='m'>För att kunna tippa matcher måste du först <InlineLink href={`/${RoutesEnum.LOGIN}`}>skapa ett konto</InlineLink>. Därefter kan du antingen skapa en liga eller gå med i en existerande liga genom att ange den inbjudningskod du fått av ligans skapare. Du kan vara med i flera ligor samtidigt.</NormalTypography>
          <NormalTypography variant='m'>Glöm inte att läsa igenom <InlineLink href={`/${RoutesEnum.RULES}`}>reglerna</InlineLink> innan du börjar tippa.</NormalTypography>
        </Section>
        <Divider color={theme.colors.silver} />
        <Section gap='s'>
          <HeadingsTypography variant='h3'>Ligor</HeadingsTypography>
          <NormalTypography variant='m'>En liga kan bestå av mellan 1 till 20 deltagare. När en liga skapas sätts en deadline för att kunna gå med. Det går alltså inte att gå med i en liga efter denna deadline.</NormalTypography>
          <NormalTypography variant='m'>Det är skaparen av ligan som är ansvarig för att skapa omgångar (välja matcher) samt att rätta dessa efter de spelats. Rättning sker manuellt genom en uträkningsalgoritm. Skaparen kan alltså själv inte bestämma antal poäng som deltagarna får. Poängen du får läggs ihop för varje omgång och kan följas i tabellen.</NormalTypography>
          <NormalTypography variant='m'>Varje omgång kan bestå av 1 till 13 matcher. Alla deltagare ska tippa resultat i varje match. I enskilda matcher kan man även tippa målskytt i matchen. En liga kan bestå av max 100 omgångar.</NormalTypography>
          <NormalTypography variant='m'>Först efter avsparkstiden i en enskild match kan du se vad alla andra deltagare har tippat. När en match har rättats kan du se vad alla deltagare fick för poäng i matchen.</NormalTypography>
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

const InlineLink = styled.a`
  color: ${theme.colors.primary};
  text-decoration: none;
  font-weight: 500;
  &:hover {
    text-decoration: underline;
  }
`;

export default HowToPlayPage;