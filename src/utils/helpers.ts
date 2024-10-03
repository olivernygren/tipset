import { QueryDocumentSnapshot, DocumentData, DocumentSnapshot } from 'firebase/firestore';
import { PredictionOutcomeEnum, PredictionStatus } from './Fixture';
import { LeagueGameWeek } from './League';
import { ProfilePictureEnum } from '../components/avatar/Avatar';
import { Player } from './Players';
import { TournamentsEnum } from './Team';

export const defenderGoalPoints = 5;
export const midfielderGoalPoints = 3;
export const forwardGoalPoints = 2;

export const withDocumentIdOnObjectsInArray = <T>(docs: QueryDocumentSnapshot<DocumentData>[]): T[] => docs.map((doc) => ({
  ...(doc.data() as T),
  documentId: doc.id,
}));

export const withDocumentIdOnObject = <T>(docSnap: DocumentSnapshot): T & { documentId: string } => ({
  ...(docSnap.data() as T),
  documentId: docSnap.id,
});

export const generateLeagueInviteCode = (): string => Math.random().toString(20).substring(2, 8).toUpperCase();

export const hasInvalidTeamName = (teamName: string): boolean => {
  if (teamName === 'Välj lag' || teamName === '') {
    return true;
  }
  return false;
};

export const getPredictionStatus = (currentGameWeek: LeagueGameWeek, userId: string, fixtureId: string): PredictionStatus => {
  if (currentGameWeek.games.predictions.some((prediction) => prediction.userId === userId && prediction.fixtureId === fixtureId)) {
    return PredictionStatus.PREDICTED;
  }
  return PredictionStatus.NOT_PREDICTED;
};

export const getPredictionOutcome = (homeGoals: number, awayGoals: number): PredictionOutcomeEnum => {
  if (homeGoals > awayGoals) {
    return PredictionOutcomeEnum.HOME_TEAM_WIN;
  } if (homeGoals < awayGoals) {
    return PredictionOutcomeEnum.AWAY_TEAM_WIN;
  }
  return PredictionOutcomeEnum.DRAW;
};

export const getHomeTeamPredictedGoals = (gameWeek: LeagueGameWeek, fixtureId: string, userId: string): number | undefined => {
  const prediction = gameWeek.games.predictions.find((prediction) => prediction.userId === userId && prediction.fixtureId === fixtureId);
  return prediction ? prediction.homeGoals : undefined;
};

export const getAwayTeamPredictedGoals = (gameWeek: LeagueGameWeek, fixtureId: string, userId: string): number | undefined => {
  const prediction = gameWeek.games.predictions.find((prediction) => prediction.userId === userId && prediction.fixtureId === fixtureId);
  return prediction ? prediction.awayGoals : undefined;
};

export const getGeneralPositionShorthand = (position: string) => {
  switch (position) {
    case 'Forward':
      return 'ANF';
    case 'Midfielder':
      return 'MF';
    case 'Defender':
      return 'FÖR';
    case 'Goalkeeper':
      return 'MV';
    default:
      return '';
  }
};

export const getProfilePictureUrl = (picture: ProfilePictureEnum) => {
  switch (picture) {
    case ProfilePictureEnum.GRANNEN:
      return '/images/grannen.png';
    case ProfilePictureEnum.CARL_GUSTAF:
      return '/images/carl-gustaf.png';
    case ProfilePictureEnum.DONKEY:
      return '/images/donkey.png';
    case ProfilePictureEnum.ZLATAN:
      return '/images/zlatan.png';
    case ProfilePictureEnum.ANIMAL:
      return '/images/animal.png';
    case ProfilePictureEnum.SHREK:
      return '/images/shrek.png';
    case ProfilePictureEnum.ANTONY:
      return '/images/antony.png';
    case ProfilePictureEnum.FELLAINI:
      return '/images/fellaini.png';
    default:
      return '/images/generic.png';
  }
};

export const getUserPreviousGameWeekPrecitedGoalScorer = (previousGameWeek: LeagueGameWeek | undefined, userId: string): Player | undefined => {
  if (!previousGameWeek) {
    return undefined;
  }

  const prediction = previousGameWeek.games.predictions.find((prediction) => prediction.userId === userId && prediction.goalScorer);

  if (!prediction) {
    return undefined;
  }

  return prediction.goalScorer;
};

export const getLastGameWeek = (previousGameWeeks: Array<LeagueGameWeek> | undefined): LeagueGameWeek | undefined => {
  if (!previousGameWeeks || previousGameWeeks.length === 0) {
    return undefined;
  }

  const sortedGameWeeks = previousGameWeeks.sort((a, b) => a.round - b.round);

  return sortedGameWeeks[sortedGameWeeks.length - 1];
};

export const getIsBottomOfLeague = (position: number, tournament: TournamentsEnum): boolean => {
  switch (tournament) {
    case TournamentsEnum.ALLSVENSKAN:
      return position >= 16;
    case TournamentsEnum.SERIE_A:
    case TournamentsEnum.LA_LIGA:
    case TournamentsEnum.PREMIER_LEAGUE:
      return position >= 20;
    case TournamentsEnum.LIGUE_1:
    case TournamentsEnum.BUNDESLIGA:
      return position >= 18;
    case TournamentsEnum.CHAMPIONS_LEAGUE:
    case TournamentsEnum.EUROPA_LEAGUE:
      return position >= 36;
    default:
      return false;
  }
};
