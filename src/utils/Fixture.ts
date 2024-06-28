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
  goalScorers?: Array<string>;
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
  goalScorerFromTeam?: Array<string> | null; // team names
}

export interface FixtureInput {
  homeTeam: Team;
  awayTeam: Team;
  stadium: string;
  tournament: string;
  homeTeamForm: Array<FixtureOutcomeEnum>;
  awayTeamForm: Array<FixtureOutcomeEnum>;
  kickOffTime: string;
  finalResult?: FixtureResult;
  shouldPredictGoalScorer?: boolean;
  goalScorerFromTeam?: Array<string> | null; // team names
}

export interface PredictionPoints {
  correctResult: number;
  correctOutcome: number;
  correctGoalScorer: number;
  correctGoalDifference: number;
  correctGoalsByHomeTeam: number;
  correctGoalsByAwayTeam: number;
  total: number;
}

export interface Prediction {
  userId: string;
  // fixture: Fixture;
  homeGoals: number;
  awayGoals: number;
  outcome: PredictionOutcomeEnum;
  points?: PredictionPoints;
  goalScorer?: Player;
}