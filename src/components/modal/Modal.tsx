import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { theme } from '../../theme';
import { HeadingsTypography } from '../typography/Typography';
import IconButton from '../buttons/IconButton';
import { X } from '@phosphor-icons/react';
import { motion } from 'framer-motion';

interface ModalProps {
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
  size?: 's' | 'm' | 'l';
}

const Modal = ({ title, children, onClose, size = 'm' }: ModalProps) => {
  const getModalWidth = () => {
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
        <Backdrop onMouseDown={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}>
          <ModalContainer
            width={getModalWidth()}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.2 }}
          >
            <Header>
              {title && <HeadingsTypography variant='h3'>{title}</HeadingsTypography>}
              <IconButton 
                icon={<X size={24} />} 
                colors={{ normal: theme.colors.silverDark, hover: theme.colors.silverDarker, active: theme.colors.textLight }}
                onClick={onClose}
                />
            </Header>
            {children}
          </ModalContainer>
        </Backdrop>
      <GlobalStyle />
    </>
  )
};

const Backdrop = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 10;
`;

const ModalContainer = styled(motion.div)<{ width: string }>`
  /* position: fixed;
  z-index: 20;
  left: 50%;
  top: 50%; */
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.m};
  padding: ${theme.spacing.l};
  background-color: ${theme.colors.white};
  max-height: 85vh;
  height: fit-content;
  width: ${({ width }) => width};
  border-radius: ${theme.borderRadius.l};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
`;

const GlobalStyle = createGlobalStyle`
  body {
    overflow: hidden;
  }
`;

export default Modal;