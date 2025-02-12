import React, { useState } from 'react';
import styled from 'styled-components';
import { CheckCircle } from '@phosphor-icons/react';
import { FirstTeamToScore, Fixture, TeamType } from '../../utils/Fixture';
import ActionsModal from '../modal/ActionsModal';
import ClubAvatar from '../avatar/ClubAvatar';
import NationAvatar from '../avatar/NationAvatar';
import { Team } from '../../utils/Team';
import { AvatarSize } from '../avatar/Avatar';
import { devices, theme } from '../../theme';
import { EmphasisTypography, HeadingsTypography, NormalTypography } from '../typography/Typography';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';

interface FirstTeamToScoreModalProps {
  fixture: Fixture;
  selectedTeamValue?: FirstTeamToScore;
  onSave: (selectedTeam: FirstTeamToScore) => void;
  onClose: () => void;
}

const FirstTeamToScoreModal = ({
  fixture, selectedTeamValue, onSave, onClose,
}: FirstTeamToScoreModalProps) => {
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const [selectedTeam, setselectedTeam] = useState<FirstTeamToScore | undefined>(selectedTeamValue);

  const handleSave = () => {
    if (selectedTeam) {
      onSave(selectedTeam);
    }
  };

  const getAvatar = (team: Team) => (fixture.teamType === TeamType.CLUBS ? (
    <ClubAvatar
      logoUrl={team.logoUrl}
      clubName={team.name}
      size={isMobile ? AvatarSize.M : AvatarSize.XL}
      noPadding
      shape="square"
    />
  ) : (
    <NationAvatar
      flagUrl={team.logoUrl}
      nationName={team.name}
      size={isMobile ? AvatarSize.M : AvatarSize.XL}
    />
  ));

  return (
    <ActionsModal
      title="Första lag att göra mål"
      onCancelClick={onClose}
      onActionClick={handleSave}
      actionButtonLabel="Välj"
      actionButtonDisabled={!selectedTeam}
      mobileBottomSheet
      headerDivider
      size="s"
    >
      {isMobile ? (
        <ContentMobile>
          <MobileOptionContainer onClick={() => setselectedTeam(FirstTeamToScore.HOME_TEAM)} isSelected={selectedTeam === FirstTeamToScore.HOME_TEAM}>
            <EmphasisTypography variant="m" color={theme.colors.textDefault}>
              {fixture.homeTeam.shortName ?? fixture.homeTeam.name}
            </EmphasisTypography>
            {getAvatar(fixture.homeTeam)}
          </MobileOptionContainer>
          <MobileOptionContainer onClick={() => setselectedTeam(FirstTeamToScore.NONE)} isSelected={selectedTeam === FirstTeamToScore.NONE}>
            <EmphasisTypography variant="m" color={theme.colors.textDefault}>
              Inget mål
            </EmphasisTypography>
            <HeadingsTypography variant="h6">
              (0-0)
            </HeadingsTypography>
          </MobileOptionContainer>
          <MobileOptionContainer onClick={() => setselectedTeam(FirstTeamToScore.AWAY_TEAM)} isSelected={selectedTeam === FirstTeamToScore.AWAY_TEAM}>
            <EmphasisTypography variant="m" color={theme.colors.textDefault}>
              {fixture.awayTeam.shortName ?? fixture.awayTeam.name}
            </EmphasisTypography>
            {getAvatar(fixture.awayTeam)}
          </MobileOptionContainer>
        </ContentMobile>
      ) : (
        <ContentDesktop>
          <AvatarContainer onClick={() => setselectedTeam(FirstTeamToScore.HOME_TEAM)} isSelected={selectedTeam === FirstTeamToScore.HOME_TEAM}>
            {getAvatar(fixture.homeTeam)}
            <NormalTypography variant="s" color={theme.colors.textDefault}>
              {fixture.homeTeam.shortName ?? fixture.homeTeam.name}
            </NormalTypography>
            {selectedTeam === FirstTeamToScore.HOME_TEAM && (
              <CheckIconContainer>
                <CheckCircle size={24} color={theme.colors.primary} weight="fill" />
              </CheckIconContainer>
            )}
          </AvatarContainer>
          <AvatarContainer onClick={() => setselectedTeam(FirstTeamToScore.NONE)} isSelected={selectedTeam === FirstTeamToScore.NONE}>
            <NormalTypography variant="m" color={theme.colors.silverDark}>
              Inget mål
            </NormalTypography>
            <HeadingsTypography variant="h6">
              (0-0)
            </HeadingsTypography>
            {selectedTeam === FirstTeamToScore.NONE && (
              <CheckIconContainer>
                <CheckCircle size={24} color={theme.colors.primary} weight="fill" />
              </CheckIconContainer>
            )}
          </AvatarContainer>
          {/* <Button
            onClick={() => setselectedTeam(FirstTeamToScore.NONE)}
            variant={selectedTeam === FirstTeamToScore.NONE ? 'primary' : 'secondary'}
            // fullWidth
          >
            Inget mål (0-0)
          </Button> */}
          <AvatarContainer onClick={() => setselectedTeam(FirstTeamToScore.AWAY_TEAM)} isSelected={selectedTeam === FirstTeamToScore.AWAY_TEAM}>
            {getAvatar(fixture.awayTeam)}
            <NormalTypography variant="s" color={theme.colors.textDefault}>
              {fixture.awayTeam.shortName ?? fixture.awayTeam.name}
            </NormalTypography>
            {selectedTeam === FirstTeamToScore.AWAY_TEAM && (
              <CheckIconContainer>
                <CheckCircle size={24} color={theme.colors.primary} weight="fill" />
              </CheckIconContainer>
            )}
          </AvatarContainer>
        </ContentDesktop>
      )}
    </ActionsModal>
  );
};

const ContentDesktop = styled.div`
  display: flex;
  gap: ${theme.spacing.s};
  width: 100%;
  box-sizing: border-box;
`;

const ContentMobile = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  width: 100%;
  box-sizing: border-box;
`;

const AvatarContainer = styled.div<{ isSelected?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: ${theme.spacing.xxs};
  background-color: ${theme.colors.silverBleach};
  border-radius: ${theme.borderRadius.l};
  border: ${({ isSelected }) => (isSelected ? '2px' : '1px')} solid ${({ isSelected }) => (isSelected ? theme.colors.primary : theme.colors.silverLight)};
  flex: 1;
  padding: ${theme.spacing.m} 0;
  height: 90px;
  transition: background-color 0.2s ease, border-color 0.2s ease;
  cursor: pointer;
  position: relative;

  &:hover {
    background-color: ${theme.colors.primaryFade};
    border-color: ${theme.colors.primary};
  }
`;

const CheckIconContainer = styled.div`
  position: absolute;
  bottom: -13.5px;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 24px;
  background-color: ${theme.colors.white};
  border-radius: 50%;
`;

const MobileOptionContainer = styled.div<{ isSelected?: boolean }>`
  display: flex;
  gap: ${theme.spacing.s};
  width: 100%;
  box-sizing: border-box;
  align-items: center;
  justify-content: space-between;
  border-radius: ${theme.borderRadius.m};
  padding: ${theme.spacing.xs};
  background-color: ${({ isSelected }) => (isSelected ? theme.colors.primaryFade : theme.colors.silverBleach)};
  border: 1px solid ${({ isSelected }) => (isSelected ? theme.colors.primary : theme.colors.silverLight)};
`;

export default FirstTeamToScoreModal;
