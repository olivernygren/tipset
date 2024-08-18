import React, { useState } from 'react';
import {
  createUserWithEmailAndPassword, fetchSignInMethodsForEmail, signInWithEmailAndPassword, signInWithPopup, updateProfile,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowCircleRight } from '@phosphor-icons/react';
import { EmphasisTypography, HeadingsTypography, NormalTypography } from '../typography/Typography';
import Input from '../input/Input';
import Button from '../buttons/Button';
import { auth, db, provider as googleProvider } from '../../config/firebase';
import { devices, theme } from '../../theme';
import { Divider } from '../Divider';
import { CollectionEnum } from '../../utils/Firebase';
import { CreateUserInput, RolesEnum } from '../../utils/Auth';
import { Section } from '../section/Section';
import TextButton from '../buttons/TextButton';
import Avatar, { AvatarSize } from '../avatar/Avatar';
import SelectProfilePictureModal from '../profile/SelectProfilePictureModal';
import { errorNotify } from '../../utils/toast/toastHelpers';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';

const Auth = () => {
  const navigate = useNavigate();
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [firstname, setFirstname] = useState<string>('');
  const [lastname, setLastname] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showRegisterView, setShowRegisterView] = useState<boolean>(false);
  const [createAccountStep, setCreateAccountStep] = useState(1);
  const [selectedAvatar, setSelectedAvatar] = useState('generic');
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setError('');

    if (!email || !password || email === '' || password === '') {
      setError('Fyll i alla fält');
      return;
    }

    if (password.length < 6) {
      setError('Lösenordet måste vara minst 6 tecken långt');
      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (e: any) {
      if (e.code === 'auth/wrong-password') {
        setError('Fel lösenord');
      } else if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential') {
        setError('Användaren hittades inte');
      } else {
        setError('Ett fel uppstod');
      }
      errorNotify('Ett fel uppstod');
      console.error(e);
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const { user } = result;

      if (!user || !user.email) {
        errorNotify('Ett fel uppstod');
        return;
      }

      // Check if the email already exists
      const signInMethods = await fetchSignInMethodsForEmail(auth, user.email);
      if (signInMethods.length === 0) {
        // Sign out the user if no sign-in methods are found
        await auth.signOut();
        setError('Kontot finns inte. Skapa ett konto först.');
        return;
      }

      navigate('/');
    } catch (e) {
      errorNotify('Ett fel uppstod');
      console.error(e);
    }
  };

  const handleCreateAccount = async () => {
    setError('');

    if (firstname === '' || lastname === '') {
      setError('Fyll i alla fält');
      return;
    }

    setLoading(true);

    const input: CreateUserInput = {
      email,
      firstname,
      lastname,
      role: RolesEnum.USER,
      profilePicture: selectedAvatar,
    };

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const { user } = result;

      // Ensure the document ID matches the user's uid
      await setDoc(doc(db, CollectionEnum.USERS, user.uid), input);
      await updateProfile(user, {
        displayName: `${firstname} ${lastname}`,
      });

      navigate('/');
    } catch (e) {
      errorNotify('Ett fel uppstod');
      console.error(e);
    }

    setLoading(false);
  };

  const handleCreateAccountWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const { user } = result;

      const displayNameParts = user.providerData[0]?.displayName ? user.providerData[0].displayName.split(' ') : ['', ''];
      const firstName = displayNameParts[0];
      let lastName = displayNameParts.slice(1).join(' ');

      // If there's no space in the displayName, you might decide to leave lastname empty or handle it differently
      if ((!user.displayName && !user.providerData.length) || displayNameParts.length === 1) {
        lastName = ''; // Or any other fallback logic you prefer
      }

      const input = {
        email: user.email, // Google account's email
        firstname: firstName,
        lastname: lastName,
        role: RolesEnum.USER,
        profilePicture: 'generic',
      };

      await setDoc(doc(db, CollectionEnum.USERS, user.uid), input);
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
      });

      navigate('/');
    } catch (e) {
      errorNotify('Ett fel uppstod');
      console.error(e);
    }
  };

  const handleNextStep = () => {
    setError('');

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (createAccountStep === 1 && !isValidEmail) {
      setError('Ogiltig e-postadress');
      return;
    }

    if (password.length < 6) {
      setError('Lösenordet måste vara minst 6 tecken långt');
      return;
    }

    setCreateAccountStep(2);
  };

  // const getAvatar = (image: ProfilePictureEnum) => (
  //   <SelectAvatarContainer>
  //     <CustomAvatarSmall src={`/images/${image}.png`} alt={image} />
  //     {selectedImage === image ? (
  //       <Section flexDirection="row" gap="xxxs" alignItems="center" fitContent>
  //         <CheckCircle size={24} color={theme.colors.green} weight="fill" />
  //         <EmphasisTypography variant="m" color={theme.colors.green}>Vald</EmphasisTypography>
  //       </Section>
  //     ) : (
  //       <TextButton
  //         onClick={() => {
  //           setSelectedImage(image);
  //           onSelectImage(image);
  //         }}
  //         noPadding
  //       >
  //         Välj
  //       </TextButton>
  //     )}
  //   </SelectAvatarContainer>
  // );

  const getContent = () => {
    if (showRegisterView) {
      return (
        <Card>
          <Section gap="xs">
            <HeadingsTypography variant="h2">
              Skapa konto
            </HeadingsTypography>
            <NormalTypography variant="s" color={theme.colors.silverDark}>
              Ange dina uppgifter och tryck på Nästa steg
            </NormalTypography>
          </Section>
          <Button
            color="textDefault"
            textColor="textDefault"
            variant="secondary"
            onClick={handleCreateAccountWithGoogle}
            icon={<GoogleIcon src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" />}
            fullWidth
            id="google-sign-in"
          >
            Skapa konto med Google
          </Button>
          <WordDivider>
            <Divider color={theme.colors.silverLight} />
            <NormalTypography variant="m" color={theme.colors.silverDark}>eller</NormalTypography>
            <Divider color={theme.colors.silverLight} />
          </WordDivider>
          <Section gap="s">
            {createAccountStep === 1 ? (
              <>
                <Input
                  type="text"
                  name="email"
                  placeholder="E-post"
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                  fullWidth
                  label="E-post"
                />
                <Input
                  type="password"
                  placeholder="Lösenord (minst 6 tecken)"
                  value={password}
                  onChange={(e) => setPassword(e.currentTarget.value)}
                  fullWidth
                  label="Lösenord"
                  name="password"
                />
              </>
            ) : (
              <>
                <Input
                  type="text"
                  placeholder="Förnamn"
                  value={firstname}
                  onChange={(e) => setFirstname(e.currentTarget.value)}
                  fullWidth
                  label="Förnamn"
                  name="firstname"
                />
                <Input
                  type="text"
                  placeholder="Efternamn"
                  value={lastname}
                  onChange={(e) => setLastname(e.currentTarget.value)}
                  fullWidth
                  label="Efternamn"
                  name="lastname"
                />
                <Section gap="xxxs" flexDirection="row" alignItems="center" justifyContent="space-between">
                  <EmphasisTypography variant="s">Välj avatar</EmphasisTypography>
                  <Section flexDirection="row" alignItems="center" fitContent gap="xs">
                    <TextButton onClick={() => setShowAvatarModal(true)} noPadding>
                      {selectedAvatar === 'generic' ? 'Välj' : 'Ändra'}
                    </TextButton>
                    <Avatar src={`/images/${selectedAvatar}.png`} size={AvatarSize.L} showBorder objectFit="cover" />
                  </Section>
                </Section>
              </>
            )}
          </Section>
          {error.length > 0 && <NormalTypography variant="m" color={theme.colors.red}>{error}</NormalTypography>}
          {createAccountStep === 1 ? (
            <Button
              variant="primary"
              onClick={handleNextStep}
              fullWidth
              endIcon={<ArrowCircleRight size={24} color={theme.colors.white} weight="fill" />}
              disabled={email === '' || password === ''}
            >
              Nästa steg
            </Button>
          ) : (
            <Section gap="xs" flexDirection="row" alignItems="center">
              <Button variant="secondary" onClick={() => setCreateAccountStep(1)} fullWidth>
                Tillbaka
              </Button>
              <Button variant="primary" onClick={handleCreateAccount} fullWidth loading={loading}>
                Skapa konto
              </Button>
            </Section>
          )}
          <Divider color={theme.colors.silverLight} />
          <Section flexDirection={isMobile ? 'column' : 'row'} alignItems="center" justifyContent="center">
            <NormalTypography variant="m" color={theme.colors.silverDark}>Har du redan skapat ett konto?</NormalTypography>
            <TextButton onClick={() => {
              setShowRegisterView(!showRegisterView);
              setCreateAccountStep(1);
            }}
            >
              Logga in
            </TextButton>
          </Section>
        </Card>
      );
    }

    return (
      <Card>
        <Section gap="xs">
          <HeadingsTypography variant="h2">
            Logga in
          </HeadingsTypography>
          <NormalTypography variant="s" color={theme.colors.silverDark}>
            Ange dina uppgifter för att logga in
          </NormalTypography>
        </Section>
        <Button
          color="textDefault"
          textColor="textDefault"
          variant="secondary"
          onClick={handleGoogleSignIn}
          icon={<GoogleIcon src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" />}
          fullWidth
          id="google-sign-in"
        >
          Logga in med Google
        </Button>
        <WordDivider>
          <Divider color={theme.colors.silverLight} />
          <NormalTypography variant="m" color={theme.colors.silverDark}>eller</NormalTypography>
          <Divider color={theme.colors.silverLight} />
        </WordDivider>
        <Section gap="s">
          <Input
            type="text"
            name="email"
            placeholder="E-post"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            fullWidth
            label="E-post"
          />
          <Input
            type="password"
            placeholder="Lösenord (minst 6 tecken)"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            fullWidth
            label="Lösenord"
          />
        </Section>
        {error.length > 0 && <NormalTypography variant="m" color={theme.colors.red}>{error}</NormalTypography>}
        <Button
          variant="primary"
          onClick={handleSignIn}
          fullWidth
          loading={loading}
          disabled={email === '' || password === ''}
        >
          Logga in
        </Button>
        <Divider color={theme.colors.silverLight} />
        <Section flexDirection={isMobile ? 'column' : 'row'} alignItems="center" justifyContent="center">
          <NormalTypography variant="m" color={theme.colors.silverDark}>Har du inget konto?</NormalTypography>
          <TextButton
            onClick={() => setShowRegisterView(!showRegisterView)}
          >
            Skapa konto
          </TextButton>
        </Section>
      </Card>
    );
  };

  return (
    <Container>
      {getContent()}
      {showAvatarModal && (
        <SelectProfilePictureModal
          onClose={() => setShowAvatarModal(false)}
          onSelectImage={(image) => setSelectedAvatar(image)}
          onSave={() => setShowAvatarModal(false)}
        />
      )}
    </Container>
  );
};
const Container = styled.div`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: auto 0;
`;

const Card = styled.div`
  background-color: white;
  padding: ${theme.spacing.l};
  width: 400px;
  margin: auto 0;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.m};
  border-radius: 0;

  @media ${devices.mobileL} {
    border-radius: ${theme.borderRadius.l};
  }
  
  #google-sign-in {
    /* padding: ${theme.spacing.xl}; */
    color: ${theme.colors.textDefault} !important;
  }
`;

const WordDivider = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  text-align: center;
  width: 100%;
  box-sizing: border-box;
  gap: ${theme.spacing.s};
`;

const GoogleIcon = styled.img`
  width: 24px;
  height: 24px;
`;

export default Auth;
