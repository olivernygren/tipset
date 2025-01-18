import React from 'react';
import styled from 'styled-components';
import { NavLink } from '../../utils/Nav';
import SidebarLink from './SidebarLink';
import { theme } from '../../theme';

interface SidebarProps {
  links: Array<NavLink>
}

const Sidebar = ({ links }: SidebarProps) => (
  <StyledSidebar>
    <LinksContainer>
      {links.map((link, index) => (
        <SidebarLink key={index} href={link.href} label={link.label} icon={link.icon} />
      ))}
    </LinksContainer>
  </StyledSidebar>
);

const StyledSidebar = styled.div`
  height: calc(100vh - 80px);
  width: 250px;
  border-right: 1px solid ${theme.colors.silverLight};
  position: relative;
  background-color: ${theme.colors.white};
`;

const LinksContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.s};
  /* position: fixed;
  left: 0;
  top: 0px; */
`;

export default Sidebar;
