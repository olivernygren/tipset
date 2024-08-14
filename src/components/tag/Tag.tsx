import React from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';
import { NormalTypography } from '../typography/Typography';

interface TagProps {
  textAndIconColor?: string;
  backgroundColor?: string;
  text: string;
  icon?: React.ReactNode;
  size?: 's' | 'm' | 'l';
  fullWidth?: boolean;
  onClick?: () => void;
}

interface StyledTagProps {
  textAndIconColor?: string;
  backgroundColor?: string;
  size?: 's' | 'm' | 'l';
  fullWidth?: boolean;
  onClick?: () => void;
}

const Tag = ({
  text, textAndIconColor, backgroundColor, icon, size = 'm', fullWidth, onClick,
}: TagProps) => (
  <StyledTag
    size={size}
    fullWidth={fullWidth}
    backgroundColor={backgroundColor || theme.colors.primary}
    textAndIconColor={textAndIconColor}
    onClick={onClick || undefined}
  >
    {icon}
    <NormalTypography color={textAndIconColor || theme.colors.primary} variant={size === 's' ? 's' : 'm'}>
      {text}
    </NormalTypography>
  </StyledTag>
);

const getTagSize = (size?: 's' | 'm' | 'l') => {
  if (!size) return;

  switch (size) {
    case 's':
      return '24px';
    case 'm':
      return '32px';
    case 'l':
      return '40px';
    default:
      return '32px';
  }
};

const StyledTag = styled.div<StyledTagProps>`
  height: ${({ size }) => getTagSize(size)};
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 ${theme.spacing.xs};
  border-radius: 100px;
  width: fit-content;
  box-sizing: border-box;
  background-color: ${({ backgroundColor }) => backgroundColor};
  cursor: ${({ onClick }) => (onClick ? 'pointer' : 'default')};

  ${NormalTypography} {
    white-space: nowrap;
  }

  svg {
    path {
      fill: ${({ textAndIconColor }) => textAndIconColor || theme.colors.primary};
    }
  }
`;

export default Tag;
