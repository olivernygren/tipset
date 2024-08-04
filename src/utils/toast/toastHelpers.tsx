import toast from "react-hot-toast";
import ErrorToast from "../../components/toast/ErrorToast";
import SuccessToast from "../../components/toast/SuccessToast";

export const successNotify = (toastText : string | React.ReactElement) => {
  toast(
    <SuccessToast toastText={toastText} />, {
      style: {
        border: '1px solid #D9E3E9',
        boxShadow: '0px 3px 0px rgba(0, 0, 0, 0.06)',
        boxSizing: 'border-box',
        padding: '0',
        maxWidth: 'unset',
      },
    },
  );
};

export const errorNotify = (toastText : string | React.ReactElement) => {
  toast(
    (t) => (
      <ErrorToast toastText={toastText} currentToastId={t.id} />), {
      style: {
        border: '1px solid #D9E3E9',
        boxShadow: '0px 3px 0px rgba(0, 0, 0, 0.06)',
        boxSizing: 'border-box',
        padding: '0',
        maxWidth: 'unset',
      },
    },
  );
};