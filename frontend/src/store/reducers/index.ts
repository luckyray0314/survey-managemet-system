// third-party
import { combineReducers } from 'redux';

// project import
import menu from './menu';
import snackbar from './snackbar';
import survey from './survey';
import groupset from './groupset';
import personalresult from './personalresult';
import analytics from './analytics';

// ==============================|| COMBINE REDUCERS ||============================== //

const reducers = combineReducers({
  menu,
  snackbar,
  survey,
  groupset,
  personalresult,
  analytics
});

export default reducers;
