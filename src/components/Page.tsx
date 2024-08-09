import React from 'react';
import styled from 'styled-components';
import { devices, theme } from '../theme';
import RootToast from './toast/RootToast';

interface PageProps {
  children: React.ReactNode;
}

const Page = ({ children }: PageProps) => (
  <>
    <Root>
      <Content>
        {children}
      </Content>
    </Root>
    <RootToast />
  </>
);

const Root = styled.div<{ noPadding?: boolean }>`
  padding: ${({ noPadding }) => (noPadding ? '0' : theme.spacing.m)};
  min-height: calc(100vh - 80px);
  min-width: 100vw;
  overflow-x: hidden;
  overflow-y: auto;
  background-color: ${theme.colors.silverLighter};
  box-sizing: border-box;
  
  @media ${devices.tablet} {
    padding: ${({ noPadding }) => (noPadding ? '0' : theme.spacing.l)};
  }
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

export default Page;
