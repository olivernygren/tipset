/* eslint-disable react/jsx-no-useless-fragment */
import React from 'react';
import Sidebar from './Sidebar';
import { NavLink } from '../../utils/Nav';
import { RoutesEnum } from '../../utils/Routes';

const AdminSidebar = () => {
  const links: Array<NavLink> = [
    { href: `/${RoutesEnum.ADMIN}`, label: 'Dashboard', icon: <></> },
    { href: `/${RoutesEnum.ADMIN_USERS}`, label: 'Användare', icon: <></> },
    { href: `/${RoutesEnum.ADMIN_LEAGUES}`, label: 'Ligor', icon: <></> },
    { href: `/${RoutesEnum.PLAYER_RATINGS}`, label: 'Spelarbetyg', icon: <></> },
  ];

  return (
    <Sidebar
      links={links}
    />
  );
};

export default AdminSidebar;
