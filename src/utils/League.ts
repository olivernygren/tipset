import { Fixture, Prediction } from "./Fixture";

export const leagueMaximumParticipants = 20;

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
}

export interface PredictionLeagueStanding {
  userId: string;
  username: string;
  points: number;
  correctResults: number;
}

export interface LeagueGameWeekFixtures {
  fixtures: Array<Fixture>;
  predictions: Array<Prediction>;
}

export interface LeagueGameWeek {
  leagueId: string;
  round: number;
  deadline: Date;
  startDate: Date;
  games: LeagueGameWeekFixtures;
  hasBeenCorrected?: boolean;
  hasEnded?: boolean;
}
export interface LeagueGameWeekInput {
  leagueId: string;
  round: number;
  deadline: string;
  startDate: string;
  games: LeagueGameWeekFixtures;
  hasBeenCorrected?: boolean;
  hasEnded?: boolean;
}