import React from 'react'
import styled from 'styled-components';
import { theme } from '../theme';

interface PageProps {
  children: React.ReactNode;
  user: any;
  noPadding?: boolean;
}

const Page = ({ children, user, noPadding }: PageProps) => {
  return (
    <Root>{children}</Root>
  )
}

const Root = styled.div<{ noPadding?: boolean }>`
  padding: ${({ noPadding }) => (noPadding ? '0' : theme.spacing.xl)};
  min-height: 100vh;
  min-width: 100vw;
  overflow-x: hidden;
  overflow-y: auto;
  background-color: ${theme.colors.silverLighter};
`;

export default Page