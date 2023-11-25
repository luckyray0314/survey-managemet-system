import { useEffect } from 'react';
import { Button, Grid } from '@mui/material';

import AnalyticsGroupSetTable from 'sections/tables/react-table/AnalyticsGroupSetTable';

import * as XLSX from 'xlsx';
import * as Excel from 'exceljs';
import Range from 'exceljs/lib/doc/range';
import * as FileSaver from 'file-saver';

// Reducer import
import { dispatch, useSelector } from 'store';
import { DownloadOutlined, SaveOutlined } from '@ant-design/icons';
import MainCard from 'components/MainCard';
import { updateGroupSet } from 'store/reducers/survey';
// import { getSurveyResult } from "store/reducers/personalresult";
import { createAnalytics } from 'store/reducers/analytics';

interface List2D {
  num: number;
  arr2d: number[][];
}

const KaiSquareCriticalValue = [
  3.841, 5.991, 7.815, 9.488, 11.07, 12.592, 14.067, 15.507, 16.919, 18.307, 19.675, 21.026, 22.362, 23.685, 24.996, 26.296, 27.587, 28.869,
  30.144, 31.41, 32.671, 33.924, 35.172, 36.415, 37.652, 38.885, 40.113, 41.337, 42.557, 43.773
];

const create2DArray = (rows: number, cols: number): number[][] => {
  let arr: number[] = new Array(rows * cols);
  let result: number[][] = [];
  for (let i = 0; i < rows; i++) {
    result[i] = arr.slice(i * cols, (i + 1) * cols);
  }
  return result;
};

const ThirdStep = () => {
  const { surveyResult } = useSelector((state) => state.personalresult);
  const { surveyID, NQuestion, QIDs, GroupSetIDs, quesList, SampleSize, SampleData, PopulationData, PopulationSize } = useSelector(
    (state) => state.analytics
  );
  let tableJSON: any[] = [];
  let voteJSON: any[] = [];
  let answerOptions: any[] = [];

  // let row = quesList[QIDs[0]].json.length; //SampleData[0].length-1;
  // let col = quesList[QIDs[1]].json.length; //SampleData[1].length-1;

  let cellWeightTb: number[][] = [];
  let rakingTb: number[][] = [];
  let linearRegressionTb: number[][] = [];
  let logisticRegressionTb: number[][] = [];
  let weightTuningTb: number[][] = [];

  let rakinglist: Array<List2D> = [{ num: 0, arr2d: [] }];

  let numeratorTb: number[][] = [];
  let denominatorTb: number[][] = [];
  let B0 = 0;
  let B1 = 0;

  let observedTb1: number[][] = [];
  let observedTb2: number[][] = [];
  let quesWeightingTb1: number[] = [];
  let quesWeightingTb2: number[] = [];
  let kaiTestingFlag: boolean[] = [];
  let kaiSqu1 = 0;
  let kaiSqu2 = 0;

  //==========    For Count    =========
  let populationCalcTb2: number[][] = [];
  let sampleCalcTb2: number[][] = [];

  //==========    For Percent    =========
  let populationCalcTb1: number[][] = [];
  let sampleCalcTb1: number[][] = [];

  // const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  // const fileExtension = ".xlsx";

  // console.log("quEslist--------------------------", quesList);
  useEffect(() => {}, []);

  const create2DTable = (rows: number, cols: number): number[][] => {
    let result: number[][] = create2DArray(quesList[rows]?.json.length, quesList[cols]?.json.length);

    for (let i = 0; i < quesList[rows]?.json.length; i++) {
      for (let j = 0; j < quesList[cols]?.json.length; j++) {
        let a = quesList[rows].json[i].person.split(',');
        let b = quesList[cols].json[j].person.split(',');
        // console.log("a", a, "b", b);
        let val = 0;
        let maxLen = Math.max(a.length, b.length);
        let r = 0,
          c = 0;
        for (let k = 0; k < maxLen; k++) {
          if (a[r] === b[c]) {
            val++;
            r++;
            c++;
            continue;
          }
          if (Number(a[r]) > Number(b[c])) {
            c++;
            if (r >= c) k--;
            continue;
          }
          if (Number(a[r]) < Number(b[c])) {
            r++;
            if (c >= r) k--;
            continue;
          }
        }
        // console.log("val", val);
        result[i][j] = val;
        // else result[i][j] = 0;
      }
    }
    // console.log("result",result);
    return result;
  };

  const CalcCellWeighting = (row: number, col: number, populationCalcTb1: number[][], sampleCalcTb1: number[][]) => {
    let cellWeightTb1: number[][] = create2DArray(row, col);

    for (let i = 0; i < row; i++) {
      for (let j = 0; j < col; j++) {
        cellWeightTb1[i][j] = populationCalcTb1[i][j] / Number(sampleCalcTb1[i][j]);
      }
    }
    //   console.log("cell----------", cellWeightTb1);
    return cellWeightTb1;
  };

  const CalcRaking = (row: number, col: number, populationCalcTb2: number[][], sampleCalcTb2: number[][]) => {
    let rakingTb1: number[][] = create2DArray(row, col);
    let tempTb: number[][] = create2DArray(row, col);
    let rakinglist1: Array<List2D> = [{ num: 0, arr2d: [] }];
    rakinglist1.splice(0, rakinglist1.length);

    //==========   Initialization   ==========
    let rakingFlag = true;
    let popul_rowSum: number[] = Array(row);
    let temp_rowSum: number[] = Array(row);
    let sample_rowSum: number[] = Array(row);
    for (let i = 0; i < row; i++) {
      popul_rowSum[i] = 0;
      temp_rowSum[i] = 0;
      sample_rowSum[i] = 0;
    }
    let popul_colSum: number[] = Array(col);
    let temp_colSum: number[] = Array(col);
    let sample_colSum: number[] = Array(col);
    for (let i = 0; i < col; i++) {
      popul_colSum[i] = 0;
      temp_colSum[i] = 0;
      sample_colSum[i] = 0;
    }

    //==========   Basic Data   ==========
    for (let i = 0; i < row; i++) {
      for (let j = 0; j < col; j++) {
        popul_rowSum[i] += populationCalcTb2[i][j];
        popul_colSum[j] += populationCalcTb2[i][j];
        sample_rowSum[i] += sampleCalcTb2[i][j];
        sample_colSum[j] += sampleCalcTb2[i][j];
      }
    }

    let tempTb1: number[][] = create2DArray(row, col);
    for (let i = 0; i < row; i++) {
      for (let j = 0; j < col; j++) {
        tempTb[i][j] = (popul_rowSum[i] * sampleCalcTb2[i][j]) / sample_rowSum[i];
        tempTb1[i][j] = (popul_rowSum[i] * sampleCalcTb2[i][j]) / sample_rowSum[i];
        temp_colSum[j] += tempTb[i][j];
        // console.log("cc", popul_rowSum[i], sampleCalcTb2[i][j], sample_rowSum[i], tempTb[i][j]);
      }
    }
    let rlist: List2D = { num: 0, arr2d: tempTb1 };
    rakinglist1.push(rlist);

    let k = 0;
    do {
      k++;
      let tempTb2: number[][] = create2DArray(row, col);

      if (k % 2 === 1) {
        for (let i = 0; i < row; i++) {
          temp_rowSum[i] = 0;
        }

        for (let i = 0; i < row; i++) {
          for (let j = 0; j < col; j++) {
            tempTb[i][j] = (popul_colSum[j] * tempTb[i][j]) / temp_colSum[j];
            tempTb2[i][j] = (popul_colSum[j] * tempTb[i][j]) / temp_colSum[j];
            temp_rowSum[i] += tempTb[i][j];
          }
        }
      } else {
        for (let j = 0; j < col; j++) {
          temp_colSum[j] = 0;
        }

        for (let i = 0; i < row; i++) {
          for (let j = 0; j < col; j++) {
            tempTb[i][j] = (popul_rowSum[i] * tempTb[i][j]) / temp_rowSum[i];
            tempTb2[i][j] = (popul_rowSum[i] * tempTb[i][j]) / temp_rowSum[i];
            // console.log("IJ----------------", tempTb[i][j], "---", popul_rowSum[i] * tempTb[i][j] / temp_rowSum[i]);
            temp_colSum[j] += tempTb[i][j];
          }
        }
      }

      let rlist: List2D = { num: k, arr2d: tempTb2 };
      rakinglist1.push(rlist);

      // console.log('k>>>>>>>', k)
      // console.log("TM----------------", tempTb2);
      let bias = 0;

      for (let i = 0; i < row; i++) {
        for (let j = 0; j < col; j++) {
          bias += Math.abs(temp_colSum[j] - popul_colSum[j]);
          bias += Math.abs(temp_rowSum[i] - popul_rowSum[i]);
        }
      }
      // console.log("bias------------", bias);

      if (bias < 1) rakingFlag = false;
      if (k === 20) rakingFlag = false;
    } while (rakingFlag);

    for (let i = 0; i < row; i++) {
      for (let j = 0; j < col; j++) {
        rakingTb1[i][j] = populationCalcTb2[i][j] / tempTb[i][j];
      }
    }

    // console.log("rakingList----------", rakinglist1);
    //   console.log("raking----------", rakingTb1);
    rakinglist = rakinglist1;
    return rakingTb1;
  };

  const CalcRegression = (row: number, col: number, populationCalcTb2: number[][], sampleCalcTb2: number[][]) => {
    let numeratorTb1: number[][] = create2DArray(row, col);
    let denominatorTb1: number[][] = create2DArray(row, col);
    let tempTb1: number[][] = create2DArray(row, col);
    let odds: number[][] = create2DArray(row, col);
    let linearRegressionTb1: number[][] = create2DArray(row, col);
    let logisticRegressionTb1: number[][] = create2DArray(row, col);
    // let weightTuningTb1: number[][] = create2DArray(row, col);

    ////////////  For Regression  ////////////
    let MeanSample = 1;
    let MeanPopulation = 1;
    if (SampleSize && PopulationSize) {
      MeanSample = SampleSize / row / col;
      MeanPopulation = PopulationSize / row / col;
    }

    let B0_temp = 0;
    let B1_temp = 0;
    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < row; i++) {
      for (let j = 0; j < col; j++) {
        numeratorTb1[i][j] = (populationCalcTb2[i][j] - MeanPopulation) * (sampleCalcTb2[i][j] - MeanSample);
        numerator += numeratorTb1[i][j];

        denominatorTb1[i][j] = (populationCalcTb2[i][j] - MeanPopulation) * (populationCalcTb2[i][j] - MeanPopulation);
        denominator += denominatorTb1[i][j];
      }
    }

    //////////  For Regression  //////////
    B1_temp = numerator / denominator;
    B0_temp = MeanSample - B1_temp * MeanPopulation;

    // console.log("MEAN", B0);
    for (let i = 0; i < row; i++) {
      for (let j = 0; j < col; j++) {
        tempTb1[i][j] = B0_temp + B1_temp * populationCalcTb2[i][j];
        odds[i][j] = 1 + Math.exp(-tempTb1[i][j]);
        linearRegressionTb1[i][j] = tempTb1[i][j] / sampleCalcTb2[i][j];
        logisticRegressionTb1[i][j] = odds[i][j] / sampleCalcTb2[i][j];
      }
    }
    //   console.log("linear----------", linearRegressionTb1);
    //   console.log("logistic----------", logisticRegressionTb1);
    numeratorTb = numeratorTb1;
    denominatorTb = denominatorTb1;
    B0 = B0_temp;
    B1 = B1_temp;
    return [linearRegressionTb1, logisticRegressionTb1];
  };

  const CalcWeightTuning = (row: number, col: number, kaiTestingFlag: boolean[]) => {
    let weightTuningTb1: number[][] = create2DArray(row, col);

    let pv1 = [];
    let pv2 = [];
    let pv3 = [];

    for (let k = 0; k < PopulationData.length; k++) {
      for (let i = 0; i < PopulationData[k].length - 1; i++) {
        switch (k) {
          case 0:
            pv1.push(Number(PopulationData[k][i].Size));
            break;
          case 1:
            pv2.push(Number(PopulationData[k][i].Size));
            break;
          default:
            pv3.push(Number(PopulationData[k][i].Size));
        }
      }
    }

    //   console.log("pv---------", pv1);

    if (QIDs && SampleSize && PopulationSize) {
      // QIDs[0]
      let iv1 = [];
      let t1 = 0;
      if (kaiTestingFlag[0] === true) {
        for (let i = 0; i < quesList[QIDs[0]].json.length; i++) {
          let sv = Number(quesList[QIDs[0]].json[i].count) / SampleSize; // sample percent
          let pv = Number(pv1[i]) / PopulationSize; // population percent
          let iv = Math.abs(1 - pv / sv); // individual calcuated value
          t1 += iv;
          iv1.push(iv);
        }
        iv1.sort((a, b) => b - a);
        // console.log("SORT", iv1);
      } else {
        for (let i = 0; i < quesList[QIDs[0]].json.length; i++) {
          let pv = Number(pv1[i]) / PopulationSize;
          iv1.push(pv);
          t1 += pv;
        }
      }

      // QIDs[1]
      let iv2 = [];
      let t2 = 0;
      if (kaiTestingFlag[1] === true) {
        for (let i = 0; i < quesList[QIDs[1]].json.length; i++) {
          let sv = Number(quesList[QIDs[1]].json[i].count) / SampleSize; // sample percent
          let pv = Number(pv2[i]) / PopulationSize; // population percent
          let iv = Math.abs(1 - pv / sv); // individual calcuated value
          t2 += iv;
          iv2.push(iv);
        }
        iv2.sort((a, b) => b - a);
        // console.log("SORT2", iv2);
      } else {
        for (let i = 0; i < quesList[QIDs[1]].json.length; i++) {
          let pv = Number(pv2[i]) / PopulationSize;
          iv2.push(pv);
          t2 += pv;
        }
      }

      let quesWeightingTb1_1 = [];
      let quesWeightingTb2_1 = [];
      for (let i = 0; i < row; i++) {
        for (let j = 0; j < col; j++) {
          weightTuningTb1[i][j] = ((iv1[i] / t1) * iv2[j]) / t2;
        }
      }

      for (let i = 0; i < row; i++) {
        quesWeightingTb1_1.push(iv1[i] / t1);
      }

      for (let j = 0; j < col; j++) {
        quesWeightingTb2_1.push(iv2[j] / t2);
      }

      quesWeightingTb1 = quesWeightingTb1_1;
      quesWeightingTb2 = quesWeightingTb2_1;
    }

    //   console.log("weightTuning----------", weightTuningTb1);

    return weightTuningTb1;
  };

  const buildResultTable = (
    row: number,
    col: number,
    myList: any,
    cellWeightTb: number[][],
    rakingTb: number[][],
    linearRegressionTb: number[][],
    logisticRegressionTb: number[][],
    weightTuningTb: number[][]
  ) => {
    let algos = ['Non weighted', 'Cell Weighting', 'Raking', 'Linear Regression', 'Logistic Regression', 'Weight Tuning'];
    let nQues = Number(NQuestion);
    let qId: number[];
    let resJSON = [];
    qId = [];
    if (QIDs) qId = QIDs;
    let columns: string[];
    columns = [];

    ////////////////   Calculation for sum   //////////////////
    for (let i = 0; i < myList.length; i++) {
      let rowHash = myList[i];
      for (let key in rowHash) {
        if (!columns.some((x) => x == key)) {
          columns.push(key);
        }
      }
    }

    let cellSum: number[][] = create2DArray(algos.length, quesList[nQues]?.json.length);
    let algoSum: number[] = new Array(algos.length);
    for (let a = 0; a < algos.length; a++) {
      for (let c = 0; c < quesList[nQues].json.length; c++) {
        if (a === 0) cellSum[a][c] = Number(quesList[nQues].json[c].count);
        else cellSum[a][c] = 0;
      }
      algoSum[a] = 0;
    }

    let vote_rows = [];
    let vote_row = '';
    let temp;

    for (let a = 0; a < algos.length; a++) {
      for (let i = 0; i < myList.length; i++) {
        let rc = 0,
          cc = 0;
        let nqc = 0;
        // console.log("COLs", columns);
        for (let colIndex = 0; colIndex < columns.length; colIndex++) {
          let cellValue = myList[i][columns[colIndex]];
          // console.log("NQName", nQues == colIndex);
          if (nQues == colIndex) {
            for (let c = 0; c < quesList[nQues].json.length; c++) {
              if (cellValue === quesList[nQues].json[c].name) {
                nqc = c;
                // console.log("NQC", nqc);
                break;
              }
            }
            continue;
          }
          for (let q = 0; q < qId.length; q++) {
            if (q === 0) {
              for (let c = 0; c < quesList[qId[q]].json.length; c++) {
                if (colIndex === qId[q] && cellValue === quesList[qId[q]].json[c].name) {
                  rc = c;
                  break;
                }
              }
              continue;
            }
            if (q === 1) {
              for (let c = 0; c < quesList[qId[q]].json.length; c++) {
                if (colIndex === qId[q] && cellValue === quesList[qId[q]].json[c].name) {
                  cc = c;
                  break;
                  // console.log("cell", quesList[qId[q]].json[c].name);
                }
              }
            }
          }
        }

        if (
          cellWeightTb !== undefined &&
          linearRegressionTb !== undefined &&
          logisticRegressionTb !== undefined &&
          rakingTb !== undefined &&
          weightTuningTb !== undefined
        ) {
          let weight = 0;
          if (a === 1) weight = cellWeightTb[rc][cc];
          if (a === 2) weight = rakingTb[rc][cc];
          if (a === 3) weight = linearRegressionTb[rc][cc];
          if (a === 4) weight = logisticRegressionTb[rc][cc];
          if (a === 5) weight = weightTuningTb[rc][cc];

          cellSum[a][nqc] = cellSum[a][nqc] + weight;
        }
      }
      for (let nqc = 0; nqc < quesList[nQues].json.length; nqc++) {
        algoSum[a] += cellSum[a][nqc];
      }
    }

    for (let i = 0; i < myList.length; i++) {
      // vote value
      vote_row.slice(0, vote_row.length);
      vote_row = '{';

      temp = '"' + 'Participant Number' + '":"' + (i + 1) + '",';
      vote_row += temp;

      let rc = 0,
        cc = 0;
      // let nqc = 0;
      for (let colIndex = 0; colIndex < columns.length; colIndex++) {
        let cellValue = myList[i][columns[colIndex]];
        if (cellValue === undefined) cellValue = '';
        // console.log("cellV", cellValue);
        // console.log("NQName", nQues == colIndex);
        if (nQues == colIndex) {
          for (let c = 0; c < quesList[nQues].json.length; c++) {
            if (cellValue === quesList[nQues].json[c].name) {
              // nqc = c;
              temp = '"' + quesList[nQues]?.name + '":"' + cellValue + '",';
              vote_row += temp;

              break;
            }
            // console.log("NQC", nqc);
          }
          continue;
        }
        for (let q = 0; q < qId.length; q++) {
          if (q === 0) {
            for (let c = 0; c < quesList[qId[q]].json.length; c++) {
              if (colIndex === qId[q] && cellValue === quesList[qId[q]].json[c].name) {
                rc = c;

                if (cellValue === '') temp = '"' + quesList[qId[q]]?.name + '":"' + 'non response' + '",';
                else temp = '"' + quesList[qId[q]]?.name + '":"' + cellValue + '",';

                vote_row += temp;

                break;
              }
            }
            continue;
          }
          if (q === 1) {
            for (let c = 0; c < quesList[qId[q]].json.length; c++) {
              if (colIndex === qId[q] && cellValue === quesList[qId[q]].json[c].name) {
                cc = c;

                if (cellValue === '') temp = '"' + quesList[qId[q]]?.name + '":"' + 'non response' + '",';
                else temp = '"' + quesList[qId[q]]?.name + '":"' + cellValue + '",';
                vote_row += temp;

                break;
                // console.log("cell", quesList[qId[q]].json[c].name);
              }
            }
          }
        }
      }

      temp = '"' + 'Non weighted' + '":"' + 1 + '",';
      vote_row += temp;

      for (let a = 0; a < algos.length; a++) {
        if (
          cellWeightTb !== undefined &&
          linearRegressionTb !== undefined &&
          logisticRegressionTb !== undefined &&
          rakingTb !== undefined &&
          weightTuningTb !== undefined
        ) {
          let weight = 0;
          {
            weight = cellWeightTb[rc][cc];
            temp = '"' + 'Cell Weighting' + '":"' + weight.toFixed(2) + '",';
            vote_row += temp;
          }
          {
            weight = rakingTb[rc][cc];
            temp = '"' + 'Raking' + '":"' + weight.toFixed(2) + '",';
            vote_row += temp;
          }
          {
            weight = linearRegressionTb[rc][cc];
            temp = '"' + 'Linear Regression' + '":"' + weight.toFixed(2) + '",';
            vote_row += temp;
          }
          {
            weight = logisticRegressionTb[rc][cc];
            temp = '"' + 'Logistic Regression' + '":"' + weight.toFixed(2) + '",';
            vote_row += temp;
          }
          {
            weight = weightTuningTb[rc][cc];
            temp = '"' + 'Weight Tuning' + '":"' + weight.toFixed(2) + '",';
            vote_row += temp;
          }
        }
      }
      vote_row = vote_row.slice(0, -1);
      vote_row += '}';
      vote_rows.push(JSON.parse(String(vote_row)));
    }
    //   console.log("voteTable-------------", vote_rows);

    ////////////   Building resultTB   ////////////

    let noticedRes = quesList[nQues].json;
    let res = [];

    for (let i = 0; i < noticedRes.length; i++) {
      let row = '{"' + quesList[nQues].name + '":"' + noticedRes[i]?.name + '",';
      for (let colIndex = 0; colIndex < algos.length; colIndex++) {
        let cell;
        if (colIndex === 0) cell = ((cellSum[colIndex][i] / Number(SampleSize)) * 100).toFixed(2);
        else cell = ((cellSum[colIndex][i] / algoSum[colIndex]) * 100).toFixed(2);
        if (cell == null) cell = (0).toFixed(2);
        row += '"' + algos[colIndex] + '":"' + cell + '",';
      }
      row = row.slice(0, -1);
      row += '}';
      // console.log("row---------------", row);
      res.push(JSON.parse(String(row)));
    }

    //   console.log("Result------", res);
    resJSON = res;

    return [resJSON, vote_rows];
  };

  const onClickSaveButton = (voteRows: any) => {
    let algos = ['Non weighted', 'Cell Weighting', 'Raking', 'Linear Regression', 'Logistic Regression', 'Weight Tuning'];
    //   let nQues = Number(NQuestion);
    //   let qId:number[];
    //   qId = [];
    //   if(QIDs) qId = QIDs;

    let rows = [];
    for (let a = 0; a < algos.length; a++) {
      let atemp = '{';
      for (let q = 0; q < quesList.length; q++) {
        let ques = String(quesList[q]?.name);
        let qtemp = '"' + ques + '":{';
        for (let c = 0; c < quesList[q].json.length; c++) {
          let choice = quesList[q].json[c].name;
          let sum = 0;
          let people = quesList[q].json[c].person.split(',');
          for (let p = 0; p < people.length; p++) {
            let person = Number(people[p]);
            let weight = Number(voteRows[person][algos[a]]);
            sum += weight;
          }
          let ctemp = '"' + choice + '":"' + sum + '",';
          qtemp += ctemp;
        }
        qtemp = qtemp.slice(0, -1);
        qtemp += '},';
        atemp += qtemp;
      }
      atemp = atemp.slice(0, -1);
      atemp += '}';

      rows.push(JSON.parse(String(atemp)));
    }
    //   console.log("WR-----------", rows);

    //==========    Save    =========
    dispatch(
      createAnalytics({
        surveyID: String(surveyID),
        noticedQuestion: String(NQuestion),
        groupSet: GroupSetIDs,
        weightingResult: rows,
        weights: voteRows
      })
    );
    dispatch(updateGroupSet({ id: String(surveyID), groupSet: GroupSetIDs }));
  };

  //////////////////     Export Part      ///////////////////////
  const ExpertToExcel = () => {
    // let algos = ["Non weighted", "Cell Weighting", "Raking", "Linear Regression", "Logistic Regression", "Weight Tuning"];
    let nQues = Number(NQuestion);
    let qId: number[];
    qId = [];
    if (QIDs) qId = QIDs;
    let row = quesList[qId[0]].json.length; //SampleData[0].length-1;
    let col = quesList[qId[1]].json.length; //SampleData[1].length-1;

    // XLSX
    const workbook = XLSX.utils.book_new();

    // Excel JS
    const workbook1 = new Excel.Workbook();

    const worksheet_response = XLSX.utils.aoa_to_sheet([]);
    const worksheet_population = XLSX.utils.aoa_to_sheet([]);
    const worksheet_sample = XLSX.utils.aoa_to_sheet([]);
    const worksheet_cellweighing = XLSX.utils.aoa_to_sheet([]);
    const worksheet_linear = XLSX.utils.aoa_to_sheet([]);
    const worksheet_logistic = XLSX.utils.aoa_to_sheet([]);
    const worksheet_raking = XLSX.utils.aoa_to_sheet([]);
    const worksheet_weighttuning = XLSX.utils.aoa_to_sheet([]);
    const worksheet_final = XLSX.utils.aoa_to_sheet([]);

    let res = '';
    let rrr = '';
    let margin = quesList[qId[0]]?.json.length + 2 + 2;

    //==========    Response Sheet    =========
    //// Answer Options
    XLSX.utils.sheet_add_json(worksheet_response, answerOptions, { origin: 'A2' });
    //// Vote %
    XLSX.utils.sheet_add_json(worksheet_response, tableJSON, { origin: 'H2' });
    //// Vote value
    XLSX.utils.sheet_add_json(worksheet_response, voteJSON, { origin: 'A12' });
    XLSX.utils.book_append_sheet(workbook, worksheet_response, 'Response');
    var resJson: any = XLSX.utils.sheet_to_json(worksheet_response);
    const worksheet1 = workbook1.addWorksheet('Response');

    var valuesArray = [];
    for (let i = 0; i < resJson.length; i++) {
      var valueArr = [];
      let values = Object.values(resJson[i]);
      valueArr.push(...values);
      valuesArray.push(valueArr);
    }

    var c1 = qId.length + 1; // bound between table1 and table 2
    var char1 = String.fromCharCode(65 + c1);
    var d1 = Math.max(quesList[nQues]?.json.length, quesList[qId[0]]?.json.length, quesList[qId[1]]?.json.length) + 2; // bound between table1,2 and table 3

    worksheet1.addRow(['']);
    var k = 0;
    valuesArray.forEach((item: any) => {
      worksheet1.addRow(item);
      k++;
      if (k === d1 - 1) {
        worksheet1.addRow(['']);
        worksheet1.addRow(['']);
      }
    });

    worksheet1.mergeCells("'" + char1 + '2:' + char1 + d1 + "'");
    worksheet1.getCell("'" + char1 + "2'").value = '';

    worksheet1.mergeCells("'" + String.fromCharCode(66 + c1) + '1:' + String.fromCharCode(71 + c1) + "1'");
    worksheet1.getCell(String.fromCharCode(66 + c1) + '1').value = 'Vote %';

    worksheet1.mergeCells("'A1:" + String.fromCharCode(64 + c1) + "1'");
    worksheet1.getCell('A1').value = 'Answer options';

    worksheet1.mergeCells("'A" + (d1 + 2) + ':' + String.fromCharCode(71 + c1) + (d1 + 2) + "'");
    worksheet1.getCell('A' + (d1 + 2)).value = 'Vote Value';

    worksheet1.getRow(1).font = {
      bold: true,
      size: 13
    };
    worksheet1.getRow(1).alignment = {
      horizontal: 'center'
    };

    worksheet1.getCell('A' + (d1 + 2)).font = {
      bold: true,
      size: 13
    };
    worksheet1.getCell('A' + (d1 + 2)).alignment = {
      horizontal: 'center'
    };

    //-- border style
    // border of table 3
    var range = new Range('A' + (d1 + 3), String.fromCharCode(71 + c1) + (resJson.length + 3));
    range.forEachAddress((address: any) => {
      const cell = worksheet1.getCell(address);
      cell.style = {
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        },
        alignment: {
          horizontal: 'center'
        }
      };
    });

    // border of table 1
    var range = new Range('A2', String.fromCharCode(64 + c1) + d1);
    range.forEachAddress((address: any) => {
      const cell = worksheet1.getCell(address);
      cell.style = {
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        },
        alignment: {
          horizontal: 'center'
        }
      };
    });

    // header of table 1
    var range = new Range('A2', String.fromCharCode(64 + c1) + '2');
    range.forEachAddress((address: any) => {
      const cell = worksheet1.getCell(address);
      cell.style = {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFDDEBF7' },
          bgColor: { argb: 'FF0000FF' }
        },
        font: {
          bold: true
        },
        alignment: {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: true
        },
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        }
      };
    });

    // header of table 2
    var range = new Range(String.fromCharCode(66 + c1) + '2', String.fromCharCode(71 + c1) + '2');
    range.forEachAddress((address: any) => {
      const cell = worksheet1.getCell(address);
      cell.style = {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF4B084' },
          bgColor: { argb: 'FF0000FF' }
        },
        font: {
          bold: true
        },
        alignment: {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: true
        },
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        }
      };
    });

    // body of table 2
    var range = new Range(String.fromCharCode(66 + c1) + '3', String.fromCharCode(71 + c1) + (quesList[nQues].json.length + 2));
    range.forEachAddress((address: any) => {
      const cell = worksheet1.getCell(address);
      cell.style = {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFF2CC' },
          bgColor: { argb: 'FF0000FF' }
        },
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        }
      };
    });

    // header of table 3
    var range = new Range('A' + (d1 + 3), String.fromCharCode(71 + c1) + (d1 + 3));
    range.forEachAddress((address: any) => {
      const cell = worksheet1.getCell(address);
      cell.style = {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFA9D08E' },
          bgColor: { argb: 'FF0000FF' }
        },
        font: {
          bold: true
        },
        alignment: {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: true
        },
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        }
      };
    });

    //==========    Population Sheet    =========
    //// By questions
    // Parse the table string into an HTML table element
    const parser_population = new DOMParser();

    // For qId[0]
    XLSX.utils.sheet_add_json(worksheet_population, PopulationData[0], { origin: 'A2' });

    // For qId[1]
    XLSX.utils.sheet_add_json(worksheet_population, PopulationData[1], { origin: 'A' + (PopulationData[0].length + 4) });

    // let row = quesList[qId[0]]?.json.length;
    // let col = quesList[qId[1]]?.json.length;
    // let res="";
    // let rrr="";

    // For count
    res = '<table><tr>';
    res += '<th>' + quesList[qId[0]]?.name + '</th>';
    for (let j = 0; j < col; j++) {
      let temp = quesList[qId[1]]?.json[j].name;
      if (quesList[qId[1]]?.json[j].name === '') temp = 'non-response';
      res += '<th>' + temp + '</th>';
    }
    res += '<th>Total</th></tr>';
    for (let i = 0; i < row; i++) {
      let temp = quesList[qId[0]]?.json[i].name;
      if (quesList[qId[0]]?.json[i].name === '') temp = 'non-response';
      let rrr = '<td>' + temp + '</td>';
      for (let j = 0; j < col; j++) {
        rrr += '<td>' + populationCalcTb2[i][j].toFixed(0) + '</td>';
      }
      rrr += '<td>' + Number(PopulationData[0][i]?.Size).toFixed(0) + '</td>';
      res += '<tr>' + rrr + '</tr>';
    }
    rrr = '<td>Total</td>';
    for (let j = 0; j < col; j++) {
      rrr += '<td>' + Number(PopulationData[1][j]?.Size).toFixed(0) + '</td>';
    }
    rrr += '<td>' + PopulationSize + '</td>';
    res += '<tr>' + rrr + '</tr>';
    res += '</table>';
    var tableElement_population = parser_population.parseFromString(res, 'text/html').querySelector('table');
    XLSX.utils.sheet_add_dom(worksheet_population, tableElement_population, { origin: 'Z2' });
    XLSX.utils.sheet_add_dom(worksheet_linear, tableElement_population, { origin: 'A3' });
    XLSX.utils.sheet_add_dom(worksheet_logistic, tableElement_population, { origin: 'A3' });
    XLSX.utils.sheet_add_dom(worksheet_raking, tableElement_population, { origin: 'A2' });

    // For percentage
    res = '<table><tr>';
    res += '<th>' + quesList[qId[0]]?.name + '</th>';
    for (let j = 0; j < col; j++) {
      let temp = quesList[qId[1]]?.json[j].name;
      if (quesList[qId[1]]?.json[j].name === '') temp = 'non-response';
      res += '<th>' + temp + '</th>';
    }
    res += '<th>Total</th></tr>';
    for (let i = 0; i < row; i++) {
      let temp = quesList[qId[0]]?.json[i].name;
      if (quesList[qId[0]]?.json[i].name === '') temp = 'non-response';
      let rrr = '<td>' + temp + '</td>';

      for (let j = 0; j < col; j++) {
        rrr += '<td>' + populationCalcTb1[i][j].toFixed(0) + ' %</td>';
      }
      rrr += '<td>' + ((Number(PopulationData[0][i]?.Size) / Number(PopulationSize)) * 100).toFixed(0) + ' %</td>';
      res += '<tr>' + rrr + '</tr>';
    }
    rrr = '<td>Total</td>';
    for (let j = 0; j < col; j++) {
      rrr += '<td>' + ((Number(PopulationData[0][j]?.Size) / Number(PopulationSize)) * 100).toFixed(0) + ' %</td>';
    }
    rrr += '<td>100 %</td>';
    res += '<tr>' + rrr + '</tr>';
    res += '</table>';
    var tableElement_population = parser_population.parseFromString(res, 'text/html').querySelector('table');
    XLSX.utils.sheet_add_dom(worksheet_population, tableElement_population, { origin: 'Z' + (PopulationData[0].length + 4) });
    XLSX.utils.sheet_add_dom(worksheet_cellweighing, tableElement_population, { origin: 'A2' });

    XLSX.utils.book_append_sheet(workbook, worksheet_population, 'Population');
    resJson = XLSX.utils.sheet_to_json(worksheet_population);

    const worksheet1_population = workbook1.addWorksheet('Population');

    var valuesArray = [];
    var refLen = Object.values(resJson[0]).length;
    for (let i = 0; i < resJson.length; i++) {
      let values = Object.values(resJson[i]);

      var valueArr = [];
      var tmpLen = Object.values(resJson[i]).length;

      if (tmpLen < refLen) {
        if (resJson[i].__EMPTY === undefined) {
          for (let j = 0; j < refLen - tmpLen; j++) {
            valueArr.push('');
          }
          valueArr.push('');
          valueArr.push(...values);
        } else {
          const [one, two, three, ...rest] = values;
          valueArr.push(one);
          valueArr.push(two);
          valueArr.push(three);
          valueArr.push('');
          valueArr.push(...rest);
        }
      } else {
        const [one, two, three, ...rest] = values;
        valueArr.push(one);
        valueArr.push(two);
        valueArr.push(three);
        valueArr.push('');
        valueArr.push(...rest);
      }
      valuesArray.push(valueArr);
    }

    var c1 = 3; // bound between table1 and table 2
    var c2 = quesList[qId[1]]?.json.length + 2;
    var r1 = quesList[qId[0]]?.json.length + 3; // bound between table1,2 and table 3

    worksheet1_population.addRow(['']);
    var k = 0;
    valuesArray.forEach((item: any) => {
      worksheet1_population.addRow(item);
      k++;
      if (k === r1 - 1) {
        worksheet1_population.addRow(['']);
        worksheet1_population.addRow(['']);
      }
    });

    worksheet1_population.mergeCells("'" + String.fromCharCode(66 + c1) + '1:' + String.fromCharCode(66 + c1 + c2 - 1) + "1'");
    worksheet1_population.getCell("'" + String.fromCharCode(66 + c1) + "1'").value = 'Population Numbers';

    worksheet1_population.mergeCells('A1:B1');
    worksheet1_population.getCell('A1').value = 'Total Population:';
    worksheet1_population.getCell('C1').value = PopulationSize;

    worksheet1_population.mergeCells(
      "'" + String.fromCharCode(66 + c1) + (r1 + 2) + ':' + String.fromCharCode(66 + c1 + c2 - 1) + (r1 + 2) + "'"
    );
    worksheet1_population.getCell("'" + String.fromCharCode(66 + c1) + (r1 + 2) + "'").value = 'Population Percentage';

    worksheet1_population.getRow(1).font = {
      bold: true,
      size: 13
    };
    worksheet1_population.getRow(1).alignment = {
      horizontal: 'center'
    };

    worksheet1_population.getCell("'" + String.fromCharCode(66 + c1) + (r1 + 2) + "'").font = {
      bold: true,
      size: 13
    };
    worksheet1_population.getCell("'" + String.fromCharCode(66 + c1) + (r1 + 2) + "'").alignment = {
      horizontal: 'center'
    };

    //-- border style
    // border of table 1-1
    var range = new Range('A2', 'C' + r1);
    range.forEachAddress((address: any) => {
      const cell = worksheet1_population.getCell(address);
      cell.style = {
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        },
        alignment: {
          horizontal: 'center'
        }
      };
    });

    // border of table 1-2
    var range = new Range('E2', String.fromCharCode(66 + c1 + c2 - 1) + r1);
    range.forEachAddress((address: any) => {
      const cell = worksheet1_population.getCell(address);
      cell.style = {
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        },
        alignment: {
          horizontal: 'center'
        }
      };
    });

    // border of table 2-1
    var range = new Range('A' + (r1 + 3), 'C' + (r1 + 2 + c2));
    range.forEachAddress((address: any) => {
      const cell = worksheet1_population.getCell(address);
      cell.style = {
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        },
        alignment: {
          horizontal: 'center'
        }
      };
    });

    // border of table 2-2
    var range = new Range('E' + (r1 + 3), String.fromCharCode(66 + c1 + c2 - 1) + (r1 + r1 + 1));
    range.forEachAddress((address: any) => {
      const cell = worksheet1_population.getCell(address);
      cell.style = {
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        },
        alignment: {
          horizontal: 'center'
        },
        numFmt: '0%'
      };
    });

    // header of table 1-1
    var range = new Range('A2', 'C2');
    range.forEachAddress((address: any) => {
      const cell = worksheet1_population.getCell(address);
      cell.style = {
        font: {
          bold: true
        },
        alignment: {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: true
        },
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        }
      };
    });

    // header of table 1-2
    var range = new Range('E2', String.fromCharCode(66 + c1 + c2 - 1) + '2');
    range.forEachAddress((address: any) => {
      const cell = worksheet1_population.getCell(address);
      cell.style = {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF5B9BD5' },
          bgColor: { argb: 'FF5B9BD5' }
        },
        font: {
          bold: true
        },
        alignment: {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: true
        },
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        }
      };
    });

    // header of table 2-1
    var range = new Range('A' + (r1 + 3), 'C' + (r1 + 3));
    range.forEachAddress((address: any) => {
      const cell = worksheet1_population.getCell(address);
      cell.style = {
        font: {
          bold: true
        },
        alignment: {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: true
        },
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        }
      };
    });

    // header of table 2-2
    var range = new Range('E' + (r1 + 3), String.fromCharCode(66 + c1 + c2 - 1) + (r1 + 3));
    range.forEachAddress((address: any) => {
      const cell = worksheet1_population.getCell(address);
      cell.style = {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF5B9BD5' },
          bgColor: { argb: 'FF5B9BD5' }
        },
        font: {
          bold: true
        },
        alignment: {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: true
        },
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        }
      };
    });

    //==========    Sample Sheet    =========
    //// By questions
    // For qId[0]
    XLSX.utils.sheet_add_json(worksheet_sample, SampleData[0], { origin: 'A2' });

    // For qId[1]
    XLSX.utils.sheet_add_json(worksheet_sample, SampleData[1], { origin: 'A' + (PopulationData[0].length + 4) });

    // For count
    res = '<table><tr>';
    res += '<th>' + quesList[qId[0]]?.name + '</th>';
    for (let j = 0; j < col; j++) {
      let temp = quesList[qId[1]]?.json[j].name;
      if (quesList[qId[1]]?.json[j].name === '') temp = 'non-response';
      res += '<th>' + temp + '</th>';
    }
    res += '<th>Total</th></tr>';
    for (let i = 0; i < row; i++) {
      let temp = quesList[qId[0]]?.json[i].name;
      if (quesList[qId[0]]?.json[i].name === '') temp = 'non-response';
      let rrr = '<td>' + temp + '</td>';
      for (let j = 0; j < col; j++) {
        rrr += '<td>' + sampleCalcTb2[i][j].toFixed(0) + '</td>';
      }
      rrr += '<td>' + Number(quesList[qId[0]].json[i].count).toFixed(0) + '</td>';
      res += '<tr>' + rrr + '</tr>';
    }
    rrr = '<td>Total</td>';
    for (let j = 0; j < col; j++) {
      rrr += '<td>' + Number(quesList[qId[1]].json[j].count).toFixed(0) + '</td>';
    }
    rrr += '<td>' + SampleSize + '</td>';
    res += '<tr>' + rrr + '</tr>';
    res += '</table>';
    var tableElement_sample = parser_population.parseFromString(res, 'text/html').querySelector('table');
    XLSX.utils.sheet_add_dom(worksheet_sample, tableElement_sample, { origin: 'Z2' });
    XLSX.utils.sheet_add_dom(worksheet_linear, tableElement_sample, {
      origin: String.fromCharCode(66 + quesList[qId[1]]?.json.length + 4) + '3'
    });
    XLSX.utils.sheet_add_dom(worksheet_logistic, tableElement_sample, {
      origin: String.fromCharCode(66 + quesList[qId[1]]?.json.length + 4) + '3'
    });
    XLSX.utils.sheet_add_dom(worksheet_raking, tableElement_sample, {
      origin: String.fromCharCode(66 + quesList[qId[1]]?.json.length + 4) + '2'
    });

    // For percentage
    res = '<table><tr>';
    res += '<th>' + quesList[qId[0]]?.name + '</th>';
    for (let j = 0; j < col; j++) {
      let temp = quesList[qId[1]]?.json[j].name;
      if (quesList[qId[1]]?.json[j].name === '') temp = 'non-response';
      res += '<th>' + temp + '</th>';
    }
    res += '<th>Total</th></tr>';
    for (let i = 0; i < row; i++) {
      let temp = quesList[qId[0]]?.json[i].name;
      if (quesList[qId[0]]?.json[i].name === '') temp = 'non-response';
      let rrr = '<td>' + temp + '</td>';

      for (let j = 0; j < col; j++) {
        rrr += '<td>' + sampleCalcTb1[i][j].toFixed(0) + ' %</td>';
      }
      rrr += '<td>' + ((Number(quesList[qId[0]].json[i].count) / Number(SampleSize)) * 100).toFixed(0) + ' %</td>';
      res += '<tr>' + rrr + '</tr>';
    }
    rrr = '<td>Total</td>';
    for (let j = 0; j < col; j++) {
      rrr += '<td>' + ((Number(quesList[qId[1]].json[j].count) / Number(SampleSize)) * 100).toFixed(0) + ' %</td>';
    }
    rrr += '<td>100 %</td>';
    res += '<tr>' + rrr + '</tr>';
    res += '</table>';
    var tableElement_sample = parser_population.parseFromString(res, 'text/html').querySelector('table');
    XLSX.utils.sheet_add_dom(worksheet_sample, tableElement_sample, { origin: 'Z' + (PopulationData[0].length + 4) });
    XLSX.utils.sheet_add_dom(worksheet_cellweighing, tableElement_sample, {
      origin: String.fromCharCode(66 + quesList[qId[1]]?.json.length + 4) + 2
    });

    XLSX.utils.book_append_sheet(workbook, worksheet_sample, 'Sample');
    resJson = XLSX.utils.sheet_to_json(worksheet_sample);

    // Excel JS
    const worksheet1_sample = workbook1.addWorksheet('Sample');

    var valuesArray = [];
    var refLen = Object.values(resJson[0]).length;
    for (let i = 0; i < resJson.length; i++) {
      let values = Object.values(resJson[i]);

      var valueArr = [];
      var tmpLen = Object.values(resJson[i]).length;

      if (tmpLen < refLen) {
        if (resJson[i].__EMPTY === undefined) {
          for (let j = 0; j < refLen - tmpLen; j++) {
            valueArr.push('');
          }
          valueArr.push('');
          valueArr.push(...values);
        } else {
          const [one, two, three, ...rest] = values;
          valueArr.push(one);
          valueArr.push(two);
          valueArr.push(three);
          valueArr.push('');
          valueArr.push(...rest);
        }
      } else {
        const [one, two, three, ...rest] = values;
        valueArr.push(one);
        valueArr.push(two);
        valueArr.push(three);
        valueArr.push('');
        valueArr.push(...rest);
      }
      valuesArray.push(valueArr);
    }

    var c1 = 3; // bound between table1 and table 2
    var c2 = quesList[qId[1]]?.json.length + 2;
    var r1 = quesList[qId[0]]?.json.length + 3; // bound between table1,2 and table 3

    worksheet1_sample.addRow(['']);
    var k = 0;
    valuesArray.forEach((item: any) => {
      worksheet1_sample.addRow(item);
      k++;
      if (k === r1 - 1) {
        worksheet1_sample.addRow(['']);
        worksheet1_sample.addRow(['']);
      }
    });

    worksheet1_sample.mergeCells("'" + String.fromCharCode(66 + c1) + '1:' + String.fromCharCode(66 + c1 + c2 - 1) + "1'");
    worksheet1_sample.getCell("'" + String.fromCharCode(66 + c1) + "1'").value = 'Sample Population Numbers';

    worksheet1_sample.mergeCells('A1:B1');
    worksheet1_sample.getCell('A1').value = 'Sample Population';
    worksheet1_sample.getCell('C1').value = SampleSize;

    worksheet1_sample.mergeCells(
      "'" + String.fromCharCode(66 + c1) + (r1 + 2) + ':' + String.fromCharCode(66 + c1 + c2 - 1) + (r1 + 2) + "'"
    );
    worksheet1_sample.getCell("'" + String.fromCharCode(66 + c1) + (r1 + 2) + "'").value = 'Sample Population Percentage';

    worksheet1_sample.getRow(1).font = {
      bold: true,
      size: 13
    };
    worksheet1_sample.getRow(1).alignment = {
      horizontal: 'center'
    };

    worksheet1_sample.getCell("'" + String.fromCharCode(66 + c1) + (r1 + 2) + "'").font = {
      bold: true,
      size: 13
    };
    worksheet1_sample.getCell("'" + String.fromCharCode(66 + c1) + (r1 + 2) + "'").alignment = {
      horizontal: 'center'
    };

    //-- border style
    // border of table 1-1
    var range = new Range('A2', 'C' + r1);
    range.forEachAddress((address: any) => {
      const cell = worksheet1_sample.getCell(address);
      cell.style = {
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        },
        alignment: {
          horizontal: 'center'
        }
      };
    });

    // border of table 1-2
    var range = new Range('E2', String.fromCharCode(66 + c1 + c2 - 1) + r1);
    range.forEachAddress((address: any) => {
      const cell = worksheet1_sample.getCell(address);
      cell.style = {
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        },
        alignment: {
          horizontal: 'center'
        }
      };
    });

    // border of table 2-1
    var range = new Range('A' + (r1 + 3), 'C' + (r1 + 2 + c2));
    range.forEachAddress((address: any) => {
      const cell = worksheet1_sample.getCell(address);
      cell.style = {
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        },
        alignment: {
          horizontal: 'center'
        }
      };
    });

    // border of table 2-2
    var range = new Range('E' + (r1 + 3), String.fromCharCode(66 + c1 + c2 - 1) + (r1 + r1 + 1));
    range.forEachAddress((address: any) => {
      const cell = worksheet1_sample.getCell(address);
      cell.style = {
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        },
        alignment: {
          horizontal: 'center'
        },
        numFmt: '0%'
      };
    });

    // header of table 1-1
    var range = new Range('A2', 'C2');
    range.forEachAddress((address: any) => {
      const cell = worksheet1_sample.getCell(address);
      cell.style = {
        font: {
          bold: true
        },
        alignment: {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: true
        },
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        }
      };
    });

    // header of table 1-2
    var range = new Range('E2', String.fromCharCode(66 + c1 + c2 - 1) + '2');
    range.forEachAddress((address: any) => {
      const cell = worksheet1_sample.getCell(address);
      cell.style = {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF5B9BD5' },
          bgColor: { argb: 'FF5B9BD5' }
        },
        font: {
          bold: true
        },
        alignment: {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: true
        },
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        }
      };
    });

    // header of table 2-1
    var range = new Range('A' + (r1 + 3), 'C' + (r1 + 3));
    range.forEachAddress((address: any) => {
      const cell = worksheet1_sample.getCell(address);
      cell.style = {
        font: {
          bold: true
        },
        alignment: {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: true
        },
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        }
      };
    });

    // header of table 2-2
    var range = new Range('E' + (r1 + 3), String.fromCharCode(66 + c1 + c2 - 1) + (r1 + 3));
    range.forEachAddress((address: any) => {
      const cell = worksheet1_sample.getCell(address);
      cell.style = {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF5B9BD5' },
          bgColor: { argb: 'FF5B9BD5' }
        },
        font: {
          bold: true
        },
        alignment: {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: true
        },
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        }
      };
    });

    //==========    Cell Weighting Sheet    =========
    // For vote value
    res = '<table><tr>';
    res += '<th>' + quesList[qId[0]]?.name + '</th>';
    for (let j = 0; j < col; j++) {
      let temp = quesList[qId[1]]?.json[j].name;
      if (quesList[qId[1]]?.json[j].name === '') temp = 'non-response';
      res += '<th>' + temp + '</th>';
    }
    res += '</tr>';
    for (let i = 0; i < row; i++) {
      let temp = quesList[qId[0]]?.json[i].name;
      if (quesList[qId[0]]?.json[i].name === '') temp = 'non-response';
      let rrr = '<td>' + temp + '</td>';
      for (let j = 0; j < col; j++) {
        if (cellWeightTb !== undefined) rrr += '<td>' + cellWeightTb[i][j].toFixed(2) + '</td>';
      }
      res += '<tr>' + rrr + '</tr>';
    }

    res += '</table>';
    var tableElement_population = parser_population.parseFromString(res, 'text/html').querySelector('table');
    XLSX.utils.sheet_add_dom(worksheet_cellweighing, tableElement_population, {
      origin: String.fromCharCode(66 + quesList[qId[1]]?.json.length * 2 + 7) + 2
    });
    XLSX.utils.sheet_add_dom(worksheet_final, tableElement_population, { origin: 'A2' });

    XLSX.utils.book_append_sheet(workbook, worksheet_cellweighing, 'Cell Weighing');
    resJson = XLSX.utils.sheet_to_json(worksheet_cellweighing);

    const worksheet1_cellweighing = workbook1.addWorksheet('Cell Weighing');

    var valuesArray = [];

    for (let i = 0; i < resJson.length; i++) {
      var valueArr = [];
      let values = Object.values(resJson[i]);
      for (let j = 0; j < values.length; j++) {
        valueArr.push(values[j]);
        if (j === quesList[qId[1]].json.length + 1 || j === quesList[qId[1]].json.length * 2 + 3) {
          valueArr.push('');
        }
      }
      // valueArr.push(...values);
      valuesArray.push(valueArr);
    }

    let c1_cw = quesList[qId[1]]?.json.length + 2; // bound between table1 and table 2
    let r1_cw = quesList[qId[0]]?.json.length + 2; // bound between table1,2 and table 3

    worksheet1_cellweighing.addRow(['']);
    var k = 0;
    valuesArray.forEach((item: any) => {
      worksheet1_cellweighing.addRow(item);
      k++;
      // if(k === r1-1) { worksheet1_cellweighing.addRow([""]); worksheet1_cellweighing.addRow([""]); }
    });

    worksheet1_cellweighing.mergeCells("'" + String.fromCharCode(65 + c1_cw * 2 + 2) + '1:' + String.fromCharCode(65 + c1_cw * 3) + "1'");
    worksheet1_cellweighing.getCell("'" + String.fromCharCode(65 + c1_cw * 2 + 2) + "1'").value = 'Vote Value';

    worksheet1_cellweighing.mergeCells("'" + String.fromCharCode(65 + c1_cw + 1) + '1:' + String.fromCharCode(65 + c1_cw * 2) + "1'");
    worksheet1_cellweighing.getCell("'" + String.fromCharCode(65 + c1_cw + 1) + "1'").value = 'Sample';

    worksheet1_cellweighing.mergeCells("'" + String.fromCharCode(65) + '1:' + String.fromCharCode(65 + c1_cw - 1) + "1'");
    worksheet1_cellweighing.getCell("'" + String.fromCharCode(65) + "1'").value = 'Population';

    worksheet1_cellweighing.getRow(1).font = {
      bold: true,
      size: 13
    };

    // header of table 1 ~ 3
    var range = new Range('A2', String.fromCharCode(65 + c1_cw - 1) + '2');
    range.forEachAddress((address: any) => {
      const cell = worksheet1_cellweighing.getCell(address);
      cell.style = {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF5B9BD5' },
          bgColor: { argb: 'FF5B9BD5' }
        },
        font: {
          bold: true
        },
        alignment: {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: true
        },
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        }
      };
    });

    var range = new Range(String.fromCharCode(65 + c1_cw + 1) + '2', String.fromCharCode(65 + c1_cw * 2) + '2');
    range.forEachAddress((address: any) => {
      const cell = worksheet1_cellweighing.getCell(address);
      cell.style = {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF5B9BD5' },
          bgColor: { argb: 'FF5B9BD5' }
        },
        font: {
          bold: true
        },
        alignment: {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: true
        },
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        }
      };
    });

    var range = new Range(String.fromCharCode(65 + c1_cw * 2 + 2) + '2', String.fromCharCode(65 + c1_cw * 3) + '2');
    range.forEachAddress((address: any) => {
      const cell = worksheet1_cellweighing.getCell(address);
      cell.style = {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF5B9BD5' },
          bgColor: { argb: 'FF5B9BD5' }
        },
        font: {
          bold: true
        },
        alignment: {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: true
        },
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        }
      };
    });

    // content of table 1 ~ 3
    var range = new Range('A3', String.fromCharCode(65 + c1_cw - 1) + (r1_cw + 1));
    range.forEachAddress((address: any) => {
      const cell = worksheet1_cellweighing.getCell(address);
      cell.style = {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFDDEBF7' },
          bgColor: { argb: 'FFDDEBF7' }
        },
        font: {
          // bold: true,
        },
        alignment: {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: true
        },
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        },
        numFmt: '0%'
      };
    });

    var range = new Range(String.fromCharCode(65 + c1_cw + 1) + '3', String.fromCharCode(65 + c1_cw * 2) + (r1_cw + 1));
    range.forEachAddress((address: any) => {
      const cell = worksheet1_cellweighing.getCell(address);
      cell.style = {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFDDEBF7' },
          bgColor: { argb: 'FFDDEBF7' }
        },
        font: {
          // bold: true,
        },
        alignment: {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: true
        },
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        },
        numFmt: '0%'
      };
    });

    var range = new Range(String.fromCharCode(65 + c1_cw * 2 + 2) + '3', String.fromCharCode(65 + c1_cw * 3) + r1_cw);
    range.forEachAddress((address: any) => {
      const cell = worksheet1_cellweighing.getCell(address);
      cell.style = {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFDDEBF7' },
          bgColor: { argb: 'FFDDEBF7' }
        },
        font: {
          // bold: true,
        },
        alignment: {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: true
        },
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        }
      };
    });

    //==========    Raking Sheet    =========
    // For Raking vote Table
    res = '<table><tr>';
    res += '<th>' + quesList[qId[0]]?.name + '</th>';
    for (let j = 0; j < col; j++) {
      let temp = quesList[qId[1]]?.json[j].name;
      if (quesList[qId[1]]?.json[j].name === '') temp = 'non-response';
      res += '<th>' + temp + '</th>';
    }
    res += '</tr>';
    for (let i = 0; i < row; i++) {
      let temp = quesList[qId[0]]?.json[i].name;
      if (quesList[qId[0]]?.json[i].name === '') temp = 'non-response';
      let rrr = '<td>' + temp + '</td>';
      for (let j = 0; j < col; j++) {
        rrr += '<td>' + rakingTb[i][j].toFixed(2) + '</td>';
      }
      res += '<tr>' + rrr + '</tr>';
    }

    res += '</table>';
    var tableElement_population = parser_population.parseFromString(res, 'text/html').querySelector('table');
    XLSX.utils.sheet_add_dom(worksheet_raking, tableElement_population, {
      origin: String.fromCharCode(66 + quesList[qId[1]]?.json.length * 2 + 6) + '2'
    });
    XLSX.utils.sheet_add_dom(worksheet_final, tableElement_population, {
      origin: String.fromCharCode(66 + quesList[qId[1]]?.json.length + 4) + '2'
    });

    // For rr1
    res = '<table><tr>';
    res += '<th>' + quesList[qId[0]]?.name + '</th>';
    for (let j = 0; j < col; j++) {
      let temp = quesList[qId[1]]?.json[j].name;
      if (quesList[qId[1]]?.json[j].name === '') temp = 'non-response';
      res += '<th>' + temp + '</th>';
    }
    res += '<th>Total</th></tr>';
    let cs: number[] = Array(col);
    for (let i = 0; i < col; i++) {
      cs[i] = 0;
    }
    for (let i = 0; i < row; i++) {
      let temp = quesList[qId[0]]?.json[i].name;
      if (quesList[qId[0]]?.json[i].name === '') temp = 'non-response';
      let rrr = '<td>' + temp + '</td>';
      let rs = 0;
      for (let j = 0; j < col; j++) {
        if (rakinglist[1] !== undefined) {
          rrr += '<td>' + rakinglist[0].arr2d[i][j].toFixed(2) + '</td>';
          rs += rakinglist[0].arr2d[i][j];
          cs[j] += rakinglist[0].arr2d[i][j];
        }
      }
      rrr += '<td>' + Number(rs).toFixed(2) + '</td>';
      res += '<tr>' + rrr + '</tr>';
    }
    rrr = '<td>Total</td>';
    for (let j = 0; j < col; j++) {
      rrr += '<td>' + Number(cs[j]).toFixed(0) + '</td>';
    }
    rrr += '<td>100 %</td>';
    res += '<tr>' + rrr + '</tr>';
    res += '</table>';
    var tableElement_sample = parser_population.parseFromString(res, 'text/html').querySelector('table');
    XLSX.utils.sheet_add_dom(worksheet_raking, tableElement_sample, { origin: 'A' + (quesList[qId[0]]?.json.length + 6) });

    // For rr2
    res = '<table><tr>';
    res += '<th>' + quesList[qId[0]]?.name + '</th>';
    for (let j = 0; j < col; j++) {
      let temp = quesList[qId[1]]?.json[j].name;
      if (quesList[qId[1]]?.json[j].name === '') temp = 'non-response';
      res += '<th>' + temp + '</th>';
    }
    res += '<th>Total</th></tr>';
    //  let cs: number[] = Array(col);
    for (let i = 0; i < col; i++) {
      cs[i] = 0;
    }
    for (let i = 0; i < row; i++) {
      let temp = quesList[qId[0]]?.json[i].name;
      if (quesList[qId[0]]?.json[i].name === '') temp = 'non-response';
      let rrr = '<td>' + temp + '</td>';
      let rs = 0;
      for (let j = 0; j < col; j++) {
        if (rakinglist[1] !== undefined) {
          rrr += '<td>' + rakinglist[1].arr2d[i][j].toFixed(2) + '</td>';
          rs += rakinglist[1].arr2d[i][j];
          cs[j] += rakinglist[1].arr2d[i][j];
        }
      }
      rrr += '<td>' + Number(rs).toFixed(2) + '</td>';
      res += '<tr>' + rrr + '</tr>';
    }
    rrr = '<td>Total</td>';
    for (let j = 0; j < col; j++) {
      rrr += '<td>' + Number(cs[j]).toFixed(0) + '</td>';
    }
    rrr += '<td>100 %</td>';
    res += '<tr>' + rrr + '</tr>';
    res += '</table>';
    var tableElement_sample = parser_population.parseFromString(res, 'text/html').querySelector('table');
    XLSX.utils.sheet_add_dom(worksheet_raking, tableElement_sample, { origin: 'Z' + (quesList[qId[0]]?.json.length + 6) });

    XLSX.utils.book_append_sheet(workbook, worksheet_raking, 'Raking');
    resJson = XLSX.utils.sheet_to_json(worksheet_raking);

    const worksheet1_raking = workbook1.addWorksheet('Raking');

    var valuesArray = [];

    for (let i = 0; i < resJson.length; i++) {
      var valueArr = [];
      let values = Object.values(resJson[i]);
      for (let j = 0; j < values.length; j++) {
        valueArr.push(values[j]);
        if (
          (j === quesList[qId[1]].json.length + 1 || j === quesList[qId[1]].json.length * 2 + 3) &&
          i < quesList[qId[0]].json.length + 2
        ) {
          valueArr.push('');
        }
        if (j === quesList[qId[1]].json.length + 1 && i >= quesList[qId[0]].json.length + 2) {
          valueArr.push('');
        }
      }
      if (i === quesList[qId[0]].json.length + 2 || i === quesList[qId[0]].json.length * 2 + 4) {
        valuesArray.push('');
        valuesArray.push('');
      }
      // valueArr.push(...values);
      valuesArray.push(valueArr);
    }

    c1 = quesList[qId[1]]?.json.length + 2;
    r1 = quesList[qId[0]]?.json.length + 2;

    worksheet1_raking.addRow(['']);
    var k = 0;
    valuesArray.forEach((item: any) => {
      worksheet1_raking.addRow(item);
      k++;
    });

    worksheet1_raking.mergeCells("'" + String.fromCharCode(66 + c1 * 2 + 1) + '1:' + String.fromCharCode(66 + c1 * 3 - 1) + "1'");
    worksheet1_raking.getCell("'" + String.fromCharCode(66 + c1 * 2 + 1) + "1'").value = 'Raked Sample population';

    worksheet1_raking.mergeCells("'" + String.fromCharCode(66 + c1) + '1:' + String.fromCharCode(66 + c1 + c1 - 1) + "1'");
    worksheet1_raking.getCell("'" + String.fromCharCode(66 + c1) + "1'").value = 'Step 2                Sample';

    worksheet1_raking.mergeCells("'A1:" + String.fromCharCode(66 + c1 - 2) + "1'");
    worksheet1_raking.getCell('A1').value = 'Step 1                Population';

    worksheet1_raking.mergeCells(
      "'" + String.fromCharCode(66 + c1) + (r1 + 3) + ':' + String.fromCharCode(66 + c1 + c1 - 1) + (r1 + 3) + "'"
    );
    worksheet1_raking.getCell("'" + String.fromCharCode(66 + c1) + (r1 + 3) + "'").value = 'Step 4     ';

    worksheet1_raking.mergeCells("'A" + (r1 + 3) + ':' + String.fromCharCode(66 + c1 - 2) + (r1 + 3) + "'");
    worksheet1_raking.getCell('A' + (r1 + 3)).value = 'Step 3       ';

    worksheet1_raking.getRow(1).font = {
      bold: true,
      size: 13
    };
    worksheet1_raking.getRow(2).font = {
      bold: true,
      size: 12
    };
    worksheet1_raking.getRow(r1 + 3).font = {
      bold: true,
      size: 13
    };

    // header and content of table 1-1
    var range = new Range('A2', String.fromCharCode(66 + c1 - 2) + '2');
    range.forEachAddress((address: any) => {
      const cell = worksheet1_raking.getCell(address);
      cell.style = {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF5B9BD5' },
          bgColor: { argb: 'FF5B9BD5' }
        },
        font: {
          bold: true
        },
        alignment: {
          horizontal: 'center',
          vertical: 'middle'
          // wrapText:true
        },
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        }
      };
    });

    var range = new Range('A3', String.fromCharCode(66 + c1 - 2) + (r1 + 1));
    range.forEachAddress((address: any) => {
      const cell = worksheet1_raking.getCell(address);
      cell.style = {
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        },
        alignment: {
          horizontal: 'center'
        }
      };
    });

    // header and content of table 1-2
    var range = new Range(String.fromCharCode(66 + c1) + '2', String.fromCharCode(66 + c1 + c1 - 1) + '2');
    range.forEachAddress((address: any) => {
      const cell = worksheet1_raking.getCell(address);
      cell.style = {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF5B9BD5' },
          bgColor: { argb: 'FF5B9BD5' }
        },
        font: {
          bold: true
        },
        alignment: {
          horizontal: 'center',
          vertical: 'middle'
          // wrapText:true
        },
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        }
      };
    });

    var range = new Range(String.fromCharCode(66 + c1) + '3', String.fromCharCode(66 + c1 + c1 - 1) + (r1 + 1));
    range.forEachAddress((address: any) => {
      const cell = worksheet1_raking.getCell(address);
      cell.style = {
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        },
        alignment: {
          horizontal: 'center'
        }
      };
    });

    // header and content of table 1-3
    var range = new Range(String.fromCharCode(66 + c1 * 2 + 1) + '2', String.fromCharCode(66 + c1 * 3 - 1) + '2');
    range.forEachAddress((address: any) => {
      const cell = worksheet1_raking.getCell(address);
      cell.style = {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF5B9BD5' },
          bgColor: { argb: 'FF5B9BD5' }
        },
        font: {
          bold: true
        },
        alignment: {
          horizontal: 'center',
          vertical: 'middle'
          // wrapText:true
        },
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        }
      };
    });

    var range = new Range(String.fromCharCode(66 + c1 * 2 + 1) + '3', String.fromCharCode(66 + c1 * 3 - 1) + r1);
    range.forEachAddress((address: any) => {
      const cell = worksheet1_raking.getCell(address);
      cell.style = {
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        },
        alignment: {
          horizontal: 'center'
        }
      };
    });

    // header and content of table 2-1
    var range = new Range('A' + (r1 + 4), String.fromCharCode(66 + c1 - 2) + (r1 + 5));
    range.forEachAddress((address: any) => {
      const cell = worksheet1_raking.getCell(address);
      cell.style = {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF5B9BD5' },
          bgColor: { argb: 'FF5B9BD5' }
        },
        font: {
          bold: true
        },
        alignment: {
          horizontal: 'center',
          vertical: 'middle'
          // wrapText:true
        },
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        }
      };
    });

    var range = new Range('A' + (r1 + 5), String.fromCharCode(66 + c1 - 2) + (r1 * 2 + 3));
    range.forEachAddress((address: any) => {
      const cell = worksheet1_raking.getCell(address);
      cell.style = {
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        },
        alignment: {
          horizontal: 'center'
        }
      };
    });

    // header and content of table 2-2
    var range = new Range(String.fromCharCode(66 + c1) + (r1 + 4), String.fromCharCode(66 + c1 + c1 - 1) + (r1 + 5));
    range.forEachAddress((address: any) => {
      const cell = worksheet1_raking.getCell(address);
      cell.style = {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF5B9BD5' },
          bgColor: { argb: 'FF5B9BD5' }
        },
        font: {
          bold: true
        },
        alignment: {
          horizontal: 'center',
          vertical: 'middle'
          // wrapText:true
        },
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        }
      };
    });

    var range = new Range(String.fromCharCode(66 + c1) + (r1 + 5), String.fromCharCode(66 + c1 + c1 - 1) + (r1 * 2 + 3));
    range.forEachAddress((address: any) => {
      const cell = worksheet1_raking.getCell(address);
      cell.style = {
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        },
        alignment: {
          horizontal: 'center'
        }
      };
    });

    //==========    Linear Regression Sheet   =========
    // For (Pi-P̅)(Si-S̅)  : Numerator
    res = '<table><tr>';
    res += '<th>' + quesList[qId[0]]?.name + '</th>';
    for (let j = 0; j < col; j++) {
      let temp = quesList[qId[1]]?.json[j].name;
      if (quesList[qId[1]]?.json[j].name === '') temp = 'non-response';
      res += '<th>' + temp + '</th>';
    }
    res += '</tr>';
    for (let i = 0; i < row; i++) {
      let temp = quesList[qId[0]]?.json[i].name;
      if (quesList[qId[0]]?.json[i].name === '') temp = 'non-response';
      let rrr = '<td>' + temp + '</td>';
      for (let j = 0; j < col; j++) {
        if (numeratorTb !== undefined) rrr += '<td>' + numeratorTb[i][j].toFixed(2) + '</td>';
      }
      res += '<tr>' + rrr + '</tr>';
    }

    res += '</table>';
    var tableElement_population = parser_population.parseFromString(res, 'text/html').querySelector('table');
    XLSX.utils.sheet_add_dom(worksheet_linear, tableElement_population, { origin: 'A' + (margin + 1) });
    XLSX.utils.sheet_add_dom(worksheet_logistic, tableElement_population, { origin: 'A' + (margin + 1) });

    // For (Pi-P̅)(Pi-P̅)  : Denominator
    res = '<table><tr>';
    res += '<th>' + quesList[qId[0]]?.name + '</th>';
    for (let j = 0; j < col; j++) {
      let temp = quesList[qId[1]]?.json[j].name;
      if (quesList[qId[1]]?.json[j].name === '') temp = 'non-response';
      res += '<th>' + temp + '</th>';
    }
    res += '</tr>';
    for (let i = 0; i < row; i++) {
      let temp = quesList[qId[0]]?.json[i].name;
      if (quesList[qId[0]]?.json[i].name === '') temp = 'non-response';
      let rrr = '<td>' + temp + '</td>';
      for (let j = 0; j < col; j++) {
        if (denominatorTb !== undefined) rrr += '<td>' + denominatorTb[i][j].toFixed(2) + '</td>';
      }
      res += '<tr>' + rrr + '</tr>';
    }

    res += '</table>';
    var tableElement_population = parser_population.parseFromString(res, 'text/html').querySelector('table');
    XLSX.utils.sheet_add_dom(worksheet_linear, tableElement_population, {
      origin: String.fromCharCode(66 + quesList[qId[1]]?.json.length + 4) + (margin + 1)
    });
    XLSX.utils.sheet_add_dom(worksheet_logistic, tableElement_population, {
      origin: String.fromCharCode(66 + quesList[qId[1]]?.json.length + 4) + (margin + 1)
    });

    // For linear Calculation Table
    res = '<table><tr>';
    res += '<th>' + quesList[qId[0]]?.name + '</th>';
    for (let j = 0; j < col; j++) {
      let temp = quesList[qId[1]]?.json[j].name;
      if (quesList[qId[1]]?.json[j].name === '') temp = 'non-response';
      res += '<th>' + temp + '</th>';
    }
    res += '</tr>';
    for (let i = 0; i < row; i++) {
      let temp = quesList[qId[0]]?.json[i].name;
      if (quesList[qId[0]]?.json[i].name === '') temp = 'non-response';
      let rrr = '<td>' + temp + '</td>';
      for (let j = 0; j < col; j++) {
        rrr += '<td>' + linearRegressionTb[i][j].toFixed(2) + '</td>';
      }
      res += '<tr>' + rrr + '</tr>';
    }

    res += '</table>';
    var tableElement_population = parser_population.parseFromString(res, 'text/html').querySelector('table');
    XLSX.utils.sheet_add_dom(worksheet_linear, tableElement_population, { origin: 'A' + (margin * 2 + 2) });

    // For linear Regression Table
    res = '<table><tr>';
    res += '<th>' + quesList[qId[0]]?.name + '</th>';
    for (let j = 0; j < col; j++) {
      let temp = quesList[qId[1]]?.json[j].name;
      if (quesList[qId[1]]?.json[j].name === '') temp = 'non-response';
      res += '<th>' + temp + '</th>';
    }
    res += '</tr>';
    for (let i = 0; i < row; i++) {
      let temp = quesList[qId[0]]?.json[i].name;
      if (quesList[qId[0]]?.json[i].name === '') temp = 'non-response';
      let rrr = '<td>' + temp + '</td>';
      for (let j = 0; j < col; j++) {
        if (linearRegressionTb !== undefined) rrr += '<td>' + linearRegressionTb[i][j].toFixed(2) + '</td>';
      }
      res += '<tr>' + rrr + '</tr>';
    }

    res += '</table>';
    var tableElement_population = parser_population.parseFromString(res, 'text/html').querySelector('table');
    XLSX.utils.sheet_add_dom(worksheet_linear, tableElement_population, {
      origin: String.fromCharCode(66 + quesList[qId[1]]?.json.length + 4) + (margin * 2 + 2)
    });
    XLSX.utils.sheet_add_dom(worksheet_final, tableElement_population, { origin: 'A' + (margin * 2 + 2) });

    XLSX.utils.book_append_sheet(workbook, worksheet_linear, 'Linear Regression');
    resJson = XLSX.utils.sheet_to_json(worksheet_linear);

    const worksheet1_linear = workbook1.addWorksheet('Linear Regression');

    var valuesArray = [];

    for (let i = 0; i < resJson.length; i++) {
      var valueArr = [];
      let values = Object.values(resJson[i]);
      for (let j = 0; j < values.length; j++) {
        valueArr.push(values[j]);
        if (j === quesList[qId[1]].json.length + 1 && i < quesList[qId[0]].json.length + 2) {
          valueArr.push('');
        }
        if (j === quesList[qId[1]].json.length && i >= quesList[qId[0]].json.length + 2) {
          valueArr.push('');
        }
      }
      if (i === quesList[qId[0]].json.length + 2 || i === quesList[qId[0]].json.length * 2 + 3) {
        valuesArray.push('');
        valuesArray.push('');
      }
      // valueArr.push(...values);
      valuesArray.push(valueArr);
    }

    c1 = quesList[qId[1]]?.json.length + 2;
    r1 = quesList[qId[0]]?.json.length + 2;

    worksheet1_linear.addRow(['']);
    worksheet1_linear.addRow(['']);
    var k = 0;
    valuesArray.forEach((item: any) => {
      worksheet1_linear.addRow(item);
      k++;
    });

    worksheet1_linear.mergeCells("'" + String.fromCharCode(66 + c1) + '1:' + String.fromCharCode(66 + c1 + c1 - 1) + "1'");
    worksheet1_linear.getCell("'" + String.fromCharCode(66 + c1) + "1'").value =
      'Step 2                Mean S̅ :  ' + (Number(SampleSize) / row / col).toFixed(2);

    worksheet1_linear.mergeCells("'A1:" + String.fromCharCode(66 + c1 - 2) + "1'");
    worksheet1_linear.getCell('A1').value = 'Step 1                Mean P̅ :  ' + (Number(PopulationSize) / row / col).toFixed(2);

    worksheet1_linear.mergeCells("'" + String.fromCharCode(66 + c1) + '2:' + String.fromCharCode(66 + c1 + c1 - 1) + "2'");
    worksheet1_linear.getCell("'" + String.fromCharCode(66 + c1) + "2'").value = 'Sample Population';

    worksheet1_linear.mergeCells("'A2:" + String.fromCharCode(66 + c1 - 2) + "2'");
    worksheet1_linear.getCell('A2').value = 'Population';

    worksheet1_linear.mergeCells(
      "'" + String.fromCharCode(66 + c1 - 1) + (r1 + 4) + ':' + String.fromCharCode(66 + c1 + c1 - 3) + (r1 + 4) + "'"
    );
    worksheet1_linear.getCell("'" + String.fromCharCode(66 + c1 - 1) + (r1 + 4) + "'").value = 'Step 4     (Pi-P̅)(Pi-P̅)';

    worksheet1_linear.mergeCells("'A" + (r1 + 4) + ':' + String.fromCharCode(66 + c1 - 3) + (r1 + 4) + "'");
    worksheet1_linear.getCell('A' + (r1 + 4)).value = 'Step 3       (Pi-P̅)(Si-S̅)';

    worksheet1_linear.mergeCells(
      "'" + String.fromCharCode(66 + c1 + c1 - 1) + (r1 + 4) + ':' + String.fromCharCode(66 + c1 + c1) + (r1 + 4) + "'"
    );
    worksheet1_linear.getCell("'" + String.fromCharCode(66 + c1 + c1 - 1) + (r1 + 4) + "'").value = 'Step 5';
    worksheet1_linear.getCell("'" + String.fromCharCode(66 + c1 + c1 - 1) + (r1 + 5) + "'").value = 'B1';
    worksheet1_linear.getCell("'" + String.fromCharCode(66 + c1 + c1) + (r1 + 5) + "'").value = B1;

    worksheet1_linear.getCell(String.fromCharCode(66 + c1 + c1 - 1) + (r1 + 5)).style = {
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF5B9BD5' },
        bgColor: { argb: 'FF5B9BD5' }
      },
      font: {
        bold: true
      },
      border: {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      },
      alignment: {
        horizontal: 'center'
      }
    };
    worksheet1_linear.getCell("'" + String.fromCharCode(66 + c1 + c1) + (r1 + 5) + "'").style = {
      border: {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      }
    };

    worksheet1_linear.mergeCells(
      "'" + String.fromCharCode(66 + c1 + c1 - 1) + (r1 + 7) + ':' + String.fromCharCode(66 + c1 + c1) + (r1 + 7) + "'"
    );
    worksheet1_linear.getCell("'" + String.fromCharCode(66 + c1 + c1 - 1) + (r1 + 7) + "'").value = 'Step 6';
    worksheet1_linear.getCell("'" + String.fromCharCode(66 + c1 + c1 - 1) + (r1 + 8) + "'").value = 'B0';
    worksheet1_linear.getCell("'" + String.fromCharCode(66 + c1 + c1) + (r1 + 8) + "'").value = B0;

    worksheet1_linear.getCell(String.fromCharCode(66 + c1 + c1 - 1) + (r1 + 8)).style = {
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF5B9BD5' },
        bgColor: { argb: 'FF5B9BD5' }
      },
      font: {
        bold: true
      },
      border: {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      },
      alignment: {
        horizontal: 'center'
      }
    };
    worksheet1_linear.getCell("'" + String.fromCharCode(66 + c1 + c1) + (r1 + 8) + "'").style = {
      border: {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      }
    };

    worksheet1_linear.mergeCells(
      "'" + String.fromCharCode(66 + c1 - 1) + (r1 * 2 + 5) + ':' + String.fromCharCode(66 + c1 + c1 - 3) + (r1 * 2 + 5) + "'"
    );
    worksheet1_linear.getCell("'" + String.fromCharCode(66 + c1 - 1) + (r1 * 2 + 5) + "'").value =
      "Step 8   Calculate weights which is a ratio of sample unadjusted value and the population's linearly adjusted value";

    worksheet1_linear.mergeCells("'A" + (r1 * 2 + 5) + ':' + String.fromCharCode(66 + c1 - 3) + (r1 * 2 + 5) + "'");
    worksheet1_linear.getCell('A' + (r1 * 2 + 5)).value = 'Step 7   Calculate sample linear regression value by putting in the equation';

    worksheet1_linear.getRow(1).font = {
      bold: true,
      size: 13
    };
    worksheet1_linear.getRow(2).font = {
      bold: true,
      size: 12
    };
    worksheet1_linear.getRow(r1 + 4).font = {
      bold: true,
      size: 13
    };
    worksheet1_linear.getCell(String.fromCharCode(66 + c1 + c1 - 1) + (r1 + 7)).font = {
      bold: true,
      size: 13
    };
    worksheet1_linear.getRow(r1 * 2 + 5).font = {
      bold: true,
      size: 13
    };

    // header and content of table 1-1
    var range = new Range('A3', String.fromCharCode(66 + c1 - 2) + '3');
    range.forEachAddress((address: any) => {
      const cell = worksheet1_linear.getCell(address);
      cell.style = {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF5B9BD5' },
          bgColor: { argb: 'FF5B9BD5' }
        },
        font: {
          bold: true
        },
        alignment: {
          horizontal: 'center',
          vertical: 'middle'
          // wrapText:true
        },
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        }
      };
    });

    var range = new Range('A4', String.fromCharCode(66 + c1 - 2) + (r1 + 2));
    range.forEachAddress((address: any) => {
      const cell = worksheet1_linear.getCell(address);
      cell.style = {
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        },
        alignment: {
          horizontal: 'center'
        }
      };
    });

    // header and content of table 1-2
    var range = new Range(String.fromCharCode(66 + c1) + '3', String.fromCharCode(66 + c1 + c1 - 1) + '3');
    range.forEachAddress((address: any) => {
      const cell = worksheet1_linear.getCell(address);
      cell.style = {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF5B9BD5' },
          bgColor: { argb: 'FF5B9BD5' }
        },
        font: {
          bold: true
        },
        alignment: {
          horizontal: 'center',
          vertical: 'middle'
          // wrapText:true
        },
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        }
      };
    });

    var range = new Range(String.fromCharCode(66 + c1) + '4', String.fromCharCode(66 + c1 + c1 - 1) + (r1 + 2));
    range.forEachAddress((address: any) => {
      const cell = worksheet1_linear.getCell(address);
      cell.style = {
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        },
        alignment: {
          horizontal: 'center'
        }
      };
    });

    // header and content of table 2-1
    var range = new Range('A' + (r1 + 5), String.fromCharCode(66 + c1 - 3) + (r1 + 5));
    range.forEachAddress((address: any) => {
      const cell = worksheet1_linear.getCell(address);
      cell.style = {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF5B9BD5' },
          bgColor: { argb: 'FF5B9BD5' }
        },
        font: {
          bold: true
        },
        alignment: {
          horizontal: 'center',
          vertical: 'middle'
          // wrapText:true
        },
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        }
      };
    });

    var range = new Range('A' + (r1 + 6), String.fromCharCode(66 + c1 - 3) + (r1 * 2 + 3));
    range.forEachAddress((address: any) => {
      const cell = worksheet1_linear.getCell(address);
      cell.style = {
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        },
        alignment: {
          horizontal: 'center'
        }
      };
    });

    // header and content of table 2-2
    var range = new Range(String.fromCharCode(66 + c1 - 1) + (r1 + 5), String.fromCharCode(66 + c1 + c1 - 3) + (r1 + 5));
    range.forEachAddress((address: any) => {
      const cell = worksheet1_linear.getCell(address);
      cell.style = {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF5B9BD5' },
          bgColor: { argb: 'FF5B9BD5' }
        },
        font: {
          bold: true
        },
        alignment: {
          horizontal: 'center',
          vertical: 'middle'
          // wrapText:true
        },
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        }
      };
    });

    var range = new Range(String.fromCharCode(66 + c1 - 1) + (r1 + 6), String.fromCharCode(66 + c1 + c1 - 3) + (r1 * 2 + 3));
    range.forEachAddress((address: any) => {
      const cell = worksheet1_linear.getCell(address);
      cell.style = {
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        },
        alignment: {
          horizontal: 'center'
        }
      };
    });

    // header and content of table 3-1
    var range = new Range('A' + (r1 * 2 + 6), String.fromCharCode(66 + c1 - 3) + (r1 * 2 + 6));
    range.forEachAddress((address: any) => {
      const cell = worksheet1_linear.getCell(address);
      cell.style = {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF5B9BD5' },
          bgColor: { argb: 'FF5B9BD5' }
        },
        font: {
          bold: true
        },
        alignment: {
          horizontal: 'center',
          vertical: 'middle'
          // wrapText:true
        },
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        }
      };
    });

    var range = new Range('A' + (r1 * 2 + 7), String.fromCharCode(66 + c1 - 3) + (r1 * 3 + 4));
    range.forEachAddress((address: any) => {
      const cell = worksheet1_linear.getCell(address);
      cell.style = {
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        },
        alignment: {
          horizontal: 'center'
        }
      };
    });

    // header and content of table 3-2
    var range = new Range(String.fromCharCode(66 + c1 - 1) + (r1 * 2 + 6), String.fromCharCode(66 + c1 + c1 - 3) + (r1 * 2 + 6));
    range.forEachAddress((address: any) => {
      const cell = worksheet1_linear.getCell(address);
      cell.style = {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF5B9BD5' },
          bgColor: { argb: 'FF5B9BD5' }
        },
        font: {
          bold: true
        },
        alignment: {
          horizontal: 'center',
          vertical: 'middle'
          // wrapText:true
        },
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        }
      };
    });

    var range = new Range(String.fromCharCode(66 + c1 - 1) + (r1 * 2 + 7), String.fromCharCode(66 + c1 + c1 - 3) + (r1 * 3 + 4));
    range.forEachAddress((address: any) => {
      const cell = worksheet1_linear.getCell(address);
      cell.style = {
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        },
        alignment: {
          horizontal: 'center'
        }
      };
    });

    //==========    Logistic Regression Sheet    =========
    // For logistic Calculation Table
    res = '<table><tr>';
    res += '<th>' + quesList[qId[0]]?.name + '</th>';
    for (let j = 0; j < col; j++) {
      let temp = quesList[qId[1]]?.json[j].name;
      if (quesList[qId[1]]?.json[j].name === '') temp = 'non-response';
      res += '<th>' + temp + '</th>';
    }
    res += '</tr>';
    for (let i = 0; i < row; i++) {
      let temp = quesList[qId[0]]?.json[i].name;
      if (quesList[qId[0]]?.json[i].name === '') temp = 'non-response';
      let rrr = '<td>' + temp + '</td>';
      for (let j = 0; j < col; j++) {
        rrr += '<td>' + logisticRegressionTb[i][j].toFixed(2) + '</td>';
      }
      res += '<tr>' + rrr + '</tr>';
    }

    res += '</table>';
    var tableElement_population = parser_population.parseFromString(res, 'text/html').querySelector('table');
    XLSX.utils.sheet_add_dom(worksheet_logistic, tableElement_population, { origin: 'A' + (margin * 2 + 2) });

    // For logistic Regression Table
    res = '<table><tr>';
    res += '<th>' + quesList[qId[0]]?.name + '</th>';
    for (let j = 0; j < col; j++) {
      let temp = quesList[qId[1]]?.json[j].name;
      if (quesList[qId[1]]?.json[j].name === '') temp = 'non-response';
      res += '<th>' + temp + '</th>';
    }
    res += '</tr>';
    for (let i = 0; i < row; i++) {
      let temp = quesList[qId[0]]?.json[i].name;
      if (quesList[qId[0]]?.json[i].name === '') temp = 'non-response';
      let rrr = '<td>' + temp + '</td>';
      for (let j = 0; j < col; j++) {
        if (logisticRegressionTb !== undefined) rrr += '<td>' + logisticRegressionTb[i][j].toFixed(2) + '</td>';
      }
      res += '<tr>' + rrr + '</tr>';
    }

    res += '</table>';
    var tableElement_population = parser_population.parseFromString(res, 'text/html').querySelector('table');
    XLSX.utils.sheet_add_dom(worksheet_logistic, tableElement_population, {
      origin: String.fromCharCode(66 + quesList[qId[1]]?.json.length + 4) + (margin * 2 + 2)
    });
    XLSX.utils.sheet_add_dom(worksheet_final, tableElement_population, {
      origin: String.fromCharCode(66 + quesList[qId[1]]?.json.length + 4) + (margin * 2 + 2)
    });

    XLSX.utils.book_append_sheet(workbook, worksheet_logistic, 'Logistic Regression');
    resJson = XLSX.utils.sheet_to_json(worksheet_logistic);

    const worksheet1_logistic = workbook1.addWorksheet('Logistic Regression');

    var valuesArray = [];

    for (let i = 0; i < resJson.length; i++) {
      var valueArr = [];
      let values = Object.values(resJson[i]);
      for (let j = 0; j < values.length; j++) {
        valueArr.push(values[j]);
        if (j === quesList[qId[1]].json.length + 1 && i < quesList[qId[0]].json.length + 2) {
          valueArr.push('');
        }
        if (j === quesList[qId[1]].json.length && i >= quesList[qId[0]].json.length + 2) {
          valueArr.push('');
        }
      }
      if (i === quesList[qId[0]].json.length + 2 || i === quesList[qId[0]].json.length * 2 + 3) {
        valuesArray.push('');
        valuesArray.push('');
      }
      // valueArr.push(...values);
      valuesArray.push(valueArr);
    }

    c1 = quesList[qId[1]]?.json.length + 2;
    r1 = quesList[qId[0]]?.json.length + 2;

    worksheet1_logistic.addRow(['']);
    worksheet1_logistic.addRow(['']);
    var k = 0;
    valuesArray.forEach((item: any) => {
      worksheet1_logistic.addRow(item);
      k++;
    });

    worksheet1_logistic.mergeCells("'" + String.fromCharCode(66 + c1) + '1:' + String.fromCharCode(66 + c1 + c1 - 1) + "1'");
    worksheet1_logistic.getCell("'" + String.fromCharCode(66 + c1) + "1'").value =
      'Step 2                Mean S̅ :  ' + (Number(SampleSize) / row / col).toFixed(2);

    worksheet1_logistic.mergeCells("'A1:" + String.fromCharCode(66 + c1 - 2) + "1'");
    worksheet1_logistic.getCell('A1').value = 'Step 1                Mean P̅ :  ' + (Number(PopulationSize) / row / col).toFixed(2);

    worksheet1_logistic.mergeCells("'" + String.fromCharCode(66 + c1) + '2:' + String.fromCharCode(66 + c1 + c1 - 1) + "2'");
    worksheet1_logistic.getCell("'" + String.fromCharCode(66 + c1) + "2'").value = 'Sample Population';

    worksheet1_logistic.mergeCells("'A2:" + String.fromCharCode(66 + c1 - 2) + "2'");
    worksheet1_logistic.getCell('A2').value = 'Population';

    worksheet1_logistic.mergeCells(
      "'" + String.fromCharCode(66 + c1 - 1) + (r1 + 4) + ':' + String.fromCharCode(66 + c1 + c1 - 3) + (r1 + 4) + "'"
    );
    worksheet1_logistic.getCell("'" + String.fromCharCode(66 + c1 - 1) + (r1 + 4) + "'").value = 'Step 4     (Pi-P̅)(Pi-P̅)';

    worksheet1_logistic.mergeCells("'A" + (r1 + 4) + ':' + String.fromCharCode(66 + c1 - 3) + (r1 + 4) + "'");
    worksheet1_logistic.getCell('A' + (r1 + 4)).value = 'Step 3       (Pi-P̅)(Si-S̅)';

    worksheet1_logistic.mergeCells(
      "'" + String.fromCharCode(66 + c1 + c1 - 1) + (r1 + 4) + ':' + String.fromCharCode(66 + c1 + c1) + (r1 + 4) + "'"
    );
    worksheet1_logistic.getCell("'" + String.fromCharCode(66 + c1 + c1 - 1) + (r1 + 4) + "'").value = 'Step 5';
    worksheet1_logistic.getCell("'" + String.fromCharCode(66 + c1 + c1 - 1) + (r1 + 5) + "'").value = 'B1';
    worksheet1_logistic.getCell("'" + String.fromCharCode(66 + c1 + c1) + (r1 + 5) + "'").value = B1;

    worksheet1_logistic.getCell(String.fromCharCode(66 + c1 + c1 - 1) + (r1 + 5)).style = {
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF5B9BD5' },
        bgColor: { argb: 'FF5B9BD5' }
      },
      font: {
        bold: true
      },
      border: {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      },
      alignment: {
        horizontal: 'center'
      }
    };
    worksheet1_logistic.getCell("'" + String.fromCharCode(66 + c1 + c1) + (r1 + 5) + "'").style = {
      border: {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      }
    };

    worksheet1_logistic.mergeCells(
      "'" + String.fromCharCode(66 + c1 + c1 - 1) + (r1 + 7) + ':' + String.fromCharCode(66 + c1 + c1) + (r1 + 7) + "'"
    );
    worksheet1_logistic.getCell("'" + String.fromCharCode(66 + c1 + c1 - 1) + (r1 + 7) + "'").value = 'Step 6';
    worksheet1_logistic.getCell("'" + String.fromCharCode(66 + c1 + c1 - 1) + (r1 + 8) + "'").value = 'B0';
    worksheet1_logistic.getCell("'" + String.fromCharCode(66 + c1 + c1) + (r1 + 8) + "'").value = B0;

    worksheet1_logistic.getCell(String.fromCharCode(66 + c1 + c1 - 1) + (r1 + 8)).style = {
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF5B9BD5' },
        bgColor: { argb: 'FF5B9BD5' }
      },
      font: {
        bold: true
      },
      border: {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      },
      alignment: {
        horizontal: 'center'
      }
    };
    worksheet1_logistic.getCell("'" + String.fromCharCode(66 + c1 + c1) + (r1 + 8) + "'").style = {
      border: {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      }
    };

    worksheet1_logistic.mergeCells(
      "'" + String.fromCharCode(66 + c1 - 1) + (r1 * 2 + 5) + ':' + String.fromCharCode(66 + c1 + c1 - 3) + (r1 * 2 + 5) + "'"
    );
    worksheet1_logistic.getCell("'" + String.fromCharCode(66 + c1 - 1) + (r1 * 2 + 5) + "'").value =
      "Step 8   Calculate weights which is a ratio of sample unadjusted value and the population's linearly adjusted value";

    worksheet1_logistic.mergeCells("'A" + (r1 * 2 + 5) + ':' + String.fromCharCode(66 + c1 - 3) + (r1 * 2 + 5) + "'");
    worksheet1_logistic.getCell('A' + (r1 * 2 + 5)).value = 'Step 7   Calculate sample linear regression value by putting in the equation';

    worksheet1_logistic.getRow(1).font = {
      bold: true,
      size: 13
    };
    worksheet1_logistic.getRow(2).font = {
      bold: true,
      size: 12
    };
    worksheet1_logistic.getRow(r1 + 4).font = {
      bold: true,
      size: 13
    };
    worksheet1_logistic.getCell(String.fromCharCode(66 + c1 + c1 - 1) + (r1 + 7)).font = {
      bold: true,
      size: 13
    };
    worksheet1_logistic.getRow(r1 * 2 + 5).font = {
      bold: true,
      size: 13
    };

    // header and content of table 1-1
    var range = new Range('A3', String.fromCharCode(66 + c1 - 2) + '3');
    range.forEachAddress((address: any) => {
      const cell = worksheet1_logistic.getCell(address);
      cell.style = {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF5B9BD5' },
          bgColor: { argb: 'FF5B9BD5' }
        },
        font: {
          bold: true
        },
        alignment: {
          horizontal: 'center',
          vertical: 'middle'
          // wrapText:true
        },
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        }
      };
    });

    var range = new Range('A4', String.fromCharCode(66 + c1 - 2) + (r1 + 2));
    range.forEachAddress((address: any) => {
      const cell = worksheet1_logistic.getCell(address);
      cell.style = {
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        },
        alignment: {
          horizontal: 'center'
        }
      };
    });

    // header and content of table 1-2
    var range = new Range(String.fromCharCode(66 + c1) + '3', String.fromCharCode(66 + c1 + c1 - 1) + '3');
    range.forEachAddress((address: any) => {
      const cell = worksheet1_logistic.getCell(address);
      cell.style = {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF5B9BD5' },
          bgColor: { argb: 'FF5B9BD5' }
        },
        font: {
          bold: true
        },
        alignment: {
          horizontal: 'center',
          vertical: 'middle'
          // wrapText:true
        },
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        }
      };
    });

    var range = new Range(String.fromCharCode(66 + c1) + '4', String.fromCharCode(66 + c1 + c1 - 1) + (r1 + 2));
    range.forEachAddress((address: any) => {
      const cell = worksheet1_logistic.getCell(address);
      cell.style = {
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        },
        alignment: {
          horizontal: 'center'
        }
      };
    });

    // header and content of table 2-1
    var range = new Range('A' + (r1 + 5), String.fromCharCode(66 + c1 - 3) + (r1 + 5));
    range.forEachAddress((address: any) => {
      const cell = worksheet1_logistic.getCell(address);
      cell.style = {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF5B9BD5' },
          bgColor: { argb: 'FF5B9BD5' }
        },
        font: {
          bold: true
        },
        alignment: {
          horizontal: 'center',
          vertical: 'middle'
          // wrapText:true
        },
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        }
      };
    });

    var range = new Range('A' + (r1 + 6), String.fromCharCode(66 + c1 - 3) + (r1 * 2 + 3));
    range.forEachAddress((address: any) => {
      const cell = worksheet1_logistic.getCell(address);
      cell.style = {
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        },
        alignment: {
          horizontal: 'center'
        }
      };
    });

    // header and content of table 2-2
    var range = new Range(String.fromCharCode(66 + c1 - 1) + (r1 + 5), String.fromCharCode(66 + c1 + c1 - 3) + (r1 + 5));
    range.forEachAddress((address: any) => {
      const cell = worksheet1_logistic.getCell(address);
      cell.style = {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF5B9BD5' },
          bgColor: { argb: 'FF5B9BD5' }
        },
        font: {
          bold: true
        },
        alignment: {
          horizontal: 'center',
          vertical: 'middle'
          // wrapText:true
        },
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        }
      };
    });

    var range = new Range(String.fromCharCode(66 + c1 - 1) + (r1 + 6), String.fromCharCode(66 + c1 + c1 - 3) + (r1 * 2 + 3));
    range.forEachAddress((address: any) => {
      const cell = worksheet1_logistic.getCell(address);
      cell.style = {
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        },
        alignment: {
          horizontal: 'center'
        }
      };
    });

    // header and content of table 3-1
    var range = new Range('A' + (r1 * 2 + 6), String.fromCharCode(66 + c1 - 3) + (r1 * 2 + 6));
    range.forEachAddress((address: any) => {
      const cell = worksheet1_logistic.getCell(address);
      cell.style = {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF5B9BD5' },
          bgColor: { argb: 'FF5B9BD5' }
        },
        font: {
          bold: true
        },
        alignment: {
          horizontal: 'center',
          vertical: 'middle'
          // wrapText:true
        },
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        }
      };
    });

    var range = new Range('A' + (r1 * 2 + 7), String.fromCharCode(66 + c1 - 3) + (r1 * 3 + 4));
    range.forEachAddress((address: any) => {
      const cell = worksheet1_logistic.getCell(address);
      cell.style = {
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        },
        alignment: {
          horizontal: 'center'
        }
      };
    });

    // header and content of table 3-2
    var range = new Range(String.fromCharCode(66 + c1 - 1) + (r1 * 2 + 6), String.fromCharCode(66 + c1 + c1 - 3) + (r1 * 2 + 6));
    range.forEachAddress((address: any) => {
      const cell = worksheet1_logistic.getCell(address);
      cell.style = {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF5B9BD5' },
          bgColor: { argb: 'FF5B9BD5' }
        },
        font: {
          bold: true
        },
        alignment: {
          horizontal: 'center',
          vertical: 'middle'
          // wrapText:true
        },
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        }
      };
    });

    var range = new Range(String.fromCharCode(66 + c1 - 1) + (r1 * 2 + 7), String.fromCharCode(66 + c1 + c1 - 3) + (r1 * 3 + 4));
    range.forEachAddress((address: any) => {
      const cell = worksheet1_logistic.getCell(address);
      cell.style = {
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        },
        alignment: {
          horizontal: 'center'
        }
      };
    });

    //==========    Weight Tuning Sheet    =========
    // For qId[0] question
    res = '<table><tr>';
    res += '<th>' + quesList[qId[0]]?.name + '</th>';
    for (let j = 0; j < quesList[nQues]?.json.length; j++) {
      let temp = quesList[nQues]?.json[j].name;
      if (quesList[nQues]?.json[j].name === '') temp = 'non-response';
      res += '<th>' + temp + '</th>';
    }
    res += '<th>Total</th></tr>';
    for (let i = 0; i < quesList[qId[0]]?.json.length; i++) {
      let temp = quesList[qId[0]]?.json[i].name;
      if (quesList[qId[0]]?.json[i].name === '') temp = 'non-response';
      let rrr = '<td>' + temp + '</td>';
      for (let j = 0; j < quesList[nQues]?.json.length; j++) {
        rrr += '<td>' + observedTb1[i][j].toFixed(0) + '</td>';
      }
      rrr += '<td>' + Number(quesList[qId[0]].json[i].count).toFixed(0) + '</td>';
      res += '<tr>' + rrr + '</tr>';
    }
    rrr = '<td>Total</td>';
    for (let j = 0; j < quesList[nQues]?.json.length; j++) {
      rrr += '<td>' + Number(quesList[nQues].json[j].count).toFixed(0) + '</td>';
    }
    rrr += '<td>' + SampleSize + '</td>';
    res += '<tr>' + rrr + '</tr>';
    res += '</table>';
    var tableElement_population = parser_population.parseFromString(res, 'text/html').querySelector('table');
    XLSX.utils.sheet_add_dom(worksheet_weighttuning, tableElement_population, { origin: 'A2' });
    // console.log("KAIS2", observedTb1, observedTb2);

    // For qId[1] question
    res = '<table><tr>';
    res += '<th>' + quesList[qId[1]]?.name + '</th>';
    for (let j = 0; j < quesList[nQues]?.json.length; j++) {
      let temp = quesList[nQues]?.json[j].name;
      if (quesList[nQues]?.json[j].name === '') temp = 'non-response';
      res += '<th>' + temp + '</th>';
    }
    res += '<th>Total</th></tr>';
    for (let i = 0; i < quesList[qId[1]]?.json.length; i++) {
      let temp = quesList[qId[1]]?.json[i].name;
      if (quesList[qId[1]]?.json[i].name === '') temp = 'non-response';
      let rrr = '<td>' + temp + '</td>';
      for (let j = 0; j < quesList[nQues]?.json.length; j++) {
        if (observedTb2) rrr += '<td>' + observedTb2[i][j].toFixed(0) + '</td>';
      }
      rrr += '<td>' + Number(quesList[qId[1]].json[i].count).toFixed(0) + '</td>';
      res += '<tr>' + rrr + '</tr>';
    }
    rrr = '<td>Total</td>';
    for (let j = 0; j < quesList[nQues]?.json.length; j++) {
      rrr += '<td>' + Number(quesList[nQues].json[j].count).toFixed(0) + '</td>';
    }
    rrr += '<td>' + SampleSize + '</td>';
    res += '<tr>' + rrr + '</tr>';
    res += '</table>';
    var tableElement_population = parser_population.parseFromString(res, 'text/html').querySelector('table');
    XLSX.utils.sheet_add_dom(worksheet_weighttuning, tableElement_population, { origin: 'L2' });

    // console.log("VVV", res);
    // For vote value
    res = '<table><tr>';
    res += '<th>' + quesList[qId[0]]?.name + '</th>';
    for (let j = 0; j < col; j++) {
      let temp = quesList[qId[1]]?.json[j].name;
      if (quesList[qId[1]]?.json[j].name === '') temp = 'non-response';
      res += '<th>' + temp + '</th>';
    }
    res += '</tr>';
    for (let i = 0; i < row; i++) {
      let temp = quesList[qId[0]]?.json[i].name;
      if (quesList[qId[0]]?.json[i].name === '') temp = 'non-response';
      let rrr = '<td>' + temp + '</td>';
      for (let j = 0; j < col; j++) {
        if (weightTuningTb !== undefined) rrr += '<td>' + weightTuningTb[i][j].toFixed(2) + '</td>';
      }
      res += '<tr>' + rrr + '</tr>';
    }

    res += '</table>';
    var tableElement_population = parser_population.parseFromString(res, 'text/html').querySelector('table');
    XLSX.utils.sheet_add_dom(worksheet_weighttuning, tableElement_population, { origin: 'A25' });
    XLSX.utils.sheet_add_dom(worksheet_final, tableElement_population, { origin: 'A20' });

    // For Question1 weighting
    res = '<table><tr>';
    res += '<th>' + quesList[qId[0]]?.name + '</th>';
    res += '<th>' + 'Weight' + '</th>';
    res += '</tr>';
    for (let i = 0; i < quesList[qId[0]]?.json.length; i++) {
      let temp = quesList[qId[0]]?.json[i].name;
      if (quesList[qId[0]]?.json[i].name === '') temp = 'non-response';
      let rrr = '<td>' + temp + '</td>';

      if (quesWeightingTb1 !== undefined) rrr += '<td>' + quesWeightingTb1[i].toFixed(2) + '</td>';

      res += '<tr>' + rrr + '</tr>';
    }

    res += '</table>';
    var tableElement_population = parser_population.parseFromString(res, 'text/html').querySelector('table');
    XLSX.utils.sheet_add_dom(worksheet_weighttuning, tableElement_population, { origin: 'A12' });

    // For Question2 weighting
    res = '<table><tr>';
    res += '<th>' + quesList[qId[1]]?.name + '</th>';
    res += '<th>' + 'Weight' + '</th>';
    res += '</tr>';
    for (let i = 0; i < quesList[qId[1]]?.json.length; i++) {
      let temp = quesList[qId[1]]?.json[i].name;
      if (quesList[qId[1]]?.json[i].name === '') temp = 'non-response';
      let rrr = '<td>' + temp + '</td>';

      if (quesWeightingTb2 !== undefined) rrr += '<td>' + quesWeightingTb2[i].toFixed(2) + '</td>';

      res += '<tr>' + rrr + '</tr>';
    }

    res += '</table>';
    var tableElement_population = parser_population.parseFromString(res, 'text/html').querySelector('table');
    XLSX.utils.sheet_add_dom(worksheet_weighttuning, tableElement_population, { origin: 'L12' });

    XLSX.utils.book_append_sheet(workbook, worksheet_weighttuning, 'Weight Tuning');
    resJson = XLSX.utils.sheet_to_json(worksheet_weighttuning);

    const worksheet1_weighttuning = workbook1.addWorksheet('Weight Tuning');

    var valuesArray = [];
    var refLen = Object.values(resJson[0]).length;
    var firstheight = Math.max(quesList[qId[0]]?.json.length, quesList[qId[1]]?.json.length) + 2;

    for (let i = 0; i < resJson.length; i++) {
      let values = Object.values(resJson[i]);

      var valueArr = [];
      var tmpLen = Object.values(resJson[i]).length;
      if (i === firstheight) {
        refLen = 4;
        valuesArray.push('');
        valuesArray.push('');
        valuesArray.push('');
        valuesArray.push('');
        valuesArray.push('');
      }
      if (i === firstheight * 2 - 1) {
        refLen = tmpLen * 2;
        valuesArray.push('');
        valuesArray.push('');
      }

      if (tmpLen < refLen) {
        if (resJson[i].__EMPTY === undefined) {
          for (let j = 0; j < refLen - tmpLen; j++) {
            valueArr.push('');
          }
          valueArr.push('');
          valueArr.push(...values);
        } else {
          valueArr.push(...values);
        }
      } else {
        for (let j = 0; j < tmpLen; j++) {
          valueArr.push(values[j]);
          if (j === tmpLen / 2 - 1) {
            valueArr.push('');
          }
        }
      }
      valuesArray.push(valueArr);
    }

    worksheet1_weighttuning.addRow(['']);
    var k = 0;
    valuesArray.forEach((item: any) => {
      worksheet1_weighttuning.addRow(item);
      k++;
      // if(k === r1-1) { worksheet1_cellweighing.addRow([""]); worksheet1_cellweighing.addRow([""]); }
    });

    var cc1 = quesList[nQues]?.json.length + 2;
    var cc2 = quesList[qId[1]]?.json.length;

    worksheet1_weighttuning.mergeCells("'" + String.fromCharCode(66 + cc1) + '1:' + String.fromCharCode(66 + cc1 + cc1 - 1) + "1'");
    worksheet1_weighttuning.getCell("'" + String.fromCharCode(66 + cc1) + "1'").value =
      'Step 2: Chi-square Test for ' + quesList[qId[1]]?.name;

    worksheet1_weighttuning.mergeCells('A1:' + String.fromCharCode(66 + cc1 - 2) + '1');
    worksheet1_weighttuning.getCell('A1').value = 'Step 1: Chi-square Test for ' + quesList[qId[0]]?.name;

    worksheet1_weighttuning.getCell(String.fromCharCode(66 + cc1) + (firstheight + 3)).value = 'Chi-square';
    worksheet1_weighttuning.getCell(String.fromCharCode(66 + cc1 + 1) + (firstheight + 3)).value = kaiSqu2;

    worksheet1_weighttuning.getCell(String.fromCharCode(66 + cc1) + (firstheight + 3)).style = {
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF5B9BD5' },
        bgColor: { argb: 'FF5B9BD5' }
      },
      font: {
        bold: true
      },
      border: {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      },
      alignment: {
        horizontal: 'center'
      }
    };
    worksheet1_weighttuning.getCell(String.fromCharCode(66 + cc1 + 1) + (firstheight + 3)).style = {
      border: {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      },
      alignment: {
        horizontal: 'center'
      }
    };

    worksheet1_weighttuning.getCell('A' + (firstheight + 3)).value = 'Chi-square';
    worksheet1_weighttuning.getCell('B' + (firstheight + 3)).value = kaiSqu1;

    worksheet1_weighttuning.getCell('A' + (firstheight + 3)).style = {
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF5B9BD5' },
        bgColor: { argb: 'FF5B9BD5' }
      },
      font: {
        bold: true
      },
      border: {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      },
      alignment: {
        horizontal: 'center'
      }
    };
    worksheet1_weighttuning.getCell('B' + (firstheight + 3)).style = {
      border: {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      },
      alignment: {
        horizontal: 'center'
      }
    };

    worksheet1_weighttuning.getCell(String.fromCharCode(66 + cc1) + (firstheight + 4)).value = 'Accepted';
    worksheet1_weighttuning.getCell(String.fromCharCode(66 + cc1 + 1) + (firstheight + 4)).value = String(kaiTestingFlag[1]);

    worksheet1_weighttuning.getCell(String.fromCharCode(66 + cc1) + (firstheight + 4)).style = {
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF5B9BD5' },
        bgColor: { argb: 'FF5B9BD5' }
      },
      font: {
        bold: true
      },
      border: {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      },
      alignment: {
        horizontal: 'center'
      }
    };
    worksheet1_weighttuning.getCell(String.fromCharCode(66 + cc1 + 1) + (firstheight + 4)).style = {
      border: {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      },
      alignment: {
        horizontal: 'center'
      }
    };

    worksheet1_weighttuning.getCell('A' + (firstheight + 4)).value = 'Accepted';
    worksheet1_weighttuning.getCell('B' + (firstheight + 4)).value = String(kaiTestingFlag[0]);

    worksheet1_weighttuning.getCell('A' + (firstheight + 4)).style = {
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF5B9BD5' },
        bgColor: { argb: 'FF5B9BD5' }
      },
      font: {
        bold: true
      },
      border: {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      },
      alignment: {
        horizontal: 'center'
      }
    };
    worksheet1_weighttuning.getCell('B' + (firstheight + 4)).style = {
      border: {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      },
      alignment: {
        horizontal: 'center'
      }
    };

    worksheet1_weighttuning.mergeCells('D' + (firstheight + 6) + ':' + 'E' + (firstheight + 6));
    worksheet1_weighttuning.getCell('D' + (firstheight + 6)).value = 'Step 4: Weighting for ' + quesList[qId[1]]?.name;

    worksheet1_weighttuning.mergeCells('A' + (firstheight + 6) + ':' + 'B' + (firstheight + 6));
    worksheet1_weighttuning.getCell('A' + (firstheight + 6)).value = 'Step 3: Weighting for ' + quesList[qId[0]]?.name;

    worksheet1_weighttuning.mergeCells('A' + (firstheight * 2 + 7) + ':' + String.fromCharCode(65 + cc2) + (firstheight * 2 + 7));
    worksheet1_weighttuning.getCell('A' + (firstheight * 2 + 7)).value = 'Step 5: Vote Value';

    worksheet1_weighttuning.getRow(1).font = {
      bold: true,
      size: 13
    };

    worksheet1_weighttuning.getRow(firstheight + 6).font = {
      bold: true,
      size: 13
    };

    worksheet1_weighttuning.getRow(firstheight * 2 + 7).font = {
      bold: true,
      size: 13
    };

    // header and content of table 1-1
    var range = new Range('A2', String.fromCharCode(66 + cc1 - 2) + '2');
    range.forEachAddress((address: any) => {
      const cell = worksheet1_weighttuning.getCell(address);
      cell.style = {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF5B9BD5' },
          bgColor: { argb: 'FF5B9BD5' }
        },
        font: {
          bold: true
        },
        alignment: {
          horizontal: 'center',
          vertical: 'middle'
          // wrapText:true
        },
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        }
      };
    });

    var range = new Range('A3', String.fromCharCode(66 + cc1 - 2) + (quesList[qId[0]]?.json.length + 3));
    range.forEachAddress((address: any) => {
      const cell = worksheet1_weighttuning.getCell(address);
      cell.style = {
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        },
        alignment: {
          horizontal: 'center'
        }
      };
    });

    // header and content of table 1-2
    var range = new Range(String.fromCharCode(66 + cc1) + '2', String.fromCharCode(66 + cc1 + cc1 - 1) + '2');
    range.forEachAddress((address: any) => {
      const cell = worksheet1_weighttuning.getCell(address);
      cell.style = {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF5B9BD5' },
          bgColor: { argb: 'FF5B9BD5' }
        },
        font: {
          bold: true
        },
        alignment: {
          horizontal: 'center',
          vertical: 'middle'
          // wrapText:true
        },
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        }
      };
    });

    var range = new Range(
      String.fromCharCode(66 + cc1) + '3',
      String.fromCharCode(66 + cc1 + cc1 - 1) + (quesList[qId[1]]?.json.length + 3)
    );
    range.forEachAddress((address: any) => {
      const cell = worksheet1_weighttuning.getCell(address);
      cell.style = {
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        },
        alignment: {
          horizontal: 'center'
        }
      };
    });

    // header and content of table 2-1
    var range = new Range('A' + (firstheight + 7), 'B' + (firstheight + 7));
    range.forEachAddress((address: any) => {
      const cell = worksheet1_weighttuning.getCell(address);
      cell.style = {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF5B9BD5' },
          bgColor: { argb: 'FF5B9BD5' }
        },
        font: {
          bold: true
        },
        alignment: {
          horizontal: 'center',
          vertical: 'middle'
          // wrapText:true
        },
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        }
      };
    });

    var range = new Range('A' + (firstheight + 8), 'B' + (firstheight + 8 + quesList[qId[0]]?.json.length - 1));
    range.forEachAddress((address: any) => {
      const cell = worksheet1_weighttuning.getCell(address);
      cell.style = {
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        },
        alignment: {
          horizontal: 'center'
        }
      };
    });

    // header and content of table 2-2
    var range = new Range('D' + (firstheight + 7), 'E' + (firstheight + 7));
    range.forEachAddress((address: any) => {
      const cell = worksheet1_weighttuning.getCell(address);
      cell.style = {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF5B9BD5' },
          bgColor: { argb: 'FF5B9BD5' }
        },
        font: {
          bold: true
        },
        alignment: {
          horizontal: 'center',
          vertical: 'middle'
          // wrapText:true
        },
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        }
      };
    });

    var range = new Range('D' + (firstheight + 8), 'E' + (firstheight + 8 + quesList[qId[1]]?.json.length - 1));
    range.forEachAddress((address: any) => {
      const cell = worksheet1_weighttuning.getCell(address);
      cell.style = {
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        },
        alignment: {
          horizontal: 'center'
        }
      };
    });

    // header and content of table 3-1
    var range = new Range('A' + (firstheight * 2 + 8), String.fromCharCode(65 + cc2) + (firstheight * 2 + 8));
    range.forEachAddress((address: any) => {
      const cell = worksheet1_weighttuning.getCell(address);
      cell.style = {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF5B9BD5' },
          bgColor: { argb: 'FF5B9BD5' }
        },
        font: {
          bold: true
        },
        alignment: {
          horizontal: 'center',
          vertical: 'middle'
          // wrapText:true
        },
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        }
      };
    });

    var range = new Range(
      'A' + (firstheight * 2 + 9),
      String.fromCharCode(65 + cc2) + (firstheight * 2 + 9 + quesList[qId[0]]?.json.length - 1)
    );
    range.forEachAddress((address: any) => {
      const cell = worksheet1_weighttuning.getCell(address);
      cell.style = {
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        },
        alignment: {
          horizontal: 'center'
        }
      };
    });

    //==========    Final Sheet    =========
    XLSX.utils.book_append_sheet(workbook, worksheet_final, 'Final');
    resJson = XLSX.utils.sheet_to_json(worksheet_final);

    const worksheet1_final = workbook1.addWorksheet('Final');

    var valuesArray = [];

    for (let i = 0; i < resJson.length; i++) {
      var valueArr = [];
      let values = Object.values(resJson[i]);
      for (let j = 0; j < values.length; j++) {
        valueArr.push(values[j]);
        if ((j === quesList[qId[1]].json.length || j === quesList[qId[1]].json.length * 2 + 3) && i < quesList[qId[0]].json.length + 1) {
          valueArr.push('');
        }
        if (j === quesList[qId[1]].json.length && i >= quesList[qId[0]].json.length + 1) {
          valueArr.push('');
        }
      }
      if (i === quesList[qId[0]].json.length + 1 || i === quesList[qId[0]].json.length * 2 + 2) {
        valuesArray.push('');
        valuesArray.push('');
      }
      // valueArr.push(...values);
      valuesArray.push(valueArr);
    }

    c1 = quesList[qId[1]]?.json.length + 2;
    r1 = quesList[qId[0]]?.json.length + 2;

    worksheet1_final.addRow(['']);
    var k = 0;
    valuesArray.forEach((item: any) => {
      worksheet1_final.addRow(item);
      k++;
    });

    worksheet1_final.mergeCells("'" + String.fromCharCode(66 + c1 - 1) + '1:' + String.fromCharCode(66 + c1 + c1 - 3) + "1'");
    worksheet1_final.getCell("'" + String.fromCharCode(66 + c1 - 1) + "1'").value = 'Raking';

    worksheet1_final.mergeCells("'A1:" + String.fromCharCode(66 + c1 - 3) + "1'");
    worksheet1_final.getCell('A1').value = 'Cell Weighing';

    worksheet1_final.mergeCells(
      "'" + String.fromCharCode(66 + c1 - 1) + (r1 + 2) + ':' + String.fromCharCode(66 + c1 + c1 - 3) + (r1 + 2) + "'"
    );
    worksheet1_final.getCell("'" + String.fromCharCode(66 + c1 - 1) + (r1 + 2) + "'").value = 'Logistic Regression';

    worksheet1_final.mergeCells("'A" + (r1 + 2) + ':' + String.fromCharCode(66 + c1 - 3) + (r1 + 2) + "'");
    worksheet1_final.getCell('A' + (r1 + 2)).value = 'Linear Regression';

    worksheet1_final.mergeCells("'A" + (r1 * 2 + 3) + ':' + String.fromCharCode(66 + c1 - 3) + (r1 * 2 + 3) + "'");
    worksheet1_final.getCell('A' + (r1 * 2 + 3)).value = 'Weight Tuning';

    worksheet1_final.getRow(1).font = {
      bold: true,
      size: 13
    };
    worksheet1_final.getRow(2).font = {
      bold: true,
      size: 12
    };
    worksheet1_final.getRow(r1 + 2).font = {
      bold: true,
      size: 13
    };
    worksheet1_final.getRow(r1 * 2 + 3).font = {
      bold: true,
      size: 13
    };

    // header and content of table 1-1
    var range = new Range('A2', String.fromCharCode(66 + c1 - 3) + '2');
    range.forEachAddress((address: any) => {
      const cell = worksheet1_final.getCell(address);
      cell.style = {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF5B9BD5' },
          bgColor: { argb: 'FF5B9BD5' }
        },
        font: {
          bold: true
        },
        alignment: {
          horizontal: 'center',
          vertical: 'middle'
          // wrapText:true
        },
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        }
      };
    });

    var range = new Range('A3', String.fromCharCode(66 + c1 - 3) + r1);
    range.forEachAddress((address: any) => {
      const cell = worksheet1_final.getCell(address);
      cell.style = {
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        },
        alignment: {
          horizontal: 'center'
        }
      };
    });

    // header and content of table 1-2
    var range = new Range(String.fromCharCode(66 + c1 - 1) + '2', String.fromCharCode(66 + c1 + c1 - 3) + '2');
    range.forEachAddress((address: any) => {
      const cell = worksheet1_final.getCell(address);
      cell.style = {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF5B9BD5' },
          bgColor: { argb: 'FF5B9BD5' }
        },
        font: {
          bold: true
        },
        alignment: {
          horizontal: 'center',
          vertical: 'middle'
          // wrapText:true
        },
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        }
      };
    });

    var range = new Range(String.fromCharCode(66 + c1 - 1) + '3', String.fromCharCode(66 + c1 + c1 - 3) + r1);
    range.forEachAddress((address: any) => {
      const cell = worksheet1_final.getCell(address);
      cell.style = {
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        },
        alignment: {
          horizontal: 'center'
        }
      };
    });

    // header and content of table 2-1
    var range = new Range('A' + (r1 + 3), String.fromCharCode(66 + c1 - 3) + (r1 + 3));
    range.forEachAddress((address: any) => {
      const cell = worksheet1_final.getCell(address);
      cell.style = {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF5B9BD5' },
          bgColor: { argb: 'FF5B9BD5' }
        },
        font: {
          bold: true
        },
        alignment: {
          horizontal: 'center',
          vertical: 'middle'
          // wrapText:true
        },
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        }
      };
    });

    var range = new Range('A' + (r1 + 4), String.fromCharCode(66 + c1 - 3) + (r1 * 2 + 1));
    range.forEachAddress((address: any) => {
      const cell = worksheet1_final.getCell(address);
      cell.style = {
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        },
        alignment: {
          horizontal: 'center'
        }
      };
    });

    // header and content of table 2-2
    var range = new Range(String.fromCharCode(66 + c1 - 1) + (r1 + 3), String.fromCharCode(66 + c1 + c1 - 3) + (r1 + 3));
    range.forEachAddress((address: any) => {
      const cell = worksheet1_final.getCell(address);
      cell.style = {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF5B9BD5' },
          bgColor: { argb: 'FF5B9BD5' }
        },
        font: {
          bold: true
        },
        alignment: {
          horizontal: 'center',
          vertical: 'middle'
          // wrapText:true
        },
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        }
      };
    });

    var range = new Range(String.fromCharCode(66 + c1 - 1) + (r1 + 4), String.fromCharCode(66 + c1 + c1 - 3) + (r1 * 2 + 1));
    range.forEachAddress((address: any) => {
      const cell = worksheet1_final.getCell(address);
      cell.style = {
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        },
        alignment: {
          horizontal: 'center'
        }
      };
    });

    // header and content of table 3-1
    var range = new Range('A' + (r1 * 2 + 4), String.fromCharCode(66 + c1 - 3) + (r1 * 2 + 4));
    range.forEachAddress((address: any) => {
      const cell = worksheet1_final.getCell(address);
      cell.style = {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF5B9BD5' },
          bgColor: { argb: 'FF5B9BD5' }
        },
        font: {
          bold: true
        },
        alignment: {
          horizontal: 'center',
          vertical: 'middle'
          // wrapText:true
        },
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        }
      };
    });

    var range = new Range('A' + (r1 * 2 + 5), String.fromCharCode(66 + c1 - 3) + (r1 * 2 + 5 + r1 - 3));
    range.forEachAddress((address: any) => {
      const cell = worksheet1_final.getCell(address);
      cell.style = {
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        },
        alignment: {
          horizontal: 'center'
        }
      };
    });

    //--------------- Generate Excel file ----------------
    workbook1.xlsx.writeBuffer().then((buffer: any) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      // console.log("Worksheet", workbook1);
      FileSaver.saveAs(blob, `${surveyID}.xlsx`);
    });
  };

  const onClickExpertButton = () => {
    // console.log("excel----");
    ExpertToExcel();
  };

  //////////////////     Main Part      ///////////////////////
  if (QIDs && NQuestion && SampleSize) {
    let row = quesList[QIDs[0]].json.length; //SampleData[0].length-1;
    let col = quesList[QIDs[1]].json.length; //SampleData[1].length-1;

    cellWeightTb = create2DArray(row, col);
    rakingTb = create2DArray(row, col);
    linearRegressionTb = create2DArray(row, col);
    logisticRegressionTb = create2DArray(row, col);
    weightTuningTb = create2DArray(row, col);

    //==========    For Count    =========
    populationCalcTb2 = create2DArray(row, col);
    sampleCalcTb2 = create2DTable(QIDs[0], QIDs[1]);

    //==========    For Percent    =========
    populationCalcTb1 = create2DArray(row, col);
    sampleCalcTb1 = create2DArray(row, col);

    for (let i = 0; i < row; i++) {
      for (let j = 0; j < col; j++) {
        let rp = Number(PopulationData[0][i].Size);
        let cp = Number(PopulationData[1][j].Size);
        if (PopulationSize) {
          populationCalcTb2[i][j] = (rp * cp) / PopulationSize;
          populationCalcTb1[i][j] = ((rp * cp) / PopulationSize / PopulationSize) * 100;
        }

        if (SampleSize) {
          sampleCalcTb1[i][j] = (Number(sampleCalcTb2[i][j]) / SampleSize) * 100;
        }
      }
    }

    //   console.log("sampleCTB1---------", sampleCalcTb2);
    //   console.log("populationCTB1---------",  populationCalcTb2);

    //==========   CellWeighting   ==========
    cellWeightTb = CalcCellWeighting(row, col, populationCalcTb1, sampleCalcTb1);

    //==========   Raking   ==========
    rakingTb = CalcRaking(row, col, populationCalcTb2, sampleCalcTb2);

    //==========   Regression   ==========
    [linearRegressionTb, logisticRegressionTb] = CalcRegression(row, col, populationCalcTb2, sampleCalcTb2);

    //==========   Weight Tuning   ==========
    let kaiTestingFlag1 = [];
    // Kai-square1
    let nQLen = quesList[NQuestion]?.json.length;
    let observedTb1_1: number[][] = create2DTable(NQuestion, QIDs[0]);
    let expectedTb1_1: number[][] = create2DArray(nQLen, row);
    let df1_1 = (nQLen - 1) * (quesList[QIDs[0]].json.length - 1);
    let kaiSqu1_1 = 0;
    let kaiFlag1_1 = false;
    for (let i = 0; i < nQLen; i++) {
      for (let j = 0; j < row; j++) {
        // Expected frequency = expectedTb
        // Observed frequency = observedTb
        let rr = Number(quesList[NQuestion].json[i].count);
        let cc = Number(quesList[QIDs[0]].json[j].count);
        expectedTb1_1[i][j] = (rr * cc) / SampleSize;
        kaiSqu1_1 += ((observedTb1_1[i][j] - expectedTb1_1[i][j]) * (observedTb1_1[i][j] - expectedTb1_1[i][j])) / expectedTb1_1[i][j];
      }
    }

    if (kaiSqu1_1 > KaiSquareCriticalValue[df1_1 - 1]) kaiFlag1_1 = true;
    kaiTestingFlag1.push(kaiFlag1_1);
    //   console.log("KAIS1", kaiSqu1_1, kaiFlag1_1);

    // Kai-square2
    let observedTb2_1: number[][] = create2DTable(NQuestion, QIDs[1]);
    let expectedTb2_1: number[][] = create2DArray(nQLen, col);
    let df2_1 = (nQLen - 1) * (quesList[QIDs[1]].json.length - 1);
    let kaiSqu2_1 = 0;
    let kaiFlag2_1 = false;
    for (let i = 0; i < nQLen; i++) {
      for (let j = 0; j < col; j++) {
        // Expected frequency = expectedTb
        // Observed frequency = observedTb
        let rr = Number(quesList[NQuestion].json[i].count);
        let cc = Number(quesList[QIDs[1]].json[j].count);
        expectedTb2_1[i][j] = (rr * cc) / SampleSize;
        kaiSqu2_1 += ((observedTb2_1[i][j] - expectedTb2_1[i][j]) * (observedTb2_1[i][j] - expectedTb2_1[i][j])) / expectedTb2_1[i][j];
      }
    }

    if (kaiSqu2_1 > KaiSquareCriticalValue[df2_1 - 1]) kaiFlag2_1 = true;
    kaiTestingFlag1.push(kaiFlag2_1);
    //   console.log("KAIS2", kaiSqu2_1, kaiFlag2_1);

    weightTuningTb = CalcWeightTuning(row, col, kaiTestingFlag1);

    let observedTb1_2: number[][] = create2DTable(QIDs[0], NQuestion);
    let observedTb2_2: number[][] = create2DTable(QIDs[1], NQuestion);
    observedTb1 = observedTb1_2;
    observedTb2 = observedTb2_2;
    // console.log("KAIS2", observedTb1_1, observedTb2_1);
    kaiTestingFlag = kaiTestingFlag1;
    kaiSqu1 = kaiSqu1_1;
    kaiSqu2 = kaiSqu2_1;

    //==========   Result Table   ==========
    [tableJSON, voteJSON] = buildResultTable(
      row,
      col,
      JSON.parse(JSON.stringify(surveyResult)),
      cellWeightTb,
      rakingTb,
      linearRegressionTb,
      logisticRegressionTb,
      weightTuningTb
    );

    //==========   Save   ==========
    // onClickSaveButton(voteJSON);

    //==========   Export   ==========
    // Answer Options JSON

    let maxLen = quesList[NQuestion].json.length;
    for (let i = 0; i < SampleData.length; i++) {
      if (maxLen < SampleData[i].length - 1) maxLen = SampleData[i].length - 1;
    }

    for (let j = 0; j < maxLen; j++) {
      let row = '{';
      for (let i = 0; i < SampleData.length; i++) {
        let ans = Object.keys(SampleData[i][0])[0];
        if (j < SampleData[i].length - 1) {
          row += '"' + ans + '":"' + SampleData[i][j][ans] + '",';
        } else row += '"' + ans + '":"' + ' ' + '",';
      }
      let ans = quesList[NQuestion].name;
      if (j < quesList[NQuestion].json.length) {
        row += '"' + ans + '":"' + quesList[NQuestion].json[j].name + '"}';
      } else row += '"' + ans + '":"' + ' ' + '"}';

      answerOptions.push(JSON.parse(String(row)));
    }
    //   console.log("answerOptions---------", answerOptions);
  }

  return (
    <>
      <Grid container spacing={1.5} columnSpacing={2}>
        <Grid item>
          <Button
            variant="contained"
            onClick={() => {
              onClickSaveButton(voteJSON);
            }}
            startIcon={<SaveOutlined />}
          >
            Save Result
          </Button>
        </Grid>

        <Grid item>
          <Button variant="outlined" color="warning" onClick={() => onClickExpertButton()} startIcon={<DownloadOutlined />}>
            Export Results
          </Button>
        </Grid>
      </Grid>
      <br />
      <Grid item xs={12} md={6} lg={6}>
        <MainCard title="Calculation Result Table">
          {tableJSON && (
            <>
              <AnalyticsGroupSetTable data={tableJSON} />
              <br />
            </>
          )}
        </MainCard>
      </Grid>
    </>
  );
};

export default ThirdStep;
