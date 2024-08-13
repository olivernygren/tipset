import React from 'react';
import styled from 'styled-components';
import { Toaster } from 'react-hot-toast';
import { devices } from '../../theme';

const RootToast = () => (
  <>
    <MobileToaster>
      <Toaster
        position="bottom-center"
        gutter={0}
        toastOptions={{
          className: '',
          duration: 5000,
          style: {
            marginLeft: '8px', // 8px added to the 16px that is auto for the toaster lib = margin 24px
            marginRight: '8px',
          },
        }}
      />
    </MobileToaster>
    <DesktopToast>
      <Toaster
        position="top-center"
        gutter={0}
        toastOptions={{
          className: '',
          duration: 5000,
        }}
      />
    </DesktopToast>
  </>
);

const DesktopToast = styled.div`
  visibility: hidden;

  @media ${devices.tablet} {
    visibility: visible;
  }
`;

const MobileToaster = styled.div`
  visibility: visible;

  @media ${devices.tablet} {
    visibility: hidden;
  }
`;

export default RootToast;
