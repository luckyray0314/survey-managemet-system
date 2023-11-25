// import { ReactElement } from 'react';

// ==============================|| AUTH TYPES  ||============================== //

export type GroupSetProfile = {
  _id?: string;
  name?: string;
  participants?: number;
  answers?: any;
  date?: Date;
};

export interface GroupSetProps {
  groupSet?: GroupSetProfile | null;
  groupSets?: GroupSetProfile[] | null;
  isHadAnswers?: boolean;
}

export interface GroupSetPropsActionProps {
  type: string;
  payload?: GroupSetProps;
}
