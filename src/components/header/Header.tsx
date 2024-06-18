import React, { useEffect, useState } from 'react'
import styled from 'styled-components';
import { theme } from '../../theme';
import { EmphasisTypography, HeadingsTypography, NormalTypography } from '../typography/Typography';
import { Section } from '../section/Section';
import Button from '../buttons/Button';
import { RoutesEnum } from '../../utils/Routes';
import { User, signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';

interface HeaderProps {
  user: User | null;
}

const Header = ({ user }: HeaderProps) => {
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);

  useEffect(() => {
    setIsSignedIn(Boolean(user));
  }, [user])
  
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
  }

  console.log(user)
  
  return (
    <StyledHeader>
      <InvisibleLink href="/">
        <HeadingsTypography variant='h3'>Tipset</HeadingsTypography>
      </InvisibleLink>
      <Section gap="s" alignItems='center' flexDirection='row' fitContent>
        <StyledNavLink href={`/${RoutesEnum.LEAGUES}`}>
          <NormalTypography variant='m' color={theme.colors.primary}>Ligor</NormalTypography>
        </StyledNavLink>
        {isSignedIn && (
          <EmphasisTypography variant='m'>{auth?.currentUser?.email}</EmphasisTypography>
        )}
        <InvisibleLink href={`/${RoutesEnum.TEST}`}>
          <Button variant='secondary' size='m'>Test</Button>
        </InvisibleLink>
        {isSignedIn && (
          <InvisibleLink href={`/${RoutesEnum.ADMIN}`}>
            <Button variant='secondary' size='m'>Admin</Button>
          </InvisibleLink>
        )}
        {isSignedIn ? (
          <Button variant='primary' size='m' onClick={handleSignOut}>Logga ut</Button>
        ) : (
          <InvisibleLink href={`/${RoutesEnum.LOGIN}`}>
            <Button variant='primary' size='m'>Logga in</Button>
          </InvisibleLink>
        )}
      </Section>
    </StyledHeader>
  )
}

const StyledHeader = styled.header`
  background-color: ${theme.colors.white};
  border-bottom: 1px solid ${theme.colors.silver};
  padding: 0 ${theme.spacing.l};
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100vw;
  height: 80px;
  box-sizing: border-box;
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