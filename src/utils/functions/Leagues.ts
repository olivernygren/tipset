/* eslint-disable import/prefer-default-export */
import { addDoc, collection } from 'firebase/firestore';
import { FunctionVariables, generateLeagueInviteCode } from '../helpers';
import { CreatePredictionLeagueInputV2 } from '../League';
import { db } from '../../config/firebase';
import { CollectionEnum } from '../Firebase';

interface CreateLeagueParams extends FunctionVariables {
  input: CreatePredictionLeagueInputV2;
}

export const createLeague = async (variables: CreateLeagueParams) => {
  const {
    name, description, scoringSystem, user,
  } = variables.input;

  const { onCompleted, onError, onFinalize } = variables;

  try {
    if (name.length === 0) {
      throw new Error('Ligan måste ha ett namn');
    }

    if (!user) {
      throw new Error('Du är inte inloggad');
    }

    const today = new Date();
    const oneMonthFromNow = new Date(today.setMonth(today.getMonth() + 1));

    const newLeague = {
      name,
      description,
      creatorId: user.documentId,
      scoringSystem,
      participants: [user.documentId],
      inviteCode: generateLeagueInviteCode(),
      createdAt: new Date().toISOString(),
      invitedUsers: [],
      standings: [{
        userId: user.documentId,
        username: (user?.lastname ? `${user?.firstname} ${user?.lastname}` : user?.firstname) ?? '?',
        points: 0,
        correctResults: 0,
        awardedPointsForFixtures: [],
      }],
      deadlineToJoin: oneMonthFromNow.toISOString(),
      hasEnded: false,
    };

    const leagueCollectionRef = collection(db, CollectionEnum.LEAGUES);

    await addDoc(leagueCollectionRef, newLeague);

    if (onCompleted) onCompleted();
  } catch (e) {
    // errorNotify('Ett fel uppstod när ligan skulle skapas');
    if (onError && e instanceof Error) onError(e.message);
  } finally {
    if (onFinalize) onFinalize();
  }
};
