import React, { useEffect, useState } from 'react'
import styled from 'styled-components';
import { theme } from '../../theme';
import { EmphasisTypography, HeadingsTypography } from '../typography/Typography';
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
  
  return (
    <StyledHeader>
      <HeadingsTypography variant='h3'>Tipset</HeadingsTypography>
      <Section gap="s" alignItems='center' flexDirection='row' fitContent>
        {isSignedIn && (
          <EmphasisTypography variant='m'>{auth?.currentUser?.email}</EmphasisTypography>
        )}
        <InvisibleLink href={RoutesEnum.TEST}>
          <Button variant='secondary' size='m'>Test</Button>
        </InvisibleLink>
        {isSignedIn && (
          <InvisibleLink href={RoutesEnum.ADMIN}>
            <Button variant='secondary' size='m'>Admin</Button>
          </InvisibleLink>
        )}
        {isSignedIn ? (
          <Button variant='primary' size='m' onClick={handleSignOut}>Logga ut</Button>
        ) : (
          <InvisibleLink href={RoutesEnum.LOGIN}>
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

export default Header;