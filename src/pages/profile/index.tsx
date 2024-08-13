import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import styled from 'styled-components';
import Page from '../../components/Page';
import { Section } from '../../components/section/Section';
import { HeadingsTypography, NormalTypography } from '../../components/typography/Typography';
import { theme } from '../../theme';
import Input from '../../components/input/Input';
import { useUser } from '../../context/UserContext';
import Button from '../../components/buttons/Button';
import { db } from '../../config/firebase';
import { CollectionEnum } from '../../utils/Firebase';
import { getProfilePictureUrl, withDocumentIdOnObject } from '../../utils/helpers';
import { errorNotify, successNotify } from '../../utils/toast/toastHelpers';
import SelectProfilePictureModal from '../../components/profile/SelectProfilePictureModal';
import { ProfilePictureEnum } from '../../components/avatar/Avatar';
import { Divider } from '../../components/Divider';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';

const ProfilePage = () => {
  const { user } = useUser();
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [profilePicture, setProfilePicture] = useState<string | undefined>(getProfilePictureUrl(user?.profilePicture as ProfilePictureEnum));
  const [selectedNewProfilePicture, setSelectedNewProfilePicture] = useState(user?.profilePicture ? getProfilePictureUrl(user.profilePicture as ProfilePictureEnum) : undefined);
  const [profilePictureModalOpen, setProfilePictureModalOpen] = useState(false);
  const [notLoggedIn, setNotLoggedIn] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setNotLoggedIn(false);
      setFirstName(user.firstname);
      setLastName(user.lastname);
      setEmail(user.email);
      setProfilePicture(getProfilePictureUrl(user.profilePicture as ProfilePictureEnum));
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setNotLoggedIn(true);
    }
  }, []);

  const handleSave = async () => {
    if (!user || notLoggedIn) {
      return;
    }

    setSaveLoading(true);

    try {
      const userDoc = await getDoc(doc(db, CollectionEnum.USERS, user.documentId));
      const userData = withDocumentIdOnObject(userDoc);

      await updateDoc(doc(db, CollectionEnum.USERS, user.documentId), {
        ...userData,
        firstname: firstName,
        lastname: lastName,
        profilePicture: selectedNewProfilePicture,
      });
      successNotify('Profilen är uppdaterad');
    } catch (error) {
      console.error(error);
      errorNotify('Något gick fel');
    }

    setSaveLoading(false);
  };

  const handleSelectNewProfilePicture = (image: ProfilePictureEnum) => {
    setSelectedNewProfilePicture(image);
  };

  const handleSaveNewProfilePicture = () => {
    setProfilePicture(getProfilePictureUrl(selectedNewProfilePicture as ProfilePictureEnum));
    setProfilePictureModalOpen(false);
  };

  return (
    <Page>
      <Section gap="m">
        <HeadingsTypography variant="h1">Konto</HeadingsTypography>
        {notLoggedIn ? (
          <NormalTypography variant="m">Logga in för att se kontoinformation</NormalTypography>
        ) : (
          <Section
            gap="m"
            backgroundColor={theme.colors.white}
            borderRadius={theme.borderRadius.l}
            padding={theme.spacing.m}
          >
            <HeadingsTypography variant="h4">Profilbild</HeadingsTypography>
            <Section gap="m" flexDirection={isMobile ? 'column' : 'row'} alignItems={isMobile ? 'center' : 'flex-end'}>
              <CustomAvatarLarge src={profilePicture} alt="image" />
              <Button
                variant="secondary"
                onClick={() => setProfilePictureModalOpen(true)}
              >
                Byt profilbild
              </Button>
            </Section>
            <Divider />
            <Section gap="m">
              <Section gap="m" alignItems="center" flexDirection={isMobile ? 'column' : 'row'}>
                <Input
                  label="Förnamn"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  fullWidth
                />
                <Input
                  label="Efternamn"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  fullWidth
                />
              </Section>
              <Input
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                disabled
              />
              <Button
                variant="primary"
                onClick={handleSave}
                loading={saveLoading}
                fullWidth={isMobile}
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
          onSave={handleSaveNewProfilePicture}
          onSelectImage={(image) => handleSelectNewProfilePicture(image)}
          initialImage={profilePicture?.split('/images/')[1].split('.png')[0] as ProfilePictureEnum}
        />
      )}
    </Page>
  );
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
