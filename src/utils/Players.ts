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
  SPAIN = 'Spanien',
  BRAZIL = 'Brasilien',
  JAPAN = 'Japan',
  UKRAINE = 'Ukraina',
  BELGIUM = 'Belgien',
  PORTUGAL = 'Portugal',
  GHANA = 'Ghana',
  NETHERLANDS = 'Nederländerna',
  FRANCE = 'Frankrike',
  SWITZERLAND = 'Schweiz',
  SCOTLAND = 'Skottland',
  POLAND = 'Polen',
  NORWAY = 'Norge',
  GERMANY = 'Tyskland',
  IVORY_COAST = 'Elfenbenskusten',
  AUSTRIA = 'Österrike',
  ARGENTINA = 'Argentina',
  NIGERIA = 'Nigeria',
  DENMARK = 'Danmark',
  ITALY = 'Italien',
  WALES = 'Wales',
  CZECH_REPUBLIC = 'Tjeckien',
  FINLAND = 'Finland',
  SWEDEN = 'Sverige',
  URUGUAY = 'Uruguay',
  MEXICO = 'Mexiko',
  USA = 'USA',
  CROATIA = 'Kroatien',
  SERBIA = 'Serbien',
  TURKEY = 'Turkiet',
  EGYPT = 'Egypten',
  SENEGAL = 'Senegal',
  AUSTRALIA = 'Australien',
  CAMEROON = 'Kamreun',
  COLOMBIA = 'Colombia',
  COSTA_RICA = 'Costa Rica',
  ECUADOR = 'Ecuador',
  GREECE = 'Grekland',
  HONDURAS = 'Honduras',
  ICELAND = 'Island',
  IRAN = 'Iran',
  IRELAND = 'Irland',
  JAMAICA = 'Jamaica',
  MOROCCO = 'Marocko',
  NEW_ZEALAND = 'Nya Zealand',
  PANAMA = 'Panama',
  PERU = 'Peru',
  SAUDI_ARABIA = 'Saudiarabien',
  SOUTH_AFRICA = 'Sydafrika',
  SOUTH_KOREA = 'Sydkorea',
  SLOVAKIA = 'Slovakien',
  SLOVENIA = 'Slovenien',
  MONTENEGRO = 'Montenegro',
  NORTH_MACEDONIA = 'Nordmakedonien',
  TUNISIA = 'Tunisien',
  RUSSIA = 'Ryssland',
  MOLDOVA = 'Moldavien',
  ESTONIA = 'Estland',
  AZERBAIJAN = 'Azerbajdzjan',
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
  picture?: string;
  isInjured?: boolean;
  mayBeInjured?: boolean;
  isSuspended?: boolean;
}

export interface PlayerRating {
  documentId: string;
  playerId: string;
  playerName: string;
  startingAppearances: number;
  substituteAppearances: number;
  goals: number;
  assists: number;
  ratings: Array<Rating>;
  team: string;
}

export interface Rating {
  opponent: string;
  date: string;
  rating: number;
}

export interface PlayerRatingInput {
  playerId: string;
  playerName: string;
  startingAppearances: number;
  substituteAppearances: number;
  goals: number;
  assists: number;
  ratings: Array<RatingInput>;
  team: string;
}

export interface RatingInput {
  opponent: string;
  date: string;
  rating: number;
}

export const getPlayersByGeneralPosition = (generalPosition: GeneralPositionEnum): Array<Player> => ArsenalPlayers.filter((player) => player.position.general === generalPosition);

export const getPlayerById = (id: string): Player | undefined => ArsenalPlayers.find((player) => player.id === id);

export const getAgeByBirthDate = (birthDate: string): number => {
  const today = new Date();
  const birthDateObj = new Date(birthDate);
  let age = today.getFullYear() - birthDateObj.getFullYear();
  const month = today.getMonth() - birthDateObj.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < birthDateObj.getDate())) {
    // eslint-disable-next-line no-plusplus
    age--;
  }
  return age;
};

export enum ArsenalPlayersEnum {
  DAVID_RAYA = 'David Raya',
  NETO = 'Neto',
  KARL_HEIN = 'Karl Hein',
  TOMMY_SETFORD = 'Tommy Setford',
  BEN_WHITE = 'Ben White',
  TAKEHIRO_TOMIYASU = 'Takehiro Tomiyasu',
  JURRIEN_TIMBER = 'Jurrien Timber',
  GABRIEL_MAGALHAES = 'Gabriel Magalhães',
  RICCARDO_CALAFIORI = 'Riccardo Calafiori',
  WILLIAM_SALIBA = 'William Saliba',
  JAKUB_KIWIOR = 'Jakub Kiwior',
  OLEKSANDR_ZINCHENKO = 'Oleksandr Zinchenko',
  KIERAN_TIERNEY = 'Kieran Tierney',
  MYLES_LEWIS_SKELLY = 'Myles Lewis-Skelly',
  THOMAS_PARTEY = 'Thomas Partey',
  DECLAN_RICE = 'Declan Rice',
  JORGINHO = 'Jorginho',
  MIKEL_MERINO = 'Mikel Merino',
  SALAH_EDDINE_OULAD_MHAND = 'Salah-Eddine Oulad M’Hand',
  ETHAN_NWANERI = 'Ethan Nwaneri',
  // FABIO_VIEIRA = 'Fabio Vieira',
  MARTIN_ODEGAARD = 'Martin Ødegaard',
  BUKAYO_SAKA = 'Bukayo Saka',
  RAHEEM_STERLING = 'Raheem Sterling',
  // REISS_NELSON = 'Reiss Nelson',
  GABRIEL_MARTINELLI = 'Gabriel Martinelli',
  LEANDRO_TROSSARD = 'Leandro Trossard',
  KAI_HAVERTZ = 'Kai Havertz',
  GABRIEL_JESUS = 'Gabriel Jesus',
}

export enum IFKGoteborgPlayersEnum {
  PONTUS_DAHLBERG = 'Pontus Dahlberg',
  JACOB_KARLSTROM = 'Jacob Karlström',
  ELIS_BISHESARI = 'Elis Bishesari',
  ANDERS_KRISTIANSEN = 'Anders Kristiansen',
  EMIL_SALOMONSSON = 'Emil Salomonsson',
  SEBASTIAN_OHLSSON = 'Sebastian Ohlsson',
  GUSTAV_SVENSSON = 'Gustav Svensson',
  JONAS_BAGER = 'Jonas Bager',
  ROCKSON_YEBOAH = 'Rockson Yeboah',
  AUGUST_ERLINGMARK = 'August Erlingmark',
  ANDERS_TRONDSEN = 'Anders Trondsen',
  OSCAR_WENDT = 'Oscar Wendt',
  ADAM_CARLEN = 'Adam Carlén',
  KOLBEINN_THORDARSON = 'Kolbeinn Thordarson',
  DAVID_KRUSE = 'David Kruse',
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
  NIKOLAI_BADEN = 'Nikolai Baden',
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
    picture: '/images/players/david-raya.png',
  },
  {
    id: 'rh924ghrt42ihnfro2rhty43o8',
    name: ArsenalPlayersEnum.NETO,
    position: {
      exact: ExactPositionEnum.GK,
      general: GeneralPositionEnum.GK,
    },
    number: 32,
    age: 35,
    country: CountryEnum.BRAZIL,
    picture: '/images/players/neto.png',
  },
  {
    id: 'ht943hnrwo48ho49ohin',
    name: ArsenalPlayersEnum.TOMMY_SETFORD,
    position: {
      exact: ExactPositionEnum.GK,
      general: GeneralPositionEnum.GK,
    },
    number: 36,
    age: getAgeByBirthDate('2006-03-13'),
    country: CountryEnum.NETHERLANDS,
    picture: '/images/players/tom-setford.png',
  },
  // {
  //   id: 'uewbfouwr48of938hf93',
  //   name: ArsenalPlayersEnum.KARL_HEIN,
  //   position: {
  //     exact: ExactPositionEnum.GK,
  //     general: GeneralPositionEnum.GK,
  //   },
  //   number: 31,
  //   age: 22,
  //   country: CountryEnum.ESTONIA,
  // },
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
    picture: '/images/players/ben-white.png',
    isInjured: true,
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
    picture: '/images/players/takehiro-tomiyasu.png',
    mayBeInjured: true,
  },
  {
    id: 'fhwefh9hrrh94ofof',
    name: ArsenalPlayersEnum.JURRIEN_TIMBER,
    position: {
      exact: ExactPositionEnum.LB,
      general: GeneralPositionEnum.DF,
    },
    number: 12,
    age: 22,
    country: CountryEnum.NETHERLANDS,
    picture: '/images/players/jurrien-timber.png',
  },
  {
    id: '8f9w8f9w8f9w8f9w8f9w8',
    name: ArsenalPlayersEnum.WILLIAM_SALIBA,
    position: {
      exact: ExactPositionEnum.CB,
      general: GeneralPositionEnum.DF,
    },
    number: 2,
    age: 23,
    country: CountryEnum.FRANCE,
    picture: '/images/players/william-saliba.png',
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
    picture: '/images/players/gabriel-magalhaes.png',
  },
  {
    id: 'h7fhghgw08hn3gh4b3p0fj309h',
    name: ArsenalPlayersEnum.RICCARDO_CALAFIORI,
    position: {
      exact: ExactPositionEnum.CB,
      general: GeneralPositionEnum.DF,
    },
    number: 33,
    age: getAgeByBirthDate('2002-05-19'),
    country: CountryEnum.ITALY,
    picture: '/images/players/riccardo-calafiori.png',
    mayBeInjured: true,
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
    picture: '/images/players/jakub-kiwior.png',
  },
  {
    id: 'nw8fgwfbnoqr03r93hnof',
    name: ArsenalPlayersEnum.OLEKSANDR_ZINCHENKO,
    position: {
      exact: ExactPositionEnum.LB,
      general: GeneralPositionEnum.DF,
    },
    number: 35,
    age: 27,
    country: CountryEnum.UKRAINE,
    picture: '/images/players/oleksandr-zinchenko.png',
  },
  {
    id: 'rewfgogengoengoribirg84r',
    name: ArsenalPlayersEnum.KIERAN_TIERNEY,
    position: {
      exact: ExactPositionEnum.LB,
      general: GeneralPositionEnum.DF,
    },
    number: 3,
    age: getAgeByBirthDate('1997-06-05'),
    country: CountryEnum.SCOTLAND,
    picture: '/images/players/kieran-tierney.png',
    isInjured: true,
  },
  {
    id: '248tgegh0rhq3rijw3ogt0ert',
    name: ArsenalPlayersEnum.MYLES_LEWIS_SKELLY,
    position: {
      exact: ExactPositionEnum.LB,
      general: GeneralPositionEnum.DF,
    },
    number: 49,
    age: getAgeByBirthDate('2006-09-26'),
    country: CountryEnum.ENGLAND,
    picture: '/images/players/myles-lewis-skelly.png',
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
    picture: '/images/players/thomas-partey.png',
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
    picture: '/images/players/declan-rice.png',
    mayBeInjured: true,
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
    picture: '/images/players/jorginho.png',
  },
  {
    id: 'ghi9q3hf84y98hr489dw',
    name: ArsenalPlayersEnum.MIKEL_MERINO,
    position: {
      exact: ExactPositionEnum.CM,
      general: GeneralPositionEnum.MF,
    },
    number: 23,
    age: getAgeByBirthDate('1996-06-22'),
    country: CountryEnum.SPAIN,
    picture: '/images/players/mikel-merino.png',
  },
  // {
  //   id: 'jhtb3oirhfbg3oqfwijq2R3H',
  //   name: ArsenalPlayersEnum.SALAH_EDDINE_OULAD_MHAND,
  //   position: {
  //     exact: ExactPositionEnum.CM,
  //     general: GeneralPositionEnum.MF,
  //   },
  //   number: 59,
  //   age: getAgeByBirthDate('2003-08-20'),
  //   country: CountryEnum.NETHERLANDS,
  //   picture: '/images/players/salah-eddine.png',
  // },
  {
    id: 'bdfdsofjuj938g9hrf8qwgfo2gf3i',
    name: ArsenalPlayersEnum.ETHAN_NWANERI,
    position: {
      exact: ExactPositionEnum.CAM,
      general: GeneralPositionEnum.MF,
    },
    number: 53,
    age: getAgeByBirthDate('2007-03-21'),
    country: CountryEnum.ENGLAND,
    picture: '/images/players/ethan-nwaneri.png',
  },
  // {
  //   id: 'rh27tg9fofh9w4ghnfoif',
  //   name: ArsenalPlayersEnum.FABIO_VIEIRA,
  //   position: {
  //     exact: ExactPositionEnum.CAM,
  //     general: GeneralPositionEnum.MF,
  //   },
  //   number: 21,
  //   age: 24,
  //   country: CountryEnum.PORTUGAL,
  //   picture: '/images/players/fabio-vieira.png',
  // },
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
    picture: '/images/players/martin-odegaard.png',
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
    picture: '/images/players/bukayo-saka.png',
    mayBeInjured: true,
  },
  {
    id: 'ehfiehre923rh4or98hotw9',
    name: ArsenalPlayersEnum.RAHEEM_STERLING,
    position: {
      exact: ExactPositionEnum.RW,
      general: GeneralPositionEnum.FW,
    },
    number: 30,
    age: 29,
    country: CountryEnum.ENGLAND,
    picture: '/images/players/raheem-sterling.png',
  },
  // {
  //   id: '83rtgfjwheg9heo9rowdw',
  //   name: ArsenalPlayersEnum.REISS_NELSON,
  //   position: {
  //     exact: ExactPositionEnum.RW,
  //     general: GeneralPositionEnum.FW,
  //   },
  //   number: 24,
  //   age: 24,
  //   country: CountryEnum.ENGLAND,
  //   picture: '/images/players/reiss-nelson.png',
  // },
  {
    id: 'fhty9ejpqrnoiwthrhj',
    name: ArsenalPlayersEnum.GABRIEL_MARTINELLI,
    position: {
      exact: ExactPositionEnum.LW,
      general: GeneralPositionEnum.FW,
    },
    number: 11,
    age: 22,
    country: CountryEnum.BRAZIL,
    picture: '/images/players/gabriel-martinelli.png',
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
    picture: '/images/players/leandro-trossard.png',
    mayBeInjured: true,
  },
  {
    id: '30jtgeifnqorhgwowjj9d',
    name: ArsenalPlayersEnum.KAI_HAVERTZ,
    position: {
      exact: ExactPositionEnum.ST,
      general: GeneralPositionEnum.FW,
    },
    number: 29,
    age: 25,
    country: CountryEnum.GERMANY,
    picture: '/images/players/kai-havertz.png',
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
    picture: '/images/players/gabriel-jesus.png',
  },
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
    name: IFKGoteborgPlayersEnum.JACOB_KARLSTROM,
    position: {
      exact: ExactPositionEnum.GK,
      general: GeneralPositionEnum.GK,
    },
    number: 12,
    age: getAgeByBirthDate('1997-01-09'),
    country: CountryEnum.NORWAY,
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
