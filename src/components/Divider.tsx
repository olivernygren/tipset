import styled from "styled-components";
import { theme } from "../theme";

interface DividerProps {
  color?: string;
}

export const Divider = styled.div<DividerProps>`
  width: 100%;
  height: 1px;
  background-color: ${({ color }) => color || theme.colors.silverLight};
  box-sizing: border-box;
`;