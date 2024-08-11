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
}

const Tag = ({
  text, textAndIconColor, backgroundColor, icon, size = 'm', fullWidth,
}: TagProps) => {
  const getTagSize = () => {
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

  return (
    <StyledTag
      size={getTagSize()}
      fullWidth={fullWidth}
      backgroundColor={backgroundColor || theme.colors.primary}
      textAndIconColor={textAndIconColor}
    >
      {icon}
      <NormalTypography color={textAndIconColor || theme.colors.primary} variant={size === 's' ? 's' : 'm'}>
        {text}
      </NormalTypography>
    </StyledTag>
  );
};

const StyledTag = styled.div<{ size: string, fullWidth?: boolean, backgroundColor: string, textAndIconColor?: string }>`
  height: ${({ size }) => size};
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 ${theme.spacing.xs};
  border-radius: 100px;
  width: fit-content;
  box-sizing: border-box;
  background-color: ${({ backgroundColor }) => backgroundColor};

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
