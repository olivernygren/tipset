import React, { useEffect, useState } from 'react'
import styled from 'styled-components';
import { theme } from '../../theme';
import { EmphasisTypography, HeadingsTypography } from '../typography/Typography';
import { Section } from '../section/Section';
import Button from '../buttons/Button';
import { RoutesEnum } from '../../utils/Routes';
import { User, signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useUser } from '../../context/UserContext';
import IconButton from '../buttons/IconButton';
import { SignOut, UserCircle } from '@phosphor-icons/react';
import { Divider } from '../Divider';

interface HeaderProps {
  user: User | null;
}

const Header = ({ user }: HeaderProps) => {
  const { hasAdminRights } = useUser();

  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);

  useEffect(() => {
    setIsSignedIn(Boolean(user));
  }, [user])
  
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      window.location.href = `/${RoutesEnum.LOGIN}`;
    } catch (e) {
      console.error(e);
    }
  }
  
  return (
    <StyledHeader>
      <Content>
        <InvisibleLink href="/">
          <HeadingsTypography variant='h3'>Tipset</HeadingsTypography>
        </InvisibleLink>
        <Section gap="s" alignItems='center' flexDirection='row' fitContent height='40px'>
          <StyledNavLink href={`/${RoutesEnum.LEAGUES}`}>
            <EmphasisTypography variant='m' color={theme.colors.primary}>Ligor</EmphasisTypography>
          </StyledNavLink>
          <InvisibleLink href={`/${RoutesEnum.RULES}`}>
            <EmphasisTypography variant='m' color={theme.colors.primary}>Regler</EmphasisTypography>
          </InvisibleLink>
          {isSignedIn && (
            <EmphasisTypography variant='m' color={theme.colors.textLight}>{auth?.currentUser?.email}</EmphasisTypography>
          )}
          <Divider vertical />
          {isSignedIn && (
            <InvisibleLink href={`/${RoutesEnum.PROFILE}`}>
              <IconButton
                icon={<UserCircle size={32} color={theme.colors.primary} />}
                colors={{ normal: theme.colors.primary, hover: theme.colors.primaryDark, active: theme.colors.primaryDarker }}
                onClick={() => {}}
                title='Profil'
              />
            </InvisibleLink>
          )}
          {hasAdminRights && (
            <InvisibleLink href={`/${RoutesEnum.ADMIN}`}>
              <Button variant='secondary' size='m'>Admin</Button>
            </InvisibleLink>
          )}
          {isSignedIn ? (
            <IconButton
              icon={<SignOut size={32} color={theme.colors.primary} />}
              colors={{ normal: theme.colors.primary, hover: theme.colors.primaryDark, active: theme.colors.primaryDarker }}
              onClick={handleSignOut}
              title='Logga ut'
            />
          ) : (
            <InvisibleLink href={`/${RoutesEnum.LOGIN}`}>
              <Button variant='primary' size='m'>Logga in</Button>
            </InvisibleLink>
          )}
        </Section>
      </Content>
    </StyledHeader>
  )
}

const StyledHeader = styled.header`
  background-color: ${theme.colors.white};
  border-bottom: 1px solid ${theme.colors.silver};
  padding: 0 ${theme.spacing.l};
  width: 100vw;
  height: 80px;
  box-sizing: border-box;
`;

const Content = styled.div`
  max-width: 1200px;
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

export default Header;