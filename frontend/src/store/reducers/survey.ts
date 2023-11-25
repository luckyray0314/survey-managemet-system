import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// project import
import axios from 'utils/axios';
// import { dispatch } from 'store';

// types
import { SurveyProps } from 'types/survey';

// initial state
const initialState: SurveyProps = {
  survey: null,
  surveys: null,
  isHadGroupSet: false,
  isAnalyzed: false,
  status: 'idle'
};

// ==============================|| SLICE - MENU ||============================== //

export const fetchMenu = createAsyncThunk('', async () => {
  const response = await axios.get('/api/menu/dashboard');
  return response.data;
});

const survey = createSlice({
  name: 'survey',
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
      .addCase(createSurvey.fulfilled, (state, action) => {
        state.survey = action.payload;
        state.isAnalyzed = false;
        state.isHadGroupSet = false;
      })
      .addCase(getSurveys.fulfilled, (state, action) => {
        state.surveys = action.payload;
      })
      .addCase(updateSurvey.fulfilled, (state, action) => {
        state.survey = action.payload;
        state.isAnalyzed = false;
        state.isHadGroupSet = false;
      })

      .addCase(getSurvey.pending, (state, action) => {
        state.status = 'loading';
      })
      .addCase(getSurvey.fulfilled, (state, action) => {
        state.status = 'success';
        state.survey = action.payload;
        state.isAnalyzed = false;
        state.isHadGroupSet = false;
      })
      .addCase(getSurvey.rejected, (state, action) => {
        state.status = 'failed';
      })

      .addCase(deleteSurvey.fulfilled, (state, action) => {
        state.survey = null;
        state.surveys = action.payload;
        state.isAnalyzed = false;
        state.isHadGroupSet = false;
      })
      .addCase(copySurvey.fulfilled, (state, action) => {
        state.surveys = action.payload;
      });
  }
});

export const createSurvey = createAsyncThunk('survey/create', async (data: { title: string; intro: string; lang: string }) => {
  const response = await axios.post('api/survey/create', data);
  return response.data;
});

export const createSurveyFromImport = createAsyncThunk(
  'survey/createfromimport',
  async (data: { title: string; intro: string; lang: string; sdata: any }) => {
    const response = await axios.post('api/survey/createfromimport', data);
    return response.data;
  }
);

export const getSurveys = createAsyncThunk('survey/getsurveys', async () => {
  const response = await axios.get('api/survey');
  return response.data;
});

export const updateSurvey = createAsyncThunk('survey/updatesurvey', async (data: { id: string; json: any; text: string }) => {
  const response = await axios.put('api/survey/update', data);
  // dispatch(getSurveys());
  return response.data;
});

export const getSurvey = createAsyncThunk('survey/getsurvey', async (id: string) => {
  const response = await axios.get('api/survey/' + id);
  return response.data;
});

export const updateCustom = createAsyncThunk('survey/updatecustom', async (data: { id: string; custom: string }) => {
  const response = await axios.put('api/survey/custom', data);
  return response.data;
});

export const updateGroupSet = createAsyncThunk('survey/updategroupset', async (data: { id: string; groupSet: any }) => {
  const response = await axios.put('api/survey/groupset', data);
  return response.data;
});

export const impossibleCustom = createAsyncThunk('survey/impossiblecustom', async (data: { id: string; custom: string }) => {
  const response = await axios.put('api/survey/impossible', data);
  return response.data;
});

export const deleteSurvey = createAsyncThunk('survey/deletesurvey', async (id: string) => {
  const response = await axios.delete('api/survey/' + id);
  return response.data;
});

export const copySurvey = createAsyncThunk('survey/copysurvey', async (id: string) => {
  console.log('COO', id);
  const response = await axios.post('api/survey/copy/' + id);
  return response.data;
});

export default survey.reducer;

// export const { activeItem, activeComponent, openDrawer, openComponentDrawer, activeID } = menu.actions;
