import { useEffect, useState } from 'react';

import { Grid, Stack, Button, InputLabel, TextField } from '@mui/material';

import { CopyOutlined } from '@ant-design/icons';

import AlertCustomerDelete from './AlertSurveyDelete';
import MainCard from 'components/MainCard';

// Reducer import
import { dispatch } from 'store';
import { updateCustom } from 'store/reducers/survey';

const Frontend_URL = (process.env.REACT_APP_API_URL as string).slice(0, -5);
// const Frontend_URL = arr[0];
const Server_URL = Frontend_URL + '/run-survey/';
// const Server_URL = 'http://212.192.31.92:3306/run-survey/';

export interface Props {
  customer?: any;
  onCancel: () => void;
}

const ShareURLModal = ({ customer, onCancel }: Props) => {
  const isCreating = !customer;
  console.log('ccc', customer);
  const id = customer;

  const [openAlert, setOpenAlert] = useState(false);

  const handleAlertClose = () => {
    setOpenAlert(!openAlert);
    onCancel();
  };

  // const { id } = useParams();

  const [customID, setCustomID] = useState('');
  const [fullurl, setFullURL] = useState('');

  useEffect(() => {
    setFullURL(Server_URL + id + '/' + customID);
  }, [customID]);

  function copyToClipboard(text: string) {
    dispatch(updateCustom({ id: id, custom: customID }));

    navigator.clipboard
      .writeText(text)
      .then(() => {
        console.log('Text copied to clipboard');
        alert('Full URL copied to clipboard');
      })
      .catch((error) => {
        console.error('Error copying text: ', error);
      });

    onCancel();
  }

  return (
    <>
      <MainCard title="Share your survey URL">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            <Stack spacing={0.5}>
              <InputLabel>Body URL</InputLabel>
              <TextField
                required
                id="bodyurl"
                name="bodyurl"
                placeholder="Enter Body URL"
                fullWidth
                InputProps={{
                  readOnly: true
                }}
                autoComplete={id + '/'}
                value={Server_URL + id + '/'}
              />
            </Stack>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Stack spacing={0.5}>
              <InputLabel>Enter CustomID</InputLabel>
              <TextField
                required
                id="customID"
                name="customID"
                placeholder="123456"
                fullWidth
                autoComplete=""
                value={customID}
                onChange={(e) => setCustomID(e.target.value)}
              />
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <Stack spacing={0.5}>
              <InputLabel>Preview Full URL</InputLabel>
              <TextField
                required
                id="fullurl"
                name="fullurl"
                placeholder="Enter Full URL"
                fullWidth
                InputProps={{
                  readOnly: true
                }}
                value={fullurl}
                onChange={(e) => setFullURL(e.target.value)}
              />
            </Stack>
          </Grid>

          <Grid item spacing={5}>
            <Stack direction="row" justifyContent="flex-end">
              <Button variant="contained" onClick={() => copyToClipboard(fullurl)} startIcon={<CopyOutlined />}>
                Copy URL
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </MainCard>
      {!isCreating && <AlertCustomerDelete title={customer.fatherName} open={openAlert} handleClose={handleAlertClose} />}
    </>
  );
};

export default ShareURLModal;
