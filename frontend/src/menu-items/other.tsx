// third-party
import { FormattedMessage } from 'react-intl';

// assets
import {
  ChromeOutlined,
  QuestionOutlined,
  DeploymentUnitOutlined,
  PlusCircleOutlined,
  BarsOutlined,
  GroupOutlined,
  CalculatorOutlined,
  BarChartOutlined
} from '@ant-design/icons';

// type
import { NavItemType } from 'types/menu';

// icons
const icons = {
  ChromeOutlined,
  QuestionOutlined,
  DeploymentUnitOutlined,
  PlusCircleOutlined,
  BarsOutlined,
  GroupOutlined,
  CalculatorOutlined,
  BarChartOutlined
};

// ==============================|| MENU ITEMS - SUPPORT ||============================== //

const other: NavItemType = {
  id: 'other',
  title: <FormattedMessage id=" " />,
  type: 'group',
  children: [
    {
      id: 'all-surveys',
      title: <FormattedMessage id="all-surveys" />,
      type: 'item',
      url: '/all-surveys',
      icon: icons.BarsOutlined
    },
    {
      id: 'create-new',
      title: <FormattedMessage id="create-new" />,
      type: 'item',
      url: '/create-new',
      icon: icons.PlusCircleOutlined
    },
    {
      id: 'all-groupsets',
      title: <FormattedMessage id="all-groupsets" />,
      type: 'item',
      url: '/all-groupsets',
      icon: icons.GroupOutlined
    },
    {
      id: 'analytics',
      title: <FormattedMessage id="analytics" />,
      type: 'item',
      url: '/analytics',
      icon: icons.CalculatorOutlined
    },
    {
      id: 'results',
      title: <FormattedMessage id="results" />,
      type: 'item',
      url: '/results',
      icon: icons.BarChartOutlined
    },
    // {
    //   id: 'sample-page',
    //   title: <FormattedMessage id="sample-page" />,
    //   type: 'item',
    //   url: '/sample-page',
    //   icon: icons.ChromeOutlined
    // },
    {
      id: 'help',
      title: <FormattedMessage id="Help" />,
      type: 'item',
      url: '/help',
      icon: icons.QuestionOutlined
      // external: true,
      // target: true,
      // chip: {
      //   label: 'gitbook',
      //   color: 'secondary',
      //   size: 'small'
      // }
    }
    // {
    //   id: 'roadmap',
    //   title: <FormattedMessage id="roadmap" />,
    //   type: 'item',
    //   url: 'https://codedthemes.gitbook.io/mantis/roadmap',
    //   icon: icons.DeploymentUnitOutlined,
    //   external: true,
    //   target: true
    // }
  ]
};

export default other;
