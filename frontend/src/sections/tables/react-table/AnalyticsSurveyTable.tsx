import { useMemo } from 'react';

// material-ui
import { Box, Stack, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

// third-party
import { Column, useTable, HeaderGroup, Cell, useFilters, usePagination, Row } from 'react-table';

// project import
import ScrollX from '../../../components/ScrollX';
import { TablePagination } from 'components/third-party/ReactTable';

// Reducer import
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
      initialState: { pageIndex: 0, pageSize: 5 }
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
              <TableCell sx={{ p: 2 }} colSpan={10}>
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

const AnalyticsSurveyTable = ({ data, striped, title }: { data: any; striped?: boolean; title?: string }) => {
  const columns = useMemo(() => {
    // console.log("DDD", data);
    const keys = Object.keys(data[0]);
    const num = {
      Header: '#',
      Cell: ({ row }: { row: Row }) => {
        return <div>{row.index + 1}</div>;
      },
      className: 'cell-center'
    };
    // keys.splice(keys.length-1, 1);
    let newColumns = keys.map((item, index) => ({
      Header: item,
      accessor: item
    }));
    if (keys.includes('#')) return [...newColumns];
    else return [num, ...newColumns];
  }, [data]);

  return (
    <MainCard
      content={false}
      title={title}
      // secondary={<>
      // <CSVExport data={data} filename={striped ? 'all-surveys.csv' : 'all-surveys.csv'} /></>}
    >
      <>
        <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2}></Stack>
        <ScrollX>
          <ReactTable columns={columns} data={data} />
        </ScrollX>
      </>
    </MainCard>
  );
};

export default AnalyticsSurveyTable;
