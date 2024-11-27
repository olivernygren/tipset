import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { devices, theme } from '../theme';
import RootToast from './toast/RootToast';

interface PageProps {
  children: React.ReactNode;
  fullWidthMobile?: boolean;
}

const Page = ({ children, fullWidthMobile }: PageProps) => (
  <>
    <GlobalStyle />
    <Root fullWidthMobile={fullWidthMobile}>
      <Content>
        {children}
      </Content>
    </Root>
    <RootToast />
  </>
);

const Root = styled.div<{ fullWidthMobile?: boolean }>`
  padding: ${({ fullWidthMobile }) => (fullWidthMobile ? `${theme.spacing.m} 0` : theme.spacing.m)};
  min-height: calc(100vh - 80px);
  min-width: 100vw;
  overflow-x: hidden;
  overflow-y: auto;
  background-color: ${theme.colors.silverLighter};
  box-sizing: border-box;
  
  @media ${devices.tablet} {
    padding: ${theme.spacing.l};
  }
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  z-index: 1;
`;

const GlobalStyle = createGlobalStyle`
  body {
    position: relative;
  }

  body::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('/images/snow-falling.gif');
    background-size: 50vh;
    background-repeat: repeat;
    background-position: center;
    opacity: 0.3; /* Adjust opacity here */
    pointer-events: none; /* Ensures it's not interactive */
    z-index: 0; /* Places it behind other content */
  }
`;

export default Page;
