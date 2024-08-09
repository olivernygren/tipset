import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { signOut } from 'firebase/auth';
import {
  List, SignOut, User,
} from '@phosphor-icons/react';
import Cookies from 'js-cookie';
import { devices, theme } from '../../theme';
import { EmphasisTypography, NormalTypography } from '../typography/Typography';
import Button from '../buttons/Button';
import { RoutesEnum } from '../../utils/Routes';
import { auth } from '../../config/firebase';
import { useUser } from '../../context/UserContext';
import IconButton from '../buttons/IconButton';
import MobileMenu from './MobileMenu';

const Header = () => {
  const { user } = useUser();

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
              <NormalTypography variant="m" color={theme.colors.textDefault}>Ligor</NormalTypography>
              {window && window.location.href.includes(RoutesEnum.LEAGUES) && <ActiveLinkIndicator />}
            </StyledNavLink>
            <StyledNavLink href={`/${RoutesEnum.RULES}`}>
              <NormalTypography variant="m" color={theme.colors.textDefault}>Regler</NormalTypography>
              {window && window.location.href.includes(RoutesEnum.RULES) && <ActiveLinkIndicator />}
            </StyledNavLink>
            <StyledNavLink href={`/${RoutesEnum.HOW_TO_PLAY}`}>
              <NormalTypography variant="m" color={theme.colors.textDefault}>Hur funkar det?</NormalTypography>
              {window && window.location.href.includes(RoutesEnum.HOW_TO_PLAY) && <ActiveLinkIndicator />}
            </StyledNavLink>
          </DesktopNav>
          <RightSideItems>
            {isSignedIn && (
              <EmphasisTypography variant="m" color={theme.colors.textLight}>{`${user?.email}` ?? '?'}</EmphasisTypography>
              // <EmphasisTypography variant="m" color={theme.colors.textLight}>{`${user?.firstname} ${user?.lastname}` ?? '?'}</EmphasisTypography>
            )}
            {isSignedIn && (
              <InvisibleLink href={`/${RoutesEnum.PROFILE}`}>
                <IconButton
                  icon={<User size={24} weight="light" />}
                  colors={{ normal: theme.colors.textDefault, hover: theme.colors.primaryDark, active: theme.colors.primaryDarker }}
                  onClick={() => {}}
                  title="Profil"
                  showBorder
                />
              </InvisibleLink>
            )}
            {isSignedIn ? (
              <IconButton
                icon={<SignOut size={24} weight="light" />}
                colors={{ normal: theme.colors.textDefault, hover: theme.colors.primaryDark, active: theme.colors.primaryDarker }}
                onClick={handleSignOut}
                title="Logga ut"
                showBorder
              />
            ) : (
              <InvisibleLink href={`/${RoutesEnum.LOGIN}`}>
                <Button variant="primary" size="m">Logga in</Button>
              </InvisibleLink>
            )}
          </RightSideItems>
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
  border-bottom: 1px solid ${theme.colors.silverLight};
  padding: 0 ${theme.spacing.xl};
  width: 100vw;
  height: 80px;
  box-sizing: border-box;
`;

const Content = styled.div`
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
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
  padding: 0 ${theme.spacing.s};
  border-radius: ${theme.borderRadius.m};
  height: 100%;
  display: flex;
  align-items: center;
  position: relative;

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
    justify-content: center;
    width: 100%;
    height: 100%;
  }
`;

const RightSideItems = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${theme.spacing.s};
`;

const ActiveLinkIndicator = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 4px;
  border-top-right-radius: 3px;
  border-top-left-radius: 3px;
  background-color: ${theme.colors.primary};
`;

export default React.memo(Header);
