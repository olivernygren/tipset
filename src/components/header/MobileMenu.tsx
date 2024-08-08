import { motion } from 'framer-motion';
import React from 'react';
import styled from 'styled-components';
import { SignOut, X } from '@phosphor-icons/react/dist/ssr';
import { theme } from '../../theme';
import IconButton from '../buttons/IconButton';
import { EmphasisTypography } from '../typography/Typography';
import Button from '../buttons/Button';
import { RoutesEnum } from '../../utils/Routes';

interface MobileMenuProps {
  onClose: () => void;
  isSignedIn: boolean;
  onSignOut: () => void;
}

const MobileMenu = ({ onClose, isSignedIn, onSignOut }: MobileMenuProps) => {
  const links = [
    {
      label: 'Ligor',
      href: '/leagues',
    },
    {
      label: 'Regler',
      href: '/rules',
    },
    {
      label: 'Hur funkar det?',
      href: '/how-it-works',
    },
  ];

  return (
    <StyledMobileMenu
      initial={{ left: '100%', opacity: 0 }}
      animate={{ left: 0, opacity: 1 }}
      exit={{ left: '100%', opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <MenuHeader>
        <IconButton
          icon={<X size={32} onClick={onClose} />}
          onClick={onClose}
          colors={{ normal: theme.colors.silverDark, hover: theme.colors.silverDark, active: theme.colors.silverDarker }}
        />
      </MenuHeader>
      <Links>
        {links.map((link) => (
          <PlainLink key={link.href} href={link.href}>
            <EmphasisTypography variant="m" color={theme.colors.primary}>{link.label}</EmphasisTypography>
          </PlainLink>
        ))}
      </Links>
      <BottomLinks>
        {isSignedIn ? (
          <IconButton
            icon={<SignOut size={32} color={theme.colors.primary} />}
            colors={{ normal: theme.colors.primary, hover: theme.colors.primaryDark, active: theme.colors.primaryDarker }}
            onClick={onSignOut}
            title="Logga ut"
          />
        ) : (
          <InvisibleLink href={`/${RoutesEnum.LOGIN}`}>
            <Button variant="primary" size="m">Logga in</Button>
          </InvisibleLink>
        )}
      </BottomLinks>
    </StyledMobileMenu>
  );
};

const StyledMobileMenu = styled(motion.div)`
  position: fixed;
  inset: 0;
  background-color: ${theme.colors.white};
  z-index: 1000;
  padding: ${theme.spacing.m};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.m};
  overflow-y: hidden;
`;

const MenuHeader = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  height: fit-content;
`;

const Links = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
  align-items: center;
  justify-content: center;
  flex: 1;
`;

const PlainLink = styled.a`
  text-decoration: none;
  
  ${EmphasisTypography} {
    font-size: 30px;
  }
`;

const BottomLinks = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${theme.spacing.m};
  align-items: center;
  justify-content: center;
  height: fit-content;
`;

const InvisibleLink = styled.a`
  text-decoration: none;
  color: inherit;
`;

export default MobileMenu;
