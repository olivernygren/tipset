import { FotMobSquad, FotMobTeamsResponse } from './Fotmob';
import {
  CountryEnum, ExactPositionEnum, GeneralPositionEnum, Player, PlayerStatusEnum,
} from './Players';
import { nationalTeams, Team } from './Team';

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
