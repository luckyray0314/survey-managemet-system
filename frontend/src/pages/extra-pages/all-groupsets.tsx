import { useState, useEffect } from 'react';

// material-ui
import { Grid, Typography } from '@mui/material';

// project import
// import MainCard from 'components/MainCard';
import AllGroupSetsTable from '../../sections/tables/react-table/AllGroupSetsTable';

// Reducer import
import { dispatch, useSelector } from 'store';
import { getGroupSets } from 'store/reducers/groupset';

// ==============================|| SAMPLE PAGE ||============================== //

const AllGroupSets = () => {
  const { groupSets } = useSelector((state) => state.groupset);
  const [table, setTable] = useState<any>();

  useEffect(() => {
    dispatch(getGroupSets());
  }, []);

  useEffect(() => {
    if (groupSets) {
      // console.log("ddkdkdkdkdkd", groupSets);
      var rows = [];
      for (let i = 0; i < groupSets.length; i++) {
        var row = '{';
        row += '"#":"' + (i + 1) + '",';
        row += '"Name":"' + groupSets[i].name + '",';
        row += '"Participants":"' + groupSets[i].participants + '",';

        if (groupSets[i]?.answers) {
          let json = JSON.parse(JSON.stringify(groupSets[i]?.answers));
          if (json.length === 0) {
            row += '"Total Group Size":"' + 0 + '",';
          } else {
            let sum = 0;
            let keys = Object.keys(json);
            for (let i = 0; i < json.length; i++) {
              sum += Number(json[keys[i]].size);
            }
            row += '"Total Group Size":"' + sum + '",';
          }
        } else {
          row += '"Total Group Size":"' + 'Not edited groupset' + '",';
        }

        row += '"Date":"' + groupSets[i]?.date + '",';
        row += '"id":"' + groupSets[i]?._id + '"';

        row += '}';
        rows.push(JSON.parse(row));
      }
      setTable(rows);
      // console.log("ttt", rows);
    }
  }, [groupSets]);

  // console.log("ttt", table);

  return (
    <>
      {table !== undefined && table?.length > 0 ? (
        <Typography variant="body2">
          <Grid container spacing={3}>
            <Grid item xs={12} lg={12}>
              <AllGroupSetsTable title="All GroupSets " data={table} />
            </Grid>
          </Grid>
        </Typography>
      ) : (
        <Typography sx={{ fontSize: '1.2rem' }}>There is no GroupSet.</Typography>
      )}
    </>
  );
};

export default AllGroupSets;
