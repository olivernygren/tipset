import { PlusCircle, MinusCircle } from '@phosphor-icons/react';
import React from 'react';
import { theme } from '../../theme';
import IconButton from '../buttons/IconButton';
import Input from '../input/Input';
import { Section } from '../section/Section';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';

interface GoalsInputProps {
  goals: string;
  onIncrease?: () => void;
  onDecrease?: () => void;
  onInputChange: (value: string) => void;
  hasPredicted?: boolean;
  disabled?: boolean;
}

const GoalsInput = ({
  goals, onIncrease, onDecrease, onInputChange, hasPredicted, disabled,
}: GoalsInputProps) => {
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const getIconButtonColors = () => {
    if (hasPredicted) {
      return {
        normal: theme.colors.gold,
        hover: theme.colors.gold,
        active: theme.colors.gold,
        disabled: theme.colors.primaryLighter,
      };
    }
    return {
      normal: theme.colors.primary,
      hover: theme.colors.primaryDark,
      active: theme.colors.primaryDarker,
      disabled: theme.colors.silver,
    };
  };

  return (
    <Section alignItems="center" fitContent gap="xxxs">
      {onIncrease && (
        <IconButton
          icon={<PlusCircle size={24} />}
          onClick={onIncrease}
          colors={getIconButtonColors()}
          disabled={goals === '9' || disabled}
        />
      )}
      <Input
        value={goals}
        onChange={(e) => onInputChange(e.currentTarget.value)}
        placeholder="0"
        maxWidth={isMobile ? '44px' : '50px'}
        textAlign="center"
        fontSize={isMobile ? '26px' : '30px'}
        fontWeight="700"
        disabled={disabled}
        customPadding={theme.spacing.xxxs}
      />
      {onDecrease && (
        <IconButton
          icon={<MinusCircle size={24} />}
          onClick={onDecrease}
          colors={getIconButtonColors()}
          disabled={goals === '0' || goals === '' || disabled}
        />
      )}
    </Section>
  );
};

export default GoalsInput;
