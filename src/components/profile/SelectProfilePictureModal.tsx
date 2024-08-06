import React, { useState } from 'react'
import Button from '../buttons/Button';
import Modal from '../modal/Modal';
import { Section } from '../section/Section';
import styled from 'styled-components';
import { theme } from '../../theme';
import { ProfilePictureEnum } from '../avatar/Avatar';
import { EmphasisTypography } from '../typography/Typography';
import TextButton from '../buttons/TextButton';
import { CheckCircle } from '@phosphor-icons/react';

interface SelectProfilePictureModalProps {
  initialImage?: ProfilePictureEnum;
  onClose: () => void;
  onSelectImage: (image: ProfilePictureEnum) => void;
  onSave: () => void;
}

const SelectProfilePictureModal = ({ onClose, onSelectImage, onSave, initialImage }: SelectProfilePictureModalProps) => {
  const [selectedImage, setSelectedImage] = useState<ProfilePictureEnum | undefined>(initialImage);

  const getAvatar = (image: ProfilePictureEnum) => {
    return (
      <SelectAvatarContainer>
        <CustomAvatarSmall src={`/images/${image}.png`} alt={image} />
        {selectedImage === image ? (
          <Section flexDirection='row' gap='xxxs' alignItems='center' fitContent>
            <CheckCircle size={24} color={theme.colors.green} weight='fill' />
            <EmphasisTypography variant='m' color={theme.colors.green}>Vald</EmphasisTypography>
          </Section>
        ) : (
          <TextButton onClick={() => setSelectedImage(image)} noPadding>Välj</TextButton>
        )}
      </SelectAvatarContainer>
    )
  };

  return (
    <Modal
      size='m'
      title='Välj profilbild'
      onClose={onClose}
    >
      <AvatarGrid>
        {Object.values(ProfilePictureEnum).map((image) => getAvatar(image))}
      </AvatarGrid>
      <Section flexDirection='row' gap='xs' alignItems='center'>
        <Button
          variant='secondary'
          onClick={onClose}
          fullWidth
        >
          Avbryt
        </Button>
        <Button
          variant='primary'
          onClick={onSave}
          fullWidth
        >
          Spara
        </Button>
      </Section>
    </Modal>
  )
};

const CustomAvatarSmall = styled.img`
  width: 124px;
  height: 124px;
  border-radius: 50%;
  object-fit: cover;
  object-position: center;
  border: 2px solid ${theme.colors.silver};
`;

const AvatarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${theme.spacing.m};
  margin-bottom: ${theme.spacing.m};
`;

const SelectAvatarContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  align-items: center;
`;

export default SelectProfilePictureModal;