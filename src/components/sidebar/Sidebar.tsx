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
  min-height: 100vh;
  width: 250px;
  border-right: 1px solid ${theme.colors.silverLight};
`;

const LinksContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.s};
`;

export default Sidebar;
