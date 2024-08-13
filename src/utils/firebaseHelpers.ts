import {
  collection, where, getDocs, query, getDoc, doc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { CollectionEnum } from './Firebase';
import { PredictionLeagueStanding } from './League';
import { withDocumentIdOnObject } from './helpers';
import { User } from './Auth';

export const getLeagueByInvitationCode = async (inviteCode: string) => {
  const q = query(collection(db, CollectionEnum.LEAGUES), where('inviteCode', '==', inviteCode));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const leagueDoc = querySnapshot.docs[0];
    return leagueDoc;
  }
  console.log('No such document!');
  return null;
};

export const getSortedLeagueStandings = (standings: Array<PredictionLeagueStanding>) => standings.sort((a, b) => {
  if (a.points === b.points) {
    return a.correctResults - b.correctResults;
  }
  return b.points - a.points;
});

export const getUserStandingPositionInLeague = (userId: string, sortedStandings: Array<PredictionLeagueStanding>) => sortedStandings.findIndex((standing) => standing.userId === userId) + 1;

export const generateRandomID = () => Math.random().toString(32).substring(2, 9);

export const getUserNameById = async (userId: string) => {
  const userDocRef = doc(db, CollectionEnum.USERS, userId);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    const userData = withDocumentIdOnObject<User>(userDoc);
    return `${userData.firstname} ${userData.lastname}`;
  }
  return '';
};

export const getUserDataById = async (userId: string) => {
  const userDocRef = doc(db, CollectionEnum.USERS, userId);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    const userData = withDocumentIdOnObject<User>(userDoc);
    return userData;
  }
  return null;
};
