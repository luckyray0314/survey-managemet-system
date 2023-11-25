import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// project import
import axios from 'utils/axios';

// types
import { PersonalResultProps } from 'types/personalresult';

// initial state
const initialState: PersonalResultProps = {
  surveyResult: null,
  personalResults: null
};

// ==============================|| SLICE - MENU ||============================== //

export const fetchMenu = createAsyncThunk('', async () => {
  const response = await axios.get('/api/menu/dashboard');
  return response.data;
});

const personalresult = createSlice({
  name: 'personalresult',
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
      .addCase(savePersonalResult.fulfilled, (state, action) => {
        state.surveyResult = action.payload;
      })
      // .addCase(getSurveys.fulfilled, (state, action) => {
      //   state.surveys = action.payload;
      // })
      // .addCase(updateSurvey.fulfilled, (state, action) => {
      //   state.survey = action.payload;
      //   state.isAnalyzed = false;
      //   state.isHadGroupSet = false;
      // })
      .addCase(getSurveyResult.fulfilled, (state, action) => {
        state.surveyResult = action.payload;
      })
      .addCase(getPersonalResult.fulfilled, (state, action) => {
        state.personalResults = action.payload;
      });
    // .addCase(deleteSurvey.fulfilled, (state, action) => {
    //   state.survey = null;
    //   state.surveys = action.payload;
    //   state.isAnalyzed = false;
    //   state.isHadGroupSet = false;
    // })
    // .addCase(copySurvey.fulfilled, (state, action) => {
    //   state.surveys = action.payload;
    // });
  }
});

export const savePersonalResult = createAsyncThunk(
  'personalresult/save',
  async (data: { id: string; customID: string; surveyResult: Object; surveyResultText: string; surveyTime: string }) => {
    const response = await axios.post('api/personalresult/save', data);
    return response.data;
  }
);

export const getSurveyResult = createAsyncThunk('personalresult/getsurvey', async (id: string) => {
  const response = await axios.get('api/personalresult/' + id);
  return response.data;
});

export const getPersonalResult = createAsyncThunk('personalresult/getresult', async (id: string) => {
  const response = await axios.get('api/personalresult/result/' + id);
  return response.data;
});

export default personalresult.reducer;

// export const { activeItem, activeComponent, openDrawer, openComponentDrawer, activeID } = menu.actions;
