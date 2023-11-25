import { useMemo, useState, MouseEvent } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Dialog, IconButton, Stack, Table, TableBody, TableCell, TableHead, TableRow, Tooltip } from '@mui/material';

// third-party
import { Column, useTable, HeaderGroup, Cell, useFilters, usePagination, Row } from 'react-table';

// project import
// import MainCard from '../../../components/MainCard';
import ScrollX from '../../../components/ScrollX';
import { CSVExport, TablePagination } from 'components/third-party/ReactTable';
import { CopyTwoTone, DeleteTwoTone, EditTwoTone } from '@ant-design/icons';
// import LinearWithLabel from '../../../components/@extended/progress/LinearWithLabel';

import AddCustomer from 'sections/alert/groupset/EditGroupSetModal';
import AlertCustomerDelete from 'sections/alert/groupset/AlertGroupSetDelete';
import { PopupTransition } from 'components/@extended/Transitions';

// Reducer import
import { dispatch } from 'store';
import { copyGroupSet } from 'store/reducers/groupset';
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

const AllGroupSetsTable = ({ data, striped, title }: { data: any; striped?: boolean; title?: string }) => {
  const theme = useTheme();

  const [groupSetID, setGroupSetID] = useState<any>(null);
  const [add, setAdd] = useState<boolean>(false);
  const [customerDeleteId, setCustomerDeleteId] = useState<any>('');
  const [open, setOpen] = useState<boolean>(false);

  // // GroupSet Props
  // const [name, setName] = useState("");
  // const [participants, setParticipants] = useState<number>(30);

  // const clickCreateGroupSetButton = async () => {
  //   // await dispatch(createGroupSet({name:name, participants:participants}));
  //   // navigate('/home');
  //   console.log("DDD");
  // };

  const handleAddG = () => {
    setAdd(!add);

    // if (customer && !add) setCustomer(null);
  };

  const handleCloseG = () => {
    setOpen(!open);
  };

  const columns = useMemo(() => {
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
              <Tooltip title="Duplicate">
                <IconButton
                  color="primary"
                  onClick={() => {
                    dispatch(copyGroupSet(data[row.id]?.id));
                  }}
                >
                  <CopyTwoTone twoToneColor={theme.palette.primary.main} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit">
                <IconButton
                  color="primary"
                  onClick={(e: MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    setGroupSetID(data[row.id]?.id);
                    handleAddG();
                  }}
                >
                  <EditTwoTone twoToneColor={theme.palette.primary.main} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton
                  color="error"
                  onClick={(e: MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    handleCloseG();
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
  }, [data]);
  // console.log('groupId', groupSetID);
  return (
    // <MainCard
    //   content={false}
    //   title={false}
    //   secondary={<>
    //     <Button variant="contained">Import Survey</Button>
    //   <CSVExport data={data} filename={striped ? 'all-surveys.csv' : 'all-surveys.csv'} /></>}
    // >
    <>
      <MainCard
        content={false}
        title="All GroupSets  ( ! Warning !  If the names are the same, an error may occur. )"
        secondary={
          <>
            <CSVExport data={data} filename={'all-groupsets.csv'} />
          </>
        }
      >
        <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2}></Stack>
        <ScrollX>
          <ReactTable columns={columns} data={data} />
        </ScrollX>
      </MainCard>
      <br></br>
      <br></br>
      {/* <Grid container rowSpacing={4.5} columnSpacing={3}>
        
        <Grid item xs={12} md={4} lg={4}>
          <MainCard title = "Create New Sub group">
            <Typography variant="body2">
              <>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={12}>
                      <Stack spacing={0.5}>
                          <InputLabel>Enter Name</InputLabel>
                          <TextField
                          required
                          id="bodyurl"
                          name="bodyurl"
                          placeholder="Male"
                          fullWidth
                          autoComplete={""}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          />
                      </Stack>
                  </Grid>
                  
                  <Grid item xs={12} sm={12}>
                      <Stack spacing={0.5}>
                          <InputLabel>Enter Size of Participants (%)</InputLabel>
                          <TextField
                          required
                          id="bodyurl"
                          name="bodyurl"
                          placeholder="30"
                          fullWidth
                          autoComplete={""}
                          value={participants}
                          onChange={(e) => setParticipants(Number(e.target.value))}
                          />
                      </Stack>
                  </Grid>
                  
                </Grid>
                <br></br>
                <Grid item spacing={5}>
                    <Stack direction="row" justifyContent="flex-start">
                      <Button variant="contained" onClick={clickCreateGroupSetButton} startIcon={<PlusCircleOutlined /> } >Create New Sub Group
                      </Button>
                    </Stack>
                </Grid>
              </> 
            </Typography>
          </MainCard>  
        </Grid>
        <Grid item xs={12} md={8} lg={8}>
          <MainCard title="Sub Groups of Group Set">
            <Typography variant="body2">
              <>
                <Grid container spacing={2}>
                  
                  
                </Grid>
                
              </> 
            </Typography>
          </MainCard>  
        </Grid>
      </Grid> */}

      <AlertCustomerDelete title={customerDeleteId} open={open} handleClose={handleCloseG} />
      <Dialog
        maxWidth="lg"
        TransitionComponent={PopupTransition}
        keepMounted
        fullWidth
        onClose={handleAddG}
        open={add}
        sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
        aria-describedby="alert-dialog-slide-description"
      >
        {/* <DialogTitle>Share your survey URL</DialogTitle> */}
        {groupSetID && <AddCustomer customer={groupSetID} onCancel={handleAddG} />}
      </Dialog>
    </>
    // </MainCard>
  );
};

export default AllGroupSetsTable;
