import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

export const withDocumentId = <T>(docs: QueryDocumentSnapshot<DocumentData>[]): T[] => {
  return docs.map(doc => ({
    ...(doc.data() as T),
    documentId: doc.id,
  }));
};