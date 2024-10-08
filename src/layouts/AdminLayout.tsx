import React from 'react';
import styled from 'styled-components';
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
    <RootToast />
  </>
);

const AdminPageLayout = styled.div`
  min-height: 100vh;
  overflow: hidden;
  display: grid;
  grid-template-columns: auto 1fr;
  flex-direction: row;
  gap: 0;
`;

const PageContent = styled.div`
  overflow-y: auto;
  background-color: ${theme.colors.silverLighter};
`;

export default AdminLayout;
