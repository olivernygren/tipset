import React, { useState } from 'react'
import { Section } from '../section/Section'
import { HeadingsTypography, NormalTypography } from '../typography/Typography';
import Input from '../input/Input';
import Button from '../buttons/Button';
import { auth, provider as googleProvider } from '../../config/firebase';
import { createUserWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { theme } from '../../theme';
import { Divider } from '../Divider';

const Auth = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSignIn = async () => {
    if (!email || !password || email === '' || password === '') {
      setError('Fyll i alla fält');
      return;
    };

    if (password.length < 6) {
      setError('Lösenordet måste vara minst 6 tecken långt');
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (e) {
      console.error(e);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error(e);
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
  }

  console.log(auth?.currentUser?.email);

  return (
    <Section gap='m'>
      <HeadingsTypography variant='h2'>
        Logga in
      </HeadingsTypography>
      {auth?.currentUser?.email ? (
        <NormalTypography variant='m'>
          Inloggad användare: {auth?.currentUser?.email}
        </NormalTypography>
      ) : (
        <NormalTypography variant='m'>
          Ingen användare inloggad
        </NormalTypography>
      )}
      <Input
        type='text'
        name='email'
        placeholder='E-post'
        value={email}
        onChange={(e) => setEmail(e.currentTarget.value)}
      />
      <Input
        type='password'
        placeholder='Lösenord'
        value={password}
        onChange={(e) => setPassword(e.currentTarget.value)}
      />
      {error.length > 0 && <NormalTypography variant='m' color={theme.colors.textDefault}>{error}</NormalTypography>}
      <Button variant='secondary' onClick={handleGoogleSignIn}>
        Logga in med Google
      </Button>
      <Button variant='primary' onClick={handleSignIn}>
        Logga in
      </Button>
      <Divider color={theme.colors.silver} />
      <Button variant='secondary' onClick={handleSignOut}>
        Logga ut
      </Button>
    </Section>
  )
}

export default Auth;