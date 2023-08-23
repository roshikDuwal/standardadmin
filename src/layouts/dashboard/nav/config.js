// component
import SvgColor from '../../../components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />;

const navConfig = [
  {
    title: 'dashboard',
    path: '/dashboard/app',
    icon: icon('ic_analytics'),
  },
  // {
  //   title: 'user',
  //   path: '/dashboard/user',
  //   icon: icon('ic_user'),
  // },
  {
    title: 'Brand',
    path: '/dashboard/brand',
    icon: icon('ic_blog'),
  },{
      title: 'Catgeory',
      path: '/dashboard/category',
      icon: icon('ic_analytics'),
  },
  {
    title: 'product',
    path: '/dashboard/products',
    icon: icon('ic_cart'),
  },
  {
    title: 'Slider',
    path: '/dashboard/sliders',
    icon: <SvgColor src={`/assets/icons/ic_notification_package.svg`} sx={{ width: 1, height: 1 }} />,
  },
  {
    title: 'Messages',
    path: '/dashboard/messages',
    icon: <SvgColor src={`/assets/icons/ic_notification_mail.svg`} sx={{ width: 1, height: 1 }} />,
  },
  // {
  //   title: 'login',
  //   path: '/login',
  //   icon: icon('ic_lock'),
  // },
  // {
  //   title: 'Not found',
  //   path: '/404',
  //   icon: icon('ic_disabled'),
  // },
];

export default navConfig;
