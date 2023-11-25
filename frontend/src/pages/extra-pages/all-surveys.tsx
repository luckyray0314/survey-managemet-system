import { useState, useEffect } from 'react';

// material-ui
import { Button, Grid, Typography } from '@mui/material';

// project import
import * as XLSX from 'xlsx';
// import MainCard from 'components/MainCard';
import AllSurveyTable from '../../sections/tables/react-table/AllSurveyTable';

// Reducer import
import { dispatch, useSelector } from 'store';
import { getSurveys, createSurveyFromImport } from 'store/reducers/survey';

import MainCard from 'components/MainCard';
import { CSVExport } from 'components/third-party/ReactTable';

// ==============================|| SAMPLE PAGE ||============================== //

interface UploaderProps {
  fileType?: string | AcceptedFileType[];
}

enum AcceptedFileType {
  XLSX = '.xlsx',
  XLS = '.xls',
  CSV = '.csv'
  // Jpeg = ".jpg",
  // Png = ".png",
  // Doc = ".doc",
  // AllImages = "image/*",
  // AllVideos = "video/*",
  // AllAudios = "audio/*"
}

const AllSurveys = (props: UploaderProps) => {
  const { surveys } = useSelector((state) => state.survey);
  const [table, setTable] = useState<any>();
  const [data, setData] = useState('');
  const [name, setName] = useState('');
  const [importFlag, setImportFlag] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState<File | undefined>(undefined);

  useEffect(() => {
    dispatch(getSurveys());
  }, [importFlag]);

  useEffect(() => {
    if (surveys !== null && surveys !== undefined && surveys?.length !== 0) {
      // const json = JSON.parse(JSON.stringify(surveys));
      var rows = [];
      for (let i = 0; i < surveys.length; i++) {
        var row = '{';
        row += '"#":"' + (i + 1) + '",';
        row += '"Title":"' + surveys[i]?.title + '",';

        if (surveys[i]?.groupSet) row += '"GroupSet":"' + surveys[i]?.groupSet + '",';
        else row += '"GroupSet":"' + 'Not connected to GroupSets' + '",';

        if (surveys[i]?.lang === 'en') row += '"Language":"' + 'English' + '",';
        else if (surveys[i]?.lang === 'ar') row += '"Language":"' + 'Arabic' + '",';
        else row += '"Language":"' + 'Hebrew' + '",';

        row += '"Date":"' + surveys[i]?.date + '",';
        row += '"id":"' + surveys[i]?._id + '"';

        row += '}';
        rows.push(JSON.parse(row));
      }
      setTable(rows);
      // console.log("ttt", rows);
    }
  }, [surveys]);

  // console.log("ttt", table);

  const { fileType } = props;
  const acceptedFormats: string | AcceptedFileType[] =
    typeof fileType === 'string'
      ? fileType
      : Array.isArray(fileType)
      ? fileType?.join(',')
      : AcceptedFileType.XLS || AcceptedFileType.CSV || AcceptedFileType.XLSX;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(event?.target?.files?.[0]);
  };

  useEffect(() => {
    if (selectedFiles) {
      setName(selectedFiles.name);

      const reader = new FileReader();
      // let surveyResultdata:any;
      reader.onload = async (evt) => {
        // evt = on_file_select event
        /* Parse data */
        const bstr = evt?.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        /* Get first worksheet */
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];

        const data_json = await XLSX.utils.sheet_to_json(ws);
        // setFileFlag(1);
        // setFileName("File_"+name);
        setData(JSON.stringify(data_json));

        // Recognition Language !!!

        // Loop over each row and column
        // for (let cellAddress in ws) {
        //   if (cellAddress[0] === '!') continue; // Skip non-cell entries
        //   const cell = ws[cellAddress];
        //   // Check if the cell contains Arabic text
        //   const arabicRegex = /[\u0600-\u06FF]/;
        //   if (arabicRegex.test(cell.v)) {
        //     console.log(`Cell ${cellAddress} contains Arabic text`);
        //   }
        // }
      };
      reader.readAsBinaryString(selectedFiles);
    }
  }, [selectedFiles]);

  // const onUpload = () => {
  //   console.log(selectedFiles);
  // };
  // console.log("import data", data);
  useEffect(() => {
    if (data.length && name.length) {
      saveImport();
      setImportFlag((importFlag) => !importFlag);
    }
  }, [data, name]);

  const saveImport = async () => {
    const surveyResultdata = JSON.parse(JSON.stringify(data));
    const intro = 'imported';
    const lang = 'en';
    // console.log("CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC", surveyResultdata);
    await dispatch(createSurveyFromImport({ title: name, intro: intro, lang: lang, sdata: surveyResultdata }));
  };

  console.log('table-----', table, table?.length);

  return (
    <>
      {table !== undefined && table?.length > 0 ? (
        <MainCard
          content={false}
          title="All Surveys"
          secondary={
            <>
              <Button variant="contained" component="label" style={{ textTransform: 'none' }}>
                <input hidden type="file" accept={acceptedFormats} onChange={handleFileSelect} />
                <span> Import Survey</span>
              </Button>

              <CSVExport data={table} filename={'all-surveys.csv'} />
            </>
          }
        >
          <Typography variant="body2">
            <Grid container spacing={3}>
              <Grid item xs={12} lg={12}>
                <AllSurveyTable title="All Surveys" data={table} />
              </Grid>
            </Grid>
          </Typography>
        </MainCard>
      ) : (
        <Typography sx={{ fontSize: '1.2rem' }}>There is no survey.</Typography>
      )}
    </>
  );
};

export default AllSurveys;
