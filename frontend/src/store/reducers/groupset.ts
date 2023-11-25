import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// project import
import axios from 'utils/axios';

// types
import { GroupSetProps } from 'types/groupset';

// initial state
const initialState: GroupSetProps = {
  groupSet: null,
  groupSets: null,
  isHadAnswers: false
};

// ==============================|| SLICE - MENU ||============================== //

export const fetchMenu = createAsyncThunk('', async () => {
  const response = await axios.get('/api/menu/dashboard');
  return response.data;
});

const groupset = createSlice({
  name: 'groupset',
  initialState,
  reducers: {
    // openComponentDrawer(state, action) {
    //   state.componentDrawerOpen = action.payload.componentDrawerOpen;
    // },
    // hasError(state, action) {
    //   state.error = action.payload;
    // }
  },

  extraReducers(builder) {
    builder
      .addCase(createGroupSet.fulfilled, (state, action) => {
        state.groupSet = action.payload;
        state.isHadAnswers = false;
      })
      .addCase(getGroupSets.fulfilled, (state, action) => {
        state.groupSets = action.payload;
      })
      .addCase(getGroupSet.fulfilled, (state, action) => {
        state.groupSet = action.payload;
      })
      .addCase(addAnswer.fulfilled, (state, action) => {
        state.groupSet = action.payload;
        state.isHadAnswers = true;
      })
      .addCase(copyGroupSet.fulfilled, (state, action) => {
        state.groupSets = action.payload;
        // state.isHadAnswers = true;
      })
      .addCase(deleteGroupSet.fulfilled, (state, action) => {
        state.groupSet = null;
        state.groupSets = action.payload;
        state.isHadAnswers = false;
      })
      .addCase(updateGroupSet.fulfilled, (state, action) => {
        state.groupSet = action.payload;
        // console.log("update_______", action.payload);
      })
      .addCase(deleteAnswer.fulfilled, (state, action) => {
        state.groupSet = action.payload;
      });
  }
});

export const createGroupSet = createAsyncThunk('groupset/create', async (data: { name: string; participants: number }) => {
  const response = await axios.post('api/groupset/create', data);
  return response.data;
});

export const getGroupSets = createAsyncThunk('groupset/getgroupsets', async () => {
  const response = await axios.get('api/groupset');
  return response.data;
});

export const getGroupSet = createAsyncThunk('groupset/get', async (id: string) => {
  const response = await axios.get('api/groupset/' + id);
  return response.data;
});

export const addAnswer = createAsyncThunk('groupset/addAnswer', async (data: { id: string; name: string; size: number }) => {
  const response = await axios.put('api/groupset/answer', data);
  return response.data;
});

export const changeParticipants = createAsyncThunk('groupset/changeParticipants', async (data: { id: string; participants: number }) => {
  const response = await axios.put('api/groupset/changeParticipants', data);
  return response.data;
});

export const copyGroupSet = createAsyncThunk('groupset/copyGroupSet', async (id: string) => {
  // console.log("COO", id);
  const response = await axios.post('api/groupset/copy/' + id);
  return response.data;
});

export const deleteGroupSet = createAsyncThunk('groupset/deleteGroupSet', async (id: string) => {
  const response = await axios.delete('api/groupset/' + id);
  return response.data;
});

export const updateGroupSet = createAsyncThunk('groupset/updategroupset', async (data: { id: string; name: string; size: number }) => {
  const response = await axios.put('api/groupset/update', data);
  return response.data;
});

export const deleteAnswer = createAsyncThunk('groupset/deleteAnswer', async (data: { id: string; name: string }) => {
  const response = await axios.put('api/groupset/delanswer', data);
  return response.data;
});

export default groupset.reducer;

// export const { activeItem, activeComponent, openDrawer, openComponentDrawer, activeID } = menu.actions;
