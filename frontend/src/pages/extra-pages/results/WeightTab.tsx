import { useEffect, useState } from 'react';

// material-ui
import { Grid } from '@mui/material';

// project import
import ApexColumnChart from 'sections/chart/ApexColumnChart';

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

    let choice = Object.keys(myList[0][ques[0]]);
    let SampleSize = 0;
    for (let j = 0; j < choice.length; j++) {
      SampleSize += Number(myList[0][ques[0]][choice[j]]);
    }

    var table = [];
    for (let q = 0; q < ques.length; q++) {
      let dt = [];
      const data1 = new Map();
      let data2 = [];

      let choice = Object.keys(myList[0][ques[q]]);
      let sum = [];
      for (let i = 0; i < myList.length; i++) {
        let ssum = 0;
        for (let j = 0; j < choice.length; j++) {
          let val = Number(myList[i][ques[q]][choice[j]]);
          ssum += val;
        }
        sum.push(ssum);
      }
      for (let j = 0; j < choice.length; j++) {
        let data2_temp = [];
        for (let i = 0; i < myList.length; i++) {
          let val = Number(myList[i][ques[q]][choice[j]]);
          data2_temp.push(Number(Number((val / sum[i]) * SampleSize).toFixed(2)));
        }
        data2.push(data2_temp);
        data1.set('name', choice[j]);
        data1.set('data', data2_temp);

        // Convert Map to an array of key-value pairs
        const mapArray = Array.from(data1);

        // Convert the array to an object
        const mapObject = Object.fromEntries(mapArray);

        // Convert the object to JSON
        const jsonString = JSON.stringify(mapObject);
        dt.push(JSON.parse(jsonString));
      }
      table.push(dt);
    }
    setQuestion(ques);
    setTables(table);
  };

  // tables.map((item:any) =>{
  //   console.log("tables", item);
  // });

  return (
    <>
      <Grid container spacing={3}>
        {tables.length !== 0 &&
          tables.map((item: any, index) => (
            <Grid item xs={12} md={6} lg={12}>
              <MainCard title={question[index]}>
                <ApexColumnChart data={item} />
              </MainCard>
            </Grid>
          ))}
      </Grid>
    </>
  );
};

export default Basic;
