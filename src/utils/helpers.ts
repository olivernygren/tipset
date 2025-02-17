import { QueryDocumentSnapshot, DocumentData, DocumentSnapshot } from 'firebase/firestore';
import {
  Fixture, FixtureGroup, PredictionOutcomeEnum, PredictionStatus,
} from './Fixture';
import { LeagueGameWeek, LeagueScoringSystemValues } from './League';
import { ProfilePictureEnum } from '../components/avatar/Avatar';
import {
  ExactPositionEnum, GeneralPositionEnum, Player, PlayerStatusEnum,
} from './Players';
import { Team, TournamentsEnum } from './Team';
import { theme } from '../theme';
import { FotMobMatch } from './Fotmob';

export const defenderGoalPoints = 5;
export const midfielderGoalPoints = 3;
export const forwardGoalPoints = 2;

export const withDocumentIdOnObjectsInArray = <T>(docs: QueryDocumentSnapshot<DocumentData>[]): T[] => docs.map((doc) => ({
  ...(doc.data() as T),
  documentId: doc.id,
}));

export const withDocumentIdOnObject = <T>(docSnap: DocumentSnapshot): T & { documentId: string } => ({
  ...(docSnap.data() as T),
  documentId: docSnap.id,
});

export const generateLeagueInviteCode = (): string => Math.random().toString(20).substring(2, 8).toUpperCase();

export const hasInvalidTeamName = (teamName: string): boolean => {
  if (teamName === 'Välj lag' || teamName === '') {
    return true;
  }
  return false;
};

export const getPredictionStatus = (currentGameWeek: LeagueGameWeek, userId: string, fixtureId: string): PredictionStatus => {
  if (currentGameWeek.games.predictions.some((prediction) => prediction.userId === userId && prediction.fixtureId === fixtureId)) {
    return PredictionStatus.PREDICTED;
  }
  return PredictionStatus.NOT_PREDICTED;
};

export const getPredictionOutcome = (homeGoals: number, awayGoals: number): PredictionOutcomeEnum => {
  if (homeGoals > awayGoals) {
    return PredictionOutcomeEnum.HOME_TEAM_WIN;
  } if (homeGoals < awayGoals) {
    return PredictionOutcomeEnum.AWAY_TEAM_WIN;
  }
  return PredictionOutcomeEnum.DRAW;
};

export const getHomeTeamPredictedGoals = (gameWeek: LeagueGameWeek, fixtureId: string, userId: string): number | undefined => {
  const prediction = gameWeek.games.predictions.find((prediction) => prediction.userId === userId && prediction.fixtureId === fixtureId);
  return prediction ? prediction.homeGoals : undefined;
};

export const getAwayTeamPredictedGoals = (gameWeek: LeagueGameWeek, fixtureId: string, userId: string): number | undefined => {
  const prediction = gameWeek.games.predictions.find((prediction) => prediction.userId === userId && prediction.fixtureId === fixtureId);
  return prediction ? prediction.awayGoals : undefined;
};

export const getGeneralPositionShorthand = (position: string) => {
  switch (position) {
    case 'Forward':
      return 'ANF';
    case 'Midfielder':
      return 'MF';
    case 'Defender':
      return 'FÖR';
    case 'Goalkeeper':
      return 'MV';
    default:
      return '?';
  }
};

export const getProfilePictureUrl = (picture: ProfilePictureEnum) => {
  switch (picture) {
    case ProfilePictureEnum.GRANNEN:
      return '/images/grannen.png';
    case ProfilePictureEnum.CARL_GUSTAF:
      return '/images/carl-gustaf.png';
    case ProfilePictureEnum.DONKEY:
      return '/images/donkey.png';
    case ProfilePictureEnum.ZLATAN:
      return '/images/zlatan.png';
    case ProfilePictureEnum.ANIMAL:
      return '/images/animal.png';
    case ProfilePictureEnum.SHREK:
      return '/images/shrek.png';
    case ProfilePictureEnum.ANTONY:
      return '/images/antony.png';
    case ProfilePictureEnum.FELLAINI:
      return '/images/fellaini.png';
    default:
      return '/images/generic.png';
  }
};

export const getUserPreviousGameWeekPrecitedGoalScorers = (previousGameWeek: LeagueGameWeek | undefined, userId: string): Array<Player> => {
  if (!previousGameWeek) {
    return [];
  }

  const allPreviousGameWeekPredictedGoalScorers = previousGameWeek.games.predictions.filter((prediction) => prediction.userId === userId && prediction.goalScorer);
  const allPredictedGoalScorers = allPreviousGameWeekPredictedGoalScorers.map((prediction) => prediction.goalScorer);

  return allPredictedGoalScorers.filter((goalScorer) => goalScorer !== undefined) as Array<Player>;
};

export const getLastGameWeek = (previousGameWeeks: Array<LeagueGameWeek> | undefined): LeagueGameWeek | undefined => {
  if (!previousGameWeeks || previousGameWeeks.length === 0) {
    return undefined;
  }

  const sortedGameWeeks = previousGameWeeks.sort((a, b) => a.round - b.round);

  return sortedGameWeeks[sortedGameWeeks.length - 1];
};

export const getIsBottomOfLeague = (position: number, tournament: TournamentsEnum): boolean => {
  switch (tournament) {
    case TournamentsEnum.ALLSVENSKAN:
      return position >= 16;
    case TournamentsEnum.SERIE_A:
    case TournamentsEnum.LA_LIGA:
    case TournamentsEnum.PREMIER_LEAGUE:
      return position >= 20;
    case TournamentsEnum.LIGUE_1:
    case TournamentsEnum.BUNDESLIGA:
      return position >= 18;
    case TournamentsEnum.CHAMPIONS_LEAGUE:
    case TournamentsEnum.EUROPA_LEAGUE:
      return position >= 36;
    case TournamentsEnum.SVENSKA_CUPEN:
      return position >= 4;
    default:
      return false;
  }
};

export const getPlayerPositionColor = (position: GeneralPositionEnum) => {
  switch (position) {
    case GeneralPositionEnum.FW:
      return theme.colors.blue;
    case GeneralPositionEnum.MF:
      return theme.colors.primary;
    case GeneralPositionEnum.DF:
      return theme.colors.red;
    default:
      return theme.colors.gold;
  }
};

export const getExactPositionOptions = (generalPosition: GeneralPositionEnum) => {
  switch (generalPosition) {
    case GeneralPositionEnum.GK:
      return Object.values(ExactPositionEnum).filter((position) => position === ExactPositionEnum.GK);
    case GeneralPositionEnum.DF:
      return Object.values(ExactPositionEnum).filter((position) => position === ExactPositionEnum.CB || position === ExactPositionEnum.LB || position === ExactPositionEnum.RB);
    case GeneralPositionEnum.MF:
      return Object.values(ExactPositionEnum).filter((position) => position === ExactPositionEnum.CM || position === ExactPositionEnum.DM || position === ExactPositionEnum.AM || position === ExactPositionEnum.LM || position === ExactPositionEnum.RM);
    case GeneralPositionEnum.FW:
      return Object.values(ExactPositionEnum).filter((position) => position === ExactPositionEnum.ST || position === ExactPositionEnum.LW || position === ExactPositionEnum.RW);
    default:
      return Object.values(ExactPositionEnum);
  }
};

export const createRandomPlayerId = (): string => Math.random().toString(36).substring(2, 8).toUpperCase();

export const getSortedPlayerByPosition = (players: Array<Player>): Array<Player> => {
  if (!players) {
    return [];
  }

  const goalKeepers = players.filter((player) => player.position.general === GeneralPositionEnum.GK);

  const defenders = players.filter((player) => player.position.general === GeneralPositionEnum.DF);
  const midfielders = players.filter((player) => player.position.general === GeneralPositionEnum.MF);
  const forwards = players.filter((player) => player.position.general === GeneralPositionEnum.FW);

  const defenderOrder = ['RB', 'CB', 'LB'];
  const midfielderOrder = ['DM', 'CM', 'RM', 'AM', 'LM'];
  const forwardOrder = ['RW', 'ST', 'LW'];

  const sortByExactPosition = (players: Array<Player>, order: Array<string>): Array<Player> => players.sort((a, b) => {
    const positionComparison = order.indexOf(a.position.exact) - order.indexOf(b.position.exact);
    if (positionComparison !== 0) {
      return positionComparison;
    }
    if (a.number !== undefined && b.number !== undefined) {
      return a.number - b.number;
    }
    return 0;
  });

  const sortedDefenders = sortByExactPosition(defenders, defenderOrder);
  const sortedMidfielders = sortByExactPosition(midfielders, midfielderOrder);
  const sortedForwards = sortByExactPosition(forwards, forwardOrder);

  return [...goalKeepers, ...sortedDefenders, ...sortedMidfielders, ...sortedForwards];
};

export const getPlayerStatusName = (status: PlayerStatusEnum) => {
  switch (status) {
    case PlayerStatusEnum.AVAILABLE:
      return 'Tillgänglig';
    case PlayerStatusEnum.INJURED:
      return 'Skadad';
    case PlayerStatusEnum.SUSPENDED:
      return 'Avstängd';
    case PlayerStatusEnum.MAY_BE_INJURED:
      return 'Möjligtvis skadad';
    case PlayerStatusEnum.ILL:
      return 'Sjuk';
    case PlayerStatusEnum.UNKNOWN:
      return 'Okänd';
    case PlayerStatusEnum.PERSONAL_ISSUES:
      return 'Personliga skäl';
    default:
      return '';
  }
};

export const getLastKickoffTimeInAllGameWeeks = (allGameWeeks: Array<LeagueGameWeek>): Date => {
  const fixtures = allGameWeeks.flatMap((gameWeek) => gameWeek.games.fixtures);

  if (fixtures.length === 0) return new Date();

  const latestKickoff = fixtures.reduce((latest, fixture) => {
    const fixtureDate = new Date(fixture.kickOffTime);
    return fixtureDate > latest ? fixtureDate : latest;
  }, new Date(fixtures[0].kickOffTime));

  const day = new Date(latestKickoff);
  day.setDate(day.getDate() + 1);
  day.setHours(0, 0, 0, 0);

  return day;
};

export const getLastKickoffTimeInGameWeek = (gameWeek?: LeagueGameWeek): Date => {
  if (!gameWeek) return new Date();

  const { fixtures } = gameWeek.games;

  if (fixtures.length === 0) return new Date();

  const latestKickoff = fixtures.reduce((latest, fixture) => {
    const fixtureDate = new Date(fixture.kickOffTime);
    return fixtureDate > latest ? fixtureDate : latest;
  }, new Date(fixtures[0].kickOffTime));

  const day = new Date(latestKickoff);
  day.setDate(day.getDate() + 1);
  day.setHours(0, 0, 0, 0);

  return day;
};

export const groupFixturesByDate = (fixtures: Array<Fixture>) => {
  const groupedFixtures = new Map();

  fixtures.forEach((fixture) => {
    const date = new Date(fixture.kickOffTime).toLocaleDateString();
    if (!groupedFixtures.has(date)) {
      groupedFixtures.set(date, []);
    }
    groupedFixtures.get(date).push(fixture);
  });

  return groupedFixtures;
};

export const groupFixturesByDateAndTournament = (fixtures: Array<Fixture>) => {
  const groupedFixtures = new Map();

  fixtures.forEach((fixture) => {
    const date = new Date(fixture.kickOffTime).toLocaleDateString();
    if (!groupedFixtures.has(date)) {
      groupedFixtures.set(date, new Map());
    }

    const { tournament } = fixture;
    if (!groupedFixtures.get(date).has(tournament)) {
      groupedFixtures.get(date).set(tournament, []);
    }

    groupedFixtures.get(date).get(tournament).push(fixture);
  });

  return groupedFixtures;
};

export const getTournamentIcon = (tournament: string) => {
  switch (tournament) {
    case TournamentsEnum.PREMIER_LEAGUE:
      return 'https://images.fotmob.com/image_resources/logo/leaguelogo/47.png';
    case TournamentsEnum.FA_CUP:
      return 'https://images.fotmob.com/image_resources/logo/leaguelogo/132.png';
    case TournamentsEnum.CARABAO_CUP:
      return 'https://images.fotmob.com/image_resources/logo/leaguelogo/133.png';
    case TournamentsEnum.CHAMPIONSHIP:
      return 'https://images.fotmob.com/image_resources/logo/leaguelogo/48.png';
    case TournamentsEnum.LA_LIGA:
      return 'https://images.fotmob.com/image_resources/logo/leaguelogo/dark/87.png';
    case TournamentsEnum.COPA_DEL_REY:
      return 'https://images.fotmob.com/image_resources/logo/leaguelogo/138.png';
    case TournamentsEnum.SUPERCOPA:
      return 'https://images.fotmob.com/image_resources/logo/leaguelogo/139.png';
    case TournamentsEnum.SERIE_A:
      return 'https://images.fotmob.com/image_resources/logo/leaguelogo/dark/55.png';
    case TournamentsEnum.SUPERCOPPA_ITALIANA:
      return 'https://images.fotmob.com/image_resources/logo/leaguelogo/222.png';
    case TournamentsEnum.COPPA_ITALIA:
      return 'https://images.fotmob.com/image_resources/logo/leaguelogo/141.png';
    case TournamentsEnum.BUNDESLIGA:
      return 'https://images.fotmob.com/image_resources/logo/leaguelogo/54.png';
    case TournamentsEnum.DFB_POKAL:
      return 'https://images.fotmob.com/image_resources/logo/leaguelogo/209.png';
    case TournamentsEnum.BUNDESLIGA_2:
      return 'https://images.fotmob.com/image_resources/logo/leaguelogo/146.png';
    case TournamentsEnum.LIGUE_1:
      return 'https://images.fotmob.com/image_resources/logo/leaguelogo/53.png';
    case TournamentsEnum.CHAMPIONS_LEAGUE:
      return 'https://images.fotmob.com/image_resources/logo/leaguelogo/42.png';
    case TournamentsEnum.EUROPA_LEAGUE:
      return 'https://images.fotmob.com/image_resources/logo/leaguelogo/73.png';
    case TournamentsEnum.CONFERENCE_LEAGUE:
      return 'https://images.fotmob.com/image_resources/logo/leaguelogo/10216.png';
    case TournamentsEnum.UEFA_SUPER_CUP:
      return 'https://images.fotmob.com/image_resources/logo/leaguelogo/74.png';
    case TournamentsEnum.ALLSVENSKAN:
      return 'https://images.fotmob.com/image_resources/logo/leaguelogo/67.png';
    case TournamentsEnum.SVENSKA_CUPEN:
      return 'https://images.fotmob.com/image_resources/logo/leaguelogo/171.png';
    case TournamentsEnum.EREDIVISIE:
      return 'https://images.fotmob.com/image_resources/logo/leaguelogo/57.png';
    case TournamentsEnum.PRIMEIRA_LIGA:
      return 'https://images.fotmob.com/image_resources/logo/leaguelogo/61.png';
    case TournamentsEnum.NATIONS_LEAGUE:
      return 'https://images.fotmob.com/image_resources/logo/leaguelogo/9806.png';
    case TournamentsEnum.WORLD_CUP:
    case TournamentsEnum.WORLD_CUP_QUALIFIERS:
      return 'https://images.fotmob.com/image_resources/logo/leaguelogo/77.png';
    case TournamentsEnum.EUROS:
    case TournamentsEnum.EUROS_QUALIFIERS:
      return 'https://images.fotmob.com/image_resources/logo/leaguelogo/50.png';
    case TournamentsEnum.FRIENDLIES:
      return 'https://images.fotmob.com/image_resources/logo/leaguelogo/114.png';
    case TournamentsEnum.PLACEHOLDER:
      return 'https://cdn.pixabay.com/photo/2014/04/03/00/38/shield-308943_640.png';
    default:
      return '';
  }
};

export const getFixtureNickname = (teams: Array<Team>): string | undefined => {
  const teamNicknames: { [key: string]: string } = {
    'Real Madrid,FC Barcelona': 'El Clásico',
    'Real Madrid,Atlético Madrid': 'El Derbi Madrileño',
    'Real Sociedad,Athletic Bilbao': 'Euskal Derbia',
    'Real Betis,Sevilla': 'Derbi Sevillano',
    'Sporting Gijón,Real Oviedo': 'Derbi Asturiano',
    'Celta Vigo,Deportivo La Coruña': 'O Noso Derbi',
    'Valencia,Levante': 'Derbi Valenciano',
    'Valencia,Villarreal': 'Derbi de la Comunitat',
    'Manchester United,Liverpool': 'North West Derby',
    'Liverpool,Everton': 'Merseyside Derby',
    'Manchester United,Manchester City': 'Manchester Derby',
    'Arsenal,Tottenham': 'North London Derby',
    'Crystal Palace,Brighton': 'M23 Derby',
    'Fulham,Chelsea': 'West London Derby',
    'West Ham,Millwall': 'Dockers Derby',
    'Birmingham City,Aston Villa': 'Second City Derby',
    'Birmingham City,West Bromwich Albion': 'Black Country Derby',
    'Sheffield United,Sheffield Wednesday': 'Steel City Derby',
    'Newcastle,Sunderland': 'Tyne-Wear Derby',
    'AC Milan,Inter': 'Derby della Madonnina',
    'Inter,Juventus': 'Derby d‘Italia',
    'Roma,Lazio': 'Derby della Capitale',
    'Napoli,Juventus': 'Derby del Sole',
    'Juventus,Torino': 'Derby della Mole',
    'Genoa,Sampdoria': 'Derby della Lanterna',
    'Atalanta,Brescia': 'Derby della Lombardia',
    'Borussia Dortmund,Bayern Munich': 'Der Klassiker',
    'Schalke 04,Borussia Dortmund': 'Revierderby',
    'Hamburger SV,St. Pauli': 'Nordderby',
    'Köln,Borussia Mönchengladbach': 'Rheinland Derby',
    'Bayer Leverkusen,Köln': 'Rhein Derby',
    'Paris Saint-Germain,Marseille': 'Le Classique',
    'Marseille,Lyon': 'Choc des Olympiques',
    'Lyon,Saint-Étienne': 'Derby Rhône-Alpes',
    'Monaco,Nice': 'Derby de la Côte d‘Azur',
    'Lille,Lens': 'Derby du Nord',
    'Ajax,PSV': 'De Topper',
    'Feyenoord,Ajax': 'De Klassieker',
    'Benfica,Porto': 'O Clássico',
    'Sporting CP,Benfica': 'O Derby de Lisboa',
    'IFK Göteborg,GAIS': 'Göteborgsderbyt',
    'AIK,Djurgården': '08-Derby',
    'Malmö FF,Helsingborg': 'Skånederbyt',
    'Djurgården,Hammarby': 'Tvillingderbyt',
    'AIK,Hammarby': '08-Derby',
    'IFK Göteborg,Malmö FF': 'Mästa Mästarderbyt',
  };

  const teamNames = teams.map((team) => team.name).sort().join(',');

  return teamNicknames[teamNames] || undefined;
};

export const getFixtureGroups = (fixtures: Array<Fixture>) => {
  const tournamentOrder = [
    TournamentsEnum.CHAMPIONS_LEAGUE,
    TournamentsEnum.ALLSVENSKAN,
    TournamentsEnum.PREMIER_LEAGUE,
    TournamentsEnum.LA_LIGA,
    TournamentsEnum.BUNDESLIGA,
    TournamentsEnum.SERIE_A,
    TournamentsEnum.LIGUE_1,
  ];

  const groupedFixtures = fixtures.reduce((acc, fixture) => {
    const tournamentIndex = acc.findIndex((group) => group.tournament === fixture.tournament);
    if (tournamentIndex >= 0) {
      acc[tournamentIndex].fixtures.push(fixture);
    } else {
      acc.push({ tournament: fixture.tournament, fixtures: [fixture] });
    }
    return acc;
  }, [] as Array<FixtureGroup>);

  // Sort the tournaments based on the predefined order
  groupedFixtures.sort((a, b) => {
    const indexA = tournamentOrder.indexOf(a.tournament as TournamentsEnum);
    const indexB = tournamentOrder.indexOf(b.tournament as TournamentsEnum);

    // Assign a high index value to tournaments not found in the tournamentOrder array
    const adjustedIndexA = indexA === -1 ? tournamentOrder.length : indexA;
    const adjustedIndexB = indexB === -1 ? tournamentOrder.length : indexB;

    return adjustedIndexA - adjustedIndexB;
  });

  return groupedFixtures;
};

export const teamsWithRegisteredPlayers = [
  'Arsenal',
  'Aston Villa',
  'Liverpool',
  'Manchester City',
  'Manchester United',
  'Tottenham',
  'Chelsea',
  'Newcastle',
  'Juventus',
  'Inter',
  'AC Milan',
  'Roma',
  'Fiorentina',
  'Napoli',
  'Atalanta',
  'Bayern München',
  'Borussia Dortmund',
  'Bayer Leverkusen',
  'Hamburger SV',
  'Atletico Madrid',
  'FC Barcelona',
  'Real Madrid',
  'Valencia',
  'Paris Saint-Germain',
  'Sverige',
  'IFK Göteborg',
];

export const isPredictGoalScorerPossibleForFixture = (fixture: Fixture): boolean => {
  if (teamsWithRegisteredPlayers.includes(fixture.homeTeam.name) || teamsWithRegisteredPlayers.includes(fixture.awayTeam.name)) {
    return true;
  }
  return false;
};

export const isPredictGoalScorerPossibleByTeamNames = (teamNames: Array<string>): boolean => {
  if (teamNames.some((team) => teamsWithRegisteredPlayers.includes(team))) {
    return true;
  }
  return false;
};

export const bullseyeScoringSystem: LeagueScoringSystemValues = {
  correctResult: 1,
  correctOutcome: 1,
  correctGoalScorerDefender: 5,
  correctGoalScorerMidfielder: 3,
  correctGoalScorerForward: 2,
  correctGoalDifference: 1,
  correctGoalsByTeam: 1,
  oddsBetween3And4: 1,
  oddsBetween4And6: 2,
  oddsBetween6And10: 3,
  oddsAvobe10: 5,
  goalFest: 0, // TODO: Update
  underdogBonus: 0, // TODO: Update
  firstTeamToScore: 0, // TODO: Update
};

export const gamblerScoringSystem: LeagueScoringSystemValues = {
  correctResult: 0,
  correctOutcome: 2,
  correctGoalScorerDefender: 5,
  correctGoalScorerMidfielder: 3,
  correctGoalScorerForward: 2,
  correctGoalDifference: 1,
  correctGoalsByTeam: 1,
  oddsBetween3And4: 2,
  oddsBetween4And6: 4,
  oddsBetween6And10: 6,
  oddsAvobe10: 10,
  goalFest: 3,
  underdogBonus: 1,
  firstTeamToScore: 1,
};
