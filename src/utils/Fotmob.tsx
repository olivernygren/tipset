import { TournamentsEnum } from './Team';

export type FotMobSquad = Array<FotMobSquadPart>;

export interface FotMobSquadPart {
  title: string;
  members: Array<FotMobSquadMember>
}

export interface FotMobSquadMember {
  id: number;
  name: string;
  shirtNumber: number;
  ccode: string;
  cname: string;
  role: FotMobMemberRole;
  positionId: number;
  rating: number;
  goals: number;
  penalties: number;
  assists: number;
  rcards: number;
  ycards: number;
  excludeFromRanking: boolean;
}

export interface FotMobMemberRole {
  key: string;
  fallback: string;
}

export interface FotMobTeamsResponse {
  QAData: Array<any>;
  allAvailableSeasons: Array<any>;
  details: FotMobTeamsResponseDetails;
  overview: FotMobTeamsResponseOverview;
  squad: FotMobSquad;
  table: Array<FotMobTableResult>;
}

export interface FotMobTeamsResponseOverview {
  teamColors: FotMobTeamColors
}

export interface FotMobTeamColors {
  darkMode: string;
  lightMode: string;
}

export interface FotMobTeamsResponseDetails {
  id: number;
  name: string; // Team name
  shortName: string; // Team short name
  country: string; // Country code
  type: string;
  sportsTeamJSONLD: {
    athlete: Array<any>;
    gender: string;
    location: {
      name: string; // Stadium name
    };
    logo: string; // Team logo
    url: string; // Url to FotMob team page
  };
}

export interface FotMobTableResult {
  data: FotMobTableData;
}

export interface FotMobTableData {
  ccode: string;
  composite: boolean;
  leagueId: number;
  leagueName: string;
  legend: Array<any>;
  ongoing: Array<any>;
  pageUrl: string;
  table: FotMobTableVariants;
  tableFilterTypes: Array<FotMobTableFilterType>;
}

enum FotMobTableFilterType {
  ALL = 'all',
  HOME = 'home',
  AWAY = 'away',
  FORM = 'form',
  XG = 'xg',
}

export interface FotMobTableVariants {
  all: FotMobTable;
  home: FotMobTable;
  away: FotMobTable;
  form: FotMobTable;
  xg: FotMobTable;
}

export type FotMobTable = Array<FotMobTableTeam>;

export interface FotMobTableTeam {
  deduction: number | null;
  draws: number;
  featuredInMatch: boolean;
  goalConDiff: number; // Goal difference
  id: number;
  idx: number; // Position in table
  losses: number;
  name: string; // Team name
  ongoing: any;
  pageUrl: string;
  played: number;
  pts: number; // Points
  qualColor: string;
  scoreStr: string;
  shortName: string;
  wins: number;
}

export interface FotMobStatListItem {
  ParticipantName: string;
  ParticipantId: number;
  TeamId: number;
  TeamColor: string;
  StatValue: number; // number of goals/assists etc
  SubStatValue: number;
  MinutesPlayed: number;
  MatchesPlayed: number;
  StatValueCount: number;
  Rank: number;
  ParticipantCountryCode: string;
  TeamName: string;
}

export const fotMobTournamentGoalStatsUrls = {
  [TournamentsEnum.SERIE_A]: 'https://data.fotmob.com/stats/55/season/23819/goals.json',
  [TournamentsEnum.PREMIER_LEAGUE]: 'https://data.fotmob.com/stats/47/season/23685/goals.json',
  [TournamentsEnum.BUNDESLIGA]: 'https://data.fotmob.com/stats/54/season/23794/goals.json',
  [TournamentsEnum.LIGUE_1]: 'https://data.fotmob.com/stats/53/season/23724/goals.json',
  [TournamentsEnum.LA_LIGA]: 'https://data.fotmob.com/stats/87/season/23686/goals.json',
  [TournamentsEnum.CHAMPIONS_LEAGUE]: 'https://data.fotmob.com/stats/42/season/24110/goals.json',
};

export interface FotMobMatchesByDateResult {
  leagues: Array<FotMobMatchesByDateLeague>;
}

export interface FotMobMatchesByDateLeague {
  ccode: string;
  id: number;
  internalRank: number;
  liveRank: number;
  localRank: number;
  matches: Array<FotMobMatch>;
  name: string;
  parentLeagueId: number;
  primaryId: number;
  simpleLeague: boolean;
}

export interface FotMobMatch {
  away: FotMobMatchTeam;
  eliminatedTeamId: number | null;
  home: FotMobMatchTeam;
  id: number;
  leagueId: number;
  status: FotMobMatchStatus;
  statusId: number;
  time: string;
  timeTS: number;
  tournamentStage: string;
}

export interface FotMobMatchTeam {
  id: number;
  name: string;
  longName: string;
  score: number;
}

export interface FotMobMatchStatus {
  aggregatedStr?: string;
  cancelled: boolean;
  finished: boolean;
  started: boolean;
  utcTime: string;
}
