import React from 'react'
import Sidebar from './Sidebar'
import { NavLink } from '../../utils/Nav';

const AdminSidebar = () => {
  const links: Array<NavLink> = [
    { href: '/admin', label: 'Dashboard', icon: <></> },
    { href: '/admin/users', label: 'Användare', icon: <></> },
    { href: '/admin/leagues', label: 'Ligor', icon: <></> },
  ];

  return (
    <Sidebar 
      links={links}
    />
  )
}

export default AdminSidebar