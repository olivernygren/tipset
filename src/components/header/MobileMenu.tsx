import { motion } from 'framer-motion';
import React from 'react';
import styled from 'styled-components';
import { SignOut, X } from '@phosphor-icons/react/dist/ssr';
import { theme } from '../../theme';
import IconButton from '../buttons/IconButton';
import { EmphasisTypography } from '../typography/Typography';
import Button from '../buttons/Button';
import { RoutesEnum } from '../../utils/Routes';
import Avatar, { AvatarSize } from '../avatar/Avatar';
import { useUser } from '../../context/UserContext';

interface MobileMenuProps {
  onClose: () => void;
  isSignedIn: boolean;
  onSignOut: () => void;
}

const MobileMenu = ({ onClose, isSignedIn, onSignOut }: MobileMenuProps) => {
  const { user } = useUser();

  const links = [
    {
      label: 'Startsida',
      href: '/',
    },
    {
      label: 'Ligor',
      href: `/${RoutesEnum.LEAGUES}`,
    },
    {
      label: 'Regler',
      href: `/${RoutesEnum.RULES}`,
    },
    {
      label: 'Hur funkar det?',
      href: `/${RoutesEnum.HOW_TO_PLAY}`,
    },
  ];

  return (
    <StyledMobileMenu
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
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
          <>
            <InvisibleLink href={`/${RoutesEnum.PROFILE}`}>
              <ProfileLink>
                {user && user.profilePicture && (
                  <Avatar
                    src={`/images/${user.profilePicture}.png`}
                    size={AvatarSize.M}
                    objectFit="cover"
                    showBorder
                    alt="avatar"
                  />
                )}
                <EmphasisTypography variant="l">{user?.firstname && user?.lastname ? `${user.firstname} ${user.lastname}` : 'Min profil'}</EmphasisTypography>
              </ProfileLink>
            </InvisibleLink>
            <Button
              variant="secondary"
              endIcon={<SignOut size={24} color={theme.colors.primary} />}
              onClick={onSignOut}
              fullWidth
            >
              Logga ut
            </Button>
          </>
        ) : (
          <InvisibleLink href={`/${RoutesEnum.LOGIN}`}>
            <Button variant="primary" size="m" fullWidth>Logga in</Button>
          </InvisibleLink>
        )}
      </BottomLinks>
    </StyledMobileMenu>
  );
};

const StyledMobileMenu = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  background-color: ${theme.colors.white};
  z-index: 1000;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 0 ${theme.spacing.s} ${theme.spacing.l} ${theme.spacing.s};
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
  height: 80px;
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
  flex-direction: column;
  gap: ${theme.spacing.m};
  align-items: center;
  justify-content: center;
  height: fit-content;
`;

const InvisibleLink = styled.a`
  text-decoration: none;
  color: inherit;
  width: 100%;
  box-sizing: border-box;
`;

const ProfileLink = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.xxs};
  width: 100%;
  box-sizing: border-box;
`;

export default MobileMenu;
