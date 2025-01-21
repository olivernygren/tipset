import React from 'react';
import styled, { keyframes } from 'styled-components';
import { CSSTransition } from 'react-transition-group';
import { EmphasisTypography, NormalTypography } from '../typography/Typography';
import { theme } from '../../theme';

interface TooltipProps {
  text: string;
  textWeight?: 'emphasis' | 'normal';
  textSize?: 'xs' | 's' | 'm' | 'l';
  backgroundColor?: string;
  textColor?: string;
  endIcon?: React.ReactNode;
  show: boolean;
}

interface StyledTooltipProps {
  backgroundColor?: string;
}

const Tooltip = ({
  text, textWeight = 'emphasis', textSize = 's', backgroundColor = theme.colors.textDefault, textColor = theme.colors.white, endIcon, show,
}: TooltipProps) => (
  <CSSTransition
    in={show}
    timeout={200}
    classNames="fade"
    unmountOnExit
  >
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
      {endIcon}
    </StyledTooltip>
  </CSSTransition>
);

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

const StyledTooltip = styled.div<StyledTooltipProps>`
  display: flex;
  gap: ${theme.spacing.xxxs};
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xxs} ${theme.spacing.xs};
  border-radius: ${theme.borderRadius.m};
  background-color: ${({ backgroundColor }) => backgroundColor};
  position: relative;
  max-width: 500px;
  width: fit-content;
  animation: ${fadeIn} 0.2s ease;

  &.fade-enter {
    animation: ${fadeIn} 0.2s ease forwards;
  }

  &.fade-exit {
    animation: ${fadeOut} 0.2s ease forwards;
  }
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
