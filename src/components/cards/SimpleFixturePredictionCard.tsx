import React from 'react';
import styled from 'styled-components';
import { Fixture, Prediction, TeamType } from '../../utils/Fixture';
import { devices, theme } from '../../theme';
import { EmphasisTypography, NormalTypography } from '../typography/Typography';
import UserName, { UserProfilePicture } from '../typography/UserName';
import { AvatarSize } from '../avatar/Avatar';
import ClubAvatar from '../avatar/ClubAvatar';
import NationAvatar from '../avatar/NationAvatar';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';
import { Divider } from '../Divider';
// import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';

interface SimpleFixturePredictionCardProps {
  prediction: Prediction;
  fixture: Fixture | undefined;
}

const SimpleFixturePredictionCard = ({ prediction, fixture }: SimpleFixturePredictionCardProps) => {
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  return (
    <Card>
      <CardTopRow>
        <UserContainer>
          <UserProfilePicture userId={prediction.userId} size={isMobile ? AvatarSize.S : AvatarSize.M} />
          {prediction.username ? (
            <EmphasisTypography variant={isMobile ? 's' : 'l'}>{prediction.username}</EmphasisTypography>
          ) : (
            <EmphasisTypography variant={isMobile ? 's' : 'm'}>
              <UserName userId={prediction.userId} />
            </EmphasisTypography>
          )}
        </UserContainer>
        {fixture && (
        <PredictionContainer>
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
          <NormalTypography variant="m">{prediction.homeGoals}</NormalTypography>
          <NormalTypography variant="m">-</NormalTypography>
          <NormalTypography variant="m">{prediction.awayGoals}</NormalTypography>
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
      </CardTopRow>
      {fixture && fixture.shouldPredictGoalScorer && <Divider />}
      {fixture && fixture.shouldPredictGoalScorer && (
        <GoalScorerContainer>
          <EmphasisTypography variant={isMobile ? 's' : 'm'} color={theme.colors.silverDarker}>Målskytt</EmphasisTypography>
          <NormalTypography variant={isMobile ? 's' : 'm'} color={theme.colors.silverDarker}>{prediction.goalScorer?.name ?? 'Ingen målskytt'}</NormalTypography>
        </GoalScorerContainer>
      )}
    </Card>
  );
};
const Card = styled.div`
  background-color: ${theme.colors.silverLighter};
  border-radius: ${theme.borderRadius.m};
  box-shadow: 0px 3px 0px rgba(0, 0, 0, 0.08);
  width: 100%;
  box-sizing: border-box;
`;

const CardTopRow = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.xxxs};
  
  @media ${devices.tablet} {
    padding: ${theme.spacing.xxxs} ${theme.spacing.xxs};
  }
`;

const UserContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0;

  @media ${devices.tablet} {
    gap: ${theme.spacing.xxxs};
  }
`;

const PredictionContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.xxxs};
  align-items: center;
  width: fit-content;
`;

const GoalScorerContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.xxs} ${theme.spacing.xs};

  @media ${devices.tablet} {
    padding: ${theme.spacing.xs} ${theme.spacing.s};
  }
`;

export default SimpleFixturePredictionCard;
