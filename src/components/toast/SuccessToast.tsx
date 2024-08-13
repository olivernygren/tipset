import React from 'react';
import styled from 'styled-components';
import { CheckCircle } from '@phosphor-icons/react';
import { NormalTypography } from '../typography/Typography';
import { theme } from '../../theme';

export interface SuccessToastProps {
  toastText: string | React.ReactElement
}

const SuccessToast = ({ toastText }: SuccessToastProps) => (
  <ToastWrapper className="success-toast">
    <ToastContent>
      <CheckCircle size={24} color={theme.colors.green} weight="fill" />
      <ToastText variant="s">{toastText}</ToastText>
    </ToastContent>
  </ToastWrapper>
);

export const ToastContent = styled.div`
  display:flex;
  padding: ${theme.spacing.xxs} 0;
  align-items: center; 
  margin: 0 6px;
`;

export const ToastText = styled(NormalTypography)`
  margin-left: 10px;
`;

export const ToastWrapper = styled.div`
  display:flex;
  align-items: center;
`;

export default SuccessToast;
