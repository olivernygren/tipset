import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { signOut } from 'firebase/auth';
import { List, SignOut, UserCircle } from '@phosphor-icons/react';
import Cookies from 'js-cookie';
import { devices, theme } from '../../theme';
import { EmphasisTypography } from '../typography/Typography';
import Button from '../buttons/Button';
import { RoutesEnum } from '../../utils/Routes';
import { auth } from '../../config/firebase';
import { useUser } from '../../context/UserContext';
import IconButton from '../buttons/IconButton';
import { Divider } from '../Divider';
import MobileMenu from './MobileMenu';

const Header = () => {
  const { hasAdminRights, user } = useUser();

  const hasUserCookie = Cookies.get('user');

  const [isSignedIn, setIsSignedIn] = useState<boolean>(!!hasUserCookie);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsSignedIn(Boolean(user));
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      window.location.href = `/${RoutesEnum.LOGIN}`;
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <StyledHeader>
        <Content>
          <InvisibleLink href="/">
            <LogoImageContainer>
              <img src="/images/tipset-logo-text.svg" alt="logo" />
            </LogoImageContainer>
          </InvisibleLink>
          <DesktopNav>
            <StyledNavLink href={`/${RoutesEnum.LEAGUES}`}>
              <EmphasisTypography variant="m" color={theme.colors.textDefault}>Ligor</EmphasisTypography>
            </StyledNavLink>
            <StyledNavLink href={`/${RoutesEnum.RULES}`}>
              <EmphasisTypography variant="m" color={theme.colors.textDefault}>Regler</EmphasisTypography>
            </StyledNavLink>
            <StyledNavLink href={`/${RoutesEnum.RULES}`}>
              <EmphasisTypography variant="m" color={theme.colors.textDefault}>Hur funkar det?</EmphasisTypography>
            </StyledNavLink>
            {isSignedIn && (
            <EmphasisTypography variant="m" color={theme.colors.textLight}>{user?.email ?? '?'}</EmphasisTypography>
            )}
            <Divider vertical />
            {isSignedIn && (
            <InvisibleLink href={`/${RoutesEnum.PROFILE}`}>
              <IconButton
                icon={<UserCircle size={32} color={theme.colors.primary} />}
                colors={{ normal: theme.colors.primary, hover: theme.colors.primaryDark, active: theme.colors.primaryDarker }}
                onClick={() => {}}
                title="Profil"
              />
            </InvisibleLink>
            )}
            {hasAdminRights && (
            <InvisibleLink href={`/${RoutesEnum.ADMIN}`}>
              <Button variant="secondary" size="m">Admin</Button>
            </InvisibleLink>
            )}
            {isSignedIn ? (
              <IconButton
                icon={<SignOut size={32} color={theme.colors.primary} />}
                colors={{ normal: theme.colors.primary, hover: theme.colors.primaryDark, active: theme.colors.primaryDarker }}
                onClick={handleSignOut}
                title="Logga ut"
              />
            ) : (
              <InvisibleLink href={`/${RoutesEnum.LOGIN}`}>
                <Button variant="primary" size="m">Logga in</Button>
              </InvisibleLink>
            )}
          </DesktopNav>
          <MobileMenuButton>
            <IconButton
              icon={<List size={32} />}
              colors={{ normal: theme.colors.textDefault, hover: theme.colors.textDefault, active: theme.colors.textDefault }}
              onClick={() => setIsMobileMenuOpen(true)}
              title="Meny"
            />
          </MobileMenuButton>
        </Content>
      </StyledHeader>
      {isMobileMenuOpen && (
        <MobileMenu
          onClose={() => setIsMobileMenuOpen(false)}
          isSignedIn={isSignedIn}
          onSignOut={handleSignOut}
        />
      )}
    </>
  );
};

const StyledHeader = styled.header`
  background-color: ${theme.colors.white};
  border-bottom: 1px solid ${theme.colors.silver};
  padding: 0 ${theme.spacing.l};
  width: 100vw;
  height: 80px;
  box-sizing: border-box;
`;

const Content = styled.div`
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
`;

const InvisibleLink = styled.a`
  text-decoration: none;
  color: inherit;
`;

const LogoImageContainer = styled.div`
  height: 50px;
  width: fit-content;
  > img {
    height: 100%;
  }
`;

const StyledNavLink = styled.a`
  text-decoration: none;
  padding: ${theme.spacing.s};
  border-radius: ${theme.borderRadius.m};
  > span {
    &:hover {
      color: ${theme.colors.primaryDark};
    }
    &:active {
      color: ${theme.colors.primaryDarker};
    }
  }
`;

const MobileMenuButton = styled.div`
  width: fit-content;

  @media ${devices.tablet} {
    display: none;
  }
`;

const DesktopNav = styled.div`
  display: none;

  @media ${devices.tablet} {
    display: flex;
    gap: ${theme.spacing.s};
    align-items: center;
    width: fit-content;
    height: 40px;
  }
`;

export default React.memo(Header);
