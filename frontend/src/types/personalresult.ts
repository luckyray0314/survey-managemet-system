// import { ReactElement } from 'react';

// ==============================|| AUTH TYPES  ||============================== //

export type PersonalResultProfile = {
  _id?: string;
  surveyID?: string;
  customID?: string;
  surveyResult?: Object;
  surveyResultText?: string;
  surveyTime?: string;
  date?: Date;
};

export interface PersonalResultProps {
  surveyResult?: Object | null;
  personalResults?: PersonalResultProfile[] | null;
  // personalResults?: PersonalResultProfile[] | null;
}

export interface PersonalResultPropsActionProps {
  type: string;
  payload?: PersonalResultProps;
}
