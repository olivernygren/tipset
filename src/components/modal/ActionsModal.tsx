import React from 'react';
import styled from 'styled-components';
import Modal from './Modal';
import { NormalTypography } from '../typography/Typography';
import { devices, theme } from '../../theme';
import Button from '../buttons/Button';

interface ActionsModalProps {
  title: string;
  message?: string;
  disclaimer?: string;
  size?: 's' | 'm' | 'l';
  actionButtonLabel: string;
  actionButtonColor?: 'primary' | 'red';
  actionButtonStartIcon?: React.ReactNode;
  actionButtonEndIcon?: React.ReactNode;
  actionButtonDisabled?: boolean;
  loading?: boolean;
  cancelButtonLabel?: string;
  onActionClick: () => void;
  onCancelClick: () => void;
  hideCancelButton?: boolean;
  mobileFullScreen?: boolean;
  mobileBottomSheet?: boolean;
  headerDivider?: boolean;
  noPadding?: boolean;
  children?: React.ReactNode;
}

const ActionsModal = ({
  title,
  disclaimer,
  message,
  size = 'm',
  actionButtonLabel,
  actionButtonColor = 'primary',
  actionButtonStartIcon,
  actionButtonEndIcon,
  actionButtonDisabled,
  loading,
  cancelButtonLabel = 'Avbryt',
  onActionClick,
  onCancelClick,
  hideCancelButton,
  mobileFullScreen,
  mobileBottomSheet,
  headerDivider,
  children,
  noPadding,
}: ActionsModalProps) => (
  <Modal
    title={title}
    disclaimer={disclaimer}
    onClose={onCancelClick}
    size={size}
    headerDivider={headerDivider}
    mobileFullScreen={mobileFullScreen}
    mobileBottomSheet={mobileBottomSheet}
    noPadding
  >
    <ModalContent noPadding={noPadding} headerDivider={headerDivider}>
      {message && message.length > 0 && (
        <NormalTypography variant="m" color={theme.colors.silverDarker}>
          {message}
        </NormalTypography>
      )}
      {children}
    </ModalContent>
    <ButtonsContainer divider={headerDivider}>
      {!hideCancelButton && (
        <Button variant="secondary" onClick={onCancelClick} fullWidth>
          {cancelButtonLabel}
        </Button>
      )}
      <Button
        onClick={onActionClick}
        fullWidth
        color={actionButtonColor}
        loading={loading}
        icon={actionButtonStartIcon}
        endIcon={actionButtonEndIcon}
        disabled={actionButtonDisabled}
      >
        {actionButtonLabel}
      </Button>
    </ButtonsContainer>
  </Modal>
);

const ModalContent = styled.div<{ noPadding?: boolean, headerDivider?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.m};
  flex-grow: 1;
  overflow-y: auto;
  padding: ${({ noPadding, headerDivider }: { noPadding?: boolean, headerDivider?: boolean }) => (noPadding ? '0' : `${headerDivider ? theme.spacing.m : theme.spacing.xxs} ${theme.spacing.m}`)};
  
  @media ${devices.tablet} {
    padding: ${({ noPadding, headerDivider }: { noPadding?: boolean, headerDivider?: boolean }) => (noPadding ? '0' : `${headerDivider ? theme.spacing.l : theme.spacing.xxs} ${theme.spacing.l}`)};
  }
`;

const ButtonsContainer = styled.div<{ divider?: boolean }>`
  display: flex;
  gap: ${theme.spacing.s};
  align-items: center;
  padding: ${theme.spacing.m} ${theme.spacing.m} ${theme.spacing.l} ${theme.spacing.m};
  ${({ divider }) => divider && `border-top: 1px solid ${theme.colors.silverLight};`}
  
  @media ${devices.tablet} {
    padding: ${theme.spacing.m} ${theme.spacing.l};
  }
`;

export default ActionsModal;
