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

export const getFotMobGoalStatsUrl = (tournament: TournamentsEnum) => {
  switch (tournament) {
    case TournamentsEnum.SERIE_A:
      return 'https://data.fotmob.com/stats/55/season/23819/goals.json';
    case TournamentsEnum.PREMIER_LEAGUE:
      return 'https://data.fotmob.com/stats/47/season/23685/goals.json';
    case TournamentsEnum.BUNDESLIGA:
      return 'https://data.fotmob.com/stats/54/season/23794/goals.json';
    case TournamentsEnum.LIGUE_1:
      return 'https://data.fotmob.com/stats/53/season/23724/goals.json';
    case TournamentsEnum.LA_LIGA:
      return 'https://data.fotmob.com/stats/87/season/23686/goals.json';
    // case TournamentsEnum.CHAMPIONS_LEAGUE:
    //   return 'https://data.fotmob.com/stats/2/season/23723/goals.json';
    default:
      return '';
  }
};

export const fotMobTournamentGoalStatsUrls = {
  [TournamentsEnum.SERIE_A]: 'https://data.fotmob.com/stats/55/season/23819/goals.json',
  [TournamentsEnum.PREMIER_LEAGUE]: 'https://data.fotmob.com/stats/47/season/23685/goals.json',
  [TournamentsEnum.BUNDESLIGA]: 'https://data.fotmob.com/stats/54/season/23794/goals.json',
  [TournamentsEnum.LIGUE_1]: 'https://data.fotmob.com/stats/53/season/23724/goals.json',
  [TournamentsEnum.LA_LIGA]: 'https://data.fotmob.com/stats/87/season/23686/goals.json',
  // [TournamentsEnum.CHAMPIONS_LEAGUE]: 'https://data.fotmob.com/stats/2/season/23723/goals.json',
};
