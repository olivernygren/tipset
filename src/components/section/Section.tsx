/* eslint-disable import/prefer-default-export */
import styled from 'styled-components';
import { devices, theme } from '../../theme';

interface SectionProps {
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  gap?: 'xxxs' | 'xxs' | 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl' | 'xxxl' | 'xxxxl';
  padding?: string;
  backgroundColor?: string;
  borderRadius?: string;
  fitContent?: boolean;
  height?: string;
  expandMobile?: boolean;
  pointer?: boolean;
  overflow?: string;
}

export const Section = styled.section<SectionProps>`
  display: flex;
  flex-direction: ${({ flexDirection }) => flexDirection || 'column'};
  justify-content: ${({ justifyContent }) => justifyContent || 'flex-start'};
  align-items: ${({ alignItems }) => alignItems || 'flex-start'};
  gap: ${({ gap }) => gap && theme.spacing[gap]};
  padding: ${({ padding }) => padding || 0};
  background-color: ${({ backgroundColor }) => backgroundColor || 'transparent'};
  border-radius: ${({ borderRadius, expandMobile }) => (expandMobile || !borderRadius ? 0 : borderRadius)};
  box-sizing: border-box;
  width: ${({ fitContent }) => (fitContent ? 'fit-content' : '100%')};
  position: relative;
  height: ${({ height }) => height || 'auto'};
  cursor: ${({ pointer }) => (pointer ? 'pointer' : 'inherit')};
  overflow: ${({ overflow }) => overflow || 'visible'};

  @media ${devices.tablet} {
    border-radius: ${({ borderRadius }) => borderRadius || 0};
  }
`;
