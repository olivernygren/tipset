import { PlusCircle, MinusCircle } from '@phosphor-icons/react';
import React from 'react';
import { theme } from '../../theme';
import IconButton from '../buttons/IconButton';
import Input from '../input/Input';
import { Section } from '../section/Section';

interface GoalsInputProps {
  team: 'home' | 'away';
  goals: string;
  onIncrease: () => void;
  onDecrease: () => void;
  onInputChange: (value: string) => void;
  hasPredicted?: boolean;
}

const GoalsInput = ({ team, goals, onIncrease, onDecrease, onInputChange, hasPredicted }: GoalsInputProps) => {
  const getIconButtonColors = () => {
    if (hasPredicted) {
      return {
        normal: theme.colors.gold,
        hover: theme.colors.gold,
        active: theme.colors.gold,
        disabled: theme.colors.primaryLighter
      }
    } else {
      return {
        normal: theme.colors.primary,
        hover: theme.colors.primaryDark,
        active: theme.colors.primaryDarker,
        disabled: theme.colors.silver
      }
    }
  };

  return (
    <Section alignItems='center' fitContent gap="xxxs">
      <IconButton 
        icon={<PlusCircle size={24} />}
        onClick={onIncrease}
        colors={getIconButtonColors()}
        disabled={goals === '9'}
      />
      <Input
        value={goals}
        onChange={(e) => onInputChange(e.currentTarget.value)}
        placeholder='0'
        maxWidth='50px'
        textAlign='center'
        fontSize='30px'
        fontWeight='600'
      />
      <IconButton 
        icon={<MinusCircle size={24} />}
        onClick={onDecrease}
        colors={getIconButtonColors()}
        disabled={goals === '0' || goals === ''}
      />
    </Section>
  )
};

export default GoalsInput