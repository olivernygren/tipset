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
