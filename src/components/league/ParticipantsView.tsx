import React, { useState } from 'react';
import styled from 'styled-components';
import { Crown, XCircle } from '@phosphor-icons/react';
import { doc, updateDoc } from 'firebase/firestore';
import { Section } from '../section/Section';
import { devices, theme } from '../../theme';
import { EmphasisTypography, HeadingsTypography, NormalTypography } from '../typography/Typography';
import { PredictionLeague } from '../../utils/League';
import UserName, { UserEmail } from '../typography/UserName';
import { useUser } from '../../context/UserContext';
import IconButton from '../buttons/IconButton';
import Modal from '../modal/Modal';
import Button from '../buttons/Button';
import { db } from '../../config/firebase';
import { CollectionEnum } from '../../utils/Firebase';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';

interface ParticipantsViewProps {
  league: PredictionLeague;
  isCreator: boolean;
  refetchLeague: () => void;
}

const ParticipantsView = ({ league, isCreator, refetchLeague }: ParticipantsViewProps) => {
  const { user, hasAdminRights } = useUser();
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [userToRemove, setUserToRemove] = useState<string | null>(null);
  const [removingLoading, setRemovingLoading] = useState(false);

  const handleRemoveUserFromLeague = async () => {
    if (!userToRemove) return;

    setRemovingLoading(true);

    const updatedParticipants = league.participants.filter((participantId) => participantId !== userToRemove);
    const updatedStandings = league.standings.filter((standing) => standing.userId !== userToRemove);
    const updatedLeague = {
      ...league,
      participants: updatedParticipants,
      standings: updatedStandings,
    };

    try {
      await updateDoc(doc(db, CollectionEnum.LEAGUES, league.documentId), updatedLeague);
      refetchLeague();
    } catch (error) {
      console.error(error);
    }

    setRemovingLoading(false);
    setConfirmModalOpen(false);
  };

  return (
    <>
      <Section
        backgroundColor={theme.colors.white}
        padding={theme.spacing.m}
        gap="s"
        borderRadius={theme.borderRadius.m}
      >
        <HeadingsTypography variant="h4">Deltagare</HeadingsTypography>
        <TableHeader>
          <EmphasisTypography variant="s" color={theme.colors.silverDark}>Namn</EmphasisTypography>
          {!isMobile && (
            <>
              <EmphasisTypography variant="s" color={theme.colors.silverDark}>Email</EmphasisTypography>
              <EmphasisTypography variant="s" color={theme.colors.silverDark}>ID</EmphasisTypography>
            </>
          )}
          <EmptyCell />
        </TableHeader>
        <Section gap="xxs">
          {league.participants.map((participantId) => (
            <TableRow key={participantId}>
              <Section alignItems="center" flexDirection="row" gap="xxs" fitContent>
                <NoWrapTypography variant="m">
                  <UserName userId={participantId} />
                </NoWrapTypography>
                {league.creatorId === participantId && (
                  <Crown weight="fill" size={24} color={theme.colors.gold} />
                )}
              </Section>
              {!isMobile && (
                <>
                  <NoWrapTypographyNormal variant="m">
                    <UserEmail userId={participantId} />
                  </NoWrapTypographyNormal>
                  <NoWrapTypographyNormal variant="s" color={theme.colors.silverDarker}>
                    {participantId}
                  </NoWrapTypographyNormal>
                </>
              )}
              {(isCreator || hasAdminRights) && user?.documentId !== participantId ? (
                <IconButton
                  icon={<XCircle weight="fill" size={24} />}
                  onClick={() => {
                    setUserToRemove(participantId);
                    setConfirmModalOpen(true);
                  }}
                  colors={{ normal: theme.colors.red, hover: theme.colors.redDark, active: theme.colors.redDarker }}
                />
              ) : (
                <EmptyCell />
              )}
            </TableRow>
          ))}
        </Section>
      </Section>
      {confirmModalOpen && (
        <Modal
          size="s"
          title="Ta bort deltagare"
          onClose={() => setConfirmModalOpen(false)}
          mobileBottomSheet
        >
          <NormalTypography variant="m">
            Är du säker på att du vill ta bort
            {' '}
            <UserName userId={userToRemove ?? ''} />
            {' '}
            från ligan?
          </NormalTypography>
          <Section gap="xs" flexDirection="row" alignItems="center">
            <Button variant="secondary" onClick={() => setConfirmModalOpen(false)} fullWidth>
              Avbryt
            </Button>
            <Button onClick={handleRemoveUserFromLeague} color="red" fullWidth loading={removingLoading}>
              Ta bort
            </Button>
          </Section>
        </Modal>
      )}
    </>
  );
};

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: ${theme.spacing.s};
  border-bottom: 1px solid ${theme.colors.silverLight};
  padding: ${theme.spacing.xxs};
  width: 100%;
  box-sizing: border-box;
  
  @media ${devices.tablet} {
    grid-template-columns: 1fr 1fr 1fr auto;
  }
`;

const TableRow = styled.div`
  display: grid;
  align-items: center;
  grid-template-columns: 1fr auto;
  gap: ${theme.spacing.s};
  padding: ${theme.spacing.xxxs} ${theme.spacing.xs};
  background-color: ${theme.colors.silverBleach};
  border: 1px solid ${theme.colors.silverLight};
  border-radius: ${theme.borderRadius.s};
  width: 100%;
  box-sizing: border-box;
  min-height: 42px;

  @media ${devices.tablet} {
    grid-template-columns: 1fr 1fr 1fr auto;
  }
`;

const EmptyCell = styled.div`
  width: 32px;
  height: 2px;
`;

const NoWrapTypography = styled(EmphasisTypography)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const NoWrapTypographyNormal = styled(EmphasisTypography)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export default ParticipantsView;
