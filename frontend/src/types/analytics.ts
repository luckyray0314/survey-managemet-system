// import { ReactElement } from 'react';

// ==============================|| AUTH TYPES  ||============================== //

export type AnalyticsProfile = {
  _id?: string;
  surveyID?: string;
  noticedQuestion?: Object;
  groupSet?: Object;
  weightingResult?: Object;
  weights?: Object;
  date?: Date;
};

export interface AnalyticsProps {
  surveyID?: any | null;
  quesList?: any | null;
  QIDs?: number[] | null;
  SampleSize?: number | null;
  PopulationSize?: number | null;
  SampleData?: any | null;
  PopulationData?: any | null;
  NQuestion?: number | null;
  GroupSetIDs?: any | null;
  analytics?: AnalyticsProfile | null;
}

export interface AnalyticsPropsActionProps {
  type: string;
  payload?: AnalyticsProps;
}
