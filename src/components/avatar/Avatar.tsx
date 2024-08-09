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
}

interface StyledAvatarProps {
  size: AvatarSize;
  showBorder: boolean;
  customBorderColor?: string;
  objectFit: 'cover' | 'contain';
  isDarkMode?: boolean;
  noPadding?: boolean;
}

const Avatar = ({
  src, size = AvatarSize.M, alt, objectFit = 'contain', showBorder = false, customBorderColor, isDarkMode, noPadding = false,
}: AvatarProps) => (
  <StyledAvatar
    size={size}
    showBorder={showBorder}
    customBorderColor={customBorderColor}
    objectFit={objectFit}
    isDarkMode={isDarkMode}
    noPadding={noPadding}
    className="avatar"
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

// const StyledAvatar = styled.img<AvatarProps>`
//   border-radius: ${({ shape }) => shape === 'circle' ? '50%' : theme.borderRadius.xs};
//   width: ${({ size }) => getAvatarSize(size)};
//   height: ${({ size }) => getAvatarSize(size)};
//   object-fit: ${({ objectFit }) => objectFit};
//   object-position: center;
//   border: ${({ showBorder, customBorderColor }) => showBorder ? `2px solid ${customBorderColor || theme.colors.silverLight}` : 'none'};
//   padding: ${({ objectFit }) => objectFit === 'contain' ? theme.spacing.xxs : '0'};
// `;

const StyledAvatar = styled.div<StyledAvatarProps>`
  display: inline-block;
  width: ${({ size }) => getAvatarSize(size)};
  height: ${({ size }) => getAvatarSize(size)};
  border: ${({ showBorder, customBorderColor }) => (showBorder ? `2px solid ${customBorderColor || theme.colors.silver}` : 'none')};
  padding: ${({ objectFit }) => (objectFit === 'contain' ? theme.spacing.xxs : '0')};
  margin: ${({ objectFit }) => (objectFit === 'cover' ? theme.spacing.xxs : '0')};
  overflow: hidden;
  border-radius: 50%;
  background-color: ${({ isDarkMode }) => (isDarkMode ? theme.colors.white : 'transparent')};

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
