import { Fixture, Prediction } from './Fixture';

export const leagueMaximumParticipants = 24;

export interface PredictionLeague {
  documentId: string;
  name: string;
  description: string;
  participants: Array<string>;
  createdAt: string;
  creatorId: string;
  inviteCode: string;
  invitedUsers: Array<string>;
  standings: Array<PredictionLeagueStanding>;
  deadlineToJoin: Date;
  gameWeeks?: Array<LeagueGameWeek>;
  hasEnded?: boolean;
}

export interface CreatePredictionLeagueInput {
  name: string;
  description: string;
  participants: Array<string>;
  createdAt: string;
  creatorId: string;
  inviteCode: string;
  invitedUsers: Array<string>;
  standings: Array<PredictionLeagueStanding>;
  deadlineToJoin: string;
  hasEnded: boolean;
}

export enum LeagueTabs {
  OVERVIEW = 'OVERVIEW',
  MATCHES = 'MATCHES',
  PARTICIPANTS = 'PARTICIPANTS',
  EDIT = 'EDIT',
}

export interface PredictionLeagueStanding {
  userId: string;
  username: string;
  points: number;
  correctResults: number;
  awardedPointsForFixtures?: Array<string>;
  oddsBonusPoints?: number;
}

export interface LeagueGameWeekFixtures {
  fixtures: Array<Fixture>;
  predictions: Array<Prediction>;
}

export interface LeagueGameWeek {
  leagueId: string;
  round: number;
  startDate: Date;
  games: LeagueGameWeekFixtures;
  hasBeenCorrected?: boolean;
  hasEnded?: boolean;
}
export interface LeagueGameWeekInput {
  leagueId: string;
  round: number;
  startDate: string;
  games: LeagueGameWeekFixtures;
  hasBeenCorrected?: boolean;
  hasEnded?: boolean;
}
