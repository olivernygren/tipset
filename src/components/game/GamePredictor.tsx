import React, { useState } from 'react';
import { ChartBar, MapPin } from '@phosphor-icons/react';
import styled from 'styled-components';
import { Section } from '../section/Section';
import { EmphasisTypography, NormalTypography } from '../typography/Typography';
import { Fixture, Prediction, TeamType } from '../../utils/Fixture';
import { ArsenalPlayers, Player } from '../../utils/Players';
import { AvatarSize } from '../avatar/Avatar';
import { devices, theme } from '../../theme';
import { Team } from '../../utils/Team';
import { Divider } from '../Divider';
import Button from '../buttons/Button';
import ClubAvatar from '../avatar/ClubAvatar';
import NationAvatar from '../avatar/NationAvatar';
import GoalsInput from './GoalsInput';
import { errorNotify } from '../../utils/toast/toastHelpers';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';
import SelectImitation from '../input/SelectImitation';
import GoalScorerModal from './GoalScorerModal';
import IconButton from '../buttons/IconButton';
import Tag from '../tag/Tag';

interface GamePredictorProps {
  game: Fixture;
  gameNumber: number;
  onResultUpdate: (gameNumber: number, homeGoals: string, awayGoals: string) => void;
  onPlayerPredictionUpdate: (gameNumber: number, player: Player | undefined) => void;
  onSave: (homeGoals: string, awayGoals: string, predictedPlayerToScore?: Player) => void;
  onShowStats: (fixture: Fixture) => void;
  hasPredicted?: boolean;
  predictionValue?: Prediction;
  loading?: boolean;
  previousGameWeekPredictedGoalScorer?: Player;
  numberOfParticipantsPredicted?: number;
  isLeagueCreator?: boolean;
}

const GamePredictor = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  game, gameNumber, onPlayerPredictionUpdate, onResultUpdate, onSave, onShowStats, hasPredicted, predictionValue, loading, previousGameWeekPredictedGoalScorer, isLeagueCreator, numberOfParticipantsPredicted,
}: GamePredictorProps) => {
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const [homeGoals, setHomeGoals] = useState<string>(predictionValue?.homeGoals.toString() ?? '');
  const [awayGoals, setAwayGoals] = useState<string>(predictionValue?.awayGoals.toString() ?? '');
  const [predictedPlayerToScore, setPredictedPlayerToScore] = useState<Player | undefined>(predictionValue && predictionValue.goalScorer ? predictionValue.goalScorer : undefined);
  const [isSelectGoalScorerModalOpen, setIsSelectGoalScorerModalOpen] = useState(false);

  const kickoffTimeHasPassed = new Date(game.kickOffTime) < new Date();

  const handleIncreaseGoals = (team: 'home' | 'away') => {
    if (new Date(game.kickOffTime) < new Date()) {
      errorNotify('Deadline har passerat');
      return;
    }

    let updatedHomeGoals = homeGoals;
    let updatedAwayGoals = awayGoals;

    if (team === 'home') {
      if (homeGoals === '') {
        updatedHomeGoals = '0';
        setHomeGoals('0');
        return;
      }
      updatedHomeGoals = (parseInt(homeGoals) + 1).toString();
      setHomeGoals((oldstate) => (parseInt(oldstate) + 1).toString());
    } else {
      if (awayGoals === '') {
        updatedAwayGoals = '0';
        setAwayGoals('0');
        return;
      }
      updatedAwayGoals = (parseInt(awayGoals) + 1).toString();
      setAwayGoals((oldstate) => (parseInt(oldstate) + 1).toString());
    }
    onResultUpdate(gameNumber, updatedHomeGoals, updatedAwayGoals);
  };

  const handleDecreaseGoals = (team: 'home' | 'away') => {
    if (new Date(game.kickOffTime) < new Date()) {
      errorNotify('Deadline har passerat');
      return;
    }

    let updatedHomeGoals = homeGoals;
    let updatedAwayGoals = awayGoals;

    if (team === 'home') {
      if (homeGoals === '') {
        updatedHomeGoals = '0';
        setHomeGoals('0');
        return;
      }
      updatedHomeGoals = (parseInt(homeGoals) - 1).toString();
      setHomeGoals((oldstate) => (parseInt(oldstate) - 1).toString());
    } else {
      if (awayGoals === '') {
        updatedAwayGoals = '0';
        setAwayGoals('0');
        return;
      }
      updatedAwayGoals = (parseInt(awayGoals) - 1).toString();
      setAwayGoals((oldstate) => (parseInt(oldstate) - 1).toString());
    }
    onResultUpdate(gameNumber, updatedHomeGoals, updatedAwayGoals);
  };

  const getKickoffTime = () => {
    const weekday = new Date(game.kickOffTime).toLocaleDateString('sv-SE', { weekday: 'short' });
    const weekdayCapitalized = weekday.charAt(0).toUpperCase() + weekday.slice(1);
    const date = new Date(game.kickOffTime).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
    const time = new Date(game.kickOffTime).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });

    return `${weekdayCapitalized} ${date.replaceAll('.', '')} ${time}`;
  };

  const getTextColor = () => (hasPredicted ? theme.colors.white : theme.colors.textDefault);

  const handleInputChange = (team: 'home' | 'away', value: string) => {
    if (value !== '' && !/^[0-9]$/.test(value)) {
      return;
    }
    if (team === 'home') {
      setHomeGoals(value);
    } else {
      setAwayGoals(value);
    }
    onResultUpdate(gameNumber, homeGoals, awayGoals);
  };

  const handleSave = () => {
    onSave(homeGoals, awayGoals, predictedPlayerToScore);
  };

  const handleUpdatePlayerPrediction = (player?: Player) => {
    if (!player) return;
    setPredictedPlayerToScore(player);
    onPlayerPredictionUpdate(gameNumber, player);
  };

  const getTeam = (team: Team, isAwayTeam: boolean) => {
    const { name, shortName } = team;
    const logoUrl = team.logoUrl ?? team.relativeLogoUrl;
    const displayName = (isMobile && shortName) ? shortName : name;

    return (
      <TeamContainer team={isAwayTeam ? 'away' : 'home'}>
        <AvatarAndTeamName>
          {game.teamType === TeamType.CLUBS ? (
            <ClubAvatar
              clubName={displayName}
              logoUrl={logoUrl}
              size={isMobile ? AvatarSize.L : AvatarSize.L}
              showBorder={hasPredicted}
              isDarkMode={hasPredicted}
            />
          ) : (
            <NationAvatar
              nationName={name}
              flagUrl={logoUrl}
              size={isMobile ? AvatarSize.L : AvatarSize.L}
              isDarkMode={hasPredicted}
            />
          )}
          <TeamName variant={isMobile ? 's' : 'm'} color={hasPredicted ? theme.colors.white : theme.colors.textDefault} align="center">
            {displayName}
          </TeamName>
        </AvatarAndTeamName>
      </TeamContainer>
    );
  };

  const getCardHeaderContent = () => {
    if (isMobile) {
      return (
        <>
          <Section flexDirection="row" gap="xxxs" alignItems="center" fitContent>
            <MapPin size={16} weight="fill" color={getTextColor()} />
            <EllipsisTypography variant="s" align="center" color={getTextColor()}>{game.stadium}</EllipsisTypography>
          </Section>
          <Section flexDirection="row" alignItems="center" gap="xs" justifyContent="center">
            <NoWrapTypography variant="s" align="center" color={getTextColor()}>{getKickoffTime()}</NoWrapTypography>
            <NormalTypography variant="s" color={getTextColor()}>•</NormalTypography>
            <EllipsisTypography variant="s" align="center" color={getTextColor()}>{game.tournament}</EllipsisTypography>
            <IconButton
              icon={<ChartBar size={24} weight="fill" />}
              colors={{
                normal: hasPredicted ? theme.colors.gold : theme.colors.primary,
                hover: hasPredicted ? theme.colors.gold : theme.colors.primaryDark,
                active: hasPredicted ? theme.colors.gold : theme.colors.primaryDarker,
              }}
              onClick={() => onShowStats(game)}
            />
          </Section>
        </>
      );
    }
    return (
      <>
        <Section flexDirection="row" gap="xxxs" alignItems="center" fitContent overflow="hidden">
          <MapPin size={16} weight="fill" color={getTextColor()} />
          <EllipsisTypography variant="s" align="center" color={getTextColor()}>{game.stadium}</EllipsisTypography>
        </Section>
        <NormalTypography variant="s" color={getTextColor()}>•</NormalTypography>
        <NoWrapTypography variant="s" align="center" color={getTextColor()}>{getKickoffTime()}</NoWrapTypography>
        <NormalTypography variant="s" color={getTextColor()}>•</NormalTypography>
        <EllipsisTypography variant="s" align="center" color={getTextColor()}>{game.tournament}</EllipsisTypography>
        <IconButton
          icon={<ChartBar size={24} weight="fill" />}
          colors={{
            normal: hasPredicted ? theme.colors.gold : theme.colors.primary,
            hover: hasPredicted ? theme.colors.gold : theme.colors.primaryDark,
            active: hasPredicted ? theme.colors.gold : theme.colors.primaryDarker,
          }}
          onClick={() => onShowStats(game)}
        />
      </>
    );
  };

  return (
    <>
      <Card hasPredicted={hasPredicted}>
        <CardHeader>
          {getCardHeaderContent()}
        </CardHeader>
        <Divider color={hasPredicted ? theme.colors.primaryLight : theme.colors.silverLighter} />
        <TagsSection>
          {game.fixtureNickname && (
            <>
              <Tag
                text={game.fixtureNickname}
                textAndIconColor={hasPredicted ? theme.colors.primaryDark : theme.colors.primaryDark}
                backgroundColor={hasPredicted ? theme.colors.gold : theme.colors.primaryBleach}
                size="s"
              />
              {!isMobile && game.shouldPredictGoalScorer && <NormalTypography variant="s" color={getTextColor()}>•</NormalTypography>}
            </>
          )}
          <EmphasisTypography variant="s" color={hasPredicted ? theme.colors.primaryLighter : theme.colors.silver}>{`${numberOfParticipantsPredicted === 0 ? 'Ingen' : numberOfParticipantsPredicted} deltagare har tippat`}</EmphasisTypography>
        </TagsSection>
        <Divider color={hasPredicted ? theme.colors.primaryLight : theme.colors.silverLighter} />
        <GameWrapper>
          {getTeam(game.homeTeam, false)}
          <GoalInputWrapper>
            <GoalsInput
              goals={homeGoals}
              onIncrease={() => handleIncreaseGoals('home')}
              onDecrease={() => handleDecreaseGoals('home')}
              onInputChange={(value) => handleInputChange('home', value)}
              hasPredicted={hasPredicted}
              disabled={kickoffTimeHasPassed}
            />
            <NormalTypography variant="l" color={hasPredicted ? theme.colors.white : theme.colors.textDefault}>–</NormalTypography>
            <GoalsInput
              goals={awayGoals}
              onIncrease={() => handleIncreaseGoals('away')}
              onDecrease={() => handleDecreaseGoals('away')}
              onInputChange={(value) => handleInputChange('away', value)}
              hasPredicted={hasPredicted}
              disabled={kickoffTimeHasPassed}
            />
          </GoalInputWrapper>
          {getTeam(game.awayTeam, true)}
        </GameWrapper>
        {game.odds && (
          <>
            <Divider color={hasPredicted ? theme.colors.primaryLight : theme.colors.silverLighter} />
            <OddsContainer hasPredicted={hasPredicted}>
              <OddsWrapper>
                <NormalTypography variant="s" color={hasPredicted ? theme.colors.gold : theme.colors.primary}>1</NormalTypography>
                <NormalTypography variant="s" color={hasPredicted ? theme.colors.white : theme.colors.textDefault}>{game.odds.homeWin}</NormalTypography>
              </OddsWrapper>
              <OddsWrapper>
                <NormalTypography variant="s" color={hasPredicted ? theme.colors.gold : theme.colors.primary}>X</NormalTypography>
                <NormalTypography variant="s" color={hasPredicted ? theme.colors.white : theme.colors.textDefault}>{game.odds.draw}</NormalTypography>
              </OddsWrapper>
              <OddsWrapper>
                <NormalTypography variant="s" color={hasPredicted ? theme.colors.gold : theme.colors.primary}>2</NormalTypography>
                <NormalTypography variant="s" color={hasPredicted ? theme.colors.white : theme.colors.textDefault}>{game.odds.awayWin}</NormalTypography>
              </OddsWrapper>
            </OddsContainer>
          </>
        )}
        <Divider color={hasPredicted ? theme.colors.primaryLight : theme.colors.silverLighter} />
        <GoalScorerSection>
          {game.shouldPredictGoalScorer ? (
            <EmphasisTypography variant={isMobile ? 's' : 'm'} color={hasPredicted ? theme.colors.white : theme.colors.textDefault}>{isMobile ? 'Välj målskytt' : 'Välj målskytt i matchen'}</EmphasisTypography>
          ) : (
            <Section flexDirection="row" alignItems="center" justifyContent="center">
              <EmphasisTypography variant={isMobile ? 's' : 'm'} color={hasPredicted ? theme.colors.primaryLighter : theme.colors.silver}>Ingen målskytt ska tippas</EmphasisTypography>
            </Section>
          )}
          {game.shouldPredictGoalScorer && (
            <SelectImitation
              value={predictedPlayerToScore?.name || ''}
              onClick={() => setIsSelectGoalScorerModalOpen(true)}
              disabled={!game.shouldPredictGoalScorer || kickoffTimeHasPassed}
              placeholder="Välj målskytt"
            />
          )}
        </GoalScorerSection>
        {!kickoffTimeHasPassed && (
          <SaveButtonSection hasPredicted={hasPredicted}>
            <Button
              variant="primary"
              onClick={handleSave}
              color={hasPredicted ? 'gold' : 'primary'}
              loading={loading}
              disabledInvisible={homeGoals === '' || awayGoals === '' || loading}
              textColor={hasPredicted ? theme.colors.textDefault : theme.colors.white}
              fullWidth
            >
              Spara
            </Button>
          </SaveButtonSection>
        )}
      </Card>
      {isSelectGoalScorerModalOpen && (
        <GoalScorerModal
          players={ArsenalPlayers}
          onSave={(players) => handleUpdatePlayerPrediction(players[0])}
          onClose={() => setIsSelectGoalScorerModalOpen(false)}
          initialSelectedPlayers={[predictedPlayerToScore]}
          previousGameWeekPredictedGoalScorer={previousGameWeekPredictedGoalScorer}
        />
      )}
    </>
  );
};

const Card = styled.div<{ hasPredicted?: boolean }>`
  border-radius: ${theme.borderRadius.m};
  border: 2px solid ${({ hasPredicted }) => (hasPredicted ? theme.colors.gold : theme.colors.primary)};
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  background-color: ${({ hasPredicted }) => (hasPredicted ? theme.colors.primary : theme.colors.white)};
  width: 100%;
  box-sizing: border-box;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xs} ${theme.spacing.s};
  width: 100%;
  box-sizing: border-box;
  flex-direction: column;
  gap: ${theme.spacing.xxs};
  
  @media ${devices.tablet} {
    flex-direction: row;
    gap: ${theme.spacing.s};
    padding: ${theme.spacing.xxs} ${theme.spacing.s};
  }
`;

const GameWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  margin: auto 0;
  padding: ${theme.spacing.s} 0 ${theme.spacing.s} 0;
  
  @media ${devices.tablet} {
    gap: ${theme.spacing.s};
  }
`;

const GoalInputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};

  @media ${devices.tablet} {
    gap: ${theme.spacing.s};
  }
`;

const TeamContainer = styled.div<{ team: 'home' | 'away' }>`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xxxs};
  box-sizing: border-box;
  flex: 1;
  align-items: ${({ team }) => (team === 'home' ? 'flex-end' : 'flex-start')};
  
  @media ${devices.tablet} {
    width: 100%;
    align-items: ${({ team }) => (team === 'home' ? 'flex-end' : 'flex-start')};
  }

  @media ${devices.mobile} {
    width: 100%;
    align-items: ${({ team }) => (team === 'home' ? 'flex-end' : 'flex-start')};
  }
`;

const AvatarAndTeamName = styled.div`
  display: flex;
  gap: ${theme.spacing.xxxs};
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
  align-items: center;
  margin: 0 auto;
`;

const GoalScorerSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.s} ${theme.spacing.xs};
  width: 100%;
  box-sizing: border-box;
  gap: ${theme.spacing.xs};

  @media ${devices.tablet} {
    padding: ${theme.spacing.s};
  }
`;

const SaveButtonSection = styled.div<{ hasPredicted?: boolean }>`
  background-color: ${({ hasPredicted }) => (hasPredicted ? theme.colors.gold : theme.colors.primary)};
  width: 100%;
`;

const EllipsisTypography = styled(NormalTypography)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const NoWrapTypography = styled(NormalTypography)`
  white-space: nowrap;
`;

const TeamName = styled(EmphasisTypography)`
  white-space: nowrap;
`;

const TagsSection = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xs} 0;
  flex-direction: column;
  min-height: 24px;
  width: 100%;
  
  @media ${devices.tablet} {
    flex-direction: row;
    gap: ${theme.spacing.m};
  }
`;

const OddsContainer = styled.div<{ hasPredicted?: boolean }>`
  /* background-color: ${({ hasPredicted }) => (hasPredicted ? theme.colors.gold : theme.colors.primaryFade)}; */
  padding: ${theme.spacing.xs} 0;
  border-radius: ${theme.borderRadius.s};
  /* display: flex;
  justify-content: space-between; */
  align-items: center;
  display: grid;
  grid-template-columns: 4fr 3fr 4fr;
  gap: ${theme.spacing.s};
  width: 100%;
  box-sizing: border-box;
  `;

const OddsWrapper = styled.div`
  display: flex;
  gap: ${theme.spacing.xxs};
  align-items: center;
  justify-content: center;
  display: flex;
  width: 100%;
  box-sizing: border-box;
`;

export default GamePredictor;
