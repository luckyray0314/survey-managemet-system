import { useState, useEffect } from 'react';
import {
  Checkbox,
  FormControl,
  Grid,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Stack
} from '@mui/material';

import AnalyticsGroupSetTable from 'sections/tables/react-table/AnalyticsGroupSetTable';

// Reducer import
import { dispatch, useSelector } from 'store';
import { getGroupSets } from 'store/reducers/groupset';
import MainCard from 'components/MainCard';
// import { getSurveyResult } from "store/reducers/personalresult";
import { setQIDs, setPopulationSize, setSampleData, setPopulationData, setNQuestion, setGroupSetIDs } from 'store/reducers/analytics';

// interface IChoice {
//     person: string,
//     name: string,
//     count: number
// }

// interface IQuestion {
//     id: string,
//     name: string,
//     json: any
// }

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250
    }
  }
};

const SecondStep = () => {
  const { groupSets } = useSelector((state) => state.groupset);
  const { quesList, SampleSize } = useSelector((state) => state.analytics);
  const [groupset, setGroupSet] = useState<string[]>([]);

  const [n_ques, setnQues] = useState('');
  const [qId, setQId] = useState<number[]>([]);
  const [tables, setTables] = useState<any[]>();
  const [popultables, setPopulTables] = useState<any[]>();

  useEffect(() => {
    dispatch(getGroupSets());
  }, []);

  useEffect(() => {
    if (n_ques !== '') {
      dispatch(setNQuestion(Number(n_ques)));
      // console.log("n_ques................", n_ques);
    }
  }, [n_ques]);

  useEffect(() => {
    if (quesList.length !== 0 && groupset.length === 2 && SampleSize !== null && SampleSize !== undefined) {
      let quesId1 = [];
      for (let i = 0; i < quesList.length; i++) {
        for (let tb = 0; tb < groupset.length; tb++) {
          let s1 = quesList[i]?.name.replace(/[?:;.\s]/g, '').toLowerCase();
          let s2 = groupset[tb].replace(/[?:;.\s]/g, '').toLowerCase();

          if (s1 === s2) {
            quesId1.push(i);
          }
        }
      }
      if (quesId1.length === 2) {
        setQId(quesId1);
      }
    }
  }, [quesList, groupset]);

  useEffect(() => {
    if (qId.length === 2) {
      buildSampleTable();
      buildPopulationTable();
      dispatch(setQIDs(qId));
    }
  }, [qId]);

  const buildSampleTable = async () => {
    if (quesList.length !== 0 && groupset.length === 2 && SampleSize !== null && SampleSize !== undefined) {
      // console.log("NQUES_____________", quesId);
      let quesId = qId;
      let qtb = [];
      for (let tb = 0; tb < groupset.length; tb++) {
        let sumRows = 0;

        let res = [];
        // console.log("len------------------", quesList[quesId[tb]]?.json.length);
        for (let i = 0; i < quesList[quesId[tb]]?.json.length; i++) {
          let row = '';
          ////////  Choices of answer  ///////////
          let cellValue1 = quesList[quesId[tb]].json[i].name;
          if (cellValue1 === '') {
            cellValue1 = 'non-response';
          }
          row += '{"' + quesList[quesId[tb]]?.name + '":"' + cellValue1 + '",';

          ////////  Number of people  ///////////
          let cellValue2 = quesList[quesId[tb]].json[i].count;
          sumRows += Number(cellValue2);
          if (cellValue2 == null) cellValue2 = 0;
          row += '"' + 'Size' + '":"' + cellValue2 + '",';

          ////////  Percent  ///////////
          let cellValue3 = (Number(quesList[quesId[tb]].json[i].count) / SampleSize) * 100;
          if (cellValue3 == null) cellValue3 = 0;
          row += '"' + 'Percent (%)' + '":"' + cellValue3.toFixed(2) + '"}';
          // console.log("row------------------", row);
          res.push(JSON.parse(String(row)));
        }
        if (quesList[quesId[tb]]?.json.length === undefined) {
          let row = '';
          ////////  Choices of answer  ///////////
          let cellValue1 = quesList[quesId[tb]].json.name;
          if (cellValue1 === '') {
            cellValue1 = 'non-response';
          }
          row += '{"' + quesList[quesId[tb]]?.name + '":"' + cellValue1 + '",';

          ////////  Number of people  ///////////
          let cellValue2 = quesList[quesId[tb]].json.count;
          sumRows += Number(cellValue2);
          if (cellValue2 == null) cellValue2 = 0;
          row += '"' + 'Size' + '":"' + cellValue2 + '",';

          ////////  Percent  ///////////
          let cellValue3 = (Number(quesList[quesId[tb]].json.count) / SampleSize) * 100;
          if (cellValue3 == null) cellValue3 = 0;
          row += '"' + 'Percent (%)' + '":"' + cellValue3.toFixed(2) + '"}';
          // console.log("row------------------", row);
          res.push(JSON.parse(String(row)));
        }

        let row = '{"' + quesList[quesId[tb]]?.name + '":"' + 'Total' + '",';
        row += '"' + 'Size' + '":"' + sumRows + '",';
        row += '"' + 'Percent (%)' + '":"' + '100' + '"}';

        res.push(JSON.parse(String(row)));
        // console.log("res------------------", res);

        qtb.push(res);
      }
      setTables(qtb);
      await dispatch(setSampleData(qtb));
    }
  };

  const buildPopulationTable = async () => {
    if (quesList.length !== 0 && groupset.length === 2 && SampleSize !== null && SampleSize !== undefined && groupSets) {
      let qtb = [];
      let gId: string[];
      gId = [];
      let populSize = 0;
      for (let i = 0; i < groupSets.length; i++) {
        for (let j = 0; j < qId.length; j++) {
          let gname = groupset[j];
          let res = [];
          if (gname === groupSets[i].name) {
            gId.push(String(groupSets[i]._id));
            // console.log("answer-----------", groupSets[i].answers);
            if (populSize < Number(groupSets[i]?.participants)) {
              populSize = Number(groupSets[i]?.participants);
            }

            var sumSizeRows = 0;
            var sumPercentRows = 0;

            for (let c = 0; c < groupSets[i]?.answers?.length; c++) {
              let row = '';
              ////////  Choices of answer  ///////////
              let cellValue1 = groupSets[i].answers[c].name;
              row += '{"' + groupSets[i].name + '":"' + cellValue1 + '",';

              ////////  Number of people  ///////////
              let cellValue2 = (Number(groupSets[i].participants) * Number(groupSets[i].answers[c].size)) / 100;
              if (cellValue2 == null) cellValue2 = 0;
              sumSizeRows += Number(cellValue2);
              row += '"' + 'Size' + '":"' + cellValue2.toFixed(0) + '",';

              ////////  Percent  ///////////
              let cellValue3 = Number(groupSets[i].answers[c].size);
              if (cellValue3 == null) cellValue3 = 0;
              sumPercentRows += Number(cellValue3);
              row += '"' + 'Percent (%)' + '":"' + cellValue3.toFixed(0) + '"}';
              // console.log("row------------------", row);
              res.push(JSON.parse(String(row)));
            }

            let row = '{"' + groupSets[i].name + '":"' + 'Total' + '",';
            row += '"' + 'Size' + '":"' + sumSizeRows + '",';
            row += '"' + 'Percent (%)' + '":"' + sumPercentRows + '"}';

            res.push(JSON.parse(String(row)));
            // console.log("res------------------", res);

            qtb.push(res);
            // console.log("-----------------", sumPercentRows, sumSizeRows);
          }
        }
        //  console.log("gID-----------", qtb);
      }
      setPopulTables(qtb);
      await dispatch(setGroupSetIDs(gId));
      await dispatch(setPopulationSize(populSize));
      await dispatch(setPopulationData(qtb));
    }
  };

  const handleChangeNQues = (event: SelectChangeEvent) => {
    setnQues(event.target.value as string);
  };

  const handleChange = (event: SelectChangeEvent<typeof groupset>) => {
    const {
      target: { value }
    } = event;

    setGroupSet(
      // On autofill we get a the stringified value.
      typeof value === 'string' ? value.split(' | ') : value
    );
  };

  // console.log("grouset______________", popultables);

  return (
    <>
      <Grid item xs={12} sm={12}>
        <Stack spacing={1.5}>
          <InputLabel>Select the noticed question as the purpose of the survey </InputLabel>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Select the noticed question </InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={n_ques}
              placeholder="Survey"
              onChange={handleChangeNQues}
            >
              {quesList !== undefined && quesList?.map((ques: any) => <MenuItem value={ques.id}>{ques.name}</MenuItem>)}
            </Select>
          </FormControl>
        </Stack>
      </Grid>
      <br />

      <Grid item xs={12} md={12}>
        <Stack spacing={0.5}>
          <InputLabel>
            Select Group Set ( Don't select more over 3. Group Set Name must be the same as Question name in the survey. )
          </InputLabel>
          <FormControl fullWidth>
            <InputLabel id="demo-multiple-checkbox-label">Group Set</InputLabel>
            <Select
              labelId="demo-multiple-checkbox-label"
              id={'demo-multiple-checkbox'}
              multiple
              value={groupset}
              onChange={handleChange}
              input={<OutlinedInput placeholder="Tag" />}
              renderValue={(selected) => selected.join(' | ')}
              MenuProps={MenuProps}
            >
              {groupSets &&
                groupSets.map(
                  (gs) =>
                    gs.name && (
                      <MenuItem key={gs._id} value={gs.name}>
                        <Checkbox checked={groupset.indexOf(gs.name) > -1} />
                        <ListItemText primary={gs.name} />
                      </MenuItem>
                    )
                )}
            </Select>
          </FormControl>
        </Stack>
      </Grid>
      <br />

      <Grid container columnSpacing={3}>
        <Grid item xs={12} md={6} lg={6}>
          <MainCard title="Sample Table">
            {tables &&
              tables.length !== 0 &&
              tables.map((item: any, index) => (
                <>
                  <AnalyticsGroupSetTable data={item} />
                  <br />
                </>
              ))}
          </MainCard>
        </Grid>
        <Grid item xs={12} md={6} lg={6}>
          <MainCard title="Population Table">
            {popultables &&
              popultables.length !== 0 &&
              popultables.map((item: any, index) => (
                <>
                  <AnalyticsGroupSetTable data={item} />
                  <br />
                </>
              ))}
          </MainCard>
        </Grid>
      </Grid>
    </>
  );
};

export default SecondStep;
