import { useState, ReactNode } from 'react';

// material-ui
import { Box, Tab, Tabs, Typography } from '@mui/material';

// project import
import MainCard from 'components/MainCard';
import TextTab from './TextTab';
import TableTab from './TableTab';
import GraphTab from './GraphTab';
import WeightTab from './WeightTab';

// assets
import { BarChartOutlined, ControlOutlined, ProfileOutlined, TableOutlined } from '@ant-design/icons';

// ==============================|| TAB PANEL ||============================== //

interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`
  };
}

// ==============================|| TABS - ICON ||============================== //

export default function IconTabs() {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const iconTabCodeString = ``;

  return (
    <MainCard codeString={iconTabCodeString}>
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
            <Tab label="Text" icon={<ProfileOutlined />} iconPosition="start" {...a11yProps(0)} />
            <Tab label="Table" icon={<TableOutlined />} iconPosition="start" {...a11yProps(1)} />
            <Tab label="Graph" icon={<BarChartOutlined />} iconPosition="start" {...a11yProps(2)} />
            <Tab label="Weighting Adjustment" icon={<ControlOutlined />} iconPosition="start" {...a11yProps(3)} />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <Typography variant="h6">
            <TextTab />
          </Typography>
        </TabPanel>
        <TabPanel value={value} index={1}>
          <Typography variant="h6">
            <TableTab />
          </Typography>
        </TabPanel>
        <TabPanel value={value} index={2}>
          <Typography variant="h6">
            <GraphTab />
          </Typography>
        </TabPanel>
        <TabPanel value={value} index={3}>
          <Typography variant="h6">
            <WeightTab />
          </Typography>
        </TabPanel>
      </Box>
    </MainCard>
  );
}
