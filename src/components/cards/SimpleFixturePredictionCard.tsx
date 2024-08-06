import styled from 'styled-components';
import { Fixture, Prediction, TeamType } from '../../utils/Fixture';
import { theme } from '../../theme';
import { EmphasisTypography, NormalTypography } from '../typography/Typography';
import UserName from '../typography/UserName';
import { AvatarSize } from '../avatar/Avatar';
import ClubAvatar from '../avatar/ClubAvatar';
import NationAvatar from '../avatar/NationAvatar';

interface SimpleFixturePredictionCardProps {
  prediction: Prediction;
  fixture: Fixture | undefined;
}

const SimpleFixturePredictionCard = ({ prediction, fixture }: SimpleFixturePredictionCardProps) => {
  return (
    <Card>
      {prediction.username ? (
        <EmphasisTypography variant='m'>{prediction.username}</EmphasisTypography>
      ) : (
        <EmphasisTypography variant='m'>
          <UserName userId={prediction.userId} />
        </EmphasisTypography>
      )}
      {fixture && (
        <PredictionContainer>
          {fixture.shouldPredictGoalScorer && (
            <NormalTypography variant='m' color={theme.colors.silverDarker}>{prediction.goalScorer?.name ?? 'Ingen målskytt'}</NormalTypography>
          )}
          {fixture.teamType === TeamType.CLUBS ? (
            <ClubAvatar
              logoUrl={fixture.homeTeam.logoUrl}
              clubName={fixture.homeTeam.name}
              size={AvatarSize.S}
            />
          ) : (
            <NationAvatar
              flagUrl={fixture.homeTeam.logoUrl}
              nationName={fixture.homeTeam.name}
              size={AvatarSize.S}
            />
          )}
          <NormalTypography variant='m'>{prediction.homeGoals}</NormalTypography>
          <NormalTypography variant='m'>-</NormalTypography>
          <NormalTypography variant='m'>{prediction.awayGoals}</NormalTypography>
          {fixture.teamType === TeamType.CLUBS ? (
            <ClubAvatar
              logoUrl={fixture.awayTeam.logoUrl}
              clubName={fixture.awayTeam.name}
              size={AvatarSize.S}
            />
          ) : (
            <NationAvatar
              flagUrl={fixture.awayTeam.logoUrl}
              nationName={fixture.awayTeam.name}
              size={AvatarSize.S}
            />
          )}
        </PredictionContainer>
      )}
    </Card>
  )
};

const Card = styled.div`
  background-color: ${theme.colors.silverLighter};
  border-radius: ${theme.borderRadius.s};
  padding: ${theme.spacing.xxxs} ${theme.spacing.xs};
  width: 100%;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PredictionContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.xxs};
  align-items: center;
  width: fit-content;
`;

export default SimpleFixturePredictionCard;