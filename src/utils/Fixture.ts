import { Player } from './Players';
import { Team } from './Team';

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

export enum TeamType {
  CLUBS = 'clubs',
  NATIONS = 'nations',
}

export interface FixtureResult {
  homeTeamGoals: number;
  awayTeamGoals: number;
  goalScorers?: Array<string>;
}

export interface Fixture {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  stadium: string;
  tournament: string;
  homeTeamForm?: Array<FixtureOutcomeEnum>;
  awayTeamForm?: Array<FixtureOutcomeEnum>;
  kickOffTime: string;
  finalResult?: FixtureResult;
  shouldPredictGoalScorer?: boolean;
  goalScorerFromTeam?: Array<string> | null; // team names
  teamType: TeamType;
  previewStats?: FixturePreviewStats;
  includeStats?: boolean;
  fixtureNickname?: string;
  odds?: FixtureOdds;
}

export interface FixtureInput {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  stadium: string;
  tournament: string;
  kickOffTime: string;
  finalResult?: FixtureResult;
  shouldPredictGoalScorer?: boolean;
  goalScorerFromTeam?: Array<string> | null; // team names
  teamType: TeamType;
  includeStats?: boolean;
  fixtureNickname?: string;
}

export interface PredictionPoints {
  correctResult: number;
  correctOutcome: number;
  correctGoalScorer: number;
  correctGoalDifference: number;
  correctGoalsByHomeTeam: number;
  correctGoalsByAwayTeam: number;
  oddsBonus: number;
  total: number;
}

export interface Prediction {
  userId: string;
  username?: string;
  fixtureId: string;
  homeGoals: number;
  awayGoals: number;
  outcome: PredictionOutcomeEnum;
  points?: PredictionPoints;
  goalScorer?: Player;
}

export interface PredictionInput {
  userId: string;
  username?: string;
  fixtureId: string;
  homeGoals: number;
  awayGoals: number;
  outcome: PredictionOutcomeEnum;
  points?: PredictionPoints;
  goalScorer?: Player;
}

export enum PredictionStatus {
  NOT_PREDICTED = 'NOT_PREDICTED',
  UPDATED = 'UPDATED',
  PREDICTED = 'PREDICTED',
}

export interface TeamFixturePreviewStats {
  standingsPosition?: string;
  standingsPoints?: string;
  form: Array<FixtureOutcomeEnum>;
  lastFixture?: {
    outcome: FixtureOutcomeEnum;
    result: FixtureResult;
    opponent: string;
  };
  insights?: Array<string>;
}

export interface FixturePreviewStats {
  homeTeam: TeamFixturePreviewStats;
  awayTeam: TeamFixturePreviewStats;
  analysis?: string;
  lastUpdated: string;
}

export interface FixtureOdds {
  homeWin: string;
  draw: string;
  awayWin: string;
}
