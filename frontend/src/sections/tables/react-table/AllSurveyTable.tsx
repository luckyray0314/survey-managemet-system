import { useMemo, useState, MouseEvent } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Dialog, IconButton, Link, Stack, Table, TableBody, TableCell, TableHead, TableRow, Tooltip } from '@mui/material';

// third-party
import { Column, useTable, HeaderGroup, Cell, useFilters, usePagination, Row } from 'react-table';

// project import
// import MainCard from '../../../components/MainCard';
import ScrollX from '../../../components/ScrollX';
import { TablePagination } from 'components/third-party/ReactTable';
import { CopyTwoTone, DeleteTwoTone, EditTwoTone, InteractionTwoTone } from '@ant-design/icons';
// import LinearWithLabel from '../../../components/@extended/progress/LinearWithLabel';

import ShareURLModal from 'sections/alert/survey/ShareURLModal';
import AlertCustomerDelete from 'sections/alert/survey/AlertSurveyDelete';
import { PopupTransition } from 'components/@extended/Transitions';

// Reducer import
import { dispatch } from 'store';
import { copySurvey } from 'store/reducers/survey';

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

const AllSurveyTable = ({ data, striped, title }: { data: any; striped?: boolean; title?: string }) => {
  const theme = useTheme();

  const [customer, setCustomer] = useState<any>(null);
  const [add, setAdd] = useState<boolean>(false);
  const [customerDeleteId, setCustomerDeleteId] = useState<any>('');
  const [open, setOpen] = useState<boolean>(false);

  const handleAddS = () => {
    setAdd(!add);
    // if (customer && !add) setCustomer(null);
  };

  const handleCloseS = () => {
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
              <Tooltip title="Share Link">
                <IconButton
                  color="primary"
                  onClick={(e: MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    handleAddS();
                    setCustomer(data[row.id]?.id);
                  }}
                >
                  <InteractionTwoTone twoToneColor={theme.palette.primary.main} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Duplicate">
                <IconButton
                  color="primary"
                  onClick={() => {
                    dispatch(copySurvey(data[row.id]?.id));
                  }}
                >
                  <CopyTwoTone twoToneColor={theme.palette.primary.main} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit">
                <IconButton color="primary" component={Link} href={'/edit-survey/' + data[row.id]?.id} target="_blank">
                  <EditTwoTone twoToneColor={theme.palette.primary.main} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
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
  }, [data]);

  return (
    // <MainCard
    //   content={false}
    //   title={false}
    //   secondary={<>
    //     <Button variant="contained">Import Survey</Button>
    //   <CSVExport data={data} filename={striped ? 'all-surveys.csv' : 'all-surveys.csv'} /></>}
    // >
    <>
      <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2}></Stack>
      <ScrollX>
        <ReactTable columns={columns} data={data} />
      </ScrollX>
      <AlertCustomerDelete title={customerDeleteId} open={open} handleClose={handleCloseS} />
      <Dialog
        maxWidth="sm"
        TransitionComponent={PopupTransition}
        keepMounted
        fullWidth
        onClose={handleAddS}
        open={add}
        sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
        aria-describedby="alert-dialog-slide-description"
      >
        {/* <DialogTitle>Share your survey URL</DialogTitle> */}
        <ShareURLModal customer={customer} onCancel={handleAddS} />
      </Dialog>
    </>
    // </MainCard>
  );
};

export default AllSurveyTable;
