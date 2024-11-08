import React from 'react';
import styled from 'styled-components';
import { Eye, Target } from '@phosphor-icons/react';
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

interface LastRoundFixtureResultProps {
  fixture: Fixture;
  predictions?: Array<Prediction>;
  onModalOpen?: () => void;
  showButtonsAndPoints?: boolean;
}

const LastRoundFixtureResult = ({
  fixture, predictions, onModalOpen, showButtonsAndPoints = true,
}: LastRoundFixtureResultProps) => {
  const { user } = useUser();
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

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
          {!isMobile && getClubAvatar(fixture.homeTeam)}
          <NormalTypography variant="s">
            {fixture.homeTeam.name}
          </NormalTypography>
        </TeamWrapper>
        <TeamWrapper>
          {!isMobile && getClubAvatar(fixture.awayTeam)}
          <NormalTypography variant="s">
            {fixture.awayTeam.name}
          </NormalTypography>
        </TeamWrapper>
      </Teams>
      {showButtonsAndPoints && (
        <ButtonsAndPointsWrapper>
          {predictions && (
          <PointsTag>
            <Target size={16} color={theme.colors.silverDarker} />
            <NoWrapTypography variant="s" color={theme.colors.silverDarker}>
              {predictions.find((p) => p.fixtureId === fixture.id && p.userId === user?.documentId)?.points?.total ?? '?'}
              {' '}
              p
            </NoWrapTypography>
          </PointsTag>
          )}
          {/* <TextButton noPadding>
            Se allas tips
            </TextButton> */}
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
  min-height: 50px;
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
  min-height: 50px;
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
  min-height: 50px;
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

export default LastRoundFixtureResult;
