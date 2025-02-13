import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  collection, getDocs, query, where,
} from 'firebase/firestore';
import { CaretDown, CaretUp, Prohibit } from '@phosphor-icons/react';
import Modal from '../modal/Modal';
import {
  FirstTeamToScore, Fixture, Prediction, TeamType,
} from '../../utils/Fixture';
import { devices, theme } from '../../theme';
import PredictionScoreCard from '../game/PredictionScoreCard';
import SimpleFixturePredictionCard from '../cards/SimpleFixturePredictionCard';
import { HeadingsTypography, NormalTypography } from '../typography/Typography';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';
import CompactFixtureResult from '../game/CompactFixtureResult';
import FinalResult from '../game/FinalResult';
import { GeneralPositionEnum, Player } from '../../utils/Players';
import Avatar, { AvatarSize } from '../avatar/Avatar';
import {
  getGeneralPositionShorthand, getPlayerPositionColor, withDocumentIdOnObject,
} from '../../utils/helpers';
import { db } from '../../config/firebase';
import { CollectionEnum } from '../../utils/Firebase';
import { Team } from '../../utils/Team';
import IconButton from '../buttons/IconButton';
import ClubAvatar from '../avatar/ClubAvatar';
import NationAvatar from '../avatar/NationAvatar';
import { Section } from '../section/Section';

interface PredictionsModalProps {
  onClose: () => void;
  predictions: Array<Prediction>;
  fixture: Fixture | undefined;
}

const PredictionsModal = ({
  onClose, predictions, fixture,
}: PredictionsModalProps) => {
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const [homeTeamPlayers, setHomeTeamPlayers] = useState<Array<Player>>([]);
  const [awayTeamPlayers, setAwayTeamPlayers] = useState<Array<Player>>([]);
  const [isGoalScorersExpanded, setIsGoalScorersExpanded] = useState<boolean>(false);

  const gameHasFinished = fixture && Boolean(fixture.finalResult);
  const hasGoalScorers = Boolean(fixture && fixture.finalResult?.goalScorers && fixture.finalResult?.goalScorers.length > 0 && [...homeTeamPlayers, ...awayTeamPlayers].length > 0);

  useEffect(() => {
    const fetchTeams = async () => {
      if (fixture?.shouldPredictGoalScorer) {
        const homePlayers = await fetchTeamByName(fixture?.homeTeam.name);
        const awayPlayers = await fetchTeamByName(fixture?.awayTeam.name);

        if (homePlayers && homePlayers.length > 0) {
          setHomeTeamPlayers(homePlayers);
        }
        if (awayPlayers && awayPlayers.length > 0) {
          setAwayTeamPlayers(awayPlayers);
        }
      }
    };
    fetchTeams();
  }, []);

  const fetchTeamByName = async (teamName: string) => {
    const teamsRef = collection(db, CollectionEnum.TEAMS);
    const q = query(teamsRef, where('name', '==', teamName));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const teamDoc = querySnapshot.docs[0];
      const teamData = withDocumentIdOnObject<Team>(teamDoc);

      if (teamData.players) {
        return teamData.players;
      }
      return [];
    }
    return [];
  };

  const getPlayerAvatarByName = (name: string, index: number, showTeam?: boolean) => {
    const combinedPlayers = [...homeTeamPlayers, ...awayTeamPlayers];
    const playerObj = combinedPlayers.find((player) => player.name === name);

    if (!playerObj || !fixture) return null;

    return (
      <AvatarContainer index={index}>
        <Avatar
          src={playerObj.externalPictureUrl ?? playerObj.picture ?? '/images/placeholder-fancy.png'}
          alt={playerObj.name}
          size={AvatarSize.M}
          objectFit="cover"
          showBorder
          backgroundColor={theme.colors.white}
          customBorderWidth={1}
        />
        {showTeam && (
          <GoalScorerTeamAvatar>
            {getTeamAvatar(homeTeamPlayers.some((player) => player.name === name) ? fixture.homeTeam : fixture.awayTeam)}
          </GoalScorerTeamAvatar>
        )}
      </AvatarContainer>
    );
  };

  const getTeamAvatar = (team: Team, customSize?: AvatarSize) => (fixture?.teamType === TeamType.CLUBS ? (
    <ClubAvatar
      logoUrl={team.logoUrl}
      clubName={team.name}
      size={customSize || AvatarSize.XS}
      shape="square"
      noPadding
    />
  ) : (
    <NationAvatar
      flagUrl={team.logoUrl}
      nationName={team.name}
      size={customSize || AvatarSize.XS}
    />
  ));

  return (
    <Modal
      title="Vad tippade alla?"
      onClose={onClose}
      size={gameHasFinished ? 'l' : 'm'}
      headerDivider
      mobileBottomSheet
    >
      <Content>
        <Section gap="s">
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
          <GoalScorersContainer isExpanded={isGoalScorersExpanded}>
            <GoalScorersMainContent>
              <HeadingsTypography variant={isMobile ? 'h6' : 'h5'}>Målskyttar</HeadingsTypography>
              <GoalScorersAvatars hasGoalScorers={hasGoalScorers}>
                {hasGoalScorers ? (
                  fixture?.finalResult?.goalScorers?.map((scorer, index) => (
                    getPlayerAvatarByName(scorer, index)
                  ))
                ) : (
                  <NormalTypography variant="s" color={theme.colors.silverDark}>Inga målskyttar</NormalTypography>
                )}
              </GoalScorersAvatars>
              {hasGoalScorers && (
                <IconButton
                  icon={isGoalScorersExpanded ? <CaretUp size={20} weight="bold" /> : <CaretDown size={20} weight="bold" />}
                  colors={{ normal: theme.colors.textDefault }}
                  onClick={() => setIsGoalScorersExpanded(!isGoalScorersExpanded)}
                />
              )}
            </GoalScorersMainContent>
            <ExpandedGoalScorers>
              {fixture?.finalResult?.goalScorers?.map((scorer) => (
                <GoalScorerCard>
                  {getPlayerAvatarByName(scorer, 0, true)}
                  <NormalTypography variant="m" align="center">{scorer}</NormalTypography>
                  <PlayerPositionTag bgColor={getPlayerPositionColor([...homeTeamPlayers, ...awayTeamPlayers].find((player) => player.name === scorer)?.position.general as GeneralPositionEnum)}>
                    <NormalTypography variant="xs" color={theme.colors.white}>
                      {getGeneralPositionShorthand([...homeTeamPlayers, ...awayTeamPlayers].find((player) => player.name === scorer)?.position.general as GeneralPositionEnum)}
                    </NormalTypography>
                  </PlayerPositionTag>
                </GoalScorerCard>
              ))}
            </ExpandedGoalScorers>
          </GoalScorersContainer>
          )}
          {fixture?.shouldPredictFirstTeamToScore && fixture.finalResult?.firstTeamToScore && (
          <FirstTeamToScoreContainer>
            <HeadingsTypography variant={isMobile ? 'h6' : 'h5'}>Första lag att göra mål</HeadingsTypography>
            <Section gap="xxs" flexDirection="row" alignItems="center" fitContent>
              <FirstTeamToScoreLogo>
                {fixture.finalResult?.firstTeamToScore === FirstTeamToScore.NONE ? (
                  <Section padding={theme.spacing.xxs}>
                    <Prohibit size={32} color={theme.colors.textDefault} />
                  </Section>
                ) : (
                  getTeamAvatar(fixture.finalResult.firstTeamToScore === FirstTeamToScore.HOME_TEAM ? fixture.homeTeam : fixture.awayTeam, AvatarSize.M)
                )}
              </FirstTeamToScoreLogo>
            </Section>
          </FirstTeamToScoreContainer>
          )}
        </Section>
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

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.m};
  width: 100%;
  box-sizing: border-box;
`;

const GoalScorerCard = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  padding: 0 ${theme.spacing.xs} 0 ${theme.spacing.xxxs};
  gap: ${theme.spacing.xxxs};
  background-color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.m};
  border: 1px solid ${theme.colors.silverLight};
`;

const AvatarContainer = styled.div<{ index: number }>`
  position: relative;
  z-index: ${({ index }) => index};
  margin-left: ${({ index }) => (index === 0 ? '0' : '-28px')};
`;

const PlayerPositionTag = styled.div<{ bgColor: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xxxs} ${theme.spacing.xxs};
  border-radius: ${theme.borderRadius.l};
  background-color: ${({ bgColor }) => bgColor};
  margin-left: auto;
`;

const GoalScorersContainer = styled.div<{ isExpanded: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xxs};
  border: 1px solid ${theme.colors.silverLight};
  background-color: ${theme.colors.silverBleach};
  border-radius: ${theme.borderRadius.m};
  padding: 0 ${theme.spacing.xs};
  box-shadow: 0px 3px 0px 0px ${theme.colors.silverLighter};
  min-height: 62px;
  max-height: ${({ isExpanded }) => (isExpanded ? '1000px' : '62px')};
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
  transition: max-height 0.6s cubic-bezier(.39,-0.15,.46,.94);
  
  @media ${devices.tablet} {
    min-height: 72px;
    max-height: ${({ isExpanded }) => (isExpanded ? '1000px' : '72px')};
    padding: ${theme.spacing.xxs} ${theme.spacing.s} ${theme.spacing.xxs} ${theme.spacing.s};
  }
`;

const GoalScorersMainContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  min-height: 60px;

  @media ${devices.tablet} {
    gap: ${theme.spacing.s};
    min-height: 56px;
  }
`;

const GoalScorersAvatars = styled.div<{ hasGoalScorers: boolean }>`
  display: flex;
  align-items: center;
  padding-top: ${theme.spacing.xxxs};
  margin-left: auto;
  ${({ hasGoalScorers }) => hasGoalScorers && 'margin-right: -10px;'}
`;

const ExpandedGoalScorers = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xxs};
  padding-bottom: ${theme.spacing.xs};
`;

const GoalScorerTeamAvatar = styled.div`
  position: absolute;
  bottom: 6px;
  right: 6px;
  z-index: 1;
`;

const FirstTeamToScoreContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing.xxs};
  border: 1px solid ${theme.colors.silverLight};
  background-color: ${theme.colors.silverBleach};
  border-radius: ${theme.borderRadius.m};
  box-shadow: 0px 3px 0px 0px ${theme.colors.silverLighter};
  width: 100%;
  box-sizing: border-box;
  padding: ${theme.spacing.xs};
  
  @media ${devices.tablet} {
    padding: ${theme.spacing.s};
  }
`;

const FirstTeamToScoreLogo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default PredictionsModal;
