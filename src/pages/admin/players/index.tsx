import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Plus, Sparkle } from '@phosphor-icons/react';
import { collection, getDocs } from 'firebase/firestore';
import { theme } from '../../../theme';
import { EmphasisTypography, HeadingsTypography } from '../../../components/typography/Typography';
import Button from '../../../components/buttons/Button';
import { Divider } from '../../../components/Divider';
import { Team } from '../../../utils/Team';
import RootToast from '../../../components/toast/RootToast';
import { CollectionEnum } from '../../../utils/Firebase';
import { db } from '../../../config/firebase';
import { withDocumentIdOnObjectsInArray } from '../../../utils/helpers';
import CreateTeamModal from '../../../components/teams/CreateTeamModal';
import { Section } from '../../../components/section/Section';
import CreateTeamViaFotMobSnippetModal from '../../../components/teams/CreateTeamViaFotMobSnippetModal';
import { convertCountryCodeToCountryEnum } from '../../../utils/fotmobHelpers';

const AdminPlayersPage = () => {
  const [addTeamModalOpen, setAddTeamModalOpen] = useState<boolean>(false);
  const [addTeamViaFotmobSnippetModalOpen, setAddTeamViaFotmobSnippetModalOpen] = useState<boolean>(false);
  const [teams, setTeams] = useState<Array<Team>>([]);

  useEffect(() => {
    handleFetchTeams();
  }, []);

  const handleFetchTeams = async () => {
    const teamCollectionRef = collection(db, CollectionEnum.TEAMS);
    const teamsData = await getDocs(teamCollectionRef);
    const allTeams = withDocumentIdOnObjectsInArray<Team>(teamsData.docs);
    const sortedTeams = allTeams.sort((a, b) => a.name.localeCompare(b.name));
    setTeams(sortedTeams);
  };

  return (
    <>
      <PageContent>
        <Header>
          <HeadingsTypography variant="h2" as="h1">Spelare & Lag</HeadingsTypography>
          <Section flexDirection="row" gap="xs" fitContent>
            <Button
              variant="secondary"
              icon={<Sparkle color={theme.colors.primary} size={20} weight="fill" />}
              onClick={() => setAddTeamViaFotmobSnippetModalOpen(true)}
            >
              Skapa lag via FotMob
            </Button>
            <Button
              variant="primary"
              icon={<Plus color={theme.colors.white} size={20} weight="bold" />}
              onClick={() => setAddTeamModalOpen(true)}
            >
              Lägg till lag
            </Button>
          </Section>
        </Header>
        <Divider />
        <HeadingsTypography variant="h4">Välj lag</HeadingsTypography>
        <TeamCards>
          {teams.map((team) => (
            <TeamCard
              key={team?.name}
              teamPrimaryColor={team?.teamPrimaryColor}
              onClick={() => window.location.assign(`/admin/players/${team?.documentId}`)}
            >
              <LogoContainer>
                <TeamLogo src={team?.logoUrl} alt={team?.name} />
              </LogoContainer>
              <TeamNameContainer teamPrimaryColor={team?.teamPrimaryColor} className="team-name-container">
                <EmphasisTypography variant="m">{team?.name}</EmphasisTypography>
              </TeamNameContainer>
            </TeamCard>
          ))}
        </TeamCards>
      </PageContent>
      {addTeamModalOpen && (
        <CreateTeamModal
          onClose={() => setAddTeamModalOpen(false)}
          refetchTeams={handleFetchTeams}
        />
      )}
      {addTeamViaFotmobSnippetModalOpen && (
        <CreateTeamViaFotMobSnippetModal
          onClose={() => setAddTeamViaFotmobSnippetModalOpen(false)}
          refetchTeams={handleFetchTeams}
        />
      )}
      <RootToast />
    </>
  );
};

const PageContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.m};
  padding: ${theme.spacing.l};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

const TeamCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: ${theme.spacing.s};
`;

const TeamCard = styled.div<{ teamPrimaryColor?: string }>`
  background-color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.l};
  padding: ${theme.spacing.m} ${theme.spacing.m} ${theme.spacing.s} ${theme.spacing.m};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  align-items: center;
  transition: all 0.2s ease;
  cursor: pointer;
  box-sizing: border-box;
  border: 2px solid ${theme.colors.white};

  &:hover {
    border-color: ${({ teamPrimaryColor }) => teamPrimaryColor || theme.colors.white};

    .team-name-container {
      background-color: ${({ teamPrimaryColor }) => teamPrimaryColor || theme.colors.white};
    }

    ${EmphasisTypography} {
      color: ${theme.colors.white};
      text-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
    }
  }
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  width: 100px;
  flex-grow: 1;
`;

const TeamLogo = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const TeamNameContainer = styled.div<{ teamPrimaryColor?: string }>`
  padding: ${theme.spacing.xxs} ${theme.spacing.s};
  width: fit-content;
  border-radius: 100px;
  background-color: ${theme.colors.white};
  transition: all 0.2s ease;
`;

export default AdminPlayersPage;
