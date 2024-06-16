export interface PredictionLeague {
  documentId: string;
  name: string;
  description: string;
  participants: Array<string>;
  creatorId: string;
  inviteCode: string;
  inviteLink: string;
  invitedUsers: Array<string>;
}

export interface PredictionLeagueInput {
  name: string;
  description: string;
  creatorId: string;
}