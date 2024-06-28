import { collection, where, getDocs, query } from "firebase/firestore";
import { db } from "../config/firebase";
import { CollectionEnum } from "./Firebase";
import { PredictionLeagueStanding } from "./League";

export const getLeagueByInvitationCode = async (inviteCode: string) => {
  const q = query(collection(db, CollectionEnum.LEAGUES), where("inviteCode", "==", inviteCode));
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    const leagueDoc = querySnapshot.docs[0];
    return leagueDoc;
  } else {
    console.log('No such document!');
    return null;
  }
};

export const getSortedLeagueStandings = (standings: Array<PredictionLeagueStanding>) => {
  return standings.sort((a, b) => {
    if (a.points === b.points) {
      return a.correctResults - b.correctResults;
    }
    return b.points - a.points;
  });
}

export const getUserStandingPositionInLeague = (userId: string, sortedStandings: Array<PredictionLeagueStanding>) => {
  return sortedStandings.findIndex(standing => standing.userId === userId) + 1;
}