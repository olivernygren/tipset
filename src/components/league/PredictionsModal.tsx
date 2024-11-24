import React from 'react';
import styled from 'styled-components';
import Modal from '../modal/Modal';
import { Fixture, Prediction } from '../../utils/Fixture';
import { devices, theme } from '../../theme';
import PredictionScoreCard from '../game/PredictionScoreCard';
// eslint-disable-next-line import/no-cycle
import FixtureResultPreview from '../game/FixtureResultPreview';
import SimpleFixturePredictionCard from '../cards/SimpleFixturePredictionCard';
import { Section } from '../section/Section';
import { HeadingsTypography, NormalTypography } from '../typography/Typography';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';
import CompactFixtureResult from '../game/CompactFixtureResult';
import FinalResult from '../game/FinalResult';
import { ArsenalPlayers, GeneralPositionEnum } from '../../utils/Players';
import Avatar, { AvatarSize } from '../avatar/Avatar';
import { getGeneralPositionShorthand, getPlayerPositionColor } from '../../utils/helpers';

interface PredictionsModalProps {
  onClose: () => void;
  predictions: Array<Prediction>;
  fixture: Fixture | undefined;
}

const PredictionsModal = ({ onClose, predictions, fixture }: PredictionsModalProps) => {
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const gameHasFinished = fixture && Boolean(fixture.finalResult);

  const getPlayerByName = (name: string) => {
    const playerObj = ArsenalPlayers.find((player) => player.name === name);
    const positionColor = getPlayerPositionColor((playerObj?.position.general ?? '') as GeneralPositionEnum);

    return (
      <GoalScorerCard>
        {playerObj && playerObj.picture && (
          <AvatarContainer>
            <Avatar
              src={playerObj.picture}
              alt={playerObj.name}
              size={isMobile ? AvatarSize.M : AvatarSize.L}
              objectFit="cover"
              showBorder
            />
            {!isMobile && (
              <PlayerPositionTag bgColor={positionColor}>
                <NormalTypography variant="xs" color={theme.colors.white}>{getGeneralPositionShorthand(playerObj?.position.general ?? '?')}</NormalTypography>
              </PlayerPositionTag>
            )}
          </AvatarContainer>
        )}
        <NormalTypography variant="m">{playerObj?.name ?? '?'}</NormalTypography>
        {isMobile && (
          <MobilePlayerPositionTag bgColor={positionColor}>
            <NormalTypography variant="xs" color={theme.colors.white}>{getGeneralPositionShorthand(playerObj?.position.general ?? '?')}</NormalTypography>
          </MobilePlayerPositionTag>
        )}
      </GoalScorerCard>
    );
  };

  return (
    <Modal
      title="Vad tippade alla?"
      onClose={onClose}
      size={gameHasFinished ? 'l' : 'm'}
      headerDivider
      mobileBottomSheet
    >
      <Content>
        {fixture && (
          isMobile ? (
            <CompactFixtureResult
              fixture={fixture}
              predictions={predictions}
              showButtonsAndPoints={false}
            />
          ) : (
            <FinalResult fixture={fixture} />
          )
        )}
        {fixture && gameHasFinished && fixture.shouldPredictGoalScorer && (
          <GoalScorersContainer>
            <HeadingsTypography variant="h5">Målskyttar</HeadingsTypography>
              {fixture.finalResult?.goalScorers && fixture.finalResult?.goalScorers.length > 0 ? (
                <GoalScorers>
                  {fixture.finalResult.goalScorers.map((scorer) => (
                    getPlayerByName(scorer)
                  ))}
                </GoalScorers>
              ) : (
                <NormalTypography variant="s" color={theme.colors.silverDark}>Inga målskyttar</NormalTypography>
              )}
          </GoalScorersContainer>
        )}
        <PredictionsContainer>
          {gameHasFinished && (
            <HeadingsTypography variant="h5">
              Deltagares tips
            </HeadingsTypography>
          )}
          {predictions && predictions.length > 0 ? predictions.map((prediction) => (
            gameHasFinished ? (
              <PredictionScoreCard prediction={prediction} fixture={fixture ?? undefined} />
            ) : (
              <SimpleFixturePredictionCard prediction={prediction} fixture={fixture} />
            )
          )) : (
            <NormalTypography variant="m" color={theme.colors.silverDark}>Ingen tippade 😔</NormalTypography>
          )}
        </PredictionsContainer>
      </Content>
    </Modal>
  );
};

const PredictionsContainer = styled.div`
  gap: ${theme.spacing.xs};
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
`;

const GoalScorersContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  width: 100%;

  @media ${devices.tablet} {
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    gap: ${theme.spacing.xs};
    border: 1px solid ${theme.colors.silverLight};
    border-radius: ${theme.borderRadius.m};
    padding: ${theme.spacing.s};
    box-sizing: border-box;
    box-shadow: 0px 3px 0px 0px ${theme.colors.silverLighter};
  }
`;

const GoalScorers = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xxs};
  
  @media ${devices.tablet} {
    gap: ${theme.spacing.xs};
    flex-direction: row;
    align-items: center;
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.m};
  width: 100%;
  box-sizing: border-box;
`;

const GoalScorerCard = styled.div`
  display: flex;
  gap: ${theme.spacing.xxs};
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  padding: 2px ${theme.spacing.xs} 2px 2px;
  background-color: ${theme.colors.silverLighter};
  border-radius: ${theme.borderRadius.s};
  border: 1px solid ${theme.colors.silverLight};
  
  @media ${devices.tablet} {
    padding: ${theme.spacing.xxxs} ${theme.spacing.s} ${theme.spacing.xs} ${theme.spacing.s};
    justify-content: center;
    flex-direction: column;
    width: fit-content;
  }
`;

const AvatarContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xxxs};
`;

const PlayerPositionTag = styled.div<{ bgColor: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xxxs} ${theme.spacing.xxs};
  border-radius: ${theme.borderRadius.l};
  background-color: ${({ bgColor }) => bgColor};
  position: absolute;
  bottom: -2px;
  transform: translateX(-50%);
  left: 50%;
`;

const MobilePlayerPositionTag = styled.div<{ bgColor: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xxxs} ${theme.spacing.xxs};
  border-radius: ${theme.borderRadius.l};
  background-color: ${({ bgColor }) => bgColor};
  margin-left: auto;
`;

export default PredictionsModal;
