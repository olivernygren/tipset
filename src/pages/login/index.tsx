import React from 'react'
import Auth from '../../components/auth/Auth';
import Page from '../../components/Page';

const LoginPage = () => {
  return (
    <Page user={undefined}>
      <Auth />
    </Page>
  )
}

export default LoginPage;