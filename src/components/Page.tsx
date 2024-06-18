import React from 'react'
import styled from 'styled-components';
import { theme } from '../theme';

interface PageProps {
  children: React.ReactNode;
  user?: any;
  noPadding?: boolean;
}

const Page = ({ children, user, noPadding }: PageProps) => {
  return (
    <Root>
      <Content>
        {children}
      </Content>
    </Root>
  )
}

const Root = styled.div<{ noPadding?: boolean }>`
  padding: ${({ noPadding }) => (noPadding ? '0' : theme.spacing.xl)};
  min-height: calc(100vh - 80px);
  min-width: 100vw;
  overflow-x: hidden;
  overflow-y: auto;
  background-color: ${theme.colors.silverLighter};
  box-sizing: border-box;
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

export default Page