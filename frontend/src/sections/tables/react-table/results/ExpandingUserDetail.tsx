// material-ui
import { alpha, useTheme } from '@mui/material/styles';
import { Grid, List, ListItem, Stack, TableCell, TableRow, Typography } from '@mui/material';

// third-party
// import { PatternFormat } from 'react-number-format';

// project import

import MainCard from 'components/MainCard';

// ==============================|| EXPANDING TABLE - USER DETAILS ||============================== //

const ExpandingUserDetail = ({ data }: any) => {
  const theme = useTheme();

  const backColor = alpha(theme.palette.primary.lighter, 0.1);
  const mainCardColor = alpha(theme.palette.primary.lighter, 0.5);

  return (
    <TableRow sx={{ bgcolor: backColor, '&:hover': { bgcolor: `${backColor} !important` } }}>
      <TableCell colSpan={8} sx={{ p: 2.5 }}>
        <Grid container spacing={2.5} sx={{ pl: { xs: 0, sm: 5, md: 6, lg: 10, xl: 12 } }}>
          <Grid item xs={12} sm={7} md={8} xl={8}>
            <Stack spacing={2.5}>
              <MainCard
                title="Survey Result details"
                sx={{ bgcolor: mainCardColor, '&:hover': { bgcolor: `${mainCardColor} !important` } }}
              >
                <List sx={{ py: 0 }}>
                  {Object.keys(data).map((item, index) => (
                    <ListItem>
                      <Stack spacing={0.5}>
                        <Typography color="secondary">
                          {index + 1}. {item}
                        </Typography>
                        <Typography>{data[item]}</Typography>
                      </Stack>
                    </ListItem>
                  ))}
                  {/* <ListItem divider={!matchDownMD}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Stack spacing={0.5}>
                          <Typography color="secondary">Full Name</Typography>
                          <Typography>
                            {data.firstName} {data.lastName}
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Stack spacing={0.5}>
                          <Typography color="secondary">Father Name</Typography>
                          <Typography>Mr. {data.fatherName}</Typography>
                        </Stack>
                      </Grid>
                    </Grid>
                  </ListItem> */}

                  {/* <ListItem>
                    <Stack spacing={0.5}>
                      <Typography color="secondary">Gender</Typography>
                      <Typography>{data.Gender}</Typography>
                    </Stack>
                  </ListItem> */}
                </List>
              </MainCard>
            </Stack>
          </Grid>
        </Grid>
      </TableCell>
    </TableRow>
  );
};

export default ExpandingUserDetail;
