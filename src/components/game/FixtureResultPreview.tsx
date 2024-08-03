import React, { useState } from 'react'
import { Fixture, Prediction, TeamType } from '../../utils/Fixture';
import { AvatarSize } from '../avatar/Avatar';
import ClubAvatar from '../avatar/ClubAvatar';
import NationAvatar from '../avatar/NationAvatar';
import { EmphasisTypography, NormalTypography } from '../typography/Typography';
import { theme } from '../../theme';
import styled from 'styled-components';
import { Section } from '../section/Section';
import TextButton from '../buttons/TextButton';
import { CaretDown } from '@phosphor-icons/react';
import PredictionScoreCard from './PredictionScoreCard';
import { useUser } from '../../context/UserContext';

interface FixtureResultPreviewProps {
  fixture: Fixture;
  predictions?: Array<Prediction>;
}

const FixtureResultPreview = ({ fixture, predictions }: FixtureResultPreviewProps) => {
  const { user } = useUser()

  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <Section gap='xs'>
      <Section
        justifyContent='space-between'
        alignItems='center'
        flexDirection='row'
        backgroundColor={theme.colors.white}
        borderRadius={theme.borderRadius.s}
      >
        <Teams>
          <FullTimeIndicator>
            <EmphasisTypography variant='m' color={theme.colors.primaryDarker}>FT</EmphasisTypography>
          </FullTimeIndicator>
          <TeamContainer>
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
            <EmphasisTypography variant='m'>{fixture.homeTeam.name}</EmphasisTypography>
          </TeamContainer>
          <NormalTypography variant='s' color={theme.colors.textLight}>vs</NormalTypography>
          <TeamContainer>
            <EmphasisTypography variant='m'>{fixture.awayTeam.name}</EmphasisTypography>
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
          </TeamContainer>
        </Teams>
        <Section gap='xs' flexDirection='row' alignItems='center' fitContent>
          <ResultContainer>
            <NormalTypography variant='m' color={theme.colors.primaryDark}>{fixture.finalResult?.homeTeamGoals ?? '?'} - {fixture.finalResult?.awayTeamGoals ?? '?'}</NormalTypography>
          </ResultContainer>
          {predictions && (
            <PointsContainer>
              <NormalTypography variant='m' color={theme.colors.gold}>{predictions.find((p) => p.fixtureId === fixture.id && p.userId === user?.documentId)?.points?.total ?? '?'} p</NormalTypography>
            </PointsContainer>
          )}
          {predictions && predictions.length > 0 && (
            <TextButton 
              onClick={() => setIsExpanded(!isExpanded)}
              endIcon={
                <DropdownIconContainer isExpanded={isExpanded}>
                  <CaretDown size={16} color={theme.colors.primary} weight="bold" />
                </DropdownIconContainer>
              }
            >
              Visa tips
            </TextButton>
          )}
        </Section>
      </Section>
      {isExpanded && predictions && (
        <PredictionsContainer>
          {predictions.map((prediction, index, array) => (
            <PredictionScoreCard prediction={prediction} />
          ))}
        </PredictionsContainer>
      )}
    </Section>
  )
};

const FullTimeIndicator = styled.div`
  height: 100%;
  width: fit-content;
  /* margin-right: ${theme.spacing.xs}; */
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${theme.borderRadius.s} 0 0 ${theme.borderRadius.s};
  border-right: 1px solid ${theme.colors.primaryLighter};
  background-color: ${theme.colors.primaryBleach};
  padding: 0 ${theme.spacing.xs};
`;

const Teams = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  align-items: center;
  height: 44px;
`;

const TeamContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.xxxs};
  align-items: center;
`;

const DropdownIconContainer = styled.div<{ isExpanded: boolean }>`
  transform: ${({ isExpanded }) => isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'};
  transition: transform 0.2s ease;
`;

const PredictionsContainer = styled.div`
  gap: ${theme.spacing.xxs};
  width: 100%;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  margin-bottom: ${theme.spacing.s};
`;

const ResultContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px ${theme.spacing.xxs};
  border-radius: ${theme.borderRadius.s};
  background-color: ${theme.colors.primaryBleach};
  width: fit-content;
`;

const PointsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px ${theme.spacing.xxs};
  border-radius: ${theme.borderRadius.s};
  background-color: ${theme.colors.primaryDark};
  width: fit-content;
`;

export default FixtureResultPreview;