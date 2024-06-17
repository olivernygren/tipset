import React, { useState } from 'react'
import { Section } from '../section/Section'
import { HeadingsTypography, NormalTypography } from '../typography/Typography';
import Input from '../input/Input';
import Button from '../buttons/Button';
import { auth, db, provider as googleProvider } from '../../config/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile } from 'firebase/auth';
import { theme } from '../../theme';
import { Divider } from '../Divider';
import { addDoc, collection } from 'firebase/firestore';
import { CollectionEnum } from '../../utils/Firebase';
import { CreateUserInput, RolesEnum } from '../../utils/Auth';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [firstname, setFirstname] = useState<string>('');
  const [lastname, setLastname] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showRegisterView, setShowRegisterView] = useState<boolean>(false);

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
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/home');
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

  const handleCreateAccount = async () => {
    const input: CreateUserInput = {
      email,
      firstname,
      lastname,
      role: RolesEnum.USER
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      await addDoc(collection(db, CollectionEnum.USERS), input);
      await updateProfile(auth.currentUser!, {
        displayName: `${firstname} ${lastname}`,
      });

      navigate('/home');
    } catch (e) {
      console.error(e);
    }
  };

  console.log(auth?.currentUser?.email);

  return (
    <Section gap='m'>
      <HeadingsTypography variant='h2'>
        {showRegisterView ? 'Skapa konto' : 'Logga in'}
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
      {showRegisterView && (
        <>
          <Input
            type='text'
            placeholder='Förnamn'
            value={firstname}
            onChange={(e) => setFirstname(e.currentTarget.value)}
          />
          <Input
            type='text'
            placeholder='Efternamn'
            value={lastname}
            onChange={(e) => setLastname(e.currentTarget.value)}
          />
        </>
      )}
      {error.length > 0 && <NormalTypography variant='m' color={theme.colors.textDefault}>{error}</NormalTypography>}
      <Button variant='primary' onClick={showRegisterView ? handleCreateAccount : handleSignIn}>
        {showRegisterView ? 'Skapa konto' : 'Logga in'}
      </Button>
      <Button variant='secondary' onClick={handleGoogleSignIn}>
        Logga in med Google
      </Button>
      <Divider color={theme.colors.silver} />
      <Button variant='secondary' onClick={() => setShowRegisterView(!showRegisterView)}>
        {showRegisterView ? 'Logga in' : 'Skapa konto'}
      </Button>
    </Section>
  )
}

export default Auth;