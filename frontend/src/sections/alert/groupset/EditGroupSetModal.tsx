import { useState, useEffect } from 'react';

import { Grid, Stack, Button, InputLabel, TextField, Typography } from '@mui/material';

import { EditOutlined, PlusCircleOutlined } from '@ant-design/icons';

// import AlertCustomerDelete from './AlertCustomerDelete';
import MainCard from 'components/MainCard';
import SubGroupSetTable from 'sections/tables/react-table/SubGroupSetTable';

// Reducer import
import { dispatch, useSelector } from 'store';
import { getGroupSet, addAnswer, changeParticipants } from 'store/reducers/groupset';

// const Server_URL = 'http://localhost:3006/';
// const Server_URL = 'http://212.192.31.92:3306/';

export interface Props {
  customer: any;
  onCancel: () => void;
}

const EditGroupSetModal = ({ customer, onCancel }: Props) => {
  // const isCreating = !customer;
  // console.log('ccc', customer);
  // const id = customer;
  const { groupSet } = useSelector((state) => state.groupset);
  const [stable, setSTable] = useState<any>();
  const [id, setID] = useState('');

  // GroupSet Props
  const [participants, setParticipants] = useState<number>(150000);
  const [name, setName] = useState('');
  const [size, setSize] = useState<number>(0);

  useEffect(() => {
    const getTable = async () => {
      if (customer) {
        setID(customer);
        console.log('addCustomer ', customer);
        await dispatch(getGroupSet(customer));
      }
    };
    getTable();
  }, [customer]);

  useEffect(() => {
    if (groupSet?.answers) {
      let k = JSON.parse(JSON.stringify(groupSet?.answers)).length;
      if (k !== 0) setSTable(groupSet.answers);
      // console.log('groupSet', groupSet);
    }
  }, [groupSet]);

  // const [openAlert, setOpenAlert] = useState(false);

  // const handleAlertClose = () => {
  //   setOpenAlert(!openAlert);
  //   onCancel();
  // };

  //  console.log("DDD____________________", stable);

  const clickCreateGroupSetButton = async () => {
    await dispatch(addAnswer({ id: id, name: name, size: size }));
    await dispatch(getGroupSet(id));
    // await dispatch(getGroupSets());
    // onCancel();
    // navigate('/home');
    // console.log("DDD");
  };
  const clickChangeButton = async () => {
    await dispatch(changeParticipants({ id: id, participants: participants }));
    // await dispatch(getGroupSet(id));
    // await dispatch(getGroupSets());
    // onCancel();
    // navigate('/home');
    // console.log("DDD");
  };

  return (
    <>
      <MainCard title="Edit Group Set">
        <MainCard title="Change the participants of GroupSet." xs={12} md={7} lg={7}>
          <Typography variant="body2">
            <>
              <Stack spacing={0.5}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={7} lg={7}>
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
                  </Grid>
                  <Grid item xs={12} md={5} lg={5}>
                    <Button variant="contained" onClick={clickChangeButton} startIcon={<EditOutlined />}>
                      Change
                    </Button>
                  </Grid>
                </Grid>
              </Stack>
            </>
          </Typography>
        </MainCard>
        <br></br>
        <Grid container rowSpacing={4.5} columnSpacing={3}>
          <Grid item xs={12} md={4} lg={4}>
            <MainCard title="Create New Sub group">
              <Typography variant="body2">
                <>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={12}>
                      <Stack spacing={0.5}>
                        <InputLabel>Enter Name</InputLabel>
                        <TextField
                          required
                          id="bodyurl"
                          name="bodyurl"
                          placeholder="Male"
                          fullWidth
                          autoComplete={''}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </Stack>
                    </Grid>

                    <Grid item xs={12} sm={12}>
                      <Stack spacing={0.5}>
                        <InputLabel>Enter Size of Participants (%)</InputLabel>
                        <TextField
                          required
                          id="bodyurl"
                          name="bodyurl"
                          placeholder="30"
                          fullWidth
                          autoComplete={''}
                          value={size}
                          onChange={(e) => setSize(Number(e.target.value))}
                        />
                      </Stack>
                    </Grid>
                  </Grid>
                  <br></br>
                  <Grid item spacing={5}>
                    <Stack direction="row" justifyContent="flex-start">
                      <Button variant="contained" onClick={clickCreateGroupSetButton} startIcon={<PlusCircleOutlined />}>
                        Create New Sub Group
                      </Button>
                    </Stack>
                  </Grid>
                </>
              </Typography>
            </MainCard>
          </Grid>
          <Grid item xs={12} md={8} lg={8}>
            <MainCard title="Sub Groups of Group Set (Total size must be 100 %.)">
              <Typography variant="body2">
                <>{stable && <SubGroupSetTable title="All GroupSets" data={stable} />}</>
              </Typography>
            </MainCard>
          </Grid>
        </Grid>
      </MainCard>
      {/* {!isCreating && <AlertCustomerDelete title={customer.fatherName} open={openAlert} handleClose={handleAlertClose} />} */}
    </>
  );
};

export default EditGroupSetModal;
