import { useState, useEffect } from 'react';
import { FormControl, Grid, InputLabel, MenuItem, Select, SelectChangeEvent, Stack } from '@mui/material';

import AnalyticsSurveyTable from 'sections/tables/react-table/AnalyticsSurveyTable';

// Reducer import
import { dispatch, useSelector } from 'store';
import { getSurveys } from 'store/reducers/survey';
import { getSurveyResult } from 'store/reducers/personalresult';
import { setQuesList, setSampleSize, setSurveyID } from 'store/reducers/analytics';

interface IChoice {
  person: string;
  name: string;
  count: number;
}

interface IQuestion {
  id: string;
  name: string;
  json: any;
}

const FirstStep = () => {
  const { surveys } = useSelector((state) => state.survey);
  const { surveyResult } = useSelector((state) => state.personalresult);

  const [survey, setSurvey] = useState('');
  const [ques_list, setquesList] = useState<Array<IQuestion>>([{ id: '', name: '', json: '' }]);

  useEffect(() => {
    dispatch(getSurveys());
  }, []);

  useEffect(() => {
    if (survey !== '') {
      dispatch(setSurveyID(survey));
      dispatch(getSurveyResult(survey));
    }
  }, [survey]);

  useEffect(() => {
    if (surveyResult)
      if (JSON.parse(JSON.stringify(surveyResult)).length !== 0) {
        // console.log("JSON_____________", surveyResult);

        buildQuesList(JSON.parse(JSON.stringify(surveyResult)));
      }
  }, [surveyResult]);

  useEffect(() => {
    if (ques_list[0].id !== '') {
      dispatch(setQuesList({ quesList: ques_list }));
      // console.log("JSON_____________", ques_list);
    }
  }, [ques_list]);

  const handleChangeLang = (event: SelectChangeEvent) => {
    setSurvey(event.target.value as string);
  };

  const buildQuesList = (myList: any[]) => {
    dispatch(setSampleSize(myList.length)); // set of 'SampleSize' constant
    // console.log("LEN------------------------", myList.length);
    let ques_list1: Array<IQuestion> = [{ id: '', name: '', json: '' }];

    let columns: string[];
    columns = [];

    let k = 0; // added for ques_list.id
    ques_list1.splice(0, ques_list1.length); // Clear Ques

    for (let i = 0; i < myList.length; i++) {
      let rowHash = myList[i];
      for (let key in rowHash) {
        if (!columns.some((x) => x == key)) {
          columns.push(key);

          let ques: IQuestion = { id: '', name: '', json: '' };
          ques.id = String(k);
          ques.name = key;
          ques_list1.push(ques);
          k++;
        }
      }
    }

    let choices: Array<IChoice> = [{ person: '', name: '', count: 0 }];

    for (let i = 0; i < myList.length; i++) {
      choices.splice(0, choices.length);

      for (let colIndex = 0; colIndex < columns.length; colIndex++) {
        let cellValue = myList[i][columns[colIndex]];
        if (cellValue == null) cellValue = '';

        let choice_temp: IChoice = { person: '', name: '', count: 0 };
        choice_temp.person = String(i);
        choice_temp.name = cellValue;
        choice_temp.count = 1;

        let rowFound = false;

        if (ques_list1[colIndex].json === '') {
          ques_list1[colIndex].json = choice_temp;
        } else {
          if (ques_list1[colIndex].json.length === undefined) {
            if (ques_list1[colIndex].json.name === cellValue) {
              ques_list1[colIndex].json.count++;
              ques_list1[colIndex].json.name = choice_temp.name;
              ques_list1[colIndex].json.person += `,${choice_temp.person}`;
            } else {
              let choice_list: Array<IChoice> = [{ person: '', name: '', count: 0 }];
              choice_list.splice(0, choice_list.length);

              let choice: IChoice = { person: '', name: '', count: 0 };
              choice.person = ques_list1[colIndex].json.person;
              choice.name = ques_list1[colIndex].json.name;
              choice.count = ques_list1[colIndex].json.count;
              choice_list.push(choice);
              choice_list.push(choice_temp);

              ques_list1[colIndex].json = choice_list;
            }
          } else {
            for (let r = 0; r < ques_list1[colIndex].json.length; r++) {
              let row = ques_list1[colIndex].json[r];
              if (row.name === choice_temp.name) {
                ques_list1[colIndex].json[r].count++;
                ques_list1[colIndex].json[r].name = choice_temp.name;
                ques_list1[colIndex].json[r].person += `,${choice_temp.person}`;
                rowFound = true;
                break;
              }
            }
            if (!rowFound) {
              ques_list1[colIndex].json.push(choice_temp);
            }
          }
        }
      }
    }

    setquesList(ques_list1);
  };

  return (
    <>
      <Grid item xs={12} sm={12}>
        <Stack spacing={1.5}>
          <InputLabel>Select Survey </InputLabel>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Select Survey </InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={survey}
              placeholder="Survey"
              onChange={handleChangeLang}
            >
              {surveys !== undefined && surveys?.map((survey) => <MenuItem value={survey._id}>{survey.title}</MenuItem>)}
            </Select>
          </FormControl>
        </Stack>
      </Grid>
      <br />
      {surveyResult && JSON.parse(JSON.stringify(surveyResult)).length !== 0 && (
        <AnalyticsSurveyTable title="Survey Results" striped={true} data={surveyResult} />
      )}
    </>
  );
};

export default FirstStep;
