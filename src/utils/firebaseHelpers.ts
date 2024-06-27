import { collection, where, getDocs, query } from "firebase/firestore";
import { db } from "../config/firebase";
import { CollectionEnum } from "./Firebase";

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