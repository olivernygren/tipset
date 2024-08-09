import styled from 'styled-components';
import { theme } from '../../theme';

interface RegularTypographyProps {
  variant?: 'xs' | 's' | 'm' | 'l';
  color?: string;
}

interface HeadingsTypographyProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  color?: string;
  children: any;
}

export interface RootTypographyProps {
  id?: string;
  color?: string;
  align?: 'left' | 'center' | 'right';
  as?: string
}

const getRegularTypographySize = (variant: RegularTypographyProps['variant']) => {
  switch (variant) {
    case 'xs':
      return '12px';
    case 's':
      return '14px';
    case 'm':
      return '16px';
    case 'l':
      return '20px';
    default:
      return '16px';
  }
};

const getHeadingsTypographySize = (variant: HeadingsTypographyProps['variant']) => {
  switch (variant) {
    case 'h1':
      return '40px';
    case 'h2':
      return '32px';
    case 'h3':
      return '24px';
    case 'h4':
      return '20px';
    case 'h5':
      return '18px';
    case 'h6':
      return '16px';
    default:
      return '24px';
  }
};

const RootTypography = styled.span<RootTypographyProps>`
  font-family: "Readex Pro", sans-serif;
  margin: 0;
  color: ${({ color }) => (color || theme.colors.textDefault)};
  cursor: ${({ onClick }) => onClick && 'pointer'};
  text-align: ${({ align }) => align && align};
`;

export const NormalTypography = styled(RootTypography)<RegularTypographyProps>`
  font-size: ${({ variant }) => getRegularTypographySize(variant ?? 'm')};
  font-weight: 400;
  transition: color 0.2s;
`;

export const EmphasisTypography = styled(RootTypography)<RegularTypographyProps>`
  font-size: ${({ variant }) => getRegularTypographySize(variant ?? 'm')};
  font-weight: 500;
  transition: color 0.2s;
`;

export const HeadingsTypography = styled(RootTypography).attrs<HeadingsTypographyProps>(({ variant }) => ({
  as: variant,
}))<HeadingsTypographyProps>`
  font-size: ${({ variant }) => getHeadingsTypographySize(variant)};
  font-weight: 700;
  transition: color 0.2s;
`;
