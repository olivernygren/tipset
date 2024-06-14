import styled from "styled-components";

interface SectionProps {
  flexDirection?: 'row' | 'column';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  gap?: 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl' | 'xxxl' | 'xxxxl';
  padding?: string;
  backgroundColor?: string;
}

export const Section = styled.section<SectionProps>`
  display: flex;
  flex-direction: ${({ flexDirection }) => flexDirection || 'column'};
  justify-content: ${({ justifyContent }) => justifyContent || 'flex-start'};
  align-items: ${({ alignItems }) => alignItems || 'flex-start'};
  gap: ${({ gap, theme }) => gap && theme.spacing[gap]};
  padding: ${({ padding }) => padding || 0};
  background-color: ${({ backgroundColor }) => backgroundColor || 'transparent'};
`;