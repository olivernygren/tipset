import React from 'react';
import styled from 'styled-components';
import { EmphasisTypography, NormalTypography } from '../typography/Typography';
import { theme } from '../../theme';

interface TooltipProps {
  text: string;
  textWeight?: 'emphasis' | 'normal';
  textSize?: 'xs' | 's' | 'm' | 'l';
  backgroundColor?: string;
  textColor?: string;
}

interface StyledTooltipProps {
  backgroundColor?: string;
}

const Tooltip = ({
  text, textWeight = 'emphasis', textSize = 's', backgroundColor = theme.colors.textDefault, textColor = theme.colors.white,
}: TooltipProps) => (
  <StyledTooltip backgroundColor={backgroundColor}>
    <TooltipPoint backgroundColor={backgroundColor} />
    {textWeight === 'emphasis' ? (
      <EmphasisTypography variant={textSize} color={textColor} align="center" noWrap>
        {text}
      </EmphasisTypography>
    ) : (
      <NormalTypography variant={textSize} color={textColor} align="center" noWrap>
        {text}
      </NormalTypography>
    )}
  </StyledTooltip>
);

const StyledTooltip = styled.div<StyledTooltipProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xxs} ${theme.spacing.xs};
  border-radius: ${theme.borderRadius.m};
  background-color: ${({ backgroundColor }) => backgroundColor};
  position: relative;
  max-width: 250px;
  width: fit-content;
`;

const TooltipPoint = styled.div<StyledTooltipProps>`
  position: absolute;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid ${({ backgroundColor }) => backgroundColor};
  top: -8px; /* Adjust based on your tooltip position */
  left: 50%;
  transform: translateX(-50%);
`;

export default Tooltip;
