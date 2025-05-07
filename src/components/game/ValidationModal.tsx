import React from 'react';
import { WarningDiamond } from '@phosphor-icons/react';
import { Section } from '../section/Section';
import { NormalTypography } from '../typography/Typography';
import { theme } from '../../theme';
import Button from '../buttons/Button';
import Modal from '../modal/Modal';
import ActionsModal from '../modal/ActionsModal';
import InfoDialogue from '../info/InfoDialogue';

interface ValidationModalProps {
  onClose: () => void;
  onConfirm: () => void;
  missingFields: Array<string>;
}

const ValidationModal: React.FC<ValidationModalProps> = ({
  onClose,
  onConfirm,
  missingFields,
}) => (
  <ActionsModal
    onCancelClick={onClose}
    onActionClick={onConfirm}
    cancelButtonLabel="Avbryt"
    actionButtonLabel="Spara ändå"
    size="s"
    title="Ofullständigt tips"
    message={`Du har inte fyllt i ${missingFields.length === 1 ? 'detta fält' : 'dessa fält'}. Vill du spara ändå?`}
    mobileBottomSheet
  >
    <Section gap="m" alignItems="center">
      <Section gap="xs">
        {missingFields.map((field) => (
          <NormalTypography key={field} variant="m" color={theme.colors.textDefault}>
            •
            {' '}
            {field}
          </NormalTypography>
        ))}
      </Section>

      <InfoDialogue title="Vill du spara ändå?" icon={<WarningDiamond size={20} color={theme.colors.goldDark} weight="fill" />} />

      {/* <Section flexDirection="row" gap="s" justifyContent="center">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Avbryt
          </Button>

          <Button
            variant="primary"
            onClick={onConfirm}
          >
            Spara ändå
          </Button>
        </Section> */}
    </Section>
  </ActionsModal>
);

export default ValidationModal;
