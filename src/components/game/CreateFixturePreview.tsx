import React from 'react';
import styled from 'styled-components';
import {
  Check, PencilSimple, Trash, X,
} from '@phosphor-icons/react';
import { Fixture, TeamType } from '../../utils/Fixture';
import { theme } from '../../theme';
import ClubAvatar from '../avatar/ClubAvatar';
import Avatar, { AvatarSize } from '../avatar/Avatar';
import NationAvatar from '../avatar/NationAvatar';
import { EmphasisTypography, NormalTypography } from '../typography/Typography';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';
import { Team } from '../../utils/Team';
import IconButton from '../buttons/IconButton';
import { getTournamentIcon } from '../../utils/helpers';
import { Divider } from '../Divider';

interface FixturePreviewProps {
  fixture: Fixture;
  onEditClick: () => void;
  onDeleteClick: () => void;
  useShortNames?: boolean;
}

const CreateFixturePreview = ({
  fixture, useShortNames, onEditClick, onDeleteClick,
}: FixturePreviewProps) => {
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const getKickoffTime = (kickoffTime: string) => {
    const date = new Date(kickoffTime);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours}:${minutes < 10 ? `0${minutes}` : minutes}`;
  };

  const getKickoffDay = (kickoffTime: string) => {
    const date = new Date(kickoffTime);
    const day = date.toLocaleDateString('sv-SE', { day: '2-digit', month: 'short' }).replaceAll('.', '');
    return day;
  };

  const getAvatar = (team: Team) => (fixture.teamType === TeamType.CLUBS ? (
    <ClubAvatar
      logoUrl={team.logoUrl}
      clubName={team.name}
      size={isMobile ? AvatarSize.S : AvatarSize.M}
    />
  ) : (
    <NationAvatar
      flagUrl={team.logoUrl}
      nationName={team.name}
      size={isMobile ? AvatarSize.S : AvatarSize.M}
    />
  ));

  return (
    <Container>
      <Header>
        <div style={{ width: 60 }} />
        <TournamentContainer>
          <Avatar
            src={getTournamentIcon(fixture.tournament)}
            size={AvatarSize.XS}
          />
          <NormalTypography variant="m" color={theme.colors.textDefault}>
            {fixture.tournament}
          </NormalTypography>
        </TournamentContainer>
        <ButtonContainer>
          <IconButton
            icon={<PencilSimple size={20} />}
            colors={{ normal: theme.colors.primary, hover: theme.colors.primaryDark, active: theme.colors.primaryDarker }}
            onClick={onEditClick}
          />
          <IconButton
            icon={<Trash size={20} />}
            colors={{ normal: theme.colors.red, hover: theme.colors.redDark, active: theme.colors.redDarker }}
            onClick={onDeleteClick}
          />
        </ButtonContainer>
      </Header>
      <Divider />
      <Teams>
        <TeamContainer isHomeTeam>
          <EmphasisTypography variant="l">
            {useShortNames && Boolean(fixture.homeTeam.shortName) ? fixture.homeTeam.shortName : fixture.homeTeam.name}
          </EmphasisTypography>
          {getAvatar(fixture.homeTeam)}
        </TeamContainer>
        <KickoffDate>
          <EmphasisTypography variant="m" color={theme.colors.textDefault}>
            {getKickoffTime(fixture.kickOffTime)}
          </EmphasisTypography>
          <NormalTypography variant="s" color={theme.colors.textLight}>
            {getKickoffDay(fixture.kickOffTime)}
          </NormalTypography>
        </KickoffDate>
        <TeamContainer>
          {getAvatar(fixture.awayTeam)}
          <EmphasisTypography variant="l">
            {useShortNames && Boolean(fixture.awayTeam.shortName) ? fixture.awayTeam.shortName : fixture.awayTeam.name}
          </EmphasisTypography>
        </TeamContainer>
      </Teams>
      <Divider />
      <MiddleRow>
        <GoalScorerCheckboxContainer>
          {fixture.shouldPredictGoalScorer ? (
            <>
              <Check size={16} color={theme.colors.textLight} weight="bold" />
              <EmphasisTypography variant="s" color={theme.colors.textLight}>Tippa målskytt</EmphasisTypography>
            </>
          ) : (
            <>
              <X size={16} weight="bold" color={theme.colors.textLight} />
              <EmphasisTypography variant="s" color={theme.colors.textLight}>Ingen målskytt ska tippas</EmphasisTypography>
            </>
          )}
        </GoalScorerCheckboxContainer>
      </MiddleRow>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: ${theme.borderRadius.m};
  background-color: ${theme.colors.silverLighter};
  width: 100%;
  box-sizing: border-box;
  position: relative;
  border: 1px solid ${theme.colors.silverLight};
`;

const Header = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.xxs} ${theme.spacing.s};
`;

const MiddleRow = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xxs} ${theme.spacing.s};
`;

const Teams = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: ${theme.spacing.m};
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xxs} ${theme.spacing.s};
`;

const TeamContainer = styled.div<{ isHomeTeam?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xxs};
  width: 100%;
  white-space: nowrap;
  ${({ isHomeTeam }) => isHomeTeam && 'justify-content: flex-end;'}
`;

const TournamentContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.xxs};
  align-items: center;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.xxxs};
  align-items: center;
`;

const GoalScorerCheckboxContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.xxs};
  align-items: center;
`;

const KickoffDate = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export default CreateFixturePreview;
