// import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useState } from 'react';

import { useNavigate } from 'react-router';

// material-ui
import { PlusCircleOutlined } from '@ant-design/icons';
import { Button, FormControl, Grid, InputLabel, MenuItem, Select, SelectChangeEvent, Stack, TextField, Typography } from '@mui/material';

// project import
import MainCard from 'components/MainCard';

// Reducer import
import { dispatch } from 'store';
import { createSurvey } from 'store/reducers/survey';
import { createGroupSet } from 'store/reducers/groupset';

// ==============================|| CREATE NEW ||============================== //

const CreateNew = () => {
  const navigate = useNavigate();
  // const surveys = useReduxSelector(state => state.surveys.surveys);
  // const dispatch = useReduxDispatch();

  // const survey = useSelector((state) => state.survey);

  // Survey Props
  const [title, setTitle] = useState('');
  const [intro, setIntro] = useState('');
  const [lang, setLang] = useState('');

  // GroupSet Props
  const [name, setName] = useState('');
  const [participants, setParticipants] = useState<number>(150000);

  const handleChangeLang = (event: SelectChangeEvent) => {
    setLang(event.target.value as string);
  };

  const clickCreateSurveyButton = async () => {
    await dispatch(createSurvey({ title: title, intro: intro, lang: lang }));
    // navigate('/edit');
    // console.log("DDD");
  };

  const clickCreateGroupSetButton = async () => {
    await dispatch(createGroupSet({ name: name, participants: participants }));
    navigate('/all-groupsets');
    // console.log("DDD");
  };

  return (
    <>
      <Grid container rowSpacing={4.5} columnSpacing={3}>
        <Grid item xs={12} md={6} lg={6}>
          <MainCard title="Create New Survey">
            <Typography variant="body2">
              <>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={12}>
                    <Stack spacing={0.5}>
                      <InputLabel>Enter Survey Title</InputLabel>
                      <TextField
                        required
                        id="bodyurl"
                        name="bodyurl"
                        placeholder="Enter Survey Title"
                        fullWidth
                        autoComplete={''}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </Stack>
                  </Grid>

                  <Grid item xs={12} sm={12}>
                    <TextField fullWidth multiline rows={4} placeholder="Intro" value={intro} onChange={(e) => setIntro(e.target.value)} />
                  </Grid>

                  <Grid item xs={12} sm={12}>
                    <Stack spacing={0.5}>
                      <InputLabel>Select Language</InputLabel>
                      <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">Select Language</InputLabel>
                        <Select
                          labelId="demo-simple-select-label"
                          id="demo-simple-select"
                          value={lang}
                          placeholder="Age"
                          onChange={handleChangeLang}
                        >
                          <MenuItem value={'en'}>English</MenuItem>
                          <MenuItem value={'ar'}>Arabic</MenuItem>
                          <MenuItem value={'hb'}>Hebrew</MenuItem>
                        </Select>
                      </FormControl>
                    </Stack>
                  </Grid>
                </Grid>
                <br></br>
                <Grid item spacing={5}>
                  <Stack direction="row" justifyContent="flex-start">
                    <Button variant="contained" onClick={clickCreateSurveyButton} startIcon={<PlusCircleOutlined />}>
                      Create New Survey
                    </Button>
                  </Stack>
                </Grid>
              </>
            </Typography>
          </MainCard>
        </Grid>
        <Grid item xs={12} md={6} lg={6}>
          <MainCard title="Create New GroupSet">
            <Typography variant="body2">
              <>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={12}>
                    <Stack spacing={0.5}>
                      <InputLabel>Enter GroupSet Name</InputLabel>
                      <TextField
                        required
                        id="bodyurl"
                        name="bodyurl"
                        placeholder="Enter GroupSet Name"
                        fullWidth
                        autoComplete={''}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </Stack>
                  </Grid>

                  <Grid item xs={12} sm={12}>
                    <Stack spacing={0.5}>
                      <InputLabel>Enter Participants</InputLabel>
                      <TextField
                        required
                        id="bodyurl"
                        name="bodyurl"
                        placeholder="150000"
                        fullWidth
                        autoComplete={''}
                        value={participants}
                        onChange={(e) => setParticipants(Number(e.target.value))}
                      />
                    </Stack>
                  </Grid>
                </Grid>
                <br></br>
                <Grid item spacing={5}>
                  <Stack direction="row" justifyContent="flex-start">
                    <Button variant="contained" onClick={clickCreateGroupSetButton} startIcon={<PlusCircleOutlined />}>
                      Create New GroupSet
                    </Button>
                  </Stack>
                </Grid>
              </>
            </Typography>
          </MainCard>
        </Grid>
      </Grid>
    </>
  );
};

export default CreateNew;
