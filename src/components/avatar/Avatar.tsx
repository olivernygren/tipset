import React from 'react';
import styled, { css } from 'styled-components';
import { theme } from '../../theme';

export enum AvatarSize {
  XS = 'xSmall',
  S = 'small',
  M = 'medium',
  L = 'large',
  XL = 'xlarge',
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
  isDarkMode?: boolean;
  noPadding?: boolean;
  opacity?: number;
  title?: string;
}

interface StyledAvatarProps {
  size: AvatarSize;
  showBorder: boolean;
  customBorderColor?: string;
  objectFit: 'cover' | 'contain';
  isDarkMode?: boolean;
  noPadding?: boolean;
  opacity?: number;
}

const Avatar = ({
  src, size = AvatarSize.M, alt, objectFit = 'contain', showBorder = false, customBorderColor, isDarkMode, noPadding = false, opacity = 1, title,
}: AvatarProps) => (
  <StyledAvatar
    title={title}
    size={size}
    showBorder={showBorder}
    customBorderColor={customBorderColor}
    objectFit={objectFit}
    isDarkMode={isDarkMode}
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
      return '64px';
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

const StyledAvatar = styled.div<StyledAvatarProps>`
  display: inline-block;
  width: ${({ size }) => getAvatarSize(size)};
  height: ${({ size }) => getAvatarSize(size)};
  border: ${({ showBorder, customBorderColor, size }) => (showBorder ? `${size === AvatarSize.XS || size === AvatarSize.S ? '1px' : '2px'} solid ${customBorderColor || theme.colors.silver}` : 'none')};
  padding: ${({ objectFit, size }) => getAvatarPadding(objectFit, size)};
  margin: ${({ objectFit, size }) => getAvatarMargin(objectFit, size)};
  overflow: hidden;
  border-radius: 50%;
  background-color: ${({ isDarkMode }) => (isDarkMode ? theme.colors.white : 'transparent')};
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
