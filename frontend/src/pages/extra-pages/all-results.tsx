import { useMemo, useState, MouseEvent, useEffect } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, IconButton, Link, Stack, Table, TableBody, TableCell, TableHead, TableRow, Tooltip } from '@mui/material';

// third-party
import { Column, useTable, HeaderGroup, Cell, useFilters, usePagination, Row } from 'react-table';

// project import
// import MainCard from '../../../components/MainCard';
import ScrollX from 'components/ScrollX';
import { TablePagination } from 'components/third-party/ReactTable';
import { DeleteTwoTone, EyeTwoTone } from '@ant-design/icons';
// import LinearWithLabel from '../../../components/@extended/progress/LinearWithLabel';

// import ShareURLModal from 'sections/alert/survey/ShareURLModal';
import AlertCustomerDelete from 'sections/alert/survey/AlertSurveyDelete';
// import { PopupTransition } from 'components/@extended/Transitions';

// Reducer import
import { dispatch, useSelector } from 'store';
import { getSurveys } from 'store/reducers/survey';
import MainCard from 'components/MainCard';

// ==============================|| REACT TABLE ||============================== //

function ReactTable({ columns, data, top }: { columns: Column[]; data: []; top?: boolean }) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    page,
    prepareRow,
    gotoPage,
    setPageSize,
    state: { pageIndex, pageSize }
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 10 }
    },
    useFilters,
    usePagination
  );

  return (
    <Stack>
      {top && (
        <Box sx={{ p: 2 }}>
          <TablePagination gotoPage={gotoPage} rows={rows} setPageSize={setPageSize} pageIndex={pageIndex} pageSize={pageSize} />
        </Box>
      )}

      <Table {...getTableProps()}>
        <TableHead sx={{ borderTopWidth: top ? 2 : 1 }}>
          {headerGroups.map((headerGroup) => (
            <TableRow {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column: HeaderGroup) => (
                <TableCell {...column.getHeaderProps([{ className: column.className }])}>{column.render('Header')}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody {...getTableBodyProps()}>
          {page.map((row: Row) => {
            prepareRow(row);
            return (
              <TableRow {...row.getRowProps()}>
                {row.cells.map((cell: Cell) => (
                  <TableCell {...cell.getCellProps([{ className: cell.column.className }])}>{cell.render('Cell')}</TableCell>
                ))}
              </TableRow>
            );
          })}

          {!top && (
            <TableRow>
              <TableCell sx={{ p: 2 }} colSpan={7}>
                <TablePagination gotoPage={gotoPage} rows={rows} setPageSize={setPageSize} pageIndex={pageIndex} pageSize={pageSize} />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Stack>
  );
}

// ==============================|| REACT TABLE - BASIC ||============================== //

const Results = ({ striped, title }: { striped?: boolean; title?: string }) => {
  const theme = useTheme();
  const [data, setData] = useState<any>(null);
  const { surveys } = useSelector((state) => state.survey);

  // const [customer, setCustomer] = useState<any>(null);
  // const [add, setAdd] = useState<boolean>(false);
  const [customerDeleteId, setCustomerDeleteId] = useState<any>('');
  const [open, setOpen] = useState<boolean>(false);

  // const handleAddS = () => {
  //   setAdd(!add);
  //   // if (customer && !add) setCustomer(null);
  // };

  useEffect(() => {
    dispatch(getSurveys());
  }, []);

  useEffect(() => {
    if (surveys) {
      // const json = JSON.parse(JSON.stringify(surveys));
      var rows = [];
      for (let i = 0; i < surveys.length; i++) {
        var row = '{';
        row += '"#":"' + (i + 1) + '",';
        row += '"Title":"' + surveys[i]?.title + '",';

        if (surveys[i]?.groupSet) row += '"GroupSet":"' + surveys[i]?.groupSet + '",';
        else row += '"GroupSet":"' + 'Not connected to GroupSets' + '",';

        row += '"Date":"' + surveys[i]?.date + '",';
        row += '"id":"' + surveys[i]?._id + '"';

        row += '}';
        rows.push(JSON.parse(row));
      }
      setData(rows);
      // console.log("ttt", rows);
    }
  }, [surveys]);

  const handleCloseS = () => {
    setOpen(!open);
  };

  const columns = useMemo(() => {
    if (data && data?.length > 0) {
      // console.log("DDD", data);
      const keys = Object.keys(data[0]);
      keys.splice(keys.length - 1, 1);
      let newColumns = keys.map((item, index) => ({
        Header: item,
        accessor: item
      }));
      let actionColumn: any = {};
      if (Object.keys(data[data.length - 1]).includes('id'))
        actionColumn = {
          Header: 'Actions',
          className: 'cell-center',
          disableSortBy: true,
          Cell: ({ row }: { row: Row<{}> }) => {
            return (
              <Stack direction="row" alignItems="center" justifyContent="center" spacing={0}>
                {/* <Tooltip title="Share Link">
                    <IconButton
                      color="primary"
                      onClick={(e: MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
                        setCustomer(data[row.id]?.id);
                        handleAddS();
                      }}
                    >
                      <InteractionTwoTone twoToneColor={theme.palette.primary.main} />
                    </IconButton>
                  </Tooltip> */}
                {/* <Tooltip title="Duplicate">
                    <IconButton
                      color="primary"
                      onClick={() => {
                        // dispatch(copySurvey(data[row.id]?.id));
                      }}
                    >
                      <CopyTwoTone twoToneColor={theme.palette.primary.main} />
                    </IconButton>
                  </Tooltip> */}
                <Tooltip title="View result">
                  <IconButton
                    color="primary"
                    component={Link}
                    href={'/results/' + data[row.id]?.id}
                    // target="_blank"
                  >
                    <EyeTwoTone twoToneColor={theme.palette.primary.main} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Survey and Result">
                  <IconButton
                    color="error"
                    onClick={(e: MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      handleCloseS();
                      setCustomerDeleteId(data[row.id]?.id);
                    }}
                  >
                    <DeleteTwoTone twoToneColor={theme.palette.error.main} />
                  </IconButton>
                </Tooltip>
              </Stack>
            );
          }
        };

      // newColumns.pop();
      // console.log("newCol", newColumns);
      return [...newColumns, actionColumn];
    }
  }, [data]);

  return (
    <MainCard
      content={false}
      title={'Results ( ! Warning ! You can see the exact result after Analytics. )'}
      // secondary={<>
      //   <Button variant="contained">Import Survey</Button>
      // <CSVExport data={data} filename={striped ? 'all-surveys.csv' : 'all-surveys.csv'} /></>}
    >
      <>
        <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2}></Stack>
        <ScrollX>{columns && columns?.length > 0 && data && data?.length > 0 && <ReactTable columns={columns} data={data} />}</ScrollX>
        <AlertCustomerDelete title={customerDeleteId} open={open} handleClose={handleCloseS} />
        {/* <Dialog
        maxWidth="sm"
        TransitionComponent={PopupTransition}
        keepMounted
        fullWidth
        onClose={handleAddS}
        open={add}
        sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>Share your survey URL</DialogTitle>
        <ShareURLModal customer={customer} onCancel={handleAddS} />
      </Dialog> */}
      </>
    </MainCard>
  );
};

export default Results;
