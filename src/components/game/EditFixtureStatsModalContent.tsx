import React, { useState } from 'react';
import styled from 'styled-components';
import { updateDoc, doc } from 'firebase/firestore';
import { CaretDown } from '@phosphor-icons/react';
import {
  Fixture, FixtureOdds, FixtureOutcomeEnum, FixturePreviewStats, FixtureResult,
} from '../../utils/Fixture';
import { PredictionLeague, LeagueGameWeek } from '../../utils/League';
import Button from '../buttons/Button';
import { theme, devices } from '../../theme';
import { db } from '../../config/firebase';
import { CollectionEnum } from '../../utils/Firebase';
import { errorNotify } from '../../utils/toast/toastHelpers';
import { Team, getTeamByName } from '../../utils/Team';
import { EmphasisTypography, HeadingsTypography } from '../typography/Typography';
import FormIcon from '../form/FormIcon';

interface EditFixtureStatsModalContentProps {
  fixture: Fixture;
  onCloseEditView: () => void;
  league: PredictionLeague;
  ongoingGameWeek: LeagueGameWeek | undefined;
  refetchLeague: () => void;
}

const EditFixtureStatsModalContent = ({
  fixture, onCloseEditView, league, ongoingGameWeek, refetchLeague,
}: EditFixtureStatsModalContentProps) => {
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [includeLastFixture, setIncludeLastFixture] = useState<boolean>(false);
  const [includeStandings, setIncludeStandings] = useState<boolean>(false);
  const [includeInsights, setIncludeInsights] = useState<boolean>(false);
  const [includeOdds, setIncludeOdds] = useState<boolean>(false);

  // Dropdown states
  const [isFormExpanded, setIsFormExpanded] = useState<boolean>(false);
  const [isLastFixtureExpanded, setIsLastFixtureExpanded] = useState<boolean>(false);
  const [isStandingsExpanded, setIsStandingsExpanded] = useState<boolean>(false);
  const [isInsightsExpanded, setIsInsightsExpanded] = useState<boolean>(false);
  const [isOddsExpanded, setIsOddsExpanded] = useState<boolean>(false);

  // Edit values
  const [editStandingsPositionValue, setEditStandingsPositionValue] = useState({
    homeTeam: fixture.previewStats?.homeTeam.standingsPosition ?? '',
    awayTeam: fixture.previewStats?.awayTeam.standingsPosition ?? '',
  });
  const [editStandingsPositionPoints, setEditStandingsPositionPoints] = useState({
    homeTeam: fixture.previewStats?.homeTeam.standingsPoints ?? '',
    awayTeam: fixture.previewStats?.awayTeam.standingsPoints ?? '',
  });
  const [editFormValue, setEditFormValue] = useState<{ homeTeam: Array<FixtureOutcomeEnum>, awayTeam: Array<FixtureOutcomeEnum> }>({
    homeTeam: fixture.previewStats?.homeTeam.form ?? [FixtureOutcomeEnum.NONE, FixtureOutcomeEnum.NONE, FixtureOutcomeEnum.NONE, FixtureOutcomeEnum.NONE, FixtureOutcomeEnum.NONE],
    awayTeam: fixture.previewStats?.awayTeam.form ?? [FixtureOutcomeEnum.NONE, FixtureOutcomeEnum.NONE, FixtureOutcomeEnum.NONE, FixtureOutcomeEnum.NONE, FixtureOutcomeEnum.NONE],
  });
  const [showEditOutcomeMenu, setShowEditOutcomeMenu] = useState<{ team: 'home' | 'away', index: number }>({ team: 'home', index: -1 });
  const [editLastFixtureOpponents, setEditLastFixtureOpponents] = useState<{ homeTeamOpponent: Team | undefined, awayTeamOpponent: Team | undefined }>({
    homeTeamOpponent: fixture.previewStats?.homeTeam.lastFixture?.opponent ? getTeamByName(fixture.previewStats?.homeTeam.lastFixture?.opponent) : undefined,
    awayTeamOpponent: fixture.previewStats?.awayTeam.lastFixture?.opponent ? getTeamByName(fixture.previewStats?.awayTeam.lastFixture?.opponent) : undefined,
  });
  const [editHomeTeamLastFixtureResult, setEditHomeTeamLastFixtureResult] = useState<FixtureResult>({
    homeTeamGoals: fixture.previewStats?.homeTeam.lastFixture?.result.homeTeamGoals ?? 0,
    awayTeamGoals: fixture.previewStats?.homeTeam.lastFixture?.result.awayTeamGoals ?? 0,
  });
  const [editAwayTeamLastFixtureResult, setEditAwayTeamLastFixtureResult] = useState<FixtureResult>({
    homeTeamGoals: fixture.previewStats?.awayTeam.lastFixture?.result.homeTeamGoals ?? 0,
    awayTeamGoals: fixture.previewStats?.awayTeam.lastFixture?.result.awayTeamGoals ?? 0,
  });
  const [homeTeamLastFixtureOutcome, setHomeTeamLastFixtureOutcome] = useState<FixtureOutcomeEnum>(fixture.previewStats?.homeTeam.lastFixture?.outcome ?? FixtureOutcomeEnum.NONE);
  const [awayTeamLastFixtureOutcome, setAwayTeamLastFixtureOutcome] = useState<FixtureOutcomeEnum>(fixture.previewStats?.awayTeam.lastFixture?.outcome ?? FixtureOutcomeEnum.NONE);
  const [odds, setOdds] = useState<FixtureOdds>({ homeWin: fixture.odds?.homeWin.toString() ?? '', draw: fixture.odds?.draw.toString() ?? '', awayWin: fixture.odds?.awayWin.toString() ?? '' });
  const [homeTeamInsights, setHomeTeamInsights] = useState<Array<string>>(fixture.previewStats?.homeTeam?.insights ?? []);
  const [awayTeamInsights, setAwayTeamInsights] = useState<Array<string>>(fixture.previewStats?.awayTeam?.insights ?? []);
  const [editHomeTeamInsightsValue, setEditHomeTeamInsightsValue] = useState<string>('');
  const [editAwayTeamInsightsValue, setEditAwayTeamInsightsValue] = useState<string>('');
  const [createNewHomeTeamInsight, setCreateNewHomeTeamInsight] = useState(false);
  const [createNewAwayTeamInsight, setCreateNewAwayTeamInsight] = useState(false);

  const handleSaveStats = async () => {
    if (!ongoingGameWeek) return;

    setSaveLoading(true);

    const previewStats: FixturePreviewStats = {
      homeTeam: {
        form: editFormValue.homeTeam,
        ...(includeStandings && { standingsPosition: editStandingsPositionValue.homeTeam }),
        ...(includeStandings && { standingsPoints: editStandingsPositionPoints.homeTeam }),
        ...(includeInsights && { insights: homeTeamInsights }),
        ...(includeLastFixture && {
          lastFixture: {
            opponent: editLastFixtureOpponents.homeTeamOpponent?.name ?? '',
            result: editHomeTeamLastFixtureResult,
            outcome: homeTeamLastFixtureOutcome,
          },
        }),
      },
      lastUpdated: new Date().toISOString(),
      awayTeam: {
        form: editFormValue.awayTeam,
        ...(includeStandings && { standingsPosition: editStandingsPositionValue.awayTeam }),
        ...(includeStandings && { standingsPoints: editStandingsPositionPoints.awayTeam }),
        ...(includeInsights && { insights: awayTeamInsights }),
        ...(includeLastFixture && {
          lastFixture: {
            opponent: editLastFixtureOpponents.awayTeamOpponent?.name ?? '',
            result: editAwayTeamLastFixtureResult,
            outcome: awayTeamLastFixtureOutcome,
          },
        }),
      },
    };

    const updatedFixture: Fixture = {
      ...fixture,
      previewStats,
      ...(includeOdds && { odds }),
    };

    const updatedGameWeek: LeagueGameWeek = {
      ...ongoingGameWeek,
      games: {
        ...ongoingGameWeek.games,
        fixtures: ongoingGameWeek.games.fixtures.map((fixture) => {
          if (fixture.id === updatedFixture.id) {
            return updatedFixture;
          }
          return fixture;
        }),
      },
    };

    const updatedGameWeeks = league.gameWeeks?.map((week) => {
      if (week.round === ongoingGameWeek.round) {
        return updatedGameWeek;
      }
      return week;
    });

    try {
      await updateDoc(doc(db, CollectionEnum.LEAGUES, league.documentId), {
        gameWeeks: updatedGameWeeks,
      });
      refetchLeague();
    } catch (error) {
      errorNotify('Något gick fel när statistiken skulle sparas');
      setSaveLoading(false);
    } finally {
      setSaveLoading(false);
      // if (isMobile) {
      //   setMobileSelectedTeam(mobileSelectedTeam === 'home' ? 'away' : 'home');
      // } else {
      //   onCloseEditView();
      // }
      onCloseEditView();
    }
  };

  const getClickableFormIcon = (outcome: FixtureOutcomeEnum, index: number, isHomeTeam: boolean) => (
    <FormIcon
      key={outcome}
      outcome={outcome}
      onClick={() => setEditFormValue((oldstate) => {
        const newForm = isHomeTeam ? [...oldstate.homeTeam] : [...oldstate.awayTeam];
        newForm[index] = outcome;
        setShowEditOutcomeMenu({ team: isHomeTeam ? 'home' : 'away', index: -1 });
        const newFormObj = isHomeTeam ? { ...oldstate, homeTeam: newForm } : { ...oldstate, awayTeam: newForm };
        return newFormObj;
      })}
    />
  );

  const getTeamForm = (isHomeTeam: boolean) => {
    const teamPreviewStats = isHomeTeam ? fixture.previewStats?.homeTeam : fixture.previewStats?.awayTeam;

    return teamPreviewStats?.form.map((outcome, index) => (
      <FormIconContainer key={`${index}-${outcome}`}>
        {showEditOutcomeMenu.team === (isHomeTeam ? 'home' : 'away') && showEditOutcomeMenu.index === index && (
          <SelectOutcomeMenu>
            {Object.values(FixtureOutcomeEnum).map((outcome) => getClickableFormIcon(outcome, index, isHomeTeam))}
          </SelectOutcomeMenu>
        )}
        <FormIcon
          outcome={outcome as FixtureOutcomeEnum}
          onClick={() => {
            if (showEditOutcomeMenu.team === (isHomeTeam ? 'home' : 'away') && showEditOutcomeMenu.index === index) {
              setShowEditOutcomeMenu({ team: isHomeTeam ? 'home' : 'away', index: -1 });
            } else {
              setShowEditOutcomeMenu({ team: isHomeTeam ? 'home' : 'away', index });
            }
          }}
        />
      </FormIconContainer>
    ));
  };

  return (
    <ModalContent>
      <DropdownsContainer>
        <Dropdown isExpanded={isFormExpanded}>
          <DropdownHeader onClick={() => setIsFormExpanded(!isFormExpanded)}>
            <EmphasisTypography>Form</EmphasisTypography>
            <RotatingIcon isExpanded={isFormExpanded}>
              <CaretDown size={20} color={theme.colors.textDefault} />
            </RotatingIcon>
          </DropdownHeader>
          <DropdownContent>
            <TeamColumn>
              <HeadingsTypography variant="h6">{fixture.homeTeam.name}</HeadingsTypography>
              <FormIcons>
                {getTeamForm(true)}
              </FormIcons>
            </TeamColumn>
            <TeamColumn>
              <HeadingsTypography variant="h6">{fixture.awayTeam.name}</HeadingsTypography>
              <FormIcons>
                {getTeamForm(false)}
              </FormIcons>
            </TeamColumn>
          </DropdownContent>
        </Dropdown>
        <Dropdown isExpanded={isStandingsExpanded}>
          <DropdownHeader onClick={() => setIsStandingsExpanded(!isStandingsExpanded)}>
            <EmphasisTypography>Tabellplacering</EmphasisTypography>
            <RotatingIcon isExpanded={isStandingsExpanded}>
              <CaretDown size={20} color={theme.colors.textDefault} />
            </RotatingIcon>
          </DropdownHeader>
          <DropdownContent>
            <TeamColumn>
              <HeadingsTypography variant="h6">{fixture.homeTeam.name}</HeadingsTypography>
            </TeamColumn>
            <TeamColumn>
              <HeadingsTypography variant="h6">{fixture.awayTeam.name}</HeadingsTypography>
            </TeamColumn>
          </DropdownContent>
        </Dropdown>
        <Dropdown isExpanded={isLastFixtureExpanded}>
          <DropdownHeader onClick={() => setIsLastFixtureExpanded(!isLastFixtureExpanded)}>
            <EmphasisTypography>Senaste matchen</EmphasisTypography>
            <RotatingIcon isExpanded={isLastFixtureExpanded}>
              <CaretDown size={20} color={theme.colors.textDefault} />
            </RotatingIcon>
          </DropdownHeader>
          <DropdownContent>
            <TeamColumn>
              <HeadingsTypography variant="h6">{fixture.homeTeam.name}</HeadingsTypography>
            </TeamColumn>
            <TeamColumn>
              <HeadingsTypography variant="h6">{fixture.awayTeam.name}</HeadingsTypography>
            </TeamColumn>
          </DropdownContent>
        </Dropdown>
        <Dropdown isExpanded={isInsightsExpanded}>
          <DropdownHeader onClick={() => setIsInsightsExpanded(!isInsightsExpanded)}>
            <EmphasisTypography>Insikter</EmphasisTypography>
            <RotatingIcon isExpanded={isInsightsExpanded}>
              <CaretDown size={20} color={theme.colors.textDefault} />
            </RotatingIcon>
          </DropdownHeader>
          <DropdownContent>
            <TeamColumn>
              <HeadingsTypography variant="h6">{fixture.homeTeam.name}</HeadingsTypography>
            </TeamColumn>
            <TeamColumn>
              <HeadingsTypography variant="h6">{fixture.awayTeam.name}</HeadingsTypography>
            </TeamColumn>
          </DropdownContent>
        </Dropdown>
        <Dropdown isExpanded={isOddsExpanded}>
          <DropdownHeader onClick={() => setIsOddsExpanded(!isOddsExpanded)}>
            <EmphasisTypography>Odds</EmphasisTypography>
            <RotatingIcon isExpanded={isOddsExpanded}>
              <CaretDown size={20} color={theme.colors.textDefault} />
            </RotatingIcon>
          </DropdownHeader>
          <DropdownContent>
            <TeamColumn>
              <HeadingsTypography variant="h6">{fixture.homeTeam.name}</HeadingsTypography>
            </TeamColumn>
            <TeamColumn>
              <HeadingsTypography variant="h6">{fixture.awayTeam.name}</HeadingsTypography>
            </TeamColumn>
          </DropdownContent>
        </Dropdown>
      </DropdownsContainer>
      <ActionButtonsContainer>
        <Button
          variant="secondary"
          fullWidth
          onClick={onCloseEditView}
        >
          Avbryt
        </Button>
        <Button
          onClick={handleSaveStats}
          fullWidth
        >
          Spara
        </Button>
      </ActionButtonsContainer>
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

const DropdownsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.s};
`;

const Dropdown = styled.div<{ isExpanded?: boolean }>`
  display: flex;
  flex-direction: column;
  /* gap: ${theme.spacing.s}; */
  background-color: ${theme.colors.silverBleach};
  border-radius: ${theme.borderRadius.m};
  border: 1px solid ${theme.colors.silverLighter};
  width: 100%;
  box-sizing: border-box;
  transition: max-height 0.3s ease;
  overflow-y: hidden;
  max-height: ${({ isExpanded }) => (isExpanded ? '1000px' : '56px')};
`;

const DropdownHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: ${theme.spacing.s};
`;

const RotatingIcon = styled.div<{ isExpanded?: boolean }>`
  svg {
    transform: ${({ isExpanded }) => (isExpanded ? 'rotate(180deg)' : 'rotate(0deg)')};
    transition: transform 0.3s ease;
  }
`;

const DropdownContent = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${theme.spacing.m};
  padding: ${theme.spacing.xxxs} ${theme.spacing.s} ${theme.spacing.s} ${theme.spacing.s};
`;

const TeamColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  flex: 1;
`;

const FormIcons = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xxs};
`;

const FormIconContainer = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`;

const SelectOutcomeMenu = styled.div`
  position: absolute;
  top: -44px;
  left: 50%;
  transform: translateX(-50%);
  background-color: ${theme.colors.white};
  border: 1px solid ${theme.colors.silverLight};
  border-radius: ${theme.borderRadius.xs};
  padding: ${theme.spacing.xxs};
  z-index: 1;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xxxs};
`;

export default EditFixtureStatsModalContent;
