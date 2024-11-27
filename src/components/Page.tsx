import React from 'react';
import styled from 'styled-components';
import { devices, theme } from '../theme';
import RootToast from './toast/RootToast';

interface PageProps {
  children: React.ReactNode;
  fullWidthMobile?: boolean;
}

const Page = ({ children, fullWidthMobile }: PageProps) => (
  <>
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

  /* &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('/images/snow-falling.gif');
    background-size: contain;
    background-repeat: repeat;
    background-position: center;
    opacity: 0.2;
    z-index: 0;
  } */
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  z-index: 1;
`;

export default Page;
