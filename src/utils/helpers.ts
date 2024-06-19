import { QueryDocumentSnapshot, DocumentData, DocumentSnapshot } from 'firebase/firestore';

export const withDocumentIdOnObjectsInArray = <T>(docs: QueryDocumentSnapshot<DocumentData>[]): T[] => {
  return docs.map(doc => ({
    ...(doc.data() as T),
    documentId: doc.id,
  }));
};

export const withDocumentIdOnObject = <T>(docSnap: DocumentSnapshot): T & { documentId: string } => {
  return {
    ...(docSnap.data() as T),
    documentId: docSnap.id,
  };
};

export const generateLeagueInviteCode = (): string => {
  return Math.random().toString(20).substring(2, 8).toUpperCase();
}