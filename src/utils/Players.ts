export enum ExactPositionEnum {
  GK = 'GK',
  RB = 'RB',
  CB = 'CB',
  LB = 'LB',
  CDM = 'CDM',
  CM = 'CM',
  CAM = 'CAM',
  RM = 'RM',
  LM = 'LM',
  RW = 'RW',
  LW = 'LW',
  ST = 'ST',
}

export enum GeneralPositionEnum {
  GK = 'Goalkeeper',
  DF = 'Defender',
  MF = 'Midfielder',
  FW = 'Forward',
}

export enum CountryEnum {
  ENGLAND = 'England',
  SPAIN = 'Spain',
  BRAZIL = 'Brazil',
  JAPAN = 'Japan',
  UKRAINE = 'Ukraine',
  BELGIUM = 'Belgium',
  PORTUGAL = 'Portugal',
  GHANA = 'Ghana',
  NETHERLANDS = 'Netherlands',
  FRANCE = 'France',
  SWITZERLAND = 'Switzerland',
  SCOTLAND = 'Scotland',
  POLAND = 'Poland',
  NORWAY = 'Norway',
  GERMANY = 'Germany',
  IVORY_COAST = 'Ivory Coast',
  AUSTRIA = 'Austria',
  ARGENTINA = 'Argentina',
  NIGERIA = 'Nigeria',
  DENMARK = 'Denmark',
  ITALY = 'Italy',
  WALES = 'Wales',
  CZECH_REPUBLIC = 'Czech Republic',
  FINLAND = 'Finland',
  SWEDEN = 'Sweden',
  URUGUAY = 'Uruguay',
  MEXICO = 'Mexico',
  USA = 'USA',
  CROATIA = 'Croatia',
  SERBIA = 'Serbia',
  TURKEY = 'Turkey',
  EGYPT = 'Egypt',
  SENEGAL = 'Senegal',
  AUSTRALIA = 'Australia',
  CAMEROON = 'Cameroon',
  COLOMBIA = 'Colombia',
  COSTA_RICA = 'Costa Rica',
  ECUADOR = 'Ecuador',
  GREECE = 'Greece',
  HONDURAS = 'Honduras',
  ICELAND = 'Iceland',
  IRAN = 'Iran',
  IRELAND = 'Ireland',
  JAMAICA = 'Jamaica',
  MOROCCO = 'Morocco',
  NEW_ZEALAND = 'New Zealand',
  PANAMA = 'Panama',
  PERU = 'Peru',
  SAUDI_ARABIA = 'Saudi Arabia',
  SOUTH_AFRICA = 'South Africa',
  SOUTH_KOREA = 'South Korea',
  SLOVAKIA = 'Slovakia',
  SLOVENIA = 'Slovenia',
  MONTENEGRO = 'Montenegro',
  NORTH_MACEDONIA = 'North Macedonia',
  TUNISIA = 'Tunisia',
  RUSSIA = 'Russia',
  MOLDOVA = 'Moldova',
  ESTONIA = 'Estonia',
}


export interface Player {
  id: string
  name: string;
  position: {
    exact: ExactPositionEnum;
    general: GeneralPositionEnum;
  };
  number: number;
  age: number;
  country: CountryEnum;
}

export const getPlayersByGeneralPosition = (generalPosition: GeneralPositionEnum): Array<Player> => {
  return ArsenalPlayers.filter((player) => player.position.general === generalPosition);
}

export const getPlayerById = (id: string): Player | undefined => {
  return ArsenalPlayers.find((player) => player.id === id);
}

export const getAgeByBirthDate = (birthDate: string): number => {
  const today = new Date();
  const birthDateObj = new Date(birthDate);
  let age = today.getFullYear() - birthDateObj.getFullYear();
  const month = today.getMonth() - birthDateObj.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < birthDateObj.getDate())) {
    age--;
  }
  return age;
};

export enum ArsenalPlayersEnum {
  DAVID_RAYA = 'David Raya',
  AARON_RAMSDALE = 'Aaron Ramsdale',
  KARL_HEIN = 'Karl Hein',
  BEN_WHITE = 'Ben White',
  TAKEHIRO_TOMIYASU = 'Takehiro Tomiyasu',
  JURRIEN_TIMBER = 'Jurrien Timber',
  GABRIEL_MAGALHAES = 'Gabriel Magalhães',
  WILLAIM_SALIBA = 'William Saliba',
  JAKUB_KIWIOR = 'Jakub Kiwior',
  OLEKSANDR_ZINCHENKO = 'Oleksandr Zinchenko',
  KIERAN_TIERNEY = 'Kieran Tierney',
  NUNO_TAVARES = 'Nuno Tavares',
  THOMAS_PARTEY = 'Thomas Partey',
  DECLAN_RICE = 'Declan Rice',
  ALBERT_SAMBI_LOKONGA = 'Albert Sambi Lokonga',
  JORGINHO = 'Jorginho',
  FABIO_VIEIRA = 'Fabio Vieira',
  EMILE_SMITH_ROWE = 'Emile Smith Rowe',
  MARTIN_ODEGAARD = 'Martin Ødegaard',
  BUKAYO_SAKA = 'Bukayo Saka',
  REISS_NELSON = 'Reiss Nelson',
  GABRIEL_MARTINELLI = 'Gabriel Martinelli',
  LEANDRO_TROSSARD = 'Leandro Trossard',
  KAI_HAVERTZ = 'Kai Havertz',
  GABRIEL_JESUS = 'Gabriel Jesus',
  EDDIE_NKETIAH = 'Eddie Nketiah',
}

export enum IFKGoteborgPlayersEnum {
  PONTUS_DAHLBERG = 'Pontus Dahlberg',
  ADAM_BENEDIKTSSON = 'Adam Benediktsson',
  ELIS_BISHESARI = 'Elis Bishesari',
  ANDERS_KRISTIANSEN = 'Anders Kristiansen',
  EMIL_SALOMONSSON = 'Emil Salomonsson',
  SEBASTIAN_OHLSSON = 'Sebastian Ohlsson',
  GUSTAV_SVENSSON = 'Gustav Svensson',
  SEBASTIAN_HAUSNER = 'Sebastian Hausner',
  ADAM_CARLEN = 'Adam Carlén',
  ANDERS_TRONDSEN = 'Anders Trondsen',
  OSCAR_WENDT = 'Oscar Wendt',
  KOLBEINN_THORDARSON = 'Kolbeinn Thordarson',
  MALICK_YALCOUYE = 'Malick Yalcouyé',
  ABUNDANCE_SALAOU = 'Abundance Salaou',
  LUCAS_KAHED = 'Lucas Kåhed',
  BENJAMIN_BRANTLIND = 'Benjamin Brantlind',
  HUSSEIN_CARNEIL = 'Hussein Carneil',
  THOMAS_SANTOS = 'Thomas Santos',
  OSCAR_PETTERSSON = 'Oscar Pettersson',
  ARBNOR_MUCOLLI = 'Arbnor Mucolli',
  GUSTAF_NORLIN = 'Gustaf Norlin',
  PAULOS_ABRAHAM = 'Paulos Abraham',
  SULEIMAN_ABDULLAHI = 'Suleiman Abdullahi',
  LINUS_CARLSTRAND = 'Linus Carlstrand',
  LAURS_SKJELLERUP = 'Laurs Skjellerup',
}

export const ArsenalPlayers: Array<Player> = [
  {
    id: '84gfow9fhwofh8owrh9',
    name: ArsenalPlayersEnum.DAVID_RAYA,
    position: {
      exact: ExactPositionEnum.GK,
      general: GeneralPositionEnum.GK,
    },
    number: 22,
    age: 28,
    country: CountryEnum.SPAIN,
  },
  {
    id: 'e8fg8wgr4hrw9frtw9hd',
    name: ArsenalPlayersEnum.AARON_RAMSDALE,
    position: {
      exact: ExactPositionEnum.GK,
      general: GeneralPositionEnum.GK,
    },
    number: 1,
    age: 26,
    country: CountryEnum.ENGLAND,
  },
  {
    id: 'uewbfouwr48of938hf93',
    name: ArsenalPlayersEnum.KARL_HEIN,
    position: {
      exact: ExactPositionEnum.GK,
      general: GeneralPositionEnum.GK,
    },
    number: 31,
    age: 22,
    country: CountryEnum.ESTONIA,
  },
  {
    id: '8f9w8f9w8f9w8f9w8f9w8',
    name: ArsenalPlayersEnum.WILLAIM_SALIBA,
    position: {
      exact: ExactPositionEnum.CB,
      general: GeneralPositionEnum.DF,
    },
    number: 2,
    age: 23,
    country: CountryEnum.FRANCE,
  }, 
  {
    id: 'defb8rgb9fbf0fhwh34r',
    name: ArsenalPlayersEnum.BEN_WHITE,
    position: {
      exact: ExactPositionEnum.RB,
      general: GeneralPositionEnum.DF,
    },
    number: 4,
    age: 26,
    country: CountryEnum.ENGLAND,
  }, 
  {
    id: 'jdb38fg9fhwwh9wfhw0fe',
    name: ArsenalPlayersEnum.TAKEHIRO_TOMIYASU,
    position: {
      exact: ExactPositionEnum.RB,
      general: GeneralPositionEnum.DF,
    },
    number: 18,
    age: 25,
    country: CountryEnum.JAPAN,
  }, {
    id: 'fhwefh9hrrh94ofof',
    name: ArsenalPlayersEnum.JURRIEN_TIMBER,
    position: {
      exact: ExactPositionEnum.LB,
      general: GeneralPositionEnum.DF,
    },
    number: 12,
    age: 22,
    country: CountryEnum.NETHERLANDS,
  }, 
  {
    id: 'moehg9n0h01rh0fhfdk',
    name: ArsenalPlayersEnum.GABRIEL_MAGALHAES,
    position: {
      exact: ExactPositionEnum.CB,
      general: GeneralPositionEnum.DF,
    },
    number: 6,
    age: 26,
    country: CountryEnum.BRAZIL,
  }, 
  {
    id: 'g8h9e8g4eg98eg7seg0fegr',
    name: ArsenalPlayersEnum.JAKUB_KIWIOR,
    position: {
      exact: ExactPositionEnum.CB,
      general: GeneralPositionEnum.DF,
    },
    number: 15,
    age: 24,
    country: CountryEnum.POLAND,
  }, {
    id: 'nw8fgwfbnoqr03r93hnof',
    name: ArsenalPlayersEnum.OLEKSANDR_ZINCHENKO,
    position: {
      exact: ExactPositionEnum.LB,
      general: GeneralPositionEnum.DF,
    },
    number: 35,
    age: 27,
    country: CountryEnum.UKRAINE,
  }, 
  {
    id: '3r6eegh129r29r1odhdmed',
    name: ArsenalPlayersEnum.THOMAS_PARTEY,
    position: {
      exact: ExactPositionEnum.CDM,
      general: GeneralPositionEnum.MF,
    },
    number: 5,
    age: 30,
    country: CountryEnum.GHANA,
  }, 
  {
    id: '39rj2j10rw9gn9rnwenw2j',
    name: ArsenalPlayersEnum.DECLAN_RICE,
    position: {
      exact: ExactPositionEnum.CDM,
      general: GeneralPositionEnum.MF,
    },
    number: 41,
    age: 25,
    country: CountryEnum.ENGLAND,
  }, 
  {
    id: 'ge732fr72rgugbutg0u9w',
    name: ArsenalPlayersEnum.ALBERT_SAMBI_LOKONGA,
    position: {
      exact: ExactPositionEnum.CM,
      general: GeneralPositionEnum.MF,
    },
    number: 23,
    age: 24,
    country: CountryEnum.BELGIUM,
  }, 
  {
    id: 'ne3yfr8ehfengw9itohq3',
    name: ArsenalPlayersEnum.JORGINHO,
    position: {
      exact: ExactPositionEnum.CM,
      general: GeneralPositionEnum.MF,
    },
    number: 20,
    age: 32,
    country: CountryEnum.ITALY,
  }, 
  {
    id: 'rh27tg9fofh9w4ghnfoif',
    name: ArsenalPlayersEnum.FABIO_VIEIRA,
    position: {
      exact: ExactPositionEnum.CAM,
      general: GeneralPositionEnum.MF,
    },
    number: 21,
    age: 24,
    country: CountryEnum.PORTUGAL,
  }, 
  {
    id: 'fnwbgwjqekq0r0wpekpj',
    name: ArsenalPlayersEnum.EMILE_SMITH_ROWE,
    position: {
      exact: ExactPositionEnum.CAM,
      general: GeneralPositionEnum.MF,
    },
    number: 10,
    age: 23,
    country: CountryEnum.ENGLAND,
  }, 
  {
    id: 'mwokepoe2yr4wr8yr4owru',
    name: ArsenalPlayersEnum.MARTIN_ODEGAARD,
    position: {
      exact: ExactPositionEnum.CAM,
      general: GeneralPositionEnum.MF,
    },
    number: 8,
    age: 25,
    country: CountryEnum.NORWAY,
  }, 
  {
    id: 'cbwgr8h90ejqrjwf8gwrf',
    name: ArsenalPlayersEnum.BUKAYO_SAKA,
    position: {
      exact: ExactPositionEnum.RW,
      general: GeneralPositionEnum.FW,
    },
    number: 7,
    age: 22,
    country: CountryEnum.ENGLAND,
  }, 
  {
    id: '83rtgfjwheg9heo9rowdw',
    name: ArsenalPlayersEnum.REISS_NELSON,
    position: {
      exact: ExactPositionEnum.RW,
      general: GeneralPositionEnum.FW,
    },
    number: 24,
    age: 24,
    country: CountryEnum.ENGLAND,
  }, {
    id: 'fhty9ejpqrnoiwthrhj',
    name: ArsenalPlayersEnum.GABRIEL_MARTINELLI,
    position: {
      exact: ExactPositionEnum.LW,
      general: GeneralPositionEnum.FW,
    },
    number: 11,
    age: 22,
    country: CountryEnum.BRAZIL,
  }, 
  {
    id: 'qfujw0jw0rj90g3pork3po3',
    name: ArsenalPlayersEnum.LEANDRO_TROSSARD,
    position: {
      exact: ExactPositionEnum.LW,
      general: GeneralPositionEnum.FW,
    },
    number: 19,
    age: 29,
    country: CountryEnum.BELGIUM,
  }, {
    id: '30jtgeifnqorhgwowjj9d',
    name: ArsenalPlayersEnum.KAI_HAVERTZ,
    position: {
      exact: ExactPositionEnum.ST,
      general: GeneralPositionEnum.FW,
    },
    number: 29,
    age: 25,
    country: CountryEnum.GERMANY,
  }, 
  {
    id: 'bgwehroqnrbuwbuiwnfwifbe',
    name: ArsenalPlayersEnum.GABRIEL_JESUS,
    position: {
      exact: ExactPositionEnum.ST,
      general: GeneralPositionEnum.FW,
    },
    number: 9,
    age: 27,
    country: CountryEnum.BRAZIL,
  }, 
  {
    id: 'v14se6fvewhwe9rgqrh9',
    name: ArsenalPlayersEnum.EDDIE_NKETIAH,
    position: {
      exact: ExactPositionEnum.ST,
      general: GeneralPositionEnum.FW,
    },
    number: 14,
    age: 25,
    country: CountryEnum.ENGLAND,
  }
];

export const IFKGoteborgPlayers: Array<Player> = [
  {
    id: '3r9h39tf03ht03hfi',
    name: IFKGoteborgPlayersEnum.PONTUS_DAHLBERG,
    position: {
      exact: ExactPositionEnum.GK,
      general: GeneralPositionEnum.GK,
    },
    number: 1,
    age: getAgeByBirthDate('1999-01-21'),
    country: CountryEnum.SWEDEN,
  },
  {
    id: 'gh9rgbberofv34hoigf3goh',
    name: IFKGoteborgPlayersEnum.ADAM_BENEDIKTSSON,
    position: {
      exact: ExactPositionEnum.GK,
      general: GeneralPositionEnum.GK,
    },
    number: 12,
    age: getAgeByBirthDate('2002-10-28'),
    country: CountryEnum.ICELAND,
  },
  {
    id: 'gnrhwgf94wnfgpff4hgpgo',
    name: IFKGoteborgPlayersEnum.ELIS_BISHESARI,
    position: {
      exact: ExactPositionEnum.GK,
      general: GeneralPositionEnum.GK,
    },
    number: 25,
    age: getAgeByBirthDate('2005-05-09'),
    country: CountryEnum.SWEDEN,
  },
  {
    id: 'gnrhwgf94wnfgpff4hgpgo',
    name: IFKGoteborgPlayersEnum.ANDERS_KRISTIANSEN,
    position: {
      exact: ExactPositionEnum.GK,
      general: GeneralPositionEnum.GK,
    },
    number: 34,
    age: getAgeByBirthDate('1990-03-17'),
    country: CountryEnum.NORWAY,
  },
];