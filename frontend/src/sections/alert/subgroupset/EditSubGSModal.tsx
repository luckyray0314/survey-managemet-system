import { useEffect, useState } from 'react';

import { Grid, Stack, Button, Typography, InputLabel, TextField } from '@mui/material';

import { SaveOutlined } from '@ant-design/icons';

// import AlertCustomerDelete from './AlertCustomerDelete';
import MainCard from 'components/MainCard';

// Reducer import
import { dispatch, useSelector } from 'store';
import { updateGroupSet, getGroupSet } from 'store/reducers/groupset';

// const Server_URL = 'http://localhost:3006/';
// const Server_URL = 'http://212.192.31.92:3306/';

export interface Props {
  customer: any;
  oldSize: number;
  onCancel: () => void;
}

const EditSubGSModal = ({ customer, oldSize, onCancel }: Props) => {
  // GroupSet Props
  const [nsize, setNSize] = useState(oldSize);
  const { groupSet } = useSelector((state) => state.groupset);
  // console.log("DDDDDDDDDDDDDDDDDDDD", nsize, oldSize);
  useEffect(() => {
    setNSize(oldSize);
  }, []);

  const clickCreateGroupSetButton = async () => {
    let id = '';
    if (groupSet?._id) {
      id = groupSet?._id;
    }
    await dispatch(updateGroupSet({ id: id, name: customer, size: nsize }));
    await dispatch(getGroupSet(id));
    onCancel();
    // await dispatch(getGroupSet(id));
    // navigate('/home');
  };

  return (
    <>
      <Grid container rowSpacing={4.5} columnSpacing={3}>
        <Grid item xs={12} md={12} lg={12}>
          <MainCard title={'Edit ' + customer}>
            <Typography variant="body2">
              <>
                <Grid item xs={12} sm={12}>
                  <Stack spacing={0.5}>
                    <InputLabel>Enter Size of Participants (%)</InputLabel>
                    <TextField
                      required
                      id="bodyurl"
                      name="bodyurl"
                      placeholder="0"
                      fullWidth
                      autoComplete={''}
                      value={nsize}
                      onChange={(e) => setNSize(Number(e.target.value))}
                    />
                  </Stack>
                </Grid>
                <br></br>
                <Grid item spacing={5}>
                  <Stack direction="row" justifyContent="flex-start">
                    <Button variant="contained" onClick={clickCreateGroupSetButton} startIcon={<SaveOutlined />}>
                      Save
                    </Button>
                  </Stack>
                </Grid>
              </>
            </Typography>
          </MainCard>
        </Grid>
      </Grid>

      {/* {!isCreating && <AlertCustomerDelete title={customer.fatherName} open={openAlert} handleClose={handleAlertClose} />} */}
    </>
  );
};

export default EditSubGSModal;
