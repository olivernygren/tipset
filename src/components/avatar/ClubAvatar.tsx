import React from 'react';
import Avatar, { AvatarSize } from './Avatar';

interface ClubAvatarProps {
  clubName: string;
  logoUrl: string;
  size: AvatarSize;
  showBorder?: boolean;
  noPadding?: boolean;
  shape?: 'circle' | 'square';
}

const ClubAvatar = ({
  logoUrl, clubName, size, showBorder, noPadding, shape,
}: ClubAvatarProps) => (
  <Avatar
    src={logoUrl}
    size={size}
    alt={`${clubName} logo`}
    title={clubName}
    showBorder={showBorder}
    noPadding={noPadding}
    shape={shape}
  />
);

export default ClubAvatar;
