import { useEffect } from 'react';

// material-ui
import { Grid } from '@mui/material';

// project import
import ExpandingDetails from 'sections/tables/react-table/results/ExpandingDetails';

// redux

import { useParams } from 'react-router-dom';
import { dispatch, useSelector } from 'store';
import { getSurveyResult, getPersonalResult } from 'store/reducers/personalresult';

// ==============================|| REACT TABLE - EXPANDING ||============================== //

const Expanding = () => {
  const { id } = useParams();
  const { surveyResult, personalResults } = useSelector((state) => state.personalresult);
  // const [data, setData] = useState<any>();

  useEffect(() => {
    if (id) {
      dispatch(getSurveyResult(id));
      dispatch(getPersonalResult(id));
    }
  }, []);

  useEffect(() => {
    if (surveyResult)
      if (JSON.parse(JSON.stringify(surveyResult)).length !== 0) {
        buildData(JSON.parse(JSON.stringify(surveyResult)));
      }
  }, [surveyResult]);

  const buildData = (myList: any[]) => {
    // var rows = [];
    // for (let i = 0;  i<myList.length; i++){
    //   var row = "{";
    //   row += '"Title":"' + surveys[i]?.title + '",';
    //   if(surveys[i]?.groupSet)
    //     row += '"GroupSet":"' + surveys[i]?.groupSet + '",';
    //   else
    //     row += '"GroupSet":"' + "Not connected to GroupSets" + '",';
    //     row += '"Date":"' + surveys[i]?.date + '",';
    //     row += '"id":"' + surveys[i]?._id + '"';
    //   row+="}";
    //   rows.push(JSON.parse(row));
    // }
    // setTable(rows);
  };

  console.log('personalResult--------------------', personalResults);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        {/* <ExpandingDetails data={data.slice(11, 19)} /> */}
        {surveyResult && personalResults && <ExpandingDetails data={personalResults} detailData={surveyResult} />}
      </Grid>
    </Grid>
  );
};

export default Expanding;
