import React from 'react';
import styled from 'styled-components';
import {
  Eye, FireSimple, SoccerBall, Target,
} from '@phosphor-icons/react';
import { Fixture, Prediction, TeamType } from '../../utils/Fixture';
import { devices, theme } from '../../theme';
import { EmphasisTypography, NormalTypography } from '../typography/Typography';
import { Team } from '../../utils/Team';
import { AvatarSize } from '../avatar/Avatar';
import ClubAvatar from '../avatar/ClubAvatar';
import NationAvatar from '../avatar/NationAvatar';
import { useUser } from '../../context/UserContext';
import IconButton from '../buttons/IconButton';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';

interface CompactFixtureResultProps {
  fixture: Fixture;
  predictions?: Array<Prediction>;
  onModalOpen?: () => void;
  showButtonsAndPoints?: boolean;
}

const CompactFixtureResult = ({
  fixture, predictions, onModalOpen, showButtonsAndPoints = true,
}: CompactFixtureResultProps) => {
  const { user } = useUser();
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const correctResultPredicted = Boolean(predictions?.find((p) => p.fixtureId === fixture.id && p.userId === user?.documentId)?.points?.correctResult);
  const oddsBonusPointsAwarded = Boolean(predictions?.find((p) => p.fixtureId === fixture.id && p.userId === user?.documentId)?.points?.oddsBonus);
  const correctGoalScorerPredicted = Boolean(predictions?.find((p) => p.fixtureId === fixture.id && p.userId === user?.documentId)?.points?.correctGoalScorer);

  const getClubAvatar = (team: Team) => (fixture.teamType === TeamType.CLUBS ? (
    <ClubAvatar
      logoUrl={team.logoUrl}
      clubName={team.name}
      size={AvatarSize.XS}
    />
  ) : (
    <NationAvatar
      flagUrl={team.logoUrl}
      nationName={team.name}
      size={AvatarSize.XS}
    />
  ));

  return (
    <Container>
      <FullTimeContainer>
        <EmphasisTypography variant="s" color={theme.colors.primaryDark}>
          FT
        </EmphasisTypography>
      </FullTimeContainer>
      <ResultContainer>
        <EmphasisTypography variant="s" color={theme.colors.white}>
          {fixture.finalResult ? fixture.finalResult.homeTeamGoals : '?'}
        </EmphasisTypography>
        <EmphasisTypography variant="s" color={theme.colors.white}>
          {fixture.finalResult ? fixture.finalResult.awayTeamGoals : '?'}
        </EmphasisTypography>
      </ResultContainer>
      <Teams>
        <TeamWrapper>
          {fixture.aggregateScore && (
            <NormalTypography variant="s" color={theme.colors.silverDarker}>
              {fixture.finalResult ? `(${fixture.finalResult.homeTeamGoals + fixture.aggregateScore.homeTeamGoals})` : `(${fixture.aggregateScore.homeTeamGoals})`}
            </NormalTypography>
          )}
          {!isMobile && getClubAvatar(fixture.homeTeam)}
          <NormalTypography variant="s">
            {isMobile ? (fixture.homeTeam.shortName ?? fixture.homeTeam.name) : fixture.homeTeam.name}
          </NormalTypography>
        </TeamWrapper>
        <TeamWrapper>
          {fixture.aggregateScore && (
            <NormalTypography variant="s" color={theme.colors.silverDarker}>
              {fixture.finalResult ? `(${fixture.finalResult.awayTeamGoals + fixture.aggregateScore.awayTeamGoals})` : `(${fixture.aggregateScore.awayTeamGoals})`}
            </NormalTypography>
          )}
          {!isMobile && getClubAvatar(fixture.awayTeam)}
          <NormalTypography variant="s">
            {isMobile ? (fixture.awayTeam.shortName ?? fixture.awayTeam.name) : fixture.awayTeam.name}
          </NormalTypography>
        </TeamWrapper>
      </Teams>
      {showButtonsAndPoints && (
        <ButtonsAndPointsWrapper>
          {predictions && (
          <PointsTag>
            {(oddsBonusPointsAwarded || correctResultPredicted || correctGoalScorerPredicted) && (
              <PointsIcons>
                {correctGoalScorerPredicted && (
                  <SoccerBall size={16} color={theme.colors.silverDarker} weight="fill" />
                )}
                {oddsBonusPointsAwarded && (
                  <FireSimple size={16} color={theme.colors.silverDarker} />
                )}
                {correctResultPredicted && (
                  <Target size={16} color={theme.colors.silverDarker} />
                )}
              </PointsIcons>
            )}
            <NoWrapTypography variant="s" color={theme.colors.silverDarker}>
              {predictions.find((p) => p.fixtureId === fixture.id && p.userId === user?.documentId)?.points?.total ?? '0'}
              {' '}
              p
            </NoWrapTypography>
          </PointsTag>
          )}
          <IconButton
            icon={<Eye size={24} />}
            colors={{ normal: theme.colors.primary, hover: theme.colors.primaryDark, active: theme.colors.primaryDarker }}
            onClick={onModalOpen || (() => {})}
          />
        </ButtonsAndPointsWrapper>
      )}
    </Container>
  );
};

const Container = styled.div`
  height: 52px;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  overflow: hidden;
  border-radius: ${theme.borderRadius.m};
  border: 1px solid ${theme.colors.silverLight};
`;

const FullTimeContainer = styled.div`
  height: 100%;
  padding: 0 ${theme.spacing.xs};
  background-color: ${theme.colors.primaryBleach};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ResultContainer = styled.div`
  height: 100%;
  padding: 0 ${theme.spacing.xxs};
  display: flex;
  flex-direction: column;
  background-color: ${theme.colors.primary};
  justify-content: center;
  gap: ${theme.spacing.xxxs};
  box-sizing: border-box;
`;

const Teams = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  box-sizing: border-box;
  padding: 0px ${theme.spacing.xxs};
  justify-content: center;
  gap: ${theme.spacing.xxxs};
  
  @media ${devices.tablet} {
    padding: 2px 6px;
    gap: 0;
  }
`;

const TeamWrapper = styled.div`
  display: flex;
  gap: ${theme.spacing.xxxs};
  align-items: center;
`;

const ButtonsAndPointsWrapper = styled.div`
  display: flex;
  gap: ${theme.spacing.xxxs};
  align-items: center;
  padding-right: ${theme.spacing.xxs};
  box-sizing: border-box;
  
  @media ${devices.tablet} {
    gap: ${theme.spacing.xxs};
    padding-right: ${theme.spacing.xs};
  }
`;

const PointsTag = styled.div`
  display: flex;
  align-items: center;
  border-radius: 100px;
  justify-content: center;
  padding: ${theme.spacing.xxxs} ${theme.spacing.xxs};
  background-color: ${theme.colors.silverLighter};
  width: fit-content;
  height: fit-content;
  gap: 6px;
`;

const NoWrapTypography = styled(NormalTypography)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PointsIcons = styled.div`
  display: flex;
  gap: 2px;
  align-items: center;
`;

export default CompactFixtureResult;
