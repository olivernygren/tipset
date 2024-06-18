import { Player } from "./Players";
import { Team } from "./Team";

export enum TeamMatchOutcomeEnum {
  WIN = 'V',
  DRAW = 'O',
  LOSS = 'F',
  NONE = '-',
}

export enum OutcomeEnum {
  HOME_TEAM_WIN = '1',
  DRAW = 'X',
  AWAY_TEAM_WIN = '2',
}

export interface GameResult {
  homeTeamGoals: number;
  awayTeamGoals: number;
}

export interface Game {
  homeTeam: Team;
  awayTeam: Team;
  stadium: string;
  tournament: string;
  homeTeamForm: Array<TeamMatchOutcomeEnum>;
  awayTeamForm: Array<TeamMatchOutcomeEnum>;
  kickOffTime: Date;
  finalResult?: GameResult;
  shouldPredictGoalScorer?: boolean;
}

export interface Prediction {
  userId: string;
  game: Game;
  homeGoals: number;
  awayGoals: number;
  points?: number;
  goalScorer?: Player;
}