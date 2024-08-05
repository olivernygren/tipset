import styled, { css } from "styled-components";
import { theme } from "../theme";

interface DividerProps {
  color?: string;
  vertical?: boolean;
}

export const Divider = styled.div<DividerProps>`
  ${({ vertical }) => vertical ? css`
    width: 1px;
    height: 100%;
    min-height: 8px;
  ` : css`
    width: 100%;
    height: 1px;
  `}
  background-color: ${({ color }) => color || theme.colors.silverLight};
  box-sizing: border-box;
`;