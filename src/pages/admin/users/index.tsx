import React, { useEffect, useState } from 'react';
import {
  collection, deleteDoc, doc, getDocs,
} from 'firebase/firestore';
import styled from 'styled-components';
import { Trash } from '@phosphor-icons/react';
import { User } from '../../../utils/Auth';
import { auth, db } from '../../../config/firebase';
import { withDocumentIdOnObjectsInArray } from '../../../utils/helpers';
import { Section } from '../../../components/section/Section';
import { theme } from '../../../theme';
import { HeadingsTypography, NormalTypography } from '../../../components/typography/Typography';
import IconButton from '../../../components/buttons/IconButton';
import { CollectionEnum } from '../../../utils/Firebase';

const AdminUsersPage = () => {
  const [users, setUsers] = useState<Array<User>>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getDocs(collection(db, CollectionEnum.USERS));
      const users = withDocumentIdOnObjectsInArray<User>(data.docs);
      setUsers(users);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (documentId: string) => {
    if (auth.currentUser?.uid === documentId) {
      console.warn('Cannot delete yourself');
      return;
    }
    const userDoc = doc(db, 'leagues', documentId);
    await deleteDoc(userDoc);
    fetchUsers();
  };

  return (
    <Section padding={theme.spacing.l} gap="l">
      <HeadingsTypography variant="h2">Användare</HeadingsTypography>
      <Table>
        <TableHeader>
          <NormalTypography variant="s" color={theme.colors.textLight}>Namn</NormalTypography>
          <NormalTypography variant="s" color={theme.colors.textLight}>E-post</NormalTypography>
          <NormalTypography variant="s" color={theme.colors.textLight}>Roll</NormalTypography>
        </TableHeader>
        {users.length > 0 && users.map((user) => (
          <TableRow key={user.documentId}>
            <NormalTypography variant="m">
              {user.firstname}
              {' '}
              {user.lastname}
            </NormalTypography>
            <NormalTypography variant="m">{user.email}</NormalTypography>
            <NormalTypography variant="m">{user.role}</NormalTypography>
            <IconButton
              icon={<Trash size={20} weight="fill" />}
              colors={{ normal: theme.colors.red, hover: theme.colors.redDark, active: theme.colors.redDarker }}
              onClick={() => handleDeleteUser(user.documentId)}
            />
          </TableRow>
        ))}
      </Table>
    </Section>
  );
};

const Table = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  background-color: ${theme.colors.white};
  gap: ${theme.spacing.xxs};
  border-radius: ${theme.borderRadius.m};
  padding: ${theme.spacing.xxs};
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 44px;
  padding: ${theme.spacing.xs} 0;
  margin: 0 ${theme.spacing.xs};
  border-bottom: 1px solid ${theme.colors.silverLight};
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 44px;
  padding: 0 ${theme.spacing.xs};
  align-items: center;
  height: 48px;
`;

export default AdminUsersPage;
