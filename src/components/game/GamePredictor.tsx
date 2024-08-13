import React, { useState } from 'react';
import { MapPin } from '@phosphor-icons/react';
import styled from 'styled-components';
import { Section } from '../section/Section';
import { EmphasisTypography, NormalTypography } from '../typography/Typography';
import { Fixture, Prediction, TeamType } from '../../utils/Fixture';
import {
  GeneralPositionEnum, Player, getPlayerById, getPlayersByGeneralPosition,
} from '../../utils/Players';
import { AvatarSize } from '../avatar/Avatar';
import { devices, theme } from '../../theme';
import { Team } from '../../utils/Team';
import { Divider } from '../Divider';
// import FormIcon from '../form/FormIcon';
import Select from '../input/Select';
import Button from '../buttons/Button';
import ClubAvatar from '../avatar/ClubAvatar';
import NationAvatar from '../avatar/NationAvatar';
import GoalsInput from './GoalsInput';
import { defenderGoalPoints, forwardGoalPoints, midfielderGoalPoints } from '../../utils/helpers';
import { errorNotify } from '../../utils/toast/toastHelpers';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';

interface GamePredictorProps {
  game: Fixture;
  gameNumber: number;
  onResultUpdate: (gameNumber: number, homeGoals: string, awayGoals: string) => void;
  onPlayerPredictionUpdate: (gameNumber: number, player: Player | undefined) => void;
  onSave: (homeGoals: string, awayGoals: string, predictedPlayerToScore?: Player) => void;
  hasPredicted?: boolean;
  predictionValue?: Prediction;
  loading?: boolean;
  anyFixtureHasPredictGoalScorer: boolean;
}

const GamePredictor = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  game, gameNumber, onPlayerPredictionUpdate, onResultUpdate, onSave, hasPredicted, predictionValue, loading, anyFixtureHasPredictGoalScorer,
}: GamePredictorProps) => {
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const [homeGoals, setHomeGoals] = useState<string>(predictionValue?.homeGoals.toString() ?? '');
  const [awayGoals, setAwayGoals] = useState<string>(predictionValue?.awayGoals.toString() ?? '');
  const [predictedPlayerToScore, setPredictedPlayerToScore] = useState<Player | undefined>(predictionValue && predictionValue.goalScorer ? predictionValue.goalScorer : undefined);

  const kickoffTimeHasPassed = new Date(game.kickOffTime) < new Date();

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
              size={isMobile ? AvatarSize.M : AvatarSize.L}
              showBorder={hasPredicted}
              isDarkMode={hasPredicted}
            />
          ) : (
            <NationAvatar
              nationName={name}
              flagUrl={logoUrl}
              size={isMobile ? AvatarSize.M : AvatarSize.L}
              isDarkMode={hasPredicted}
            />
          )}
          <TeamName variant={isMobile ? 's' : 'm'} color={hasPredicted ? theme.colors.white : theme.colors.textDefault} align="center">
            {displayName}
          </TeamName>
        </AvatarAndTeamName>
        {/* {getTeamForm(isAwayTeam)} */}
      </TeamContainer>
    );
  };

  // const getTeamForm = (isAwayTeam: boolean) => {
  //   const form = isAwayTeam ? game.awayTeamForm : game.homeTeamForm;
  //   return (
  //     <Section flexDirection='row' gap='xxxs' justifyContent={isAwayTeam ? 'flex-start' : 'flex-end'}>
  //       {form.map((outcome, index) => (
  //         <FormIcon key={index} outcome={outcome} />
  //       ))}
  //     </Section>
  //   )
  // }

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
    const weekday = new Date(game.kickOffTime).toLocaleDateString('sv-SE', { weekday: 'long' });
    const weekdayCapitalized = weekday.charAt(0).toUpperCase() + weekday.slice(1);
    const date = new Date(game.kickOffTime).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
    const time = new Date(game.kickOffTime).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });

    return `${weekdayCapitalized} ${date.replaceAll('.', '')} ${time}`;
  };

  const getOptionItem = (player: Player) => ({
    value: player.id,
    label: player.name,
  });

  const getOptionGroups = () => {
    const defenders = getPlayersByGeneralPosition(GeneralPositionEnum.DF);
    const midfielders = getPlayersByGeneralPosition(GeneralPositionEnum.MF);
    const forwards = getPlayersByGeneralPosition(GeneralPositionEnum.FW);

    return [
      {
        label: 'Välj spelare',
        options: [{ value: 'Välj spelare', label: 'Välj spelare' }],
      },
      {
        label: `Försvarare (${defenderGoalPoints}p)`,
        options: defenders.map(getOptionItem),
      },
      {
        label: `Mittfältare (${midfielderGoalPoints}p)`,
        options: midfielders.map(getOptionItem),
      },
      {
        label: `Anfallare (${forwardGoalPoints}p)`,
        options: forwards.map(getOptionItem),
      },
    ];
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
          </Section>
        </>
      );
    }
    return (
      <>
        <Section flexDirection="row" gap="xxxs" alignItems="center" fitContent>
          <MapPin size={16} weight="fill" color={getTextColor()} />
          <EllipsisTypography variant="s" align="center" color={getTextColor()}>{game.stadium}</EllipsisTypography>
        </Section>
        <NormalTypography variant="s" color={getTextColor()}>•</NormalTypography>
        <NoWrapTypography variant="s" align="center" color={getTextColor()}>{getKickoffTime()}</NoWrapTypography>
        <NormalTypography variant="s" color={getTextColor()}>•</NormalTypography>
        <EllipsisTypography variant="s" align="center" color={getTextColor()}>{game.tournament}</EllipsisTypography>
      </>
    );
  };

  return (
    <Card hasPredicted={hasPredicted}>
      <CardHeader>
        {getCardHeaderContent()}
      </CardHeader>
      <Divider color={hasPredicted ? theme.colors.primaryLight : theme.colors.silverLighter} />
      <GameWrapper>
        {getTeam(game.homeTeam, false)}
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
        {getTeam(game.awayTeam, true)}
      </GameWrapper>
      <Divider color={hasPredicted ? theme.colors.primaryLight : theme.colors.silverLighter} />
      {/* {anyFixtureHasPredictGoalScorer && ( */}
      <>
        <GoalScorerSection>
          {game.shouldPredictGoalScorer ? (
            <EmphasisTypography variant={isMobile ? 's' : 'm'} color={hasPredicted ? theme.colors.white : theme.colors.textDefault}>{isMobile ? 'Välj målskytt' : 'Välj målskytt i matchen'}</EmphasisTypography>
          ) : (
            <Section flexDirection="row" alignItems="center" justifyContent="center">
              <EmphasisTypography variant={isMobile ? 's' : 'm'} color={hasPredicted ? theme.colors.primaryLighter : theme.colors.silver}>Ingen målskytt ska tippas</EmphasisTypography>
            </Section>
          )}
          {game.shouldPredictGoalScorer && (
          <Select
            options={[]}
            optionGroups={getOptionGroups()}
            value={predictedPlayerToScore?.id || ''}
            onChange={(value) => handleUpdatePlayerPrediction(getPlayerById(value))}
            disabled={!game.shouldPredictGoalScorer || kickoffTimeHasPassed}
          />
          )}
        </GoalScorerSection>
        <Divider color={hasPredicted ? theme.colors.primaryLight : theme.colors.silverLighter} />
      </>
      {/* )} */}
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
    padding: ${theme.spacing.s};
  }
`;

const GameWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-items: center;
  width: fit-content;
  box-sizing: border-box;
  margin: auto 0;
  padding: ${theme.spacing.s} 0;
  gap: ${theme.spacing.xs};
  
  @media ${devices.tablet} {
    display: grid;
    width: 100%;
    grid-template-columns: 1fr auto auto auto 1fr;
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
  padding-left: ${({ team }) => (team === 'home' ? '0' : theme.spacing.xxs)};
  padding-right: ${({ team }) => (team === 'away' ? '0' : theme.spacing.xxs)};
  
  @media ${devices.tablet} {
    width: 100%;
    align-items: ${({ team }) => (team === 'home' ? 'flex-end' : 'flex-start')};
    padding-left: ${({ team }) => (team === 'home' ? '0' : theme.spacing.s)};
    padding-right: ${({ team }) => (team === 'away' ? '0' : theme.spacing.s)};
  }

  @media ${devices.mobile} {
    width: 100%;
    align-items: ${({ team }) => (team === 'home' ? 'flex-end' : 'flex-start')};
    padding-left: ${({ team }) => (team === 'home' ? '0' : theme.spacing.xs)};
    padding-right: ${({ team }) => (team === 'away' ? '0' : theme.spacing.xs)};
  }
`;

const AvatarAndTeamName = styled.div`
  display: flex;
  gap: ${theme.spacing.xxxs};
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
  align-items: center;
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
  margin-top: auto;
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

export default GamePredictor;
