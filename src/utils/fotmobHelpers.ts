import { Fixture, TeamType } from './Fixture';
import {
  FotMobMatch, FotMobMatchesByDateLeague, FotMobSquad, FotMobTeamsResponse,
} from './Fotmob';
import {
  CountryEnum, ExactPositionEnum, GeneralPositionEnum, Player, PlayerStatusEnum,
} from './Players';
import {
  getStadiumByHomeTeam, nationalTeams, Team, TournamentsEnum,
} from './Team';

enum FotMobPositionKeyEnum {
  GOALKEEPER = 'keeper_long',
  DEFENDER = 'defender_long',
  MIDFIELDER = 'midfielder_long',
  FORWARD = 'attacker_long',
}

enum FotMobSquadPartTitleEnum {
  COACH = 'coach',
  GOALKEEPERS = 'keepers',
  DEFENDERS = 'defenders',
  MIDFIELDERS = 'midfielders',
  FORWARDS = 'attackers',
}

export const convertFotMobSquadToTeamPlayers = (squad: FotMobSquad): Array<Player> => {
  const players: Array<Player> = [];

  squad.forEach((squadPart) => {
    if (squadPart.title === FotMobSquadPartTitleEnum.COACH) {
      return;
    }
    squadPart.members.forEach((member) => {
      players.push({
        id: member.id.toString(),
        name: member.name,
        number: member.shirtNumber,
        position: {
          general: convertFotMobPositionToGeneralPosition(member.role.key as FotMobPositionKeyEnum),
          exact: convertFotMobPositionToExactPosition(member.role.key as FotMobPositionKeyEnum),
        },
        status: PlayerStatusEnum.AVAILABLE,
        country: convertCountryCodeToCountryEnum(member.ccode) as CountryEnum,
        externalPictureUrl: `https://images.fotmob.com/image_resources/playerimages/${member.id}.png`,
      });
    });
  });

  return players;
};

export const convertCountryCodeToCountryEnum = (countryCode: string): string => {
  const matchingNation = nationalTeams.find((nation) => nation.countryCode === countryCode);
  return matchingNation?.name ?? '';
};

export const convertFotMobTeamToTeam = (teamsResponse: FotMobTeamsResponse): Team => {
  const { details, overview, squad } = teamsResponse;

  const convertedTeam: Team = {
    id: details.id.toString(),
    logoUrl: details.sportsTeamJSONLD.logo || `https://images.fotmob.com/image_resources/logo/teamlogo/${details.id}.png`,
    name: details.name,
    shortName: details.shortName,
    stadium: details.sportsTeamJSONLD.location.name,
    country: convertCountryCodeToCountryEnum(details.country),
    countryCode: details.country,
    teamPrimaryColor: overview.teamColors.lightMode,
    players: convertFotMobSquadToTeamPlayers(squad),
  };
  return convertedTeam;
};

export const convertFotMobPositionToGeneralPosition = (positionKey: FotMobPositionKeyEnum): GeneralPositionEnum => {
  switch (positionKey) {
    case FotMobPositionKeyEnum.GOALKEEPER:
      return GeneralPositionEnum.GK;
    case FotMobPositionKeyEnum.DEFENDER:
      return GeneralPositionEnum.DF;
    case FotMobPositionKeyEnum.MIDFIELDER:
      return GeneralPositionEnum.MF;
    case FotMobPositionKeyEnum.FORWARD:
      return GeneralPositionEnum.FW;
    default:
      return GeneralPositionEnum.GK;
  }
};

export const convertFotMobPositionToExactPosition = (positionKey: FotMobPositionKeyEnum): ExactPositionEnum => {
  switch (positionKey) {
    case FotMobPositionKeyEnum.GOALKEEPER:
      return ExactPositionEnum.GK;
    case FotMobPositionKeyEnum.DEFENDER:
      return ExactPositionEnum.CB;
    case FotMobPositionKeyEnum.MIDFIELDER:
      return ExactPositionEnum.CM;
    case FotMobPositionKeyEnum.FORWARD:
      return ExactPositionEnum.ST;
    default:
      return ExactPositionEnum.GK;
  }
};

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
    case TournamentsEnum.CHAMPIONS_LEAGUE:
      return 'https://data.fotmob.com/stats/42/season/24110/goals.json';
    default:
      return '';
  }
};

export const getFotMobMatchesFromSelectedCountries = (leaguesArray: Array<FotMobMatchesByDateLeague>, ccodes: Array<string>): Array<FotMobMatch> => {
  const matches: Array<FotMobMatch> = [];
  leaguesArray.forEach((tournament) => {
    if (ccodes.includes(tournament.ccode)) {
      matches.push(...tournament.matches);
    }
  });
  return matches;
};

export const getFotMobMatchesFromSelectedTournaments = (leaguesArray: Array<FotMobMatchesByDateLeague>, tournaments: Array<number>): Array<FotMobMatch> => {
  const matches: Array<FotMobMatch> = [];
  leaguesArray.forEach((tournament) => {
    if (tournaments.includes(tournament.primaryId)) {
      matches.push(...tournament.matches);
    }
  });
  return matches;
};

export const getTournamentNameByFotMobId = (fotMobId: number): TournamentsEnum => {
  switch (fotMobId) {
    case 55:
      return TournamentsEnum.SERIE_A;
    case 47:
      return TournamentsEnum.PREMIER_LEAGUE;
    case 54:
      return TournamentsEnum.BUNDESLIGA;
    case 53:
      return TournamentsEnum.LIGUE_1;
    case 87:
      return TournamentsEnum.LA_LIGA;
    case 42:
      return TournamentsEnum.CHAMPIONS_LEAGUE;
    case 67:
      return TournamentsEnum.ALLSVENSKAN;
    default:
      return TournamentsEnum.SERIE_A;
  }
};

export const convertFotMobMatchToFixture = (fotMobMatch: FotMobMatch, allExistingFixtureIds: Array<string>): Fixture | null => {
  if (allExistingFixtureIds.includes(fotMobMatch.id.toString())) {
    return null;
  }

  const homeTeam: Team = {
    id: fotMobMatch.home.id.toString(),
    name: fotMobMatch.home.longName,
    shortName: fotMobMatch.home.name,
    logoUrl: `https://images.fotmob.com/image_resources/logo/teamlogo/${fotMobMatch.home.id}.png`,
  };
  const awayTeam: Team = {
    id: fotMobMatch.away.id.toString(),
    name: fotMobMatch.away.longName,
    shortName: fotMobMatch.away.name,
    logoUrl: `https://images.fotmob.com/image_resources/logo/teamlogo/${fotMobMatch.away.id}.png`,
  };
  return {
    id: fotMobMatch.id.toString(),
    homeTeam,
    awayTeam,
    kickOffTime: fotMobMatch.status.utcTime,
    stadium: getStadiumByHomeTeam(homeTeam.name, homeTeam.shortName!, homeTeam.id!),
    teamType: TeamType.CLUBS,
    tournament: getTournamentNameByFotMobId(fotMobMatch.leagueId),
    includeStats: true,
    shouldPredictGoalScorer: false,
  };
};
