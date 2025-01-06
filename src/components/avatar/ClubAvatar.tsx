import React from 'react';
import Avatar, { AvatarSize } from './Avatar';

interface ClubAvatarProps {
  clubName: string;
  logoUrl: string;
  size: AvatarSize;
  showBorder?: boolean;
  noPadding?: boolean;
}

const ClubAvatar = ({
  logoUrl, clubName, size, showBorder, noPadding,
}: ClubAvatarProps) => (
  <Avatar
    src={logoUrl}
    size={size}
    alt={`${clubName} logo`}
    title={clubName}
    showBorder={showBorder}
    noPadding={noPadding}
  />
);

export default ClubAvatar;
