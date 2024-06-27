import { Player } from "./Players";
import { Team } from "./Team";

export enum FixtureOutcomeEnum {
  WIN = 'V',
  DRAW = 'O',
  LOSS = 'F',
  NONE = '-',
}

export enum PredictionOutcomeEnum {
  HOME_TEAM_WIN = '1',
  DRAW = 'X',
  AWAY_TEAM_WIN = '2',
}

export interface FixtureResult {
  homeTeamGoals: number;
  awayTeamGoals: number;
}

export interface Fixture {
  homeTeam: Team;
  awayTeam: Team;
  stadium: string;
  tournament: string;
  homeTeamForm: Array<FixtureOutcomeEnum>;
  awayTeamForm: Array<FixtureOutcomeEnum>;
  kickOffTime: Date;
  finalResult?: FixtureResult;
  shouldPredictGoalScorer?: boolean;
}

export interface Prediction {
  userId: string;
  fixture: Fixture;
  homeGoals: number;
  awayGoals: number;
  points?: number;
  goalScorer?: Player;
}