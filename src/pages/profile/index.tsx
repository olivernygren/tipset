import React, { useEffect, useState } from 'react'
import Page from '../../components/Page';
import { Section } from '../../components/section/Section';
import { HeadingsTypography, NormalTypography } from '../../components/typography/Typography';
import { theme } from '../../theme';
import Input from '../../components/input/Input';
import { useUser } from '../../context/UserContext';
import Button from '../../components/buttons/Button';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { CollectionEnum } from '../../utils/Firebase';
import { withDocumentIdOnObject } from '../../utils/helpers';
import { errorNotify } from '../../utils/toast/toastHelpers';
import styled from 'styled-components';
import SelectProfilePictureModal from '../../components/profile/SelectProfilePictureModal';
import { ProfilePictureEnum } from '../../components/avatar/Avatar';
import { Divider } from '../../components/Divider';

const ProfilePage = () => {
  const { user } = useUser();

  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [profilePictureModalOpen, setProfilePictureModalOpen] = useState(false);
  const [notLoggedIn, setNotLoggedIn] = useState(false);

  useEffect(() => {
    if (user) {
      setNotLoggedIn(false);
      setFirstName(user.firstname);
      setLastName(user.lastname);
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setNotLoggedIn(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    if (!user || notLoggedIn) {
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, CollectionEnum.USERS, user.documentId));
      const userData = withDocumentIdOnObject(userDoc);
  
      await updateDoc(doc(db, CollectionEnum.USERS, user.documentId), {
        ...userData,
        firstname: firstName,
        lastname: lastName,
      });
    } catch (error) {
      console.error(error);
      errorNotify('Något gick fel');
    }

  }

  return (
    <Page>
      <Section gap='m'>
        <HeadingsTypography variant='h1'>Konto</HeadingsTypography>
        {notLoggedIn ? (
          <NormalTypography variant='m'>Logga in för att se kontoinformation</NormalTypography>
        ) : (
          <Section
            gap='m'
            backgroundColor={theme.colors.white}
            borderRadius={theme.borderRadius.l}
            padding={theme.spacing.m}
          >
            <HeadingsTypography variant='h4'>Profilbild</HeadingsTypography>
            <Section gap='m' flexDirection='row' alignItems='flex-end'>
              <CustomAvatarLarge src={'/images/carl-gustaf.png'} alt='image' />
              <Button
                variant='secondary'
                onClick={() => setProfilePictureModalOpen(true)}
              >
                Byt profilbild
              </Button>
            </Section>
            <Divider />
            <Section gap='m'>
              <Section gap='m' alignItems='center' flexDirection='row'>
                <Input
                  label='Förnamn'
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  fullWidth
                />
                <Input
                  label='Efternamn'
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  fullWidth
                />
              </Section>
              <Input
                label='Email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                disabled
              />
              <Button
                variant='primary'
                onClick={handleSave}
              >
                Spara
              </Button>
            </Section>
          </Section>
        )}
      </Section>
      {profilePictureModalOpen && (
        <SelectProfilePictureModal
          onClose={() => setProfilePictureModalOpen(false)}
          onSave={() => {}}
          onSelectImage={() => {}}
          initialImage={ProfilePictureEnum.CARL_GUSTAF}
        />
      )}
    </Page>
  )
};

const CustomAvatarLarge = styled.img`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  object-fit: cover;
  object-position: center;
  border: 2px solid ${theme.colors.silver};
`;

export default ProfilePage;