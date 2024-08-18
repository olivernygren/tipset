import React from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';
import { EmphasisTypography } from '../typography/Typography';

interface SidebarLinkProps {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface StyledSidebarLinkProps {
  active: boolean;
}

const SidebarLink = ({ label, href, icon }: SidebarLinkProps) => {
  const isActive = href === window.location.pathname;

  return (
    <InvisibleLink href={href} active={isActive}>
      <StyledSidebarLink active={isActive}>
        {icon}
        <EmphasisTypography variant="m" color={isActive ? theme.colors.white : theme.colors.textDefault}>{label}</EmphasisTypography>
      </StyledSidebarLink>
    </InvisibleLink>
  );
};

const StyledSidebarLink = styled.div<StyledSidebarLinkProps>`
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0 ${theme.spacing.m};
  height: 48px;
  border-radius: ${theme.borderRadius.m};
  background-color: ${({ active }) => (active ? theme.colors.primary : theme.colors.silverLighter)};
  width: 100%;
  box-sizing: border-box;
`;

const InvisibleLink = styled.a<StyledSidebarLinkProps>`
  text-decoration: none;
  color: inherit;
  cursor: pointer;

  :hover {
    background-color: ${({ active }) => (active ? theme.colors.primary : theme.colors.primaryBleach)};
  }
`;

export default SidebarLink;
