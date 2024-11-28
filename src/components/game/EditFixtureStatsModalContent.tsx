import React from 'react';
import styled from 'styled-components';
import { Fixture } from '../../utils/Fixture';
import { PredictionLeague, LeagueGameWeek } from '../../utils/League';
import Button from '../buttons/Button';
import { theme, devices } from '../../theme';

interface EditFixtureStatsModalContentProps {
  fixture: Fixture;
  onCloseEditView: () => void;
  isLeagueCreator?: boolean;
  league: PredictionLeague;
  ongoingGameWeek: LeagueGameWeek | undefined;
  refetchLeague: () => void;
}

const EditFixtureStatsModalContent = ({
  fixture, onCloseEditView, isLeagueCreator, league, ongoingGameWeek, refetchLeague,
}: EditFixtureStatsModalContentProps) => {
  console.log('äää');

  return (
    <ModalContent>
      <Button onClick={onCloseEditView}>Close</Button>
    </ModalContent>
  );
};

// Gör dropdown/accordions för varje: Form, senaste match, odds, tabellplacering, insikter

const ModalContent = styled.div`
  display: flex;
  gap: ${theme.spacing.m};
  flex-direction: column;
  padding: ${theme.spacing.m} ${theme.spacing.m} ${theme.spacing.m} ${theme.spacing.m};

  @media ${devices.tablet} {
    padding: ${theme.spacing.l} ${theme.spacing.l} ${theme.spacing.l} ${theme.spacing.l};
  }
`;

export default EditFixtureStatsModalContent;
