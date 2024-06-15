import React from 'react';
import styled from 'styled-components';

export enum AvatarSize {
  S = 'small',
  M = 'medium',
  L = 'large',
  XL = 'xlarge',
}

interface AvatarProps {
  src: string;
  size: AvatarSize;
  alt?: string;
}

const Avatar = ({ src, size = AvatarSize.M, alt }: AvatarProps) => {
  return (
    <StyledAvatar src={src} size={size} alt={alt ?? 'avatar'} />
  )
}

const getAvatarSize = (size: AvatarSize) => {
  switch (size) {
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
}

const StyledAvatar = styled.img<AvatarProps>`
  /* border-radius: 50%; */
  width: ${({ size }) => getAvatarSize(size)};
  height: ${({ size }) => getAvatarSize(size)};
  object-fit: contain;
  object-position: center;
`;

export default Avatar;