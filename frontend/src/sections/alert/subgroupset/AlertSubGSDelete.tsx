// material-ui
import { Button, Dialog, DialogContent, Stack, Typography } from '@mui/material';

// project import
import Avatar from 'components/@extended/Avatar';
import { PopupTransition } from 'components/@extended/Transitions';

// Reducer import
import { dispatch, useSelector } from 'store';
import { deleteAnswer, getGroupSet } from 'store/reducers/groupset';

// assets
import { DeleteFilled } from '@ant-design/icons';

// types
interface Props {
  title: string;
  open: boolean;
  handleClose: (status: boolean) => void;
}

// ==============================|| CUSTOMER - DELETE ||============================== //

export default function AlertSubGSDelete({ title, open, handleClose }: Props) {
  const { groupSet } = useSelector((state) => state.groupset);

  const deleteHandler = async () => {
    let id = '';
    if (groupSet?._id) id = groupSet._id;
    await dispatch(deleteAnswer({ id: id, name: title }));
    // await dispatch(getSurveys());
    await dispatch(getGroupSet(id));
    handleClose(true);
  };

  // const surveyID = title;
  console.log('deleteID', title);
  return (
    <Dialog
      open={open}
      onClose={() => handleClose(false)}
      keepMounted
      TransitionComponent={PopupTransition}
      maxWidth="xs"
      aria-labelledby="column-delete-title"
      aria-describedby="column-delete-description"
    >
      <DialogContent sx={{ mt: 2, my: 1 }}>
        <Stack alignItems="center" spacing={3.5}>
          <Avatar color="error" sx={{ width: 72, height: 72, fontSize: '1.75rem' }}>
            <DeleteFilled />
          </Avatar>
          <Stack spacing={2}>
            <Typography variant="h4" align="center">
              Are you sure you want to delete?
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2} sx={{ width: 1 }}>
            <Button fullWidth onClick={() => handleClose(false)} color="secondary" variant="outlined">
              Cancel
            </Button>
            <Button fullWidth color="error" variant="contained" onClick={deleteHandler} autoFocus>
              Delete
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
