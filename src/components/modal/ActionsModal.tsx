import React from 'react';
import styled from 'styled-components';
import Modal from './Modal';
import { NormalTypography } from '../typography/Typography';
import { theme } from '../../theme';
import Button from '../buttons/Button';

interface ActionsModalProps {
  title: string;
  message?: string;
  disclaimer?: string;
  size?: 's' | 'm' | 'l';
  actionButtonLabel: string;
  cancelButtonLabel?: string;
  onActionClick: () => void;
  onCancelClick: () => void;
  hideCancelButton?: boolean;
  mobileFullScreen?: boolean;
  mobileBottomSheet?: boolean;
  headerDivider?: boolean;
  noPadding?: boolean;
  children: React.ReactNode;
}

const ActionsModal = ({
  title,
  disclaimer,
  message,
  size = 'm',
  actionButtonLabel,
  cancelButtonLabel = 'Avbryt',
  onActionClick,
  onCancelClick,
  hideCancelButton,
  mobileFullScreen,
  mobileBottomSheet,
  headerDivider,
  noPadding,
  children,
}: ActionsModalProps) => (
  <Modal
    title={title}
    disclaimer={disclaimer}
    onClose={onCancelClick}
    size={size}
    headerDivider={headerDivider}
    mobileFullScreen={mobileFullScreen}
    mobileBottomSheet={mobileBottomSheet}
    noPadding={noPadding}
  >
    <ModalContent>
      {message && message.length > 0 && (
        <NormalTypography variant="m" color={theme.colors.silverDarker}>
          {message}
        </NormalTypography>
      )}
      {children}
    </ModalContent>
    <ButtonsContainer>
      {!hideCancelButton && (
        <Button variant="secondary" onClick={onCancelClick} fullWidth>
          {cancelButtonLabel}
        </Button>
      )}
      <Button onClick={onActionClick} fullWidth>{actionButtonLabel}</Button>
    </ButtonsContainer>
  </Modal>
);

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.m};
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.s};
  align-items: center;
`;

export default ActionsModal;
