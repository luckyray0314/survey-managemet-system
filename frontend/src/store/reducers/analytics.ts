import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// project import
import axios from 'utils/axios';

// types
import { AnalyticsProps } from 'types/analytics';

// initial state
const initialState: AnalyticsProps = {
  surveyID: null,
  quesList: null,
  QIDs: null,
  SampleSize: null,
  PopulationSize: null,
  SampleData: null,
  PopulationData: null,
  NQuestion: null,
  GroupSetIDs: null,
  analytics: null
};

// ==============================|| SLICE - MENU ||============================== //

const analytics = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setSurveyID(state, action) {
      state.surveyID = action.payload;
    },
    setQuesList(state, action) {
      state.quesList = action.payload.quesList;
    },
    setQIDs(state, action) {
      state.QIDs = action.payload;
    },

    setSampleSize(state, action) {
      state.SampleSize = action.payload;
    },
    setPopulationSize(state, action) {
      state.PopulationSize = action.payload;
    },
    setSampleData(state, action) {
      state.SampleData = action.payload;
    },
    setPopulationData(state, action) {
      state.PopulationData = action.payload;
    },
    setNQuestion(state, action) {
      state.NQuestion = action.payload;
    },
    setGroupSetIDs(state, action) {
      state.GroupSetIDs = action.payload;
    }
    // hasError(state, action) {
    //   state.error = action.payload;
    // }
  },

  extraReducers(builder) {
    builder
      .addCase(updateAnalytics.fulfilled, (state, action) => {
        state.analytics = action.payload;
      })
      .addCase(createAnalytics.fulfilled, (state, action) => {
        state.analytics = action.payload;
      })
      .addCase(getAnalytics.fulfilled, (state, action) => {
        state.analytics = action.payload;
      });
    // .addCase(getSurveys.fulfilled, (state, action) => {
    //   state.surveys = action.payload;
    // })
    // .addCase(updateSurvey.fulfilled, (state, action) => {
    //   state.survey = action.payload;
    //   state.isAnalyzed = false;
    //   state.isHadGroupSet = false;
    // })

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

export const updateAnalytics = createAsyncThunk(
  'analytics/update',
  async (data: { id: string; surveyID: string; noticedQuestion: Object; groupSet: Object; weightingResult: Object; weights: Object }) => {
    const response = await axios.put('api/analytics/update', data);
    return response.data;
  }
);

export const createAnalytics = createAsyncThunk(
  'analytics/',
  async (data: { surveyID: string; noticedQuestion: Object; groupSet: Object; weightingResult: Object; weights: Object }) => {
    const response = await axios.post('api/analytics/', data);
    return response.data;
  }
);

export const getAnalytics = createAsyncThunk('analytics/getanalytics', async (id: string) => {
  const response = await axios.get('api/analytics/' + id);
  return response.data;
});

export default analytics.reducer;

export const {
  setSurveyID,
  setQuesList,
  setQIDs,
  setSampleSize,
  setPopulationSize,
  setSampleData,
  setPopulationData,
  setNQuestion,
  setGroupSetIDs
} = analytics.actions;
