// material-ui
import { Typography } from '@mui/material';

// project import
import MainCard from 'components/MainCard';

// ==============================|| SAMPLE PAGE ||============================== //

const Help = () => (
  <MainCard title="Help">
    <Typography variant="body2">
      This site is developed to create, edit, run and analyze the survey.
      <br />
    </Typography>
  </MainCard>
);

export default Help;
