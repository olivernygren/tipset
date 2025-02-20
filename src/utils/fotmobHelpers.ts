import { generateRandomID } from './firebaseHelpers';
import { Fixture, TeamType } from './Fixture';
import {
  FotMobMatch, FotMobMatchesByDateLeague, FotMobMatchTeam, FotMobSquad, FotMobTeamsResponse,
} from './Fotmob';
import { getFixtureNickname, isPredictGoalScorerPossibleByTeamNames } from './helpers';
import {
  CountryEnum, ExactPositionEnum, GeneralPositionEnum, Player, PlayerStatusEnum,
} from './Players';
import {
  getAllTeams,
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
    case TournamentsEnum.ALLSVENSKAN:
      return 'https://data.fotmob.com/stats/67/season/22583/goals.json';
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

export const getFotMobMatchesFromTournamentsAndTeams = (
  leaguesArray: Array<FotMobMatchesByDateLeague>,
  tournaments: Array<number>,
  teamIds: Array<number>,
): Array<FotMobMatch> => {
  const specialFixturesToInclude = [
    { team1: 'Ajax', team2: 'Feyenoord' },
    { team1: 'Benfica', team2: 'Porto' },
    { team1: 'Benfica', team2: 'Sporting CP' },
    { team1: 'Celtic', team2: 'Rangers' },
    { team1: 'Galatasaray', team2: 'Fenerbahce' },
    { team1: 'Hamburger SV', team2: 'St. Pauli' },
    { team1: 'Boca Juniors', team2: 'River Plate' },
    { team1: 'Olympiacos', team2: 'Panathinaikos' },
    { team1: 'Partizan Beograd', team2: 'Crvena Zvezda' },
    { team1: 'Rapid Wien', team2: 'Austria Wien' },
    { team1: 'Dinamo Zagreb', team2: 'Hajduk Split' },
    { team1: 'Sparta Praha', team2: 'Slavia Praha' },
    { team1: 'FC København', team2: 'Brøndby' },
  ];

  const matchesSet = new Set<FotMobMatch>();
  const isMatchInFuture = (match: FotMobMatch) => new Date(match.status.utcTime) > new Date();

  leaguesArray.forEach((league) => {
    league.matches.forEach((match) => {
      if (isMatchInFuture(match) && (tournaments.includes(league.primaryId) || teamIds.includes(match.home.id) || teamIds.includes(match.away.id))) {
        const matchWithLeagueId = { ...match, leagueId: league.parentLeagueId || league.primaryId };
        matchesSet.add(matchWithLeagueId);
      }
      specialFixturesToInclude.forEach((specialFixture) => {
        if (
          (match.home.name === specialFixture.team1 && match.away.name === specialFixture.team2)
          || (match.home.name === specialFixture.team2 && match.away.name === specialFixture.team1)
        ) {
          const matchWithLeagueId = { ...match, leagueId: league.parentLeagueId || league.primaryId };
          matchesSet.add(matchWithLeagueId);
        }
      });
    });
  });

  return Array.from(matchesSet);
};

export const getTournamentNameByFotMobId = (fotMobId: number): TournamentsEnum => {
  switch (fotMobId) {
    case 55:
      return TournamentsEnum.SERIE_A;
    case 141:
    case 893240:
      return TournamentsEnum.COPPA_ITALIA;
    case 222:
      return TournamentsEnum.SUPERCOPPA_ITALIANA;
    case 47:
      return TournamentsEnum.PREMIER_LEAGUE;
    case 48:
      return TournamentsEnum.PREMIER_LEAGUE;
    case 132:
    case 894955:
      return TournamentsEnum.FA_CUP;
    case 133:
      return TournamentsEnum.CARABAO_CUP;
    case 54:
      return TournamentsEnum.BUNDESLIGA;
    case 146:
      return TournamentsEnum.BUNDESLIGA_2;
    case 209:
    case 892581:
      return TournamentsEnum.DFB_POKAL;
    case 53:
      return TournamentsEnum.LIGUE_1;
    case 134:
      return TournamentsEnum.COUPE_DE_FRANCE;
    case 87:
      return TournamentsEnum.LA_LIGA;
    case 138:
      return TournamentsEnum.COPA_DEL_REY;
    case 139:
      return TournamentsEnum.SUPERCOPA;
    case 42:
    case 897488:
      return TournamentsEnum.CHAMPIONS_LEAGUE;
    case 74:
      return TournamentsEnum.UEFA_SUPER_CUP;
    case 73:
      return TournamentsEnum.EUROPA_LEAGUE;
    case 10216:
      return TournamentsEnum.CONFERENCE_LEAGUE;
    case 67:
      return TournamentsEnum.ALLSVENSKAN;
    case 171:
      return TournamentsEnum.SVENSKA_CUPEN;
    case 61:
      return TournamentsEnum.PRIMEIRA_LIGA;
    case 57:
      return TournamentsEnum.EREDIVISIE;
    case 50:
      return TournamentsEnum.EUROS;
    case 77:
      return TournamentsEnum.WORLD_CUP;
    case 9806:
    case 9807:
    case 9808:
    case 9809:
      return TournamentsEnum.NATIONS_LEAGUE;
    case 114:
    case 896100:
    case 489:
      return TournamentsEnum.FRIENDLIES;
    default:
      return TournamentsEnum.PLACEHOLDER;
  }
};

export const getFotMobFixtureAggregateScore = (match: FotMobMatch) => {
  if (match.status.aggregatedStr) {
    const splitResult = match.status.aggregatedStr.split('-');
    const homeGoals = parseInt(splitResult[0], 10);
    const awayGoals = parseInt(splitResult[1], 10);
    return { homeGoals, awayGoals };
  }
  return null;
};

export const matchFotMobTeamWithRealTeam = (fotMobTeam: FotMobMatchTeam): Team | null => {
  const allRealTeams = getAllTeams();

  const matchingTeam = allRealTeams.find((realTeam) => (realTeam.id !== undefined && realTeam.id === fotMobTeam.id.toString()) || realTeam.fotMobName === fotMobTeam.longName || realTeam.fotMobName === fotMobTeam.name || realTeam.name === fotMobTeam.longName || realTeam.name === fotMobTeam.name || realTeam.shortName === fotMobTeam.name || realTeam.shortName === fotMobTeam.longName || realTeam.name.includes(fotMobTeam.name));

  if (!matchingTeam) {
    return null;
  }

  const {
    id, name, shortName, logoUrl, stadium,
  } = matchingTeam;

  return {
    id: id || fotMobTeam.id.toString(),
    name,
    logoUrl,
    ...(stadium && { stadium }),
    ...(shortName && { shortName }),
  };
};

export const convertFotMobMatchToFixture = (fotMobMatch: FotMobMatch, allExistingFixtureIds: Array<string>): Fixture | null => {
  if (allExistingFixtureIds.includes(fotMobMatch.id.toString())) {
    return null;
  }

  const homeTeam: Team = matchFotMobTeamWithRealTeam(fotMobMatch.home) || {
    id: fotMobMatch.home.id.toString(),
    name: fotMobMatch.home.longName,
    shortName: fotMobMatch.home.name,
    logoUrl: `https://images.fotmob.com/image_resources/logo/teamlogo/${fotMobMatch.home.id}.png`,
  };

  const awayTeam: Team = matchFotMobTeamWithRealTeam(fotMobMatch.away) || {
    id: fotMobMatch.away.id.toString(),
    name: fotMobMatch.away.longName,
    shortName: fotMobMatch.away.name,
    logoUrl: `https://images.fotmob.com/image_resources/logo/teamlogo/${fotMobMatch.away.id}.png`,
  };

  const fixtureNickname = getFixtureNickname([homeTeam, awayTeam]);

  const fixtureAggregateScore = getFotMobFixtureAggregateScore(fotMobMatch);

  return {
    id: fotMobMatch.id.toString(),
    centralFixtureReferenceId: generateRandomID(),
    homeTeam,
    awayTeam,
    kickOffTime: fotMobMatch.status.utcTime,
    stadium: homeTeam.stadium || getStadiumByHomeTeam(homeTeam.name, homeTeam.shortName!, homeTeam.id!),
    teamType: TeamType.CLUBS,
    tournament: getTournamentNameByFotMobId(fotMobMatch.leagueId),
    includeStats: true,
    shouldPredictGoalScorer: isPredictGoalScorerPossibleByTeamNames([homeTeam.name, awayTeam.name]),
    ...(fixtureNickname && { fixtureNickname }),
    ...(fixtureAggregateScore && { aggregateScore: { homeTeamGoals: fixtureAggregateScore.homeGoals, awayTeamGoals: fixtureAggregateScore.awayGoals } }),
  };
};
