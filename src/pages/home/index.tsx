import Page from '../../components/Page';
import { Section } from '../../components/section/Section';
import { HeadingsTypography } from '../../components/typography/Typography';
import HomePageCard from '../../components/cards/HomePageCard';

const HomePage = () => {
  return (
    <Page user={undefined}>
      <Section gap='m'>
        <HeadingsTypography variant='h1'>Välkommen!</HeadingsTypography>
        <HomePageCard
          title='Ligor'
          description='Skapa och delta i ligor för att tävla mot dina vänner.'
          href='/leagues'
        />
        <HomePageCard
          title='Regler'
          description='Läs om reglerna för att förstå hur du kan vinna.'
          href='/rules'
        />
      </Section>
    </Page>
  )
};

export default HomePage;