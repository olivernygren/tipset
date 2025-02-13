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
  ALL = 'all',
}

export interface FixtureResult {
  homeTeamGoals: number;
  awayTeamGoals: number;
  goalScorers?: Array<string>;
  firstTeamToScore?: FirstTeamToScore;
}

export interface Fixture {
  id: string;
  centralFixtureReferenceId?: string;
  homeTeam: Team;
  awayTeam: Team;
  stadium: string;
  tournament: string;
  homeTeamForm?: Array<FixtureOutcomeEnum>;
  awayTeamForm?: Array<FixtureOutcomeEnum>;
  kickOffTime: string;
  finalResult?: FixtureResult;
  shouldPredictGoalScorer?: boolean;
  shouldPredictFirstTeamToScore?: boolean;
  goalScorerFromTeam?: Array<string> | null;
  teamType: TeamType;
  previewStats?: FixturePreviewStats;
  includeStats?: boolean;
  fixtureNickname?: string;
  odds?: FixtureOdds;
  aggregateScore?: FixtureResult;
}

export enum FirstTeamToScore {
  HOME_TEAM = 'homeTeam',
  AWAY_TEAM = 'awayTeam',
  NONE = 'none',
}

// Hur blir det med NONE (0-0) ?

export interface FixtureInput {
  id: string;
  centralFixtureReferenceId?: string;
  homeTeam: Team;
  awayTeam: Team;
  stadium: string;
  tournament: string;
  kickOffTime: string;
  finalResult?: FixtureResult;
  shouldPredictGoalScorer?: boolean;
  shouldPredictFirstTeamToScore?: boolean;
  goalScorerFromTeam?: Array<string> | null; // team names
  teamType: TeamType;
  includeStats?: boolean;
  fixtureNickname?: string;
  aggregateScore?: FixtureResult;
}

export interface PredictionPoints {
  correctResultBool?: boolean;
  correctResult: number;
  correctOutcome: number;
  correctGoalScorer: number;
  correctGoalDifference: number;
  correctGoalsByHomeTeam: number;
  correctGoalsByAwayTeam: number;
  firstTeamToScore: number;
  underdogBonus: number;
  goalFest: number;
  oddsBonus: number;
  total: number;
}

export interface Prediction {
  userId: string;
  username?: string;
  userProfilePictureUrl?: string;
  fixtureId: string;
  homeGoals: number;
  awayGoals: number;
  outcome: PredictionOutcomeEnum;
  points?: PredictionPoints;
  goalScorer?: Player;
  firstTeamToScore?: FirstTeamToScore;
}

export interface PredictionInput {
  userId: string;
  username?: string;
  userProfilePictureUrl?: string;
  fixtureId: string;
  homeGoals: number;
  awayGoals: number;
  outcome: PredictionOutcomeEnum;
  points?: PredictionPoints;
  goalScorer?: Player;
  firstTeamToScore?: FirstTeamToScore;
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

export interface FixturesCollectionResponse {
  documentId: string;
  fixtures: Array<Fixture>;
}

export interface FixtureGroup {
  tournament: string;
  fixtures: Array<Fixture>;
}
