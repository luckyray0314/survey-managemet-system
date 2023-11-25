import { useEffect, useState } from 'react';

// material-ui
import { Grid } from '@mui/material';

// project import
import ApexPieChart from 'sections/chart/ApexPieChart';

// redux
import { useParams } from 'react-router-dom';
import { dispatch, useSelector } from 'store';
import { getAnalytics } from 'store/reducers/analytics';
import MainCard from 'components/MainCard';
// import { getSurveyResult, getPersonalResult } from "store/reducers/personalresult";

// ==============================|| REACT TABLE - BASIC ||============================== //

const Basic = () => {
  const { id } = useParams();
  const { analytics } = useSelector((state) => state.analytics);
  const [tables, setTables] = useState<Array<any>>([]);
  const [question, setQuestion] = useState<String[]>([]);

  console.log('id---', analytics);

  useEffect(() => {
    if (id) {
      dispatch(getAnalytics(id));
    }
  }, []);

  useEffect(() => {
    if (analytics)
      if (JSON.parse(JSON.stringify(analytics.weightingResult)).length !== 0) {
        buildTables(JSON.parse(JSON.stringify(analytics.weightingResult)));
      }
  }, [analytics]);

  const buildTables = (myList: any) => {
    // let tables1 = [];
    // let algos = ["Non weighted", "Cell Weighting", "Raking", "Linear Regression", "Logistic Regression", "Weight Tuning"];
    let ques = Object.keys(myList[0]);

    // let choice = Object.keys(myList[0][ques[0]]);
    // let SampleSize = 0;
    // for (let j = 0; j < choice.length; j++) {
    //   SampleSize += Number(myList[0][ques[0]][choice[j]]);
    // }
    var table = [];
    for (let q = 0; q < ques.length; q++) {
      let dt = [];
      let data1 = [];
      let data2 = [];

      let choice = Object.keys(myList[0][ques[q]]);
      // for (let i = 0; i < myList.length; i++) {

      let sum = 0;
      for (let j = 0; j < choice.length; j++) {
        let val = Number(myList[0][ques[q]][choice[j]]);
        sum += val;
      }
      for (let j = 0; j < choice.length; j++) {
        let val = Number(myList[0][ques[q]][choice[j]]);
        // let temp = '"' + choice[j] + '":"' + Number(val/sum*100).toFixed(2) + '%",';
        data1.push(choice[j]);
        data2.push(Number((val / sum) * 100));
      }

      // }

      dt.push(data1);
      dt.push(data2);
      table.push(dt);
    }
    setQuestion(ques);
    setTables(table);
  };
  tables.map((item: any) => {
    console.log('tables', item);
  });

  return (
    <>
      <Grid container spacing={3}>
        {tables.length !== 0 &&
          tables.map((item: any, index) => (
            <Grid item xs={12} md={6} xl={4}>
              <MainCard title={question[index]}>
                <ApexPieChart data={item} />
              </MainCard>
            </Grid>
          ))}
      </Grid>
    </>
  );
};

export default Basic;
