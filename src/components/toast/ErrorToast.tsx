import { WarningCircle } from '@phosphor-icons/react';
import { theme } from '../../theme';
import { ToastContent, ToastText, ToastWrapper } from './SuccessToast';

// import Button, { ButtonVariantType } from '../button/Button';

export interface ErrorToastProps {
  toastText: string | React.ReactElement
  currentToastId?: any
}

const ErrorToast = ({ toastText }: ErrorToastProps) => (
  <ToastWrapper className="error-toast">
    <ToastContent>
      <WarningCircle color={theme.colors.red} size={24} weight='fill' />
      <ToastText variant="s">{toastText}</ToastText>
    </ToastContent>
  </ToastWrapper>
);

export default ErrorToast;