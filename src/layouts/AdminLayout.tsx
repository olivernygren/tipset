import React from 'react'
import AdminSidebar from '../components/sidebar/AdminSidebar';
import styled from 'styled-components';
import { theme } from '../theme';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <AdminPageLayout>
      <AdminSidebar />
      <PageContent>
        {children}
      </PageContent>
    </AdminPageLayout>
  )
};

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
  background-color: ${theme.colors.silverLight};
`;

export default AdminLayout;