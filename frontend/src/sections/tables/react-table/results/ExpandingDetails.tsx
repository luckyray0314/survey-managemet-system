import { useCallback, useMemo, Fragment, FC } from 'react';

// material-ui
import { Box, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

// third-party
import { useExpanded, useTable, Column, Row, HeaderGroup, Cell } from 'react-table';

// project import
import ExpandingUserDetail from './ExpandingUserDetail';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { CSVExport } from 'components/third-party/ReactTable';

// assets
import { DownOutlined, RightOutlined } from '@ant-design/icons';

// ==============================|| REACT TABLE ||============================== //

interface TableProps {
  columns: Column[];
  data: [];
  renderRowSubComponent: FC<any>;
}

function ReactTable({ columns: userColumns, data, renderRowSubComponent }: TableProps) {
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow, visibleColumns } = useTable(
    {
      columns: userColumns,
      data
    },
    useExpanded
  );

  return (
    <Table {...getTableProps()}>
      <TableHead>
        {headerGroups.map((headerGroup: HeaderGroup<{}>) => (
          <TableRow {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column: HeaderGroup<{}>) => (
              <TableCell {...column.getHeaderProps([{ className: column.className }])}>{column.render('Header')}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableHead>
      <TableBody {...getTableBodyProps()}>
        {rows.map((row: Row, i: number) => {
          prepareRow(row);
          const rowProps = row.getRowProps();

          return (
            <Fragment key={i}>
              <TableRow {...row.getRowProps()}>
                {row.cells.map((cell: Cell<{}>) => (
                  <TableCell {...cell.getCellProps([{ className: cell.column.className }])}>{cell.render('Cell')}</TableCell>
                ))}
              </TableRow>
              {row.isExpanded && renderRowSubComponent({ row, rowProps, visibleColumns })}
            </Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
}

// ==============================|| REACT TABLE - EXPANDING TABLE ||============================== //

const ExpandingDetails = ({ data, detailData }: { data: any; detailData: any }) => {
  const columns = useMemo(() => {
    const expandCol = {
      Header: () => null,
      id: 'expander',
      className: 'cell-center',
      Cell: ({ row }: { row: Row }) => {
        const collapseIcon = row.isExpanded ? <DownOutlined /> : <RightOutlined />;
        return (
          <Box sx={{ fontSize: '0.75rem', color: 'text.secondary', textAlign: 'center' }} {...row.getToggleRowExpandedProps()}>
            {collapseIcon}
          </Box>
        );
      },
      SubCell: () => null
    };
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
    if (keys.includes('#')) return [expandCol, ...newColumns];
    else return [expandCol, num, ...newColumns];
  }, [data]);

  const renderRowSubComponent = useCallback(
    ({ row: { id } }: { row: Row<{}> }) => <ExpandingUserDetail data={detailData[Number(id)]} />,
    [detailData]
  );

  return (
    <MainCard title="Survey Result" content={false} secondary={<CSVExport data={detailData} filename={'survey-result-table.csv'} />}>
      <ScrollX>
        <ReactTable columns={columns} data={data} renderRowSubComponent={renderRowSubComponent} />
      </ScrollX>
    </MainCard>
  );
};

export default ExpandingDetails;
