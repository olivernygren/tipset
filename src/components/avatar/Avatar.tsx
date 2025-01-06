import React from 'react';
import styled, { css } from 'styled-components';
import { theme } from '../../theme';

export enum AvatarSize {
  XS = 'xSmall',
  S = 'small',
  M = 'medium',
  L = 'large',
  XL = 'xlarge',
  XXL = 'xxlarge',
  XXXL = 'xxxlarge',
}

export enum ProfilePictureEnum {
  GRANNEN = 'grannen',
  CARL_GUSTAF = 'carl-gustaf',
  DONKEY = 'donkey',
  ZLATAN = 'zlatan',
  ANIMAL = 'animal',
  SHREK = 'shrek',
  ANTONY = 'antony',
  FELLAINI = 'fellaini',
}

interface AvatarProps {
  src: string;
  size: AvatarSize;
  alt?: string;
  objectFit?: 'cover' | 'contain';
  showBorder?: boolean;
  customBorderColor?: string;
  customBorderWidth?: number;
  backgroundColor?: string;
  noPadding?: boolean;
  opacity?: number;
  title?: string;
}

interface StyledAvatarProps {
  size: AvatarSize;
  showBorder: boolean;
  customBorderColor?: string;
  customBorderWidth?: number;
  objectFit: 'cover' | 'contain';
  backgroundColor?: string;
  noPadding?: boolean;
  opacity?: number;
}

const Avatar = ({
  src, size = AvatarSize.M, alt, objectFit = 'contain', showBorder = false, customBorderColor, backgroundColor, noPadding = false, opacity = 1, title, customBorderWidth,
}: AvatarProps) => (
  <StyledAvatar
    title={title}
    size={size}
    showBorder={showBorder}
    customBorderColor={customBorderColor}
    customBorderWidth={customBorderWidth}
    objectFit={objectFit}
    backgroundColor={backgroundColor}
    noPadding={noPadding}
    className="avatar"
    opacity={opacity}
  >
    <img src={src} alt={alt ?? 'avatar'} />
  </StyledAvatar>
);

const getAvatarSize = (size: AvatarSize) => {
  switch (size) {
    case AvatarSize.XS:
      return '16px';
    case AvatarSize.S:
      return '24px';
    case AvatarSize.M:
      return '32px';
    case AvatarSize.L:
      return '48px';
    case AvatarSize.XL:
      return '58px';
    case AvatarSize.XXL:
      return '72px';
    case AvatarSize.XXXL:
      return '128px';
    default:
      return '32px';
  }
};

const getAvatarPadding = (objectFit: 'cover' | 'contain', size: AvatarSize) => {
  switch (objectFit) {
    case 'cover':
      return 0;
    case 'contain':
      return size === AvatarSize.XS ? theme.spacing.xxxs : theme.spacing.xxs;
    default:
      return '0';
  }
};

const getAvatarMargin = (objectFit: 'cover' | 'contain', size: AvatarSize) => {
  switch (objectFit) {
    case 'cover':
      if (size === AvatarSize.XS) {
        return theme.spacing.xxxs;
      }
      return theme.spacing.xxs;
    case 'contain':
      return 0;
    default:
      return 0;
  }
};

const getAvatarBorderWidth = (size: AvatarSize, customBorderWidth?: number) => {
  if (customBorderWidth) {
    return customBorderWidth;
  }
  return size === AvatarSize.XS || size === AvatarSize.S ? 1 : 2;
};

const StyledAvatar = styled.div<StyledAvatarProps>`
  display: inline-block;
  width: ${({ size }) => getAvatarSize(size)};
  height: ${({ size }) => getAvatarSize(size)};
  border: ${({
    showBorder, customBorderColor, size, customBorderWidth,
  }) => (showBorder ? `${getAvatarBorderWidth(size, customBorderWidth)}px solid ${customBorderColor || theme.colors.silver}` : 'none')};
  padding: ${({ objectFit, size }) => getAvatarPadding(objectFit, size)};
  margin: ${({ objectFit, size }) => getAvatarMargin(objectFit, size)};
  overflow: hidden;
  border-radius: 50%;
  background-color: ${({ backgroundColor }) => (backgroundColor || 'transparent')};
  opacity: ${({ opacity }) => opacity};

  ${({ noPadding }) => noPadding && css`
    padding: 0 !important;
  `}

  & > img {
    width: 100%;
    height: 100%;
    object-fit: ${({ objectFit }) => objectFit};
    object-position: center;
  }
`;

export default Avatar;
