import { QueryDocumentSnapshot, DocumentData, DocumentSnapshot } from 'firebase/firestore';
import { PredictionOutcomeEnum, PredictionStatus } from './Fixture';
import { LeagueGameWeek } from './League';

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
};

export const hasInvalidTeamName = (teamName: string): boolean => {
  if (teamName === 'Välj lag' || teamName === '') {
    return true;
  }
  return false;
};

export const getPredictionStatus = (currentGameWeek: LeagueGameWeek, userId: string): PredictionStatus => {
  if (currentGameWeek.games.predictions.some((prediction) => prediction.userId === userId)) {
    return PredictionStatus.PREDICTED;
  }
  return PredictionStatus.NOT_PREDICTED;
};

export const getPredictionOutcome = (homeGoals: number, awayGoals: number): PredictionOutcomeEnum => {
  if (homeGoals > awayGoals) {
    return PredictionOutcomeEnum.HOME_TEAM_WIN;
  } else if (homeGoals < awayGoals) {
    return PredictionOutcomeEnum.AWAY_TEAM_WIN;
  } else {
    return PredictionOutcomeEnum.DRAW;
  }
};

export const getHomeTeamPredictedGoals = (gameWeek: LeagueGameWeek, fixtureId: string, userId: string): number | undefined => {
  const prediction = gameWeek.games.predictions.find((prediction) => prediction.userId === userId && prediction.fixtureId === fixtureId);
  return prediction ? prediction.homeGoals : undefined;
};

export const getAwayTeamPredictedGoals = (gameWeek: LeagueGameWeek, fixtureId: string, userId: string): number | undefined => {
  const prediction = gameWeek.games.predictions.find((prediction) => prediction.userId === userId && prediction.fixtureId === fixtureId);
  return prediction ? prediction.awayGoals : undefined;
};