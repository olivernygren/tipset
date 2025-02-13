import React from 'react';
import styled from 'styled-components';
import {
  ArrowUUpLeft, Check, CheckCircle, X,
} from '@phosphor-icons/react';
import { Fixture, TeamType } from '../../utils/Fixture';
import { Section } from '../section/Section';
import { devices, theme } from '../../theme';
import ClubAvatar from '../avatar/ClubAvatar';
import { AvatarSize } from '../avatar/Avatar';
import NationAvatar from '../avatar/NationAvatar';
import { EmphasisTypography, NormalTypography } from '../typography/Typography';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';
import { Team } from '../../utils/Team';
import { Divider } from '../Divider';
import TextButton from '../buttons/TextButton';

interface FixturePreviewProps {
  fixture: Fixture;
  onClick: () => void;
}

const CorrectingFixtureCard = ({ fixture, onClick }: FixturePreviewProps) => {
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const getAvatar = (team: Team) => (fixture.teamType === TeamType.CLUBS ? (
    <ClubAvatar
      logoUrl={team.logoUrl}
      clubName={team.name}
      size={isMobile ? AvatarSize.XS : AvatarSize.S}
    />
  ) : (
    <NationAvatar
      flagUrl={team.logoUrl}
      nationName={team.name}
      size={isMobile ? AvatarSize.XS : AvatarSize.S}
    />
  ));

  return (
    <Container>
      <TopContainer>
        <NormalTypography variant={isMobile ? 's' : 'm'} color={theme.colors.silverDark}>
          {fixture.finalResult ? 'Rättad' : 'Inte rättad'}
        </NormalTypography>
        {fixture.finalResult ? (
          <Check size={16} weight="bold" color={theme.colors.silverDark} />
        ) : (
          <X size={16} weight="bold" color={theme.colors.silverDark} />
        )}
      </TopContainer>
      <Divider />
      <Teams>
        <TeamContainer isHomeTeam>
          <EmphasisTypography variant={isMobile ? 's' : 'm'}>
            {fixture.homeTeam.shortName ? fixture.homeTeam.shortName : fixture.homeTeam.name}
          </EmphasisTypography>
          {getAvatar(fixture.homeTeam)}
        </TeamContainer>
        <Section justifyContent="center" flexDirection="row">
          <NormalTypography variant={isMobile ? 's' : 'm'} color={fixture.finalResult ? theme.colors.textDefault : theme.colors.textLight}>
            {fixture.finalResult ? `${fixture.finalResult.homeTeamGoals} - ${fixture.finalResult.awayTeamGoals}` : 'vs'}
          </NormalTypography>
        </Section>
        <TeamContainer>
          {getAvatar(fixture.awayTeam)}
          <EmphasisTypography variant={isMobile ? 's' : 'm'}>
            {fixture.awayTeam.shortName ? fixture.awayTeam.shortName : fixture.awayTeam.name}
          </EmphasisTypography>
        </TeamContainer>
      </Teams>
      <Divider />
      <BottomContainer>
        <TextButton
          size={isMobile ? 's' : 'm'}
          onClick={onClick}
          noPadding
          icon={fixture.finalResult
            ? <ArrowUUpLeft size={isMobile ? 16 : 20} weight="bold" color={theme.colors.primary} />
            : <CheckCircle size={isMobile ? 16 : 20} weight="fill" color={theme.colors.primary} />}
        >
          {fixture.finalResult ? 'Ändra' : 'Rätta'}
        </TextButton>
      </BottomContainer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: ${theme.borderRadius.m};
  background-color: ${theme.colors.silverLighter};
  width: 100%;
  box-sizing: border-box;
  position: relative;
  border: 1px solid ${theme.colors.silverLight};
  box-shadow: 0px 2px 0px 0px ${theme.colors.silverLight};
`;

const Teams = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: ${theme.spacing.xxs};
  flex: 1;
  gap: ${theme.spacing.xxs};
  
  @media ${devices.tablet} {
    align-items: center;
    padding: ${theme.spacing.xxxs};
    gap: ${theme.spacing.xs};
    height: 52px;
  }
`;

const TeamContainer = styled.div<{ isHomeTeam?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xxxs};
  width: 100%;
  white-space: nowrap;
  ${({ isHomeTeam }) => (isHomeTeam ? 'justify-content: flex-end;' : 'justify-content: flex-start;')}
  
  @media ${devices.tablet} {
    gap: 0;
  }
`;

const TopContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.xxs};
  padding: ${theme.spacing.xxs};
  width: 100%;
  box-sizing: border-box;
`;

const BottomContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.xxs};
  width: 100%;
  box-sizing: border-box;
  padding: ${theme.spacing.xxs};
  
  @media ${devices.tablet} {
    padding: ${theme.spacing.xs} ${theme.spacing.xxs};
  }
`;

export default CorrectingFixtureCard;
