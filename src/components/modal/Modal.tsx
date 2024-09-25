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
  mobileFullScreen?: boolean;
  noPadding?: boolean;
}

const Modal = ({
  title, children, onClose, size = 'm', headerDivider, mobileBottomSheet, noPadding, mobileFullScreen,
}: ModalProps) => {
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const useMobileAnimation = isMobile && mobileBottomSheet;

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
        // initial={{ opacity: 0 }}
        // animate={{ opacity: 1 }}
        // exit={{ opacity: 0 }}
        mobileBottomSheet={mobileBottomSheet}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <ModalContainer
          width={getModalWidth()}
          // initial={{ opacity: useMobileAnimation ? 1 : 0, scale: useMobileAnimation ? 1 : 0.92, y: useMobileAnimation ? '-100%' : '0%' }}
          // animate={{ opacity: 1, scale: 1, y: '0%' }}
          // exit={{ opacity: useMobileAnimation ? 1 : 0, scale: useMobileAnimation ? 1 : 0.92, y: useMobileAnimation ? '-100%' : '0%' }}
          // transition={{ duration: 0.25 }}
          mobileBottomSheet={mobileBottomSheet}
          mobileFullScreen={mobileFullScreen}
        >
          <Header headerDivider={headerDivider}>
            {title && <HeadingsTypography variant="h3">{title}</HeadingsTypography>}
            <IconButton
              icon={<X size={24} />}
              colors={{ normal: theme.colors.silverDark, hover: theme.colors.silverDarker, active: theme.colors.textDefault }}
              onClick={onClose}
            />
          </Header>
          <ModalContent
            headerDivider={headerDivider}
            noPadding={noPadding}
          >
            {children}
          </ModalContent>
        </ModalContainer>
      </Backdrop>
      <GlobalStyle />
    </>
  );
};

const getModalPadding = (noPadding?: boolean, headerDivider?: boolean, isMobile?: boolean) => {
  if (noPadding) return '0';

  if (isMobile) return headerDivider ? `${theme.spacing.l}` : `0 ${theme.spacing.m} ${theme.spacing.m} ${theme.spacing.m}`;

  return headerDivider ? `${theme.spacing.l}` : `0 ${theme.spacing.l} ${theme.spacing.l} ${theme.spacing.l}`;
};

const getBorderRadius = (mobileBottomSheet?: boolean, mobileFullScreen?: boolean) => {
  if (mobileFullScreen) return 0;

  return mobileBottomSheet ? `${theme.borderRadius.l} ${theme.borderRadius.l} 0 0` : theme.borderRadius.l;
};

const Backdrop = styled.div<{ mobileBottomSheet?: boolean }>`
  display: flex;
  align-items: ${({ mobileBottomSheet }) => (mobileBottomSheet ? 'flex-end' : 'center')};
  justify-content: center;
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 10;
  animation: fadeIn 0.2s ease;
  
  @media ${devices.tablet} {
    align-items: center;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalContainer = styled.div<{ width: string, mobileBottomSheet?: boolean, mobileFullScreen?: boolean }>`
  display: flex;
  flex-direction: column;
  background-color: ${theme.colors.white};
  max-height: ${({ mobileFullScreen }) => (mobileFullScreen ? '100vh' : '90vh')};
  height: fit-content;
  width: ${({ width }) => width};
  border-radius: ${({ mobileBottomSheet, mobileFullScreen }) => getBorderRadius(mobileBottomSheet, mobileFullScreen)};
  ${({ mobileFullScreen }) => mobileFullScreen && 'height: 100vh;'}
  animation: slideIn 0.2s ease;
  
  @media ${devices.tablet} {
    max-height: 85vh;
    border-radius: ${theme.borderRadius.l};
    height: auto;
    animation: fadeIn 0.2s ease-in-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideIn {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
`;

const ModalContent = styled.div<{ headerDivider?: boolean, noPadding?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ noPadding }) => (noPadding ? 0 : theme.spacing.m)};
  width: 100%;
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
  padding: ${({ headerDivider, noPadding }) => getModalPadding(noPadding, headerDivider, true)};
  position: relative;

  @media ${devices.tablet} {
    padding: ${({ headerDivider, noPadding }) => getModalPadding(noPadding, headerDivider, false)};
  }
`;

const Header = styled.div<{ headerDivider?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  padding: ${theme.spacing.l} ${theme.spacing.m} ${theme.spacing.s} ${theme.spacing.m};
  
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
