import React, { useState } from 'react';
import styled from 'styled-components';
import { CheckCircle } from '@phosphor-icons/react';
import Button from '../buttons/Button';
import Modal from '../modal/Modal';
import { Section } from '../section/Section';
import { devices, theme } from '../../theme';
import { ProfilePictureEnum } from '../avatar/Avatar';
import { EmphasisTypography } from '../typography/Typography';
import TextButton from '../buttons/TextButton';

interface SelectProfilePictureModalProps {
  initialImage?: ProfilePictureEnum;
  onClose: () => void;
  onSelectImage: (image: ProfilePictureEnum) => void;
  onSave: () => void;
}

const SelectProfilePictureModal = ({
  onClose, onSelectImage, onSave, initialImage,
}: SelectProfilePictureModalProps) => {
  const [selectedImage, setSelectedImage] = useState<ProfilePictureEnum | undefined>(initialImage);

  const getAvatar = (image: ProfilePictureEnum) => (
    <SelectAvatarContainer>
      <CustomAvatarSmall src={`/images/${image}.png`} alt={image} />
      {selectedImage === image ? (
        <Section flexDirection="row" gap="xxxs" alignItems="center" fitContent>
          <CheckCircle size={24} color={theme.colors.green} weight="fill" />
          <EmphasisTypography variant="m" color={theme.colors.green}>Vald</EmphasisTypography>
        </Section>
      ) : (
        <TextButton
          onClick={() => {
            setSelectedImage(image);
            onSelectImage(image);
          }}
          noPadding
        >
          Välj
        </TextButton>
      )}
    </SelectAvatarContainer>
  );

  return (
    <Modal
      size="m"
      title="Välj profilbild"
      onClose={onClose}
      mobileBottomSheet
    >
      <AvatarGrid>
        {Object.values(ProfilePictureEnum).map((image) => getAvatar(image))}
      </AvatarGrid>
      <Section flexDirection="row" gap="xs" alignItems="center">
        <Button
          variant="secondary"
          onClick={onClose}
          fullWidth
        >
          Avbryt
        </Button>
        <Button
          variant="primary"
          onClick={onSave}
          fullWidth
        >
          Välj
        </Button>
      </Section>
    </Modal>
  );
};

const CustomAvatarSmall = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  object-position: center;
  border: 2px solid ${theme.colors.silver};

  @media ${devices.tablet} {
    width: 124px;
    height: 124px;
  }
`;

const AvatarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(80px, 124px));
  grid-template-rows: auto;
  gap: ${theme.spacing.m};
  margin-bottom: ${theme.spacing.m};
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  
  @media ${devices.tablet} {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const SelectAvatarContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  align-items: center;
`;

export default SelectProfilePictureModal;
