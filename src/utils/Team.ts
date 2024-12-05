/* eslint-disable guard-for-in */

import { theme } from '../theme';
import { CountryEnum } from './Players';

/* eslint-disable no-restricted-syntax */
export interface Team {
  name: string;
  shortName?: string;
  logoUrl: string;
  darkModeLogoUrl?: string;
  stadium?: string;
  country?: string;
  teamPrimaryColor?: string;
}

export enum LeagueEnum {
  PREMIER_LEAGUE = 'Premier League',
  EFL_CHAMPIONSHIP = 'EFL Championship',
  EFL_LEAGUE_ONE = 'EFL League One',
  EFL_LEAGUE_TWO = 'EFL League Two',
  ALLSVENSKAN = 'Allsvenskan',
  LA_LIGA = 'La Liga',
  SEGUNDA_DIVISION = 'Segunda Division',
  SERIE_A = 'Serie A',
  BUNDESLIGA = 'Bundesliga',
  BUNDESLIGA_2 = '2. Bundesliga',
  LIGUE_1 = 'Ligue 1',
  EREDIVISIE = 'Eredivisie',
  PRIMEIRA_LIGA = 'Primeira Liga',
  BELGIAN_PRO_LEAGUE = 'Belgian Pro League',
  UKRAINIAN_PREMIER_LEAGUE = 'Ukrainian Premier League',
  SCOTTISH_PREMIERSHIP = 'Scottish Premiership',
  AUSTRIAN_BUNDESLIGA = 'Austrian Bundesliga',
  SWISS_SUPER_LEAGUE = 'Swiss Super League',
  CZECH_FIRST_LEAGUE = 'Czech First League',
  CROATIAN_FIRST_FOOTBALL_LEAGUE = 'Prva HNL',
  SLOVAK_1_LIGA = 'Niké Liga',
  SERBIAN_SUPER_LIGA = 'Serbian SuperLiga',
  AZERBAIJAN_PREMIER_LEAGUE = 'Azerbaijan Premier League',
  NATIONS = 'Landslag',
}

export enum TournamentsEnum {
  PREMIER_LEAGUE = 'Premier League',
  FA_CUP = 'FA Cup',
  CARABAO_CUP = 'Carabao Cup',
  CHAMPIONSHIP = 'Championship',
  LA_LIGA = 'La Liga',
  COPA_DEL_REY = 'Copa del Rey',
  SERIE_A = 'Serie A',
  COPPA_ITALIA = 'Coppa Italia',
  BUNDESLIGA = 'Bundesliga',
  BUNDESLIGA_2 = '2. Bundesliga',
  DFB_POKAL = 'DFB-Pokal',
  LIGUE_1 = 'Ligue 1',
  CHAMPIONS_LEAGUE = 'Champions League',
  EUROPA_LEAGUE = 'Europa League',
  CONFERENCE_LEAGUE = 'Conference League',
  ALLSVENSKAN = 'Allsvenskan',
}

export const getTeamByNameAndLeague = (teamName: string, league: string) => Teams[league as LeagueEnum].find((team: Team) => team.name === teamName);

export const getTeamByName = (teamName: string): Team | undefined => {
  for (const league in Teams) {
    const team = Teams[league as LeagueEnum].find((team: Team) => team.name === teamName);
    if (team) return team;
  }
};

export const getTeamsByCountry = (country: string): Team[] => {
  const teams: Team[] = [];
  for (const league in Teams) {
    Teams[league as LeagueEnum].forEach((team: Team) => {
      if (team.country === country) teams.push(team);
    });
  }
  return teams;
};

export const getTeamsObjectByCountry = (): { [key: string]: Team[] } => {
  const teamsByCountry: { [key: string]: Team[] } = {};

  for (const league in Teams) {
    Teams[league as LeagueEnum].forEach((team: Team) => {
      const { country } = team;
      if (!country) return;
      if (!teamsByCountry[country]) {
        teamsByCountry[country] = [] as Team[];
      }
      teamsByCountry[country].push(team);
    });
  }

  // Sort teams alphabetically within each country's array
  Object.keys(teamsByCountry).forEach((country) => {
    teamsByCountry[country].sort((a, b) => a.name.localeCompare(b.name));
  });

  return teamsByCountry;
};

export const getAllTeams = (): Team[] => {
  const teams: Team[] = [];
  for (const league in Teams) {
    Teams[league as LeagueEnum].forEach((team: Team) => {
      teams.push(team);
    });
  }
  return teams;
};

export const getAllNations = (): Team[] => {
  const nations: Team[] = [];
  for (const league in Teams) {
    if (league === LeagueEnum.NATIONS) {
      Teams[league as LeagueEnum].forEach((team: Team) => {
        nations.push(team);
      });
    }
  }
  return nations;
};

export const getAllNationsObject = (): { [key: string]: Team[] } => {
  const nations: { [key: string]: Team[] } = { Landslag: [] };

  for (const league in Teams) {
    if (league === LeagueEnum.NATIONS) {
      Teams[league as LeagueEnum].forEach((team: Team) => {
        nations.Landslag.push(team);
      });
    }
  }

  return nations;
};

export const getFlagUrlByCountryName = (countryName: string): string => {
  const country = Teams[LeagueEnum.NATIONS].find((team: Team) => team.name === countryName);
  return country?.logoUrl || '';
};

export const getTeamPrimaryColorByName = (teamName: string): string => {
  for (const league in Teams) {
    const team = Teams[league as LeagueEnum].find((team: Team) => team.name === teamName);
    if (team && (team as any).teamPrimaryColor) return (team as any).teamPrimaryColor || theme.colors.black;
  }
  return '';
};

export const Teams = {
  [LeagueEnum.PREMIER_LEAGUE]: [
    {
      name: 'Arsenal',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg',
      stadium: 'Emirates Stadium',
      country: CountryEnum.ENGLAND,
      teamPrimaryColor: '#E40514',
    },
    {
      name: 'Chelsea',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg',
      stadium: 'Stamford Bridge',
      country: CountryEnum.ENGLAND,
      teamPrimaryColor: '#034694',
    },
    {
      name: 'Liverpool',
      logoUrl: 'https://backend.liverpoolfc.com/sites/default/files/styles/lg/public/2022-07/MicrosoftTeams-image%20%2818%29%20%281%29.webp?itok=mhoZb73-&width=1680',
      // darkModeLogoUrl: 'https://mahonpointsc.ie/wp-content/uploads/2021/09/Liverpool-Logo-Final-1.png',
      stadium: 'Anfield',
      country: CountryEnum.ENGLAND,
      teamPrimaryColor: '#d11f2b',
    },
    {
      name: 'Manchester City',
      shortName: 'Man City',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg',
      stadium: 'Etihad Stadium',
      country: CountryEnum.ENGLAND,
      teamPrimaryColor: '#6CABDD',
    },
    {
      name: 'Manchester United',
      shortName: 'Man United',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg',
      stadium: 'Old Trafford',
      country: CountryEnum.ENGLAND,
      teamPrimaryColor: '#DA291C',
    },
    {
      name: 'Tottenham',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg',
      stadium: 'Tottenham Hotspur Stadium',
      country: CountryEnum.ENGLAND,
      teamPrimaryColor: '#132257',
    },
    {
      name: 'Everton',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/7/7c/Everton_FC_logo.svg',
      stadium: 'Goodison Park',
      country: CountryEnum.ENGLAND,
      teamPrimaryColor: '#003399',
    },
    {
      name: 'Leicester',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/2/2d/Leicester_City_crest.svg',
      stadium: 'King Power Stadium',
      country: CountryEnum.ENGLAND,
      teamPrimaryColor: '#003090',
    },
    {
      name: 'West Ham',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/c/c2/West_Ham_United_FC_logo.svg',
      stadium: 'London Stadium',
      country: CountryEnum.ENGLAND,
      teamPrimaryColor: '#7A263A',
    },
    {
      name: 'Aston Villa',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9a/Aston_Villa_FC_new_crest.svg/1280px-Aston_Villa_FC_new_crest.svg.png',
      stadium: 'Villa Park',
      country: CountryEnum.ENGLAND,
      teamPrimaryColor: '#7A003C',
    },
    {
      name: 'Wolves',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/f/fc/Wolverhampton_Wanderers.svg',
      stadium: 'Molineux Stadium',
      country: CountryEnum.ENGLAND,
      teamPrimaryColor: '#FDB913',
    },
    {
      name: 'Southampton',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/c/c9/FC_Southampton.svg',
      stadium: 'St. Mary\'s Stadium',
      country: CountryEnum.ENGLAND,
      teamPrimaryColor: '#D71920',
    },
    {
      name: 'Newcastle',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/5/56/Newcastle_United_Logo.svg',
      stadium: 'St. James\' Park',
      country: CountryEnum.ENGLAND,
      teamPrimaryColor: '#000000',
    },
    {
      name: 'Crystal Palace',
      shortName: 'C. Palace',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a2/Crystal_Palace_FC_logo_%282022%29.svg',
      stadium: 'Selhurst Park',
      country: CountryEnum.ENGLAND,
      teamPrimaryColor: '#1B458F',
    },
    {
      name: 'Brighton',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/f/fd/Brighton_%26_Hove_Albion_logo.svg',
      stadium: 'AMEX Stadium',
      country: CountryEnum.ENGLAND,
      teamPrimaryColor: '#0057B8',
    },
    {
      name: 'Ipswich',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/4/43/Ipswich_Town.svg',
      stadium: 'Portman Road',
      country: CountryEnum.ENGLAND,
      teamPrimaryColor: '#0000FF',
    },
    {
      name: 'Nottingham Forest',
      shortName: 'N. Forest',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/e/e5/Nottingham_Forest_F.C._logo.svg',
      stadium: 'City Ground',
      country: CountryEnum.ENGLAND,
      teamPrimaryColor: '#FF0000',
    },
    {
      name: 'Brentford',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/2/2a/Brentford_FC_crest.svg',
      stadium: 'Brentford Community Stadium',
      country: CountryEnum.ENGLAND,
      teamPrimaryColor: '#E30613',
    },
    {
      name: 'Bournemouth',
      shortName: 'B‘mouth',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/e/e5/AFC_Bournemouth_%282013%29.svg',
      stadium: 'Vitality Stadium',
      country: CountryEnum.ENGLAND,
      teamPrimaryColor: '#DA291C',
    },
    {
      name: 'Fulham',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/e/eb/Fulham_FC_%28shield%29.svg',
      stadium: 'Craven Cottage',
      country: CountryEnum.ENGLAND,
      teamPrimaryColor: '#000000',
    },
  ],
  [LeagueEnum.EFL_CHAMPIONSHIP]: [
    {
      name: 'Preston North End',
      shortName: 'Preston',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/8/82/Preston_North_End_FC.svg',
      stadium: 'Deepdale',
      country: CountryEnum.ENGLAND,
      teamPrimaryColor: '#FFFFFF',
    },
    {
      name: 'Plymouth Argyle',
      shortName: 'Plymouth',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a8/Plymouth_Argyle_F.C._logo.svg',
      stadium: 'Home Park',
      country: CountryEnum.ENGLAND,
      teamPrimaryColor: '#004f3e',
    },
  ],
  [LeagueEnum.EFL_LEAGUE_ONE]: [
    {
      name: 'Bolton Wanderers',
      shortName: 'Bolton',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/8/82/Bolton_Wanderers_FC_logo.svg',
      stadium: 'University of Bolton Stadium',
      country: CountryEnum.ENGLAND,
      teamPrimaryColor: '#21397F',
    },
  ],
  [LeagueEnum.EFL_LEAGUE_TWO]: [
    {
      name: 'Walsall',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/e/ef/Walsall_FC.svg',
      stadium: 'Bescot Stadium',
      country: CountryEnum.ENGLAND,
      teamPrimaryColor: '#FF0000',
    },
  ],
  [LeagueEnum.ALLSVENSKAN]: [
    {
      name: 'Djurgården',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Djurgardens_IF_logo.svg',
      stadium: 'Tele2 Arena',
      country: CountryEnum.SWEDEN,
      teamPrimaryColor: '#1261ae',
    },
    {
      name: 'Hammarby IF',
      shortName: 'Hammarby',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0a/Hammarby_IF_logo.svg/1920px-Hammarby_IF_logo.svg.png',
      stadium: 'Tele2 Arena',
      country: CountryEnum.SWEDEN,
      teamPrimaryColor: '#008000',
    },
    {
      name: 'Malmö FF',
      shortName: 'Malmö',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Malmo_FF_logo.svg',
      stadium: 'Eleda Stadion',
      country: CountryEnum.SWEDEN,
      teamPrimaryColor: '#2b98db',
    },
    {
      name: 'IFK Göteborg',
      logoUrl: 'https://ifkgoteborg.se/wp-content/uploads/2017/09/IFK-logo.png',
      stadium: 'Gamla Ullevi',
      country: CountryEnum.SWEDEN,
      teamPrimaryColor: '#2b519c',
    },
    {
      name: 'AIK',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5f/AIK_logo.svg/1920px-AIK_logo.svg.png',
      stadium: 'Strawberry Arena',
      country: CountryEnum.SWEDEN,
      teamPrimaryColor: '#023154',
    },
    {
      name: 'IFK Norrköping',
      shortName: 'Norrköping',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/IFK_Norrkoping_logo.svg',
      stadium: 'PlatinumCars Arena',
      country: CountryEnum.SWEDEN,
      teamPrimaryColor: '#0052a0',
    },
    {
      name: 'BK Häcken',
      shortName: 'Häcken',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/5/5d/BK_Hacken_logo.svg',
      stadium: 'Bravida Arena',
      country: CountryEnum.SWEDEN,
      teamPrimaryColor: '#ffdf28',
    },
    {
      name: 'IFK Värnamo',
      shortName: 'Värnamo',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/1/12/IFK_Varnamo_logo.svg',
      stadium: 'Finnvedsvallen',
      country: CountryEnum.SWEDEN,
      teamPrimaryColor: '#006ab3',
    },
    // {
    //   name: 'Kalmar FF',
    //   shortName: 'Kalmar',
    //   logoUrl: 'https://upload.wikimedia.org/wikipedia/en/a/af/Kalmar_FF_logo.svg',
    //   stadium: 'Guldfågeln Arena',
    //   country: CountryEnum.SWEDEN,
    // },
    {
      name: 'Degerfors',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/9/90/Degerfors_IF_logo.svg',
      stadium: 'Stora Valla',
      country: CountryEnum.SWEDEN,
      teamPrimaryColor: '#f80c04',
    },
    {
      name: 'Elfsborg',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/3/37/IF_Elfsborg_logo.svg',
      stadium: 'Borås Arena',
      country: CountryEnum.SWEDEN,
      teamPrimaryColor: '#f8d204',
    },
    {
      name: 'GAIS',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a3/GAIS_logo.svg',
      stadium: 'Gamla Ullevi',
      country: CountryEnum.SWEDEN,
      teamPrimaryColor: '##398d50',
    },
    // {
    //   name: 'Västerås SK',
    //   shortName: 'Västerås',
    //   logoUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a0/Vasteras_SK_logo.svg',
    //   stadium: 'Hitachi Energy Arena',
    //   country: CountryEnum.SWEDEN,
    // },
    {
      name: 'Östers IF',
      shortName: 'Öster',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/b/b3/Osters_IF_logo.svg',
      stadium: 'Myresjöhus Arena',
      country: CountryEnum.SWEDEN,
      teamPrimaryColor: '#dc362e',
    },
    {
      name: 'Mjällby',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a5/Mjallby_AIF_logo.svg',
      stadium: 'Strandvallen',
      country: CountryEnum.SWEDEN,
      teamPrimaryColor: '#fed304',
    },
    {
      name: 'Halmstad BK',
      shortName: 'Halmstad',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/6/66/Halmstad_BK_logo.svg',
      stadium: 'Örjans Vall',
      country: CountryEnum.SWEDEN,
      teamPrimaryColor: '#0258a3',
    },
    {
      name: 'IK Sirius',
      shortName: 'Sirius',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/c/cf/IK_Sirius_logo.svg',
      stadium: 'Studenternas IP',
      country: CountryEnum.SWEDEN,
      teamPrimaryColor: '#145caf',
    },
    {
      name: 'Brommapojkarna',
      shortName: 'BP',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/2/20/IF_Brommapojkarna_logo.svg',
      stadium: 'Grimsta IP',
      country: CountryEnum.SWEDEN,
      teamPrimaryColor: '#df1e1f',
    },
  ],
  [LeagueEnum.LA_LIGA]: [
    {
      name: 'Real Madrid',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg',
      stadium: 'Santiago Bernabéu',
      country: CountryEnum.SPAIN,
      teamPrimaryColor: '#fbbe00',
    },
    {
      name: 'FC Barcelona',
      shortName: 'Barcelona',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg',
      // stadium: 'Camp Nou',
      stadium: 'Estadi Olímpic Lluís Companys',
      country: CountryEnum.SPAIN,
      teamPrimaryColor: '#a50044',
    },
    {
      name: 'Atletico Madrid',
      shortName: 'Atl. Madrid',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/f/f9/Atletico_Madrid_Logo_2024.svg',
      stadium: 'Wanda Metropolitano',
      country: CountryEnum.SPAIN,
      teamPrimaryColor: '#cb3524',
    },
    {
      name: 'Sevilla',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/3/3b/Sevilla_FC_logo.svg',
      stadium: 'Ramón Sánchez Pizjuán',
      country: CountryEnum.SPAIN,
      teamPrimaryColor: '#d8091d',
    },
    {
      name: 'Valencia',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/c/ce/Valenciacf.svg',
      stadium: 'Mestalla',
      country: CountryEnum.SPAIN,
      teamPrimaryColor: '#ef321f',
    },
    {
      name: 'Real Sociedad',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/f/f1/Real_Sociedad_logo.svg',
      stadium: 'Estadio Anoeta',
      country: CountryEnum.SPAIN,
      teamPrimaryColor: '#00529f',
    },
    {
      name: 'Villarreal',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/b/b9/Villarreal_CF_logo-en.svg',
      stadium: 'Estadio de la Cerámica',
      country: CountryEnum.SPAIN,
      teamPrimaryColor: '#fee766',
    },
    {
      name: 'Real Betis',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/1/13/Real_betis_logo.svg',
      stadium: 'Estadio Benito Villamarín',
      country: CountryEnum.SPAIN,
      teamPrimaryColor: '#00964a',
    },
    {
      name: 'Athletic Bilbao',
      shortName: 'Ath. Bilbao',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/9/98/Club_Athletic_Bilbao_logo.svg',
      stadium: 'Estadio San Mamés',
      country: CountryEnum.SPAIN,
      teamPrimaryColor: '#ee211e',
    },
    {
      name: 'Girona FC',
      shortName: 'Girona',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/f/f7/Girona_FC_Logo.svg',
      stadium: 'Estadi Montilivi',
      country: CountryEnum.SPAIN,
      teamPrimaryColor: '#d50000',
    },
    {
      name: 'RCD Espanyol',
      shortName: 'Espanyol',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/9/92/RCD_Espanyol_crest.svg',
      stadium: 'Stage Front Stadium',
      country: CountryEnum.SPAIN,
      teamPrimaryColor: '#00529f',
    },
    {
      name: 'Real Valladolid',
      shortName: 'Valladolid',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/6/6e/Real_Valladolid_Logo.svg',
      stadium: 'Estadio José Zorrilla',
      country: CountryEnum.SPAIN,
      teamPrimaryColor: '#921591',
    },
    {
      name: 'Getafe',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/4/46/Getafe_logo.svg',
      stadium: 'Coliseum Alfonso Pérez',
      country: CountryEnum.SPAIN,
      teamPrimaryColor: '#057cbc',
    },
    {
      name: 'Celta Vigo',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/1/12/RC_Celta_de_Vigo_logo.svg',
      stadium: 'Estadio de Balaídos',
      country: CountryEnum.SPAIN,
      teamPrimaryColor: '#8ac4ee',
    },
    {
      name: 'Deportivo Alavés',
      shortName: 'Alavés',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/f/f8/Deportivo_Alaves_logo_%282020%29.svg',
      stadium: 'Estadio de Mendizorroza',
      country: CountryEnum.SPAIN,
      teamPrimaryColor: '#012ea1',
    },
    {
      name: 'U.D Las Palmas',
      shortName: 'Las Palmas',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/2/20/UD_Las_Palmas_logo.svg',
      stadium: 'Estadio de Gran Canaria',
      country: CountryEnum.SPAIN,
      teamPrimaryColor: '#fcdb14',
    },
    {
      name: 'Osasuna',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/3/38/CA_Osasuna_2024_crest.svg',
      stadium: 'Estadio El Sadar',
      country: CountryEnum.SPAIN,
      teamPrimaryColor: '#d80723',
    },
    {
      name: 'Leganés',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/b/b8/Club_Deportivo_Legan%C3%A9s_logo.svg',
      stadium: 'Estadio Municipal de Butarque',
      country: CountryEnum.SPAIN,
      teamPrimaryColor: '#03196f',
    },
    {
      name: 'Rayo Vallecano',
      shortName: 'Rayo',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/d/d8/Rayo_Vallecano_logo.svg',
      stadium: 'Estadio de Vallecas',
      country: CountryEnum.SPAIN,
      teamPrimaryColor: '#e53115',
    },
    {
      name: 'RCD Mallorca',
      shortName: 'Mallorca',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/e/e0/Rcd_mallorca.svg',
      stadium: 'Estadio Mallorca Son Moix',
      country: CountryEnum.SPAIN,
      teamPrimaryColor: '#ee1620',
    },
  ],
  [LeagueEnum.SEGUNDA_DIVISION]: [
    {
      name: 'Deportivo La Coruña',
      shortName: 'Deportivo',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/4/4e/RC_Deportivo_La_Coru%C3%B1a_logo.svg',
      stadium: 'Riazor',
      country: CountryEnum.SPAIN,
      teamPrimaryColor: '#56105d',
    },
    {
      name: 'Sporting Gijón',
      shortName: 'R. Sporting',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/4/48/Real_Sporting_de_Gijon.svg',
      stadium: 'El Molinón',
      country: CountryEnum.SPAIN,
      teamPrimaryColor: '#e10012',
    },
    {
      name: 'Málaga CF',
      shortName: 'Málaga',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/6/6d/M%C3%A1laga_CF.svg',
      stadium: 'La Rosaleda',
      country: CountryEnum.SPAIN,
      teamPrimaryColor: '#00529f',
    },
    {
      name: 'Real Oviedo',
      shortName: 'Real Oviedo',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/6/6e/Real_Oviedo_logo.svg',
      stadium: 'Carlos Tartiere',
      country: CountryEnum.SPAIN,
      teamPrimaryColor: '#054aa2',
    },
    {
      name: 'Racing Santander',
      shortName: 'R. Santander',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/f/f5/Racing_de_Santander_logo.svg',
      stadium: 'El Sardinero',
      country: CountryEnum.SPAIN,
      teamPrimaryColor: '#2c9a29',
    },
    {
      name: 'CD Tenerife',
      shortName: 'Tenerife',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/f/f9/CD_Tenerife_logo.svg',
      stadium: 'Heliodoro Rodríguez López',
      country: CountryEnum.SPAIN,
      teamPrimaryColor: '#0e339d',
    },
    {
      name: 'Real Zaragoza',
      shortName: 'Zaragoza',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/6/69/Real_Zaragoza_logo.svg',
      stadium: 'La Romareda',
      country: CountryEnum.SPAIN,
      teamPrimaryColor: '#fe000a',
    },
  ],
  [LeagueEnum.SERIE_A]: [
    {
      name: 'Juventus',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Juventus_FC_-_pictogram_black_%28Italy%2C_2017%29.svg',
      stadium: 'Allianz Stadium',
      country: CountryEnum.ITALY,
      teamPrimaryColor: '#000000',
    },
    {
      name: 'Inter',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg',
      stadium: 'Giuseppe Meazza',
      country: CountryEnum.ITALY,
      teamPrimaryColor: '#01229c',
    },
    {
      name: 'AC Milan',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg',
      stadium: 'San Siro',
      country: CountryEnum.ITALY,
      teamPrimaryColor: '#e3032a',
    },
    {
      name: 'AS Roma',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/f/f7/AS_Roma_logo_%282017%29.svg',
      stadium: 'Stadio Olimpico',
      country: CountryEnum.ITALY,
      teamPrimaryColor: '#8f1e2c',
    },
    {
      name: 'Napoli',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ed/SSC_Napoli_2007.svg',
      stadium: 'Stadio Diego Armando Maradona',
      country: CountryEnum.ITALY,
      teamPrimaryColor: '#007dc3',
    },
    {
      name: 'Lazio',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/c/ce/S.S._Lazio_badge.svg',
      stadium: 'Stadio Olimpico',
      country: CountryEnum.ITALY,
      teamPrimaryColor: '#87d9f8',
    },
    {
      name: 'Fiorentina',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/ACF_Fiorentina_-_logo_%28Italy%2C_2022%29.svg',
      stadium: 'Stadio Artemio Franchi',
      country: CountryEnum.ITALY,
      teamPrimaryColor: '#61318c',
    },
    {
      name: 'Atalanta',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/6/66/AtalantaBC.svg',
      stadium: 'Gewiss Stadium',
      country: CountryEnum.ITALY,
      teamPrimaryColor: '#275baf',
    },
    {
      name: 'Bologna',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Bologna_F.C._1909_logo.svg',
      stadium: 'Stadio Renato Dall\'Ara',
      country: CountryEnum.ITALY,
      teamPrimaryColor: '#a0182e',
    },
    {
      name: 'Genoa',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/2/2c/Genoa_CFC_crest.svg',
      stadium: 'Stadio Luigi Ferraris',
      country: CountryEnum.ITALY,
      teamPrimaryColor: '#00213c',
    },
    {
      name: 'Udinese',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/c/ce/Udinese_Calcio_logo.svg',
      stadium: 'Dacia Arena',
      country: CountryEnum.ITALY,
      teamPrimaryColor: '#000000',
    },
    {
      name: 'Parma',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/97/Logo_Parma_Calcio_1913_%28adozione_2016%29.svg',
      stadium: 'Stadio Ennio Tardini',
      country: CountryEnum.ITALY,
      teamPrimaryColor: '#f1c516',
    },
    {
      name: 'Torino',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/2/2e/Torino_FC_Logo.svg',
      stadium: 'Stadio Olimpico Grande Torino',
      country: CountryEnum.ITALY,
      teamPrimaryColor: '#8a1912',
    },
    {
      name: 'Empoli',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/94/Empoli_FC.png',
      stadium: 'Stadio Carlo Castellani',
      country: CountryEnum.ITALY,
      teamPrimaryColor: '#005ea7',
    },
    {
      name: 'Monza',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a7/AC_Monza_logo_%282021%29.svg',
      stadium: 'Stadio Brianteo',
      country: CountryEnum.ITALY,
      teamPrimaryColor: '#ee0e35',
    },
    {
      name: 'Hellas Verona',
      shortName: 'H. Verona',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/9/92/Hellas_Verona_FC_logo_%282020%29.svg',
      stadium: 'Stadio Marcantonio Bentegodi',
      country: CountryEnum.ITALY,
      teamPrimaryColor: '#ffd100',
    },
    {
      name: 'Cagliari',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/6/61/Cagliari_Calcio_1920.svg',
      stadium: 'Unipol Domus',
      country: CountryEnum.ITALY,
      teamPrimaryColor: '#011d40',
    },
    {
      name: 'Venezia',
      logoUrl: 'https://shop.veneziafc.it/cdn/shop/files/logo_veneziafc.svg?v=1720436518&width=120',
      stadium: 'Stadio Pierluigi Penzo',
      country: CountryEnum.ITALY,
      teamPrimaryColor: '#fd7f18',
    },
    {
      name: 'Lecce',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/8/81/US_Lecce_Logo.png',
      stadium: 'Stadio Via del Mare',
      country: CountryEnum.ITALY,
      teamPrimaryColor: '#012857',
    },
    {
      name: 'Como 1907',
      shortName: 'Como',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/Logo_Como_1907_-_2019.svg',
      stadium: 'Stadio Giuseppe Sinigaglia',
      country: CountryEnum.ITALY,
      teamPrimaryColor: '#083f69',
    },
  ],
  [LeagueEnum.BUNDESLIGA]: [
    {
      name: 'Bayern München',
      shortName: 'FC Bayern',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg',
      stadium: 'Allianz Arena',
      country: CountryEnum.GERMANY,
      teamPrimaryColor: '#ed0137',
    },
    {
      name: 'Borussia Dortmund',
      shortName: 'Dortmund',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg',
      stadium: 'Signal Iduna Park',
      country: CountryEnum.GERMANY,
      teamPrimaryColor: '#ffd900',
    },
    {
      name: 'RB Leipzig',
      shortName: 'Leipzig',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/0/04/RB_Leipzig_2014_logo.svg',
      stadium: 'Red Bull Arena',
      country: CountryEnum.GERMANY,
      teamPrimaryColor: '#d50000',
    },
    {
      name: 'Bayer Leverkusen',
      shortName: 'Leverkusen',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/5/59/Bayer_04_Leverkusen_logo.svg',
      stadium: 'BayArena',
      country: CountryEnum.GERMANY,
      teamPrimaryColor: '#d50000',
    },
    {
      name: 'Eintracht Frankfurt',
      shortName: 'Frankfurt',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Eintracht_Frankfurt_Logo.svg',
      stadium: 'Deutsche Bank Park',
      country: CountryEnum.GERMANY,
      teamPrimaryColor: '#e0000c',
    },
    {
      name: 'VfB Stuttgart',
      shortName: 'Stuttgart',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/VfB_Stuttgart_1893_Logo.svg',
      stadium: 'Mercedes-Benz Arena',
      country: CountryEnum.GERMANY,
      teamPrimaryColor: '#fddd02',
    },
    {
      name: 'Mönchengladbach',
      shortName: 'Gladbach',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/81/Borussia_M%C3%B6nchengladbach_logo.svg',
      stadium: 'Borussia-Park',
      country: CountryEnum.GERMANY,
      teamPrimaryColor: '#1a191a',
    },
    {
      name: 'VfL Bochum',
      shortName: 'Bochum',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/72/VfL_Bochum_logo.svg',
      stadium: 'Vonovia Ruhrstadion',
      country: CountryEnum.GERMANY,
      teamPrimaryColor: '#005ba5',
    },
    {
      name: 'Hoffenheim',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Logo_TSG_Hoffenheim.svg',
      stadium: 'PreZero Arena',
      country: CountryEnum.GERMANY,
      teamPrimaryColor: '#1060b6',
    },
    {
      name: 'Holstein Kiel',
      shortName: 'Kiel',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Holstein_Kiel_Logo.svg',
      stadium: 'Holstein-Stadion',
      country: CountryEnum.GERMANY,
      teamPrimaryColor: '#04569d',
    },
    {
      name: 'Mainz 05',
      shortName: 'Mainz',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Logo_Mainz_05.svg',
      stadium: 'Opel Arena',
      country: CountryEnum.GERMANY,
      teamPrimaryColor: '#e6001f',
    },
    {
      name: 'Union Berlin',
      shortName: 'U. Berlin',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/44/1._FC_Union_Berlin_Logo.svg',
      stadium: 'Stadion An der Alten Försterei',
      country: CountryEnum.GERMANY,
      teamPrimaryColor: '#ec121d',
    },
    {
      name: 'Freiburg',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/6/6d/SC_Freiburg_logo.svg',
      stadium: 'Schwarzwald-Stadion',
      country: CountryEnum.GERMANY,
      teamPrimaryColor: '#000000',
    },
    {
      name: 'Augsburg',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/c/c5/FC_Augsburg_logo.svg',
      stadium: 'WWK Arena',
      country: CountryEnum.GERMANY,
      teamPrimaryColor: '#ed1c24',
    },
    {
      name: 'Werder Bremen',
      shortName: 'W. Bremen',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/be/SV-Werder-Bremen-Logo.svg',
      stadium: 'Weserstadion',
      country: CountryEnum.GERMANY,
      teamPrimaryColor: '#179151',
    },
    {
      name: 'VfL Wolfsburg',
      shortName: 'Wolfsburg',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/VfL_Wolfsburg_Logo.svg',
      stadium: 'Volkswagen Arena',
      country: CountryEnum.GERMANY,
      teamPrimaryColor: '#50a803',
    },
    {
      name: 'St. Pauli',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/8/8f/FC_St._Pauli_logo_%282018%29.svg',
      stadium: 'Millerntor-Stadion',
      country: CountryEnum.GERMANY,
      teamPrimaryColor: '#624737',
    },
    {
      name: 'Heidenheim',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/1._FC_Heidenheim_1846.svg',
      stadium: 'Voith-Arena',
      country: CountryEnum.GERMANY,
      teamPrimaryColor: '#e10012',
    },
  ],
  [LeagueEnum.BUNDESLIGA_2]: [
    {
      name: 'Hamburger SV',
      shortName: 'Hamburg',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Hamburger_SV_logo.svg',
      stadium: 'Volksparkstadion',
      country: CountryEnum.GERMANY,
      teamPrimaryColor: '#195bb4',
    },
    {
      name: 'Schalke 04',
      shortName: 'Schalke',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6d/FC_Schalke_04_Logo.svg',
      stadium: 'Veltins-Arena',
      country: CountryEnum.GERMANY,
      teamPrimaryColor: '#01499d',
    },
    {
      name: '1. FC Köln',
      shortName: 'Köln',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/01/1._FC_Koeln_Logo_2014%E2%80%93.svg',
      stadium: 'RheinEnergieStadion',
      country: CountryEnum.GERMANY,
      teamPrimaryColor: '#d7000d',
    },
    {
      name: 'Düsseldorf',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0c/Fortuna_D%C3%BCsseldorf.png',
      stadium: 'Merkur Spiel-Arena',
      country: CountryEnum.GERMANY,
      teamPrimaryColor: '#f80000',
    },
    {
      name: 'Hertha Berlin',
      shortName: 'Hertha BSC',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/81/Hertha_BSC_Logo_2012.svg',
      stadium: 'Olympiastadion',
      country: CountryEnum.GERMANY,
      teamPrimaryColor: '#004892',
    },
    {
      name: 'Hannover 96',
      shortName: 'Hannover',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/cd/Hannover_96_Logo.svg',
      stadium: 'Niedersachsenstadion',
      country: CountryEnum.GERMANY,
      teamPrimaryColor: '#069e2e',
    },
    {
      name: '1. FC Nürnberg',
      shortName: 'Nürnberg',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/1._FC_N%C3%BCrnberg_logo.svg',
      stadium: 'Max-Morlock-Stadion',
      country: CountryEnum.GERMANY,
      teamPrimaryColor: '#ab081e',
    },
  ],
  [LeagueEnum.LIGUE_1]: [
    {
      name: 'Paris Saint-Germain',
      shortName: 'PSG',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg',
      stadium: 'Parc des Princes',
      country: CountryEnum.FRANCE,
      teamPrimaryColor: '#004170',
    },
    {
      name: 'Lyon',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/1/1c/Olympique_Lyonnais_logo.svg',
      stadium: 'Groupama Stadium',
      country: CountryEnum.FRANCE,
      teamPrimaryColor: '#0b3d91',
    },
    {
      name: 'Marseille',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d8/Olympique_Marseille_logo.svg',
      stadium: 'Stade Vélodrome',
      country: CountryEnum.FRANCE,
      teamPrimaryColor: '#0597d9',
    },
    {
      name: 'AS Monaco',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/c/cf/LogoASMonacoFC2021.svg',
      stadium: 'Stade Louis II',
      country: CountryEnum.FRANCE,
      teamPrimaryColor: '#e30613',
    },
    {
      name: 'Stade Brestois',
      shortName: 'Brest',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/0/05/Stade_Brestois_29_logo.svg',
      stadium: 'Stade Francis-Le Blé',
      country: CountryEnum.FRANCE,
      teamPrimaryColor: '#e30613',
    },
    {
      name: 'LOSC Lille',
      shortName: 'Lille',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/3/3f/Lille_OSC_2018_logo.svg',
      stadium: 'Stade Pierre-Mauroy',
      country: CountryEnum.FRANCE,
      teamPrimaryColor: '#e1170e',
    },
    {
      name: 'Stade Rennais',
      shortName: 'Rennes',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/9/9e/Stade_Rennais_FC.svg',
      stadium: 'Roazhon Park',
      country: CountryEnum.FRANCE,
      teamPrimaryColor: '#000000',
    },
    {
      name: 'OGC Nice',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/2/2e/OGC_Nice_logo.svg',
      stadium: 'Allianz Riviera',
      country: CountryEnum.FRANCE,
      teamPrimaryColor: '#ee1620',
    },
    {
      name: 'Montpellier',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a8/Montpellier_HSC_logo.svg',
      stadium: 'Stade de la Mosson',
      country: CountryEnum.FRANCE,
      teamPrimaryColor: '#d97042',
    },
    {
      name: 'Angers SCO',
      shortName: 'Angers',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/d/d4/Angers_SCO_logo.svg',
      stadium: 'Stade Raymond Kopa',
      country: CountryEnum.FRANCE,
      teamPrimaryColor: '#c7a77c',
    },
    {
      name: 'AJ Auxerre',
      shortName: 'Auxerre',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/5/51/AJAuxerreLogo.svg',
      stadium: 'Stade de l\'Abbé-Deschamps',
      country: CountryEnum.FRANCE,
      teamPrimaryColor: '#0b3d91',
    },
    {
      name: 'Le Havre',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/f/fc/Le_Havre_AC_logo.svg',
      stadium: 'Stade Océane',
      country: CountryEnum.FRANCE,
      teamPrimaryColor: '#79bde8',
    },
    {
      name: 'RC Lens',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/c/cc/RC_Lens_logo.svg',
      stadium: 'Stade Bollaert-Delelis',
      country: CountryEnum.FRANCE,
      teamPrimaryColor: '#fcd116',
    },
    {
      name: 'Nantes',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Logo_FC_Nantes_%28avec_fond%29_-_2019.svg',
      stadium: 'Stade de la Beaujoire',
      country: CountryEnum.FRANCE,
      teamPrimaryColor: '#fddd02',
    },
    {
      name: 'Stade de Reims',
      shortName: 'Stade Reims',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/1/19/Stade_de_Reims_logo.svg',
      stadium: 'Stade Auguste-Delaune',
      country: CountryEnum.FRANCE,
      teamPrimaryColor: '#d50000',
    },
    {
      name: 'Toulouse FC',
      shortName: 'Toulouse',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/6/63/Toulouse_FC_2018_logo.svg',
      stadium: 'Stadium de Toulouse',
      country: CountryEnum.FRANCE,
      teamPrimaryColor: '#695089',
    },
    {
      name: 'Saint-Étienne',
      shortName: 'St. Étienne',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/2/25/AS_Saint-%C3%89tienne_logo.svg',
      stadium: 'Stade Geoffroy-Guichard',
      country: CountryEnum.FRANCE,
      teamPrimaryColor: '#009e60',
    },
    {
      name: 'RC Strasbourg',
      shortName: 'Strasbourg',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/8/80/Racing_Club_de_Strasbourg_logo.svg',
      stadium: 'Stade de la Meinau',
      country: CountryEnum.FRANCE,
      teamPrimaryColor: '#00a0e4',
    },
  ],
  [LeagueEnum.EREDIVISIE]: [
    {
      name: 'Ajax',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/7/79/Ajax_Amsterdam.svg',
      stadium: 'Johan Cruyff Arena',
      country: CountryEnum.NETHERLANDS,
      teamPrimaryColor: '#d3122e',
    },
    {
      name: 'PSV',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/0/05/PSV_Eindhoven.svg',
      stadium: 'Philips Stadion',
      country: CountryEnum.NETHERLANDS,
      teamPrimaryColor: '#ec1b24',
    },
    {
      name: 'Feyenoord',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Feyenoord_logo_since_2009.svg',
      stadium: 'De Kuip',
      country: CountryEnum.NETHERLANDS,
      teamPrimaryColor: '#ff1710',
    },
    {
      name: 'FC Twente',
      shortName: 'Twente',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/e/e3/FC_Twente.svg',
      stadium: 'De Grolsch Veste',
      country: CountryEnum.NETHERLANDS,
      teamPrimaryColor: '#e70011',
    },
  ],
  [LeagueEnum.PRIMEIRA_LIGA]: [
    {
      name: 'Porto',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/f/f1/FC_Porto.svg',
      stadium: 'Estádio do Dragão',
      country: CountryEnum.PORTUGAL,
      teamPrimaryColor: '#00529f',
    },
    {
      name: 'Benfica',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a2/SL_Benfica_logo.svg',
      stadium: 'Estádio da Luz',
      country: CountryEnum.PORTUGAL,
      teamPrimaryColor: '#ff0000',
    },
    {
      name: 'Sporting CP',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/e/e1/Sporting_Clube_de_Portugal_%28Logo%29.svg',
      stadium: 'Estádio José Alvalade',
      country: CountryEnum.PORTUGAL,
      teamPrimaryColor: '#078156',
    },
    {
      name: 'SC Braga',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/7/79/S.C._Braga_logo.svg',
      stadium: 'Estádio Municipal de Braga',
      country: CountryEnum.PORTUGAL,
      teamPrimaryColor: '#c9261c',
    },
    {
      name: 'Amarante FC',
      shortName: 'Amarante',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/e/e2/Amarante_FC.png',
      stadium: 'Estádio Municipal de Amarante',
      country: CountryEnum.PORTUGAL,
      teamPrimaryColor: '#000000',
    },
  ],
  [LeagueEnum.BELGIAN_PRO_LEAGUE]: [
    {
      name: 'Club Brugge',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/d/d0/Club_Brugge_KV_logo.svg',
      stadium: 'Jan Breydel Stadium',
      country: CountryEnum.BELGIUM,
      teamPrimaryColor: '#0d5eaf',
    },
  ],
  [LeagueEnum.UKRAINIAN_PREMIER_LEAGUE]: [
    {
      name: 'Shakhtar Donetsk',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a1/FC_Shakhtar_Donetsk.svg',
      stadium: 'Volksparkstadion',
      country: CountryEnum.UKRAINE,
      teamPrimaryColor: '#ed6a01',
    },
    {
      name: 'FK Kolos Kovalivka',
      shortName: 'Kolos',
      stadium: 'Kolos Stadium',
      country: CountryEnum.UKRAINE,
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/31/FCKolos2018.svg',
      teamPrimaryColor: '#000000',
    },
  ],
  [LeagueEnum.SCOTTISH_PREMIERSHIP]: [
    {
      name: 'Celtic',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/7/71/Celtic_FC_crest.svg',
      stadium: 'Celtic Park',
      country: CountryEnum.SCOTLAND,
      teamPrimaryColor: '#008848',
    },
  ],
  [LeagueEnum.AUSTRIAN_BUNDESLIGA]: [
    {
      name: 'Red Bull Salzburg',
      shortName: 'RB Salzburg',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/7/77/FC_Red_Bull_Salzburg_logo.svg',
      stadium: 'Red Bull Arena',
      country: CountryEnum.AUSTRIA,
      teamPrimaryColor: '#d50000',
    },
    {
      name: 'Sturm Graz',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/9/91/SK_Sturm_Graz_logo.svg',
      stadium: 'Merkur Arena',
      country: CountryEnum.AUSTRIA,
      teamPrimaryColor: '#000000',
    },
  ],
  [LeagueEnum.SWISS_SUPER_LEAGUE]: [
    {
      name: 'Young Boys',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/6/6b/BSC_Young_Boys_logo.svg',
      stadium: 'Wankdorf Stadium',
      country: CountryEnum.SWITZERLAND,
      teamPrimaryColor: '#f9e300',
    },
  ],
  [LeagueEnum.CZECH_FIRST_LEAGUE]: [
    {
      name: 'Sparta Prag',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/dd/AC-Sparta-LOGO2021.svg',
      stadium: 'epet ARENA',
      country: CountryEnum.CZECH_REPUBLIC,
      teamPrimaryColor: '#b8282e',
    },
  ],
  [LeagueEnum.CROATIAN_FIRST_FOOTBALL_LEAGUE]: [
    {
      name: 'Dinamo Zagreb',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/73/Dinamo_Zagreb_logo.png',
      stadium: 'Stadion Maksimir',
      country: CountryEnum.CROATIA,
      teamPrimaryColor: '#0047ab',
    },
  ],
  [LeagueEnum.SLOVAK_1_LIGA]: [
    {
      name: 'Slovan Bratislava',
      shortName: 'S. Bratislava',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/01/SK_Slovan_Bratislava_logo.svg',
      stadium: 'Tehelné pole',
      country: CountryEnum.SLOVAKIA,
      teamPrimaryColor: '#2db1e7',
    },
  ],
  [LeagueEnum.SERBIAN_SUPER_LIGA]: [
    {
      name: 'Crvena Zvezda',
      shortName: 'Red Star',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/15/FK_Crvena_Zvezda_Logo.svg',
      stadium: 'Rajko Mitić Stadium',
      country: CountryEnum.SERBIA,
      teamPrimaryColor: '#d50000',
    },
  ],
  [LeagueEnum.AZERBAIJAN_PREMIER_LEAGUE]: [
    {
      name: 'Qarabağ',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/d/d3/Qaraba%C4%9F_FK_logo.png',
      stadium: 'Azersun Arena',
      country: CountryEnum.AZERBAIJAN,
      teamPrimaryColor: '#1b1059',
    },
  ],
  [LeagueEnum.NATIONS]: [
    {
      name: 'England',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/b/be/Flag_of_England.svg',
    },
    {
      name: 'Brasilien',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/0/05/Flag_of_Brazil.svg',
    },
    {
      name: 'Tyskland',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/b/ba/Flag_of_Germany.svg',
    },
    {
      name: 'Belgien',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/65/Flag_of_Belgium.svg',
    },
    {
      name: 'Nederländerna',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Flag_of_the_Netherlands.svg',
    },
    {
      name: 'Frankrike',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/c/c3/Flag_of_France.svg',
    },
    {
      name: 'Spanien',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/9/9a/Flag_of_Spain.svg',
    },
    {
      name: 'Italien',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/0/03/Flag_of_Italy.svg',
    },
    {
      name: 'Argentina',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Flag_of_Argentina.svg',
    },
    {
      name: 'Portugal',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Flag_of_Portugal.svg',
    },
    {
      name: 'Skottland',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/10/Flag_of_Scotland.svg',
    },
    {
      name: 'Norge',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Flag_of_Norway.svg',
    },
    {
      name: 'Danmark',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Flag_of_Denmark.svg',
    },
    {
      name: 'Sverige',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/4/4c/Flag_of_Sweden.svg',
    },
    {
      name: 'Finland',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Flag_of_Finland.svg',
    },
    {
      name: 'Schweiz',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Flag_of_Switzerland_%28Pantone%29.svg',
    },
    {
      name: 'Ukraina',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/49/Flag_of_Ukraine.svg',
    },
    {
      name: 'Norge',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Flag_of_Norway.svg',
    },
    {
      name: 'Österrike',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/41/Flag_of_Austria.svg',
    },
    {
      name: 'Polen',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/1/12/Flag_of_Poland.svg',
    },
    {
      name: 'Ghana',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Flag_of_Ghana.svg',
    },
    {
      name: 'Japan',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/9/9e/Flag_of_Japan.svg',
    },
    {
      name: 'Tjeckien',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Flag_of_the_Czech_Republic.svg',
    },
    {
      name: 'Kroatien',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/Flag_of_Croatia.svg',
    },
    {
      name: 'Slovakien',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Flag_of_Slovakia.svg',
    },
    {
      name: 'Serbien',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Flag_of_Serbia.svg',
    },
    {
      name: 'Azerbajdzjan',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/dd/Flag_of_Azerbaijan.svg',
    },
  ],
};
