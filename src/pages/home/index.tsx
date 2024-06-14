import React from 'react'
import styled from 'styled-components';
import Page from '../../components/Page';
import { HeadingsTypography } from '../../components/typography/Typography';
import { theme } from '../../theme';

const HomePage = () => {
  return (
    <Page user={undefined}>
      <Wrapper>
        <HeadingsTypography variant="h1">Tipset</HeadingsTypography>
      </Wrapper>
    </Page>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.l};
`;

export default HomePage;