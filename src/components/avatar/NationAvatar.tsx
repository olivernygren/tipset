import React from 'react';
import Avatar, { AvatarSize } from './Avatar';

interface NationAvatarProps {
  nationName: string;
  flagUrl: string;
  size: AvatarSize;
  backgroundColor?: string;
}

const NationAvatar = ({
  nationName, flagUrl, size, backgroundColor,
}: NationAvatarProps) => (
  <Avatar
    src={flagUrl}
    size={size}
    alt={`${nationName} logo`}
    showBorder
    objectFit="cover"
    title={nationName}
    backgroundColor={backgroundColor}
  />
);

export default NationAvatar;
