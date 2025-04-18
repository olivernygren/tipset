import React, { useEffect, useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { signOut } from 'firebase/auth';
import {
  Gear, List, Lock, SignOut,
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
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';
import { Divider } from '../Divider';
import Avatar, { AvatarSize } from '../avatar/Avatar';

const Header = () => {
  const { user, hasAdminRights, loading } = useUser();
  const isTablet = useResizeListener(DeviceSizes.TABLET);

  const hasUserCookie = Cookies.get('user');

  const [isSignedIn, setIsSignedIn] = useState<boolean>(!!hasUserCookie);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsSignedIn(Boolean(user));
  }, [user]);

  if (loading) {
    return null; // Or a loading spinner
  }

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
        {isMobileMenuOpen && <GlobalStyle />}
        <Content>
          <InvisibleLink href="/">
            <LogoImageContainer>
              <img src="/images/logo.svg" alt="logo" />
            </LogoImageContainer>
          </InvisibleLink>
          {isTablet ? (
            <MobileMenuButton>
              <IconButton
                icon={<List size={32} />}
                colors={{ normal: theme.colors.textDefault, hover: theme.colors.textDefault, active: theme.colors.textDefault }}
                onClick={() => setIsMobileMenuOpen(true)}
              />
            </MobileMenuButton>
          ) : (
            <>
              <DesktopNavCenter>
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
              </DesktopNavCenter>
              <RightSideItems>
                {isSignedIn && (
                  <LoggedInUser>
                    {user?.profilePicture && (
                      <Avatar
                        src={`/images/${user?.profilePicture}.png`}
                        alt="avatar"
                        size={AvatarSize.M}
                        showBorder
                        customBorderWidth={1}
                        objectFit="cover"
                      />
                    )}
                    <EmphasisTypography variant="m" color={theme.colors.textLight}>{`${user?.firstname} ${user?.lastname}`}</EmphasisTypography>
                  </LoggedInUser>
                )}
                {isSignedIn && (
                  <Divider vertical />
                )}
                {isSignedIn && (
                  <InvisibleLink href={`/${RoutesEnum.PROFILE}`}>
                    <IconButton
                      icon={<Gear size={24} weight="light" />}
                      colors={{ normal: theme.colors.textDefault, hover: theme.colors.primaryDark, active: theme.colors.primaryDarker }}
                      onClick={() => {}}
                      title="Kontoinställningar"
                      showBorder
                    />
                  </InvisibleLink>
                )}
                {isSignedIn && hasAdminRights && (
                  <InvisibleLink href={`/${RoutesEnum.ADMIN}`}>
                    <IconButton
                      icon={<Lock size={24} weight="light" />}
                      colors={{ normal: theme.colors.textDefault, hover: theme.colors.primaryDark, active: theme.colors.primaryDarker }}
                      onClick={() => {}}
                      title="Admin"
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
            </>
          )}
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

const GlobalStyle = createGlobalStyle`
  body.no-scroll {
    overflow: hidden;
  }
`;

const StyledHeader = styled.header`
  background-color: ${theme.colors.white};
  border-bottom: 1px solid ${theme.colors.silverLight};
  padding: 0 ${theme.spacing.m};
  width: 100vw;
  height: 80px;
  box-sizing: border-box;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;

  @media ${devices.laptop} {
    padding: 0 ${theme.spacing.xl};
  }
`;

const Content = styled.div`
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  justify-content: space-between;
  height: 100%;

  @media ${devices.laptop} {
    grid-template-columns: 1fr 1fr 1fr;
  }
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
  margin-left: auto;
`;

const DesktopNavCenter = styled.div`
  display: flex;
  gap: ${theme.spacing.s};
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

const RightSideItems = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${theme.spacing.s};
  height: 44px;
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

const LoggedInUser = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xxxs};
  height: 100%;
`;

export default React.memo(Header);
