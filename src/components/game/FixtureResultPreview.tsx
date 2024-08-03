import React, { useState } from 'react'
import { Fixture, Prediction, TeamType } from '../../utils/Fixture';
import { AvatarSize } from '../avatar/Avatar';
import ClubAvatar from '../avatar/ClubAvatar';
import NationAvatar from '../avatar/NationAvatar';
import { NormalTypography } from '../typography/Typography';
import { theme } from '../../theme';
import styled from 'styled-components';
import { Section } from '../section/Section';
import TextButton from '../buttons/TextButton';
import { CaretDown } from '@phosphor-icons/react';
import { set } from 'date-fns';
import { getUserNameById } from '../../utils/firebaseHelpers';
import UserName from '../typography/UserName';

interface FixtureResultPreviewProps {
  fixture: Fixture;
  predictions?: Array<Prediction>;
}

const FixtureResultPreview = ({ fixture, predictions }: FixtureResultPreviewProps) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <Section gap='m'>
      <Section justifyContent='space-between' alignItems='center' flexDirection='row'>
        <Teams>
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
            <NormalTypography variant='m'>{fixture.homeTeam.name}</NormalTypography>
          </TeamContainer>
          <NormalTypography variant='s' color={theme.colors.textLight}>vs</NormalTypography>
          <TeamContainer>
            <NormalTypography variant='m'>{fixture.awayTeam.name}</NormalTypography>
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
      {isExpanded && predictions && predictions.map((prediction, index, array) => (
        <Section key={index} flexDirection='row' justifyContent='space-between'>
          <NormalTypography variant='m'>
            <UserName userId={prediction.userId} />
          </NormalTypography>
          <NormalTypography variant='m'>{prediction.homeGoals} - {prediction.awayGoals}</NormalTypography>
        </Section>
      ))}
    </Section>
  )
};

const Teams = styled.div`
  display: flex;
  gap: ${theme.spacing.s};
  align-items: center;
`;

const TeamContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  align-items: center;
`;

const DropdownIconContainer = styled.div<{ isExpanded: boolean }>`
  transform: ${({ isExpanded }) => isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'};
  transition: transform 0.2s ease;
`;

export default FixtureResultPreview;