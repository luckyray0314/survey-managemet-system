import { useEffect, useState } from 'react';

// material-ui
import { Grid } from '@mui/material';

// project import
import BasicTable from 'sections/tables/react-table/results/BasicTable';

// redux
import { useParams } from 'react-router-dom';
import { dispatch, useSelector } from 'store';
import { getAnalytics } from 'store/reducers/analytics';
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
    let tables1 = [];
    let algos = ['Non weighted', 'Cell Weighting', 'Raking', 'Linear Regression', 'Logistic Regression', 'Weight Tuning'];
    let ques = Object.keys(myList[0]);

    // let choice = Object.keys(myList[0][ques[0]]);
    // let SampleSize = 0;
    // for (let j = 0; j < choice.length; j++) {
    //   SampleSize += Number(myList[0][ques[0]][choice[j]]);
    // }

    for (let q = 0; q < ques.length; q++) {
      var table = [];
      let choice = Object.keys(myList[0][ques[q]]);
      for (let i = 0; i < myList.length; i++) {
        var row = '{';
        let group = '"Set algorithm":"' + algos[i] + '",';
        row += group;
        let sum = 0;
        for (let j = 0; j < choice.length; j++) {
          let val = Number(myList[i][ques[q]][choice[j]]);
          sum += val;
        }
        for (let j = 0; j < choice.length; j++) {
          let val = Number(myList[i][ques[q]][choice[j]]);
          let temp = '"' + choice[j] + '":"' + Number((val / sum) * 100).toFixed(2) + '%",';
          row += temp;
        }
        row = row.slice(0, -1);
        row += '}';
        table.push(JSON.parse(String(row)));
      }

      tables1.push(table);
    }
    setQuestion(ques);
    setTables(tables1);
  };
  tables.map((item: any) => {
    console.log('tables', item);
  });

  return (
    <>
      {tables.length !== 0 &&
        tables.map((item: any, index) => (
          <>
            <Grid container spacing={3}>
              <Grid item xs={12} lg={12}>
                <BasicTable title={question[index]} data={item} />
              </Grid>
            </Grid>
            <br></br>
          </>
        ))}
    </>
  );
};

export default Basic;
