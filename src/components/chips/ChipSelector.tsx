import React from 'react';
import styled, { css } from 'styled-components';
import {
  Broom, CaretCircleDoubleUp, CaretRight, Confetti, FalloutShelter, PokerChip,
} from '@phosphor-icons/react';
import { theme } from '../../theme';
import { EmphasisTypography, HeadingsTypography, NormalTypography } from '../typography/Typography';
import { ActiveChip, ChipEnum } from '../../utils/Chips';
import { Section } from '../section/Section';
import TextButton from '../buttons/TextButton';
import { LeagueUsersChipCount } from '../../utils/League';

interface ChipSelectorProps {
  activeChip?: ActiveChip;
  allUsedChips?: Array<ActiveChip>;
  userChipCounts?: LeagueUsersChipCount;
  isLeagueCreator?: boolean;
  leagueId: string;
  refetchLeague: () => void;
}

const ChipSelector = ({
  activeChip, allUsedChips, isLeagueCreator, userChipCounts, leagueId, refetchLeague,
}: ChipSelectorProps) => {
  const getChipIcon = (chip: ChipEnum) => {
    switch (chip) {
      case ChipEnum.RISK_TAKER:
        return <FalloutShelter size={40} weight="fill" color={theme.colors.primary} />;
      case ChipEnum.DOUBLE_UP:
        return <CaretCircleDoubleUp size={40} weight="fill" color={theme.colors.primary} />;
      case ChipEnum.GOAL_FEST:
        return <Confetti size={40} weight="fill" color={theme.colors.primary} />;
      case ChipEnum.CLEAN_SWEEP:
        return <Broom size={40} weight="fill" color={theme.colors.primary} />;
      default:
        return (
          <PokerChip
            size={24}
            weight="fill"
            color={theme.colors.primary}
          />
        );
    }
  };

  return (
    <Container>
      <TextContainer>
        <Section flexDirection="row" alignItems="center" gap="xxs" fitContent>
          <HeadingsTypography variant="h5">
            Chip
          </HeadingsTypography>
          {/* <Lightning size={20} weight="fill" color={theme.colors.primary} /> */}
        </Section>
        <NormalTypography variant="m" color={theme.colors.silverDark}>
          Välj ett chip för att öka dina chanser till poäng.
        </NormalTypography>
        <TextButton
          noPadding
          endIcon={<CaretRight size={16} color={theme.colors.primary} weight="bold" />}
        >
          Läs mer
        </TextButton>
      </TextContainer>
      <ChipCardsContainer>
        {Object.values(ChipEnum).map((chip) => (
          <ChipCard key={chip}>
            <ChipCardIcon className="chip-icon">
              {getChipIcon(chip)}
            </ChipCardIcon>
            <ChipCardText>
              <EmphasisTypography variant="s">
                {chip}
              </EmphasisTypography>
              <NormalTypography variant="xs" color={theme.colors.primaryDarker}>
                1 kvar
              </NormalTypography>
            </ChipCardText>
          </ChipCard>
        ))}
      </ChipCardsContainer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  width: 100%;
  border-radius: ${theme.borderRadius.m};
  background-color: ${theme.colors.silverBleach};
  padding: ${theme.spacing.s};
  border: 1px solid ${theme.colors.silverLighter};
  justify-content: space-between;
  box-sizing: border-box;
  gap: ${theme.spacing.xxs};
  align-items: center;
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

const ChipCardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${theme.spacing.s};
`;

const ChipCard = styled.div<{ disabled?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xxxs};
  padding: ${theme.spacing.xs};
  border-radius: ${theme.borderRadius.m};
  background-color: ${theme.colors.white};
  border: 1px solid ${theme.colors.silverLighter};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};

  ${({ disabled }) => !disabled && css`
    transition: all 0.2s ease-in-out;
    
    &:hover {
      transform: translateY(-5px);
      background-color: ${theme.colors.primary};

      ${NormalTypography}, ${EmphasisTypography} {
        color: ${theme.colors.white};
      }

      .chip-icon {
        svg {
          path {
            fill: ${theme.colors.gold};
          }
        }
      }
    }
  `}
`;

const ChipCardText = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
`;

const ChipCardIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default ChipSelector;
