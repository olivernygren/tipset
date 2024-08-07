export interface Team {
  name: string;
  logoUrl: string;
  relativeLogoUrl?: string;
  stadium?: string;
}

export enum LeagueEnum {
  PREMIER_LEAGUE = 'Premier League',
  ALLSVENSKAN = 'Allsvenskan',
  LA_LIGA = 'La Liga',
  SERIE_A = 'Serie A',
  BUNDESLIGA = 'Bundesliga',
  LIGUE_1 = 'Ligue 1',
  EREDIVISIE = 'Eredivisie',
  PRIMEIRA_LIGA = 'Primeira Liga',
  NATIONS = 'Landslag',
}

export const getTeamByNameAndLeague = (teamName: string, league: string) => {
  return Teams[league as LeagueEnum].find((team: Team) => team.name === teamName);
}

export const getTeamByName = (teamName: string): Team | undefined => {
  for (const league in Teams) {
    const team = Teams[league as LeagueEnum].find((team: Team) => team.name === teamName);
    if (team) return team;
  }
}

export const Teams = {
  [LeagueEnum.PREMIER_LEAGUE]: [
    {
      name: 'Arsenal',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg',
      stadium: 'Emirates Stadium',
    },
    {
      name: 'Chelsea',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg',
      stadium: 'Stamford Bridge',
    },
    {
      name: 'Liverpool',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg',
      stadium: 'Anfield',
    },
    {
      name: 'Manchester City',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg',
      stadium: 'Etihad Stadium',
    },
    {
      name: 'Manchester United',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg',
      stadium: 'Old Trafford',
    },
    {
      name: 'Tottenham',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg',
      stadium: 'Tottenham Hotspur Stadium',
    },
    {
      name: 'Everton',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/7/7c/Everton_FC_logo.svg',
      stadium: 'Goodison Park',
    },
    {
      name: 'Leicester',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/2/2d/Leicester_City_crest.svg',
      stadium: 'King Power Stadium',
    },
    {
      name: 'West Ham',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/c/c2/West_Ham_United_FC_logo.svg',
      stadium: 'London Stadium',
    },
    {
      name: 'Aston Villa',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9a/Aston_Villa_FC_new_crest.svg/1280px-Aston_Villa_FC_new_crest.svg.png',
      stadium: 'Villa Park',
    },
    {
      name: 'Wolves',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/f/fc/Wolverhampton_Wanderers.svg',
      stadium: 'Molineux Stadium',
    },
    {
      name: 'Southampton',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/c/c9/FC_Southampton.svg',
      stadium: 'St. Mary\'s Stadium',
    },
    {
      name: 'Newcastle',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/5/56/Newcastle_United_Logo.svg',
      stadium: 'St. James\' Park',
    },
    {
      name: 'Crystal Palace',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a2/Crystal_Palace_FC_logo_%282022%29.svg',
      stadium: 'Selhurst Park',
    },
    {
      name: 'Brighton',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/f/fd/Brighton_%26_Hove_Albion_logo.svg',
      stadium: 'AMEX Stadium',
    },
    {
      name: 'Ipswich',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/4/43/Ipswich_Town.svg',
      stadium: 'Portman Road',
    },
    {
      name: 'Nottingham Forest',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/e/e5/Nottingham_Forest_F.C._logo.svg',
      stadium: 'City Ground',
    },
    {
      name: 'Brentford',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/2/2a/Brentford_FC_crest.svg',
      stadium: 'Brentford Community Stadium',
    },
    {
      name: 'Bournemouth',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/e/e5/AFC_Bournemouth_%282013%29.svg',
      stadium: 'Vitality Stadium',
    },
    {
      name: 'Fulham',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/e/eb/Fulham_FC_%28shield%29.svg',
      stadium: 'Craven Cottage',
    },
  ],
  [LeagueEnum.ALLSVENSKAN]: [
    {
      name: 'Djurgården',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Djurgardens_IF_logo.svg',
      stadium: 'Tele2 Arena',
    },
    {
      name: 'Hammarby IF',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0a/Hammarby_IF_logo.svg/1920px-Hammarby_IF_logo.svg.png',
      stadium: 'Tele2 Arena',
    },
    {
      name: 'Malmö FF',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Malmo_FF_logo.svg',
      stadium: 'Eleda Stadion',
    },
    {
      name: 'IFK Göteborg',
      logoUrl: 'https://ifkgoteborg.se/wp-content/uploads/2017/09/IFK-logo.png',
      stadium: 'Gamla Ullevi',
    },
    {
      name: 'AIK',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5f/AIK_logo.svg/1920px-AIK_logo.svg.png',
      stadium: 'Strawberry Arena',
    },
    {
      name: 'IFK Norrköping',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/IFK_Norrkoping_logo.svg',
      stadium: 'PlatinumCars Arena',
    },
    {
      name: 'BK Häcken',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/5/5d/BK_Hacken_logo.svg',
      stadium: 'Bravida Arena',
    },
    {
      name: 'IFK Värnamo',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/1/12/IFK_Varnamo_logo.svg',
      stadium: 'Finnvedsvallen',
    },
    {
      name: 'Kalmar FF',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/a/af/Kalmar_FF_logo.svg',
      stadium: 'Guldfågeln Arena',
    },
    {
      name: 'Elfsborg',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/3/37/IF_Elfsborg_logo.svg',
      stadium: 'Borås Arena',
    },
    {
      name: 'GAIS',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a3/GAIS_logo.svg',
      stadium: 'Gamla Ullevi',
    },
    {
      name: 'Västerås SK',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a0/Vasteras_SK_logo.svg',
      stadium: 'Hitachi Energy Arena',
    },
    {
      name: 'Mjällby',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a5/Mjallby_AIF_logo.svg',
      stadium: 'Strandvallen',
    },
    {
      name: 'Halmstad BK',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/6/66/Halmstad_BK_logo.svg',
      stadium: 'Örjans Vall',
    },
    {
      name: 'IK Sirius',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/c/cf/IK_Sirius_logo.svg',
      stadium: 'Studenternas IP',
    },
    {
      name: 'Brommapojkarna',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/2/20/IF_Brommapojkarna_logo.svg',
      stadium: 'Grimsta IP',
    }
  ],
  [LeagueEnum.LA_LIGA]: [
    {
      name: 'Real Madrid',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg',
      stadium: 'Santiago Bernabéu',
    },
    {
      name: 'FC Barcelona',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg',
      stadium: 'Camp Nou',
    },
    {
      name: 'Atletico Madrid',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/f/f9/Atletico_Madrid_Logo_2024.svg',
      stadium: 'Wanda Metropolitano',
    },
    {
      name: 'Sevilla',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/3/3b/Sevilla_FC_logo.svg',
      stadium: 'Ramón Sánchez Pizjuán',
    },
    {
      name: 'Valencia',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/c/ce/Valenciacf.svg',
      stadium: 'Mestalla',
    },
    {
      name: 'Real Sociedad',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/f/f1/Real_Sociedad_logo.svg',
      stadium: 'Estadio Anoeta',
    },
    {
      name: 'Villarreal',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/b/b9/Villarreal_CF_logo-en.svg',
      stadium: 'Estadio de la Cerámica',
    },
    {
      name: 'Real Betis',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/1/13/Real_betis_logo.svg',
      stadium: 'Estadio Benito Villamarín',
    },
    {
      name: 'Athletic Bilbao',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/9/98/Club_Athletic_Bilbao_logo.svg',
      stadium: 'Estadio San Mamés',
    },
  ],
  [LeagueEnum.SERIE_A]: [
    {
      name: 'Juventus',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Juventus_FC_-_pictogram_black_%28Italy%2C_2017%29.svg',
      stadium: 'Allianz Stadium',
    },
    {
      name: 'Inter',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg',
      stadium: 'Giuseppe Meazza',
    },
    {
      name: 'AC Milan',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg',
      stadium: 'San Siro',
    },
    {
      name: 'AS Roma',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/f/f7/AS_Roma_logo_%282017%29.svg',
      stadium: 'Stadio Olimpico',
    },
    {
      name: 'Napoli',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ed/SSC_Napoli_2007.svg',
      stadium: 'Stadio Diego Armando Maradona',
    },
    {
      name: 'Lazio',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/c/ce/S.S._Lazio_badge.svg',
      stadium: 'Stadio Olimpico',
    },
    {
      name: 'Fiorentina',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/ACF_Fiorentina_-_logo_%28Italy%2C_2022%29.svg',
      stadium: 'Stadio Artemio Franchi',
    },
    {
      name: 'Atalanta',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/6/66/AtalantaBC.svg',
      stadium: 'Gewiss Stadium',
    },
    {
      name: 'Bologna',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Bologna_F.C._1909_logo.svg',
      stadium: 'Stadio Renato Dall\'Ara',
    }
  ],
  [LeagueEnum.BUNDESLIGA]: [
    {
      name: 'Bayern München',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg',
      stadium: 'Allianz Arena',
    },
    {
      name: 'Borussia Dortmund',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg',
      stadium: 'Signal Iduna Park',
    },
    {
      name: 'RB Leipzig',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/0/04/RB_Leipzig_2014_logo.svg',
      stadium: 'Red Bull Arena',
    },
    {
      name: 'Bayer Leverkusen',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/5/59/Bayer_04_Leverkusen_logo.svg',
      stadium: 'BayArena',
    },
    {
      name: 'Eintracht Frankfurt',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Eintracht_Frankfurt_Logo.svg',
      stadium: 'Deutsche Bank Park',
    },
    {
      name: 'VfB Stuttgart',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/VfB_Stuttgart_1893_Logo.svg',
      stadium: 'Mercedes-Benz Arena',
    },
  ],
  [LeagueEnum.LIGUE_1]: [
    {
      name: 'Paris Saint-Germain',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg',
      stadium: 'Parc des Princes',
    },
    {
      name: 'Lyon',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/1/1c/Olympique_Lyonnais_logo.svg',
      stadium: 'Groupama Stadium',
    },
    {
      name: 'Marseille',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d8/Olympique_Marseille_logo.svg',
      stadium: 'Stade Vélodrome',
    },
    {
      name: 'AS Monaco',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/c/cf/LogoASMonacoFC2021.svg',
      stadium: 'Stade Louis II',
    },
  ],
  [LeagueEnum.EREDIVISIE]: [
    {
      name: 'Ajax',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/7/79/Ajax_Amsterdam.svg',
      stadium: 'Johan Cruyff Arena',
    },
    {
      name: 'PSV',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/0/05/PSV_Eindhoven.svg',
      stadium: 'Philips Stadion',
    },
    {
      name: 'Feyenoord',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Feyenoord_logo_since_2009.svg',
      stadium: 'De Kuip',
    },
  ],
  [LeagueEnum.PRIMEIRA_LIGA]: [
    {
      name: 'Porto',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/f/f1/FC_Porto.svg',
      stadium: 'Estádio do Dragão',
    },
    {
      name: 'Benfica',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a2/SL_Benfica_logo.svg',
      stadium: 'Estádio da Luz',
    },
    {
      name: 'Sporting CP',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/e/e1/Sporting_Clube_de_Portugal_%28Logo%29.svg',
      stadium: 'Estádio José Alvalade',
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
    }
  ]
};