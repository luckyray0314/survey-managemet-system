// import { ReactElement } from 'react';

// ==============================|| AUTH TYPES  ||============================== //

export type SurveyProfile = {
  _id?: string;
  title?: string;
  intro?: string;
  json?: Object;
  groupSet?: Object;
  lang?: string;
  custom?: Object;
  date?: Date;
  gsName?: Object;
};

export interface SurveyProps {
  isHadGroupSet?: boolean;
  survey?: SurveyProfile | null;
  surveys?: SurveyProfile[] | null;
  isAnalyzed?: boolean;
  status?: string;
}

export interface SurveyPropsActionProps {
  type: string;
  payload?: SurveyProps;
}
