import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react'
import { PredictionLeague } from '../../utils/League';
import { withDocumentIdOnObjectsInArray } from '../../utils/helpers';
import { db } from '../../config/firebase';
import { User } from '../../utils/Auth';
import { Section } from '../../components/section/Section';
import { theme } from '../../theme';
import { HeadingsTypography, NormalTypography } from '../../components/typography/Typography';

const AdminDashboard = () => {
  const [leagues, setLeagues] = useState<Array<PredictionLeague>>([]);
  const [users, setUsers] = useState<Array<User>>([]);

  const fetchCollections = async () => {
    try {
      const leagueCollectionRef = collection(db, 'leagues');
      const anotherCollectionRef = collection(db, 'users');
  
      const [leagueData, anotherData] = await Promise.all([
        getDocs(leagueCollectionRef),
        getDocs(anotherCollectionRef),
      ]);
  
      const leagues = withDocumentIdOnObjectsInArray<PredictionLeague>(leagueData.docs);
      const anotherCollection = withDocumentIdOnObjectsInArray<User>(anotherData.docs);
  
      setLeagues(leagues);
      setUsers(anotherCollection);
    } catch (e) {
      console.error(e);
    }
  };
  
  useEffect(() => {
    fetchCollections();
  }, []);

  return (
    <Section flexDirection='row' gap='l' padding={theme.spacing.l}>
      <Section backgroundColor={theme.colors.white} borderRadius={theme.borderRadius.m} padding={theme.spacing.m} gap='m'>
        <HeadingsTypography variant='h3'>Antal ligor</HeadingsTypography>
        <NormalTypography variant='m'>{leagues.length}</NormalTypography>
      </Section>
      <Section backgroundColor={theme.colors.white} borderRadius={theme.borderRadius.m} padding={theme.spacing.m} gap='m'>
        <HeadingsTypography variant='h3'>Antal användare</HeadingsTypography>
        <NormalTypography variant='m'>{users.length}</NormalTypography>
      </Section>
    </Section>
  )
}

export default AdminDashboard;