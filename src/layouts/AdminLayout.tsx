import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import AdminSidebar from '../components/sidebar/AdminSidebar';
import { theme } from '../theme';
import RootToast from '../components/toast/RootToast';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => (
  <>
    <AdminPageLayout>
      <AdminSidebar />
      <PageContent>
        {children}
      </PageContent>
    </AdminPageLayout>
    <GlobalStyle />
    <RootToast />
  </>
);

const AdminPageLayout = styled.div`
  min-height: calc(100vh - 80px);
  overflow: hidden;
  display: grid;
  grid-template-columns: auto 1fr;
  flex-direction: row;
  gap: 0;
`;

const PageContent = styled.div`
  overflow-y: auto;
  background-color: ${theme.colors.silverLighter};
  max-height: calc(100dvh - 80px);
`;

const GlobalStyle = createGlobalStyle`
  div#root {
    max-height: calc(100dvh - 80px);
  }

  body {
    overflow: hidden;
  }
`;

export default AdminLayout;
