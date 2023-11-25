// import { Link } from 'react-router-dom';

// material-ui
import { Box, Divider, Grid, Stack, Typography } from '@mui/material';

// project import
// import { APP_DEFAULT_PATH } from 'config';

// assets
import MainPageImg from 'assets/images/header.jpg';
import TwoCone from 'assets/images/maintenance/TwoCone.png';

// ==============================|| ERROR 404 - MAIN ||============================== //

function MainPage() {
  return (
    <>
      <Grid
        container
        spacing={10}
        direction="column"
        alignItems="center"
        justifyContent="center"
        sx={{ minHeight: '100vh', pb: 8, overflow: 'hidden' }}
      >
        <Grid item xs={12}>
          <Stack direction="column">
            <Grid item>
              <Box sx={{ width: '100vw', height: '100vh' }}>
                <img src={MainPageImg} alt="mantis" style={{ width: '100%', height: '100%' }} />
                <Typography
                  variant="h1"
                  sx={{ position: 'absolute', left: '30%', bottom: 90, textTransform: 'uppercase', fontWeight: 'bold', color: 'white' }}
                >
                  Survey Masters
                </Typography>
                <Typography variant="h5" sx={{ position: 'absolute', left: '30%', bottom: 70, color: 'white' }}>
                  Real-Time survey system
                </Typography>
              </Box>
            </Grid>
            <Grid item sx={{ position: 'relative' }}>
              <Box sx={{ position: 'absolute', top: -80, left: 40, width: { xs: 130, sm: 390 }, height: { xs: 115, sm: 330 } }}>
                <img src={TwoCone} alt="mantis" style={{ width: '100%', height: '100%' }} />
              </Box>
            </Grid>
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <Stack spacing={2} justifyContent="center" alignItems="center">
            <Typography variant="h1">Survey System - Thanks</Typography>
            <Typography color="textSecondary" align="center" sx={{ width: { xs: '73%', sm: '61%' } }}></Typography>
            {/* <Button component={Link} to={APP_DEFAULT_PATH} variant="contained">
              Back To Home
            </Button> */}
            <Divider sx={{ width: '100%' }} />
            <Typography variant="h6">&copy; 2023</Typography>
          </Stack>
        </Grid>
      </Grid>
    </>
  );
}

export default MainPage;
