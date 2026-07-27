import { INavData } from '@coreui/angular';

export const navItems: INavData[] = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    iconComponent: { name: 'cil-speedometer' },
  },
  {
    title: true,
    name: 'Administration',
  },
  {
    name: 'Users',
    url: '/users',
    iconComponent: { name: 'cil-user' },
  },
  {
    name: 'Support types',
    url: '/support-types',
    iconComponent: { name: 'cil-list' },
  },
  {
    name: 'Transport supports',
    url: '/transport-supports',
    iconComponent: { name: 'cilList' },
  },
];
