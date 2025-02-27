import React from 'react';
import styled from 'styled-components';
import { Info } from '@phosphor-icons/react';
import { theme } from '../../theme';
import { Section } from '../section/Section';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';
import { HeadingsTypography } from '../typography/Typography';
import { PredictionLeague } from '../../utils/League';
import TextButton from '../buttons/TextButton';

interface ExtraChansenViewProps {
  league: PredictionLeague;
  refetchLeague: () => void;
  isCreator: boolean;
}

const ExtraChansenView = ({ league, refetchLeague, isCreator }: ExtraChansenViewProps) => {
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  return (
    <Section
      backgroundColor={theme.colors.white}
      borderRadius={theme.borderRadius.l}
      padding={isMobile ? `${theme.spacing.m} ${theme.spacing.s}` : theme.spacing.m}
      gap="s"
      expandMobile
    >
      <Header>
        <HeadingsTypography variant="h3">Extrachansen</HeadingsTypography>
        <TextButton
          icon={<Info color={theme.colors.primary} size={24} />}
          noPadding
        >
          Vad är extrachansen?
        </TextButton>
      </Header>
    </Section>
  );
};

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
`;

export default ExtraChansenView;
