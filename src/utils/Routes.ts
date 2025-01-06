export enum RoutesEnum {
  TEST = 'test',
  LOGIN = 'login',
  LEAGUES = 'leagues',
  LEAGUE = 'leagues/:leagueId',
  RULES = 'rules',
  HOW_TO_PLAY = 'how-to-play',
  PROFILE = 'profile',

  ADMIN = 'admin',
  ADMIN_LEAGUES = 'admin/leagues',
  ADMIN_USERS = 'admin/users',
  ADMIN_PLAYER_RATINGS = 'admin/player-ratings',
  ADMIN_PLAYERS = 'admin/players',
  ADMIN_PLAYERS_TEAM = 'admin/players/:teamId',
}

export enum QueryEnum {
  ADMIN = 'admin',
  LEAGUES = 'leagues',
  USERS = 'users',
  PLAYERS = 'players',
}
