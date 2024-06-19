import React, { useEffect, useState } from 'react'
import Page from '../../../../components/Page';
import { useNavigate } from 'react-router-dom';
import { deleteDoc, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../../../config/firebase';
import { CollectionEnum } from '../../../../utils/Firebase';
import { PredictionLeague } from '../../../../utils/League';
import { withDocumentIdOnObject } from '../../../../utils/helpers';
import { HeadingsTypography } from '../../../../components/typography/Typography';
import { DotsThree, Trash } from '@phosphor-icons/react';
import styled from 'styled-components';
import { Section } from '../../../../components/section/Section';
import { theme } from '../../../../theme';
import IconButton from '../../../../components/buttons/IconButton';
import ContextMenu from '../../../../components/menu/ContextMenu';
import ContextMenuOption from '../../../../components/menu/ContextMenuOption';
import { RoutesEnum } from '../../../../utils/Routes';
import { useUser } from '../../../../context/UserContext';

const PredictionLeaguePage = () => {
  const navigate = useNavigate();
  const { user, hasAdminRights } = useUser();

  console.log(user);

  const [league, setLeague] = useState<PredictionLeague | undefined>();
  const [initialFetchLoading, setInitialFetchLoading] = useState<boolean>(true);
  const [contextMenuOpen, setContextMenuOpen] = useState<boolean>(false);

  const leagueIdFromUrl = window.location.pathname.split('/')[2];
  const currentUserId = auth.currentUser?.uid ?? '';

  useEffect(() => {
    fetchLeagueData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const fetchLeagueData = async () => {
    const docRef = doc(db, CollectionEnum.LEAGUES, leagueIdFromUrl);
    const docSnap = await getDoc(docRef);
  
    if (docSnap.exists()) {
      const leagueData = withDocumentIdOnObject<PredictionLeague>(docSnap);
      setLeague(leagueData);
      setInitialFetchLoading(false);
    } else {
      console.log("No such document!");
    }
  };

  const handleDeleteLeague = async () => {
    if (!league) {
      console.log('No league found');
      return;
    };

    if (league.creatorId !== currentUserId) {
      console.log('You are not the creator of this league');
      return;
    }
  
    try {      
      const leagueDoc = doc(db, CollectionEnum.LEAGUES, league.documentId);
      await deleteDoc(leagueDoc);
      setContextMenuOpen(false);
      navigate(`/${RoutesEnum.LEAGUES}`);
    } catch (error) {
      console.log('Error deleting league', error);
    }
  }

  return (
    <Page>
      <PageHeader>
        <HeadingsTypography variant='h2'>{league?.name}</HeadingsTypography>
        <Section gap='s' flexDirection='row' alignItems='center' fitContent>
          {(league?.creatorId === currentUserId || hasAdminRights) && (
            <>
              <IconButton 
                icon={<DotsThree size={30} />} 
                colors={{ normal: theme.colors.primary, hover: theme.colors.primaryDark, active: theme.colors.primaryDarker }} 
                backgroundColor={theme.colors.primaryBleach} 
                onClick={() => setContextMenuOpen(!contextMenuOpen)}
                shape='square'
              />
              {contextMenuOpen && (
                <ContextMenu positionX='right' positionY='bottom' offsetY={48 + 12} offsetX={0}>
                  <ContextMenuOption
                    icon={<Trash size={24} color={theme.colors.red} />}
                    onClick={() => handleDeleteLeague()}
                    label="Radera liga"
                    color={theme.colors.red}
                  />
                </ContextMenu>
              )}
            </>
          )}
        </Section>
      </PageHeader>
      {initialFetchLoading && <p>Laddar...</p>}
    </Page>
  )
};

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${theme.spacing.m};
  border-bottom: 1px solid ${theme.colors.silver};
  padding-bottom: ${theme.spacing.s};
`;

export default PredictionLeaguePage;