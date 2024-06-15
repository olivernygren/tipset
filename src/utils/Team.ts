export interface Team {
  name: string;
  logoUrl: string;
  relativeLogoUrl?: string;
}

export enum LeagueEnum {
  PREMIER_LEAGUE = 'PREMIER_LEAGUE',
  ALLSVENSKAN = 'ALLSVENSKAN',
}

export const Teams = {
  [LeagueEnum.PREMIER_LEAGUE]: [
    {
      name: 'Arsenal',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg',
    },
    {
      name: 'Chelsea',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg',
    },
    {
      name: 'Liverpool',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg',
    },
    {
      name: 'Manchester City',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg',
    },
    {
      name: 'Manchester United',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg',
    },
    {
      name: 'Tottenham',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg',
    },
    {
      name: 'Everton',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/7/7c/Everton_FC_logo.svg',
    },
    {
      name: 'Leicester',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/2/2d/Leicester_City_crest.svg',
    },
    {
      name: 'West Ham',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/c/c2/West_Ham_United_FC_logo.svg',
    },
    {
      name: 'Aston Villa',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/9/9f/Aston_Villa_FC_crest.svg',
    },
    {
      name: 'Wolves',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/f/fc/Wolverhampton_Wanderers.svg',
    },
    {
      name: 'Southampton',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/c/c9/FC_Southampton.svg',
    },
    {
      name: 'Newcastle',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/5/56/Newcastle_United_Logo.svg',
    },
    {
      name: 'Crystal Palace',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/0/0c/Crystal_Palace_FC_logo.svg',
    },
    {
      name: 'Brighton',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/f/fd/Brighton_%26_Hove_Albion_logo.svg',
    },
    {
      name: 'Ipswich',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/6/67/Ipswich_Town.svg',
    },
    {
      name: 'Nottingham Forest',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/5/5c/Nottingham_Forest_logo.svg',
    },
    {
      name: 'Brentford',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/5/5c/Brentford_FC_crest.svg',
    },
    {
      name: 'Bournemouth',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/e/e5/AFC_Bournemouth_%282013%29.svg',
    },
    {
      name: 'Fulham',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/e/eb/Fulham_FC_%28shield%29.svg',
    },
  ],
  [LeagueEnum.ALLSVENSKAN]: [
    {
      name: 'Djurgården',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/0/0c/Djurg%C3%A5rdens_IF_logo.svg',
    },
    {
      name: 'Hammarby IF',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0a/Hammarby_IF_logo.svg/1920px-Hammarby_IF_logo.svg.png',
    },
    {
      name: 'Malmö FF',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/1/1b/Malm%C3%B6_FF_logo.svg',
    },
    {
      name: 'IFK Göteborg',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/4/4c/IFK_G%C3%B6teborg_logo.svg',
    },
    {
      name: 'AIK',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5f/AIK_logo.svg/1920px-AIK_logo.svg.png',
    },
    {
      name: 'IFK Norrköping',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/3/3e/IFK_Norrk%C3%B6ping_logo.svg',
    },
    {
      name: 'BK Häcken',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/8/8d/BK_H%C3%A4cken_logo.svg',
    },
    {
      name: 'IFK Värnamo',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/8/8f/%C3%96rebro_SK_logo.svg',
    },
    {
      name: 'Kalmar FF',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/4/4d/Kalmar_FF_logo.svg',
    },
    {
      name: 'Elfsborg',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/4/4d/IF_Elfsborg_logo.svg',
    },
    {
      name: 'GAIS',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/2/2d/GAIS_logo.svg',
    },
    {
      name: 'Västerås SK',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/3/3d/V%C3%A4ster%C3%A5s_SK_logo.svg',
    },
    {
      name: 'Mjällby',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/4/4d/Mj%C3%A4llby_AIF_logo.svg',
    },
    {
      name: 'Halmstad BK',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/4/4d/Halmstads_BK_logo.svg',
    },
    {
      name: 'IK Sirius',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/4/4d/IK_Sirius_logo.svg',
    },
    {
      name: 'Brommapojkarna',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/4/4d/IF_Brommapojkarna_logo.svg',
    }
  ]
}

export const getTeamByName = (teamName: string, league: string) => {
  return Teams[league as LeagueEnum].find(team => team.name === teamName);
}