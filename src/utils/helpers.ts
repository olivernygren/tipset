import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

export const withDocumentId = <T>(docs: QueryDocumentSnapshot<DocumentData>[]): T[] => {
  return docs.map(doc => ({
    ...(doc.data() as T),
    documentId: doc.id,
  }));
};

export const generateLeagueInviteCode = (): string => {
  // generate a random 8 letter string with capital letters only
  return Math.random().toString(20).substr(2, 8).toUpperCase();
}