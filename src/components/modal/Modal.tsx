import React from 'react';
import styled, { createGlobalStyle, css } from 'styled-components';
import { X } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { devices, theme } from '../../theme';
import { HeadingsTypography } from '../typography/Typography';
import IconButton from '../buttons/IconButton';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';

interface ModalProps {
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
  size?: 's' | 'm' | 'l';
  headerDivider?: boolean;
  mobileBottomSheet?: boolean;
}

const Modal = ({
  title, children, onClose, size = 'm', headerDivider, mobileBottomSheet,
}: ModalProps) => {
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const getModalWidth = () => {
    if (mobileBottomSheet && isMobile) {
      return '100%';
    }

    switch (size) {
      case 's':
        return '480px';
      case 'm':
        return '640px';
      case 'l':
        return '900px';
      default:
        return '640px';
    }
  };

  return (
    <>
      <Backdrop
        mobileBottomSheet={mobileBottomSheet}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <ModalContainer
          width={getModalWidth()}
          initial={{ opacity: 0, scale: 0.92, y: isMobile && mobileBottomSheet ? '100%' : '00%' }}
          animate={{ opacity: 1, scale: 1, y: isMobile && mobileBottomSheet ? '0%' : '0%' }}
          exit={{ opacity: 0, scale: 0.92, y: isMobile && mobileBottomSheet ? '100%' : '0%' }}
          transition={{ duration: 0.2, type: 'tween' }}
          mobileBottomSheet={mobileBottomSheet}
        >
          <Header headerDivider={headerDivider}>
            {title && <HeadingsTypography variant="h3">{title}</HeadingsTypography>}
            <IconButton
              icon={<X size={24} />}
              colors={{ normal: theme.colors.silverDark, hover: theme.colors.silverDarker, active: theme.colors.textLight }}
              onClick={onClose}
            />
          </Header>
          <ModalContent headerDivider={headerDivider}>
            {children}
          </ModalContent>
        </ModalContainer>
      </Backdrop>
      <GlobalStyle />
    </>
  );
};

const Backdrop = styled.div<{ mobileBottomSheet?: boolean }>`
  display: flex;
  align-items: ${({ mobileBottomSheet }) => (mobileBottomSheet ? 'flex-end' : 'center')};
  justify-content: center;
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 10;

  @media ${devices.tablet} {
    align-items: center;
  }
`;

const ModalContainer = styled(motion.div)<{ width: string, mobileBottomSheet?: boolean }>`
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  background-color: ${theme.colors.white};
  max-height: 90vh;
  height: fit-content;
  width: ${({ width }) => width};
  border-radius: ${({ mobileBottomSheet }) => (mobileBottomSheet ? `${theme.borderRadius.m} ${theme.borderRadius.m} 0 0` : theme.borderRadius.l)};
  
  @media ${devices.tablet} {
    max-height: 85vh;
    border-radius: ${theme.borderRadius.l};
  }
`;

const ModalContent = styled.div<{ headerDivider?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.m};
  width: 100%;
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
  padding: ${({ headerDivider }) => (headerDivider ? theme.spacing.m : 0)} ${theme.spacing.m} ${theme.spacing.s} ${theme.spacing.m};

  @media ${devices.tablet} {
    padding: ${({ headerDivider }) => (headerDivider ? theme.spacing.l : 0)} ${theme.spacing.l} ${theme.spacing.m} ${theme.spacing.l};
  }
`;

const Header = styled.div<{ headerDivider?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  padding: ${theme.spacing.m} ${theme.spacing.m} ${theme.spacing.s} ${theme.spacing.m};
  
  ${({ headerDivider }) => headerDivider && css`
    border-bottom: 1px solid ${theme.colors.silverLight};
    padding-bottom: ${theme.spacing.s};
  `}

  @media ${devices.tablet} {
    padding: ${theme.spacing.l} ${theme.spacing.l} ${theme.spacing.s} ${theme.spacing.l};
  }
`;

const GlobalStyle = createGlobalStyle`
  body {
    overflow: hidden;
  }
`;

export default Modal;