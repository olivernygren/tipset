import { Fixture, Prediction } from "./Fixture";

export const leagueMaximalParticipants = 25;

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
  position: number;
  correctResults: number;
}

export interface LeagueGameWeek {
  id: string;
  round: number;
  deadline: Date;
  games: Array<Fixture>;
  predictions: Array<Prediction>;
}