export enum ChipEnum {
  RISK_TAKER = 'Risk Taker',
  DOUBLE_UP = 'Double Up!',
  GOAL_FEST = 'Goal Fest',
  CLEAN_SWEEP = 'Clean Sweep',
}

export enum ChipType {
  GAMEWEEK = 'GAMEWEEK',
  FIXTURE = 'FIXTURE',
}

export interface Chip {
  type: ChipType;
  name: ChipEnum;
}

export interface ActiveChip {
  chip: Chip;
  userId: string;
}
