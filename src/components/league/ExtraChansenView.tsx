import React from 'react';
import { theme } from '../../theme';
import { Section } from '../section/Section';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';
import { HeadingsTypography } from '../typography/Typography';
import { PredictionLeague } from '../../utils/League';

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
      <HeadingsTypography variant="h3">Extrachansen</HeadingsTypography>
    </Section>
  );
};

export default ExtraChansenView;
