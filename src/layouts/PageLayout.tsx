import React from 'react';
import styled from 'styled-components';

interface PageLayoutProps {
  children: React.ReactNode;
}

const PageLayout = ({ children }: PageLayoutProps) => (
  <Layout>
    {children}
  </Layout>
);

const Layout = styled.div`
  display: grid;
  grid-template-rows: 80px 1fr;
  min-height: 100vh;
  gap: 0;
`;

export default PageLayout;
