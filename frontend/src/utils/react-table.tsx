import { useMemo, useState } from 'react';

// material-ui
import { FormControl, OutlinedInput, OutlinedInputProps, Slider, Stack, TextField, Tooltip } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// third-party
import { useAsyncDebounce, Row, TableState, MetaBase } from 'react-table';
// import { matchSorter } from 'match-sorter';
import { format } from 'date-fns';

// project import
import IconButton from '../components/@extended/IconButton';

// assets
import { CloseOutlined, LineOutlined, SearchOutlined } from '@ant-design/icons';

interface GlobalFilterProps extends OutlinedInputProps {
  preGlobalFilteredRows: Row<{}>[];
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
}

export function GlobalFilter({ preGlobalFilteredRows, globalFilter, setGlobalFilter, ...other }: GlobalFilterProps) {
  const count = preGlobalFilteredRows.length;
  const [value, setValue] = useState(globalFilter);
  const onChange = useAsyncDebounce((value) => {
    setGlobalFilter(value || undefined);
  }, 200);

  return (
    <OutlinedInput
      value={value || ''}
      onChange={(e) => {
        setValue(e.target.value);
        onChange(e.target.value);
      }}
      placeholder={`Search ${count} records...`}
      id="start-adornment-email"
      startAdornment={<SearchOutlined />}
      {...other}
    />
  );
}

export function DefaultColumnFilter({ column: { filterValue, Header, setFilter } }: any) {
  return (
    <TextField
      fullWidth
      value={filterValue || ''}
      onChange={(e) => {
        setFilter(e.target.value || undefined);
      }}
      placeholder={Header}
      size="small"
    />
  );
}

export function DateColumnFilter({ column: { filterValue, Header, setFilter } }: any) {
  return (
    <FormControl sx={{ width: '100%' }}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          format="dd/MM/yyyy"
          value={filterValue && new Date(filterValue)}
          onChange={(newValue) => {
            let formatDateFn = undefined;
            try {
              formatDateFn = format(newValue!, 'M/d/yyyy');
            } catch (error) {}
            console.log(formatDateFn);
            setFilter(undefined);
          }}
        />
      </LocalizationProvider>
    </FormControl>
  );
}

interface FilterColumnProps {
  filterValue?: never[];
  preFilteredRows: Row[];
  Header: string;
  setFilter: any;
  id: string;
}

// export function SelectColumnFilter({ column: { filterValue, setFilter, preFilteredRows, id } }: { column: FilterColumnProps }) {
//   const options = useMemo(() => {
//     const options = new Set();
//     preFilteredRows.forEach((row: Row) => {
//       options.add(row.values[id]);
//     });
//     return [...options.values()];
//   }, [id, preFilteredRows]);

//   return (
//     <Select
//       value={filterValue}
//       onChange={(e) => {
//         setFilter(e.target.value || undefined);
//       }}
//       displayEmpty
//       size="small"
//     >
//       <MenuItem value="">All</MenuItem>
//       {options.map((option: any, i: number) => (
//         <MenuItem key={i} value={option}>
//           {option}
//         </MenuItem>
//       ))}
//     </Select>
//   );
// }

export function SliderColumnFilter({ column: { filterValue, setFilter, preFilteredRows, id } }: { column: FilterColumnProps }) {
  const [min, max] = useMemo(() => {
    let min = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
    let max = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
    preFilteredRows.forEach((row: Row) => {
      min = Math.min(row.values[id], min);
      max = Math.max(row.values[id], max);
    });
    return [min, max];
  }, [id, preFilteredRows]);

  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ pl: 1, minWidth: 120 }}>
      <Slider
        value={filterValue || min}
        min={min}
        max={max}
        step={1}
        onChange={(event: Event, newValue: number | number[]) => {
          setFilter(newValue);
        }}
        valueLabelDisplay="auto"
        aria-labelledby="non-linear-slider"
      />
      <Tooltip title="Reset">
        <IconButton size="small" color="error" onClick={() => setFilter(undefined)}>
          <CloseOutlined />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

export function NumberRangeColumnFilter({ column: { filterValue = [], preFilteredRows, setFilter, id } }: { column: FilterColumnProps }) {
  const [min, max] = useMemo(() => {
    let min = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
    let max = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
    preFilteredRows.forEach((row: Row) => {
      min = Math.min(row.values[id], min);
      max = Math.max(row.values[id], max);
    });
    return [min, max];
  }, [id, preFilteredRows]);

  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 168, maxWidth: 250 }}>
      <TextField
        fullWidth
        value={filterValue[0] || ''}
        type="number"
        onChange={(e) => {
          const val = e.target.value;
          setFilter((old = []) => [val ? parseInt(val, 10) : undefined, old[1]]);
        }}
        placeholder={`Min (${min})`}
        size="small"
      />
      <LineOutlined />
      <TextField
        fullWidth
        value={filterValue[1] || ''}
        type="number"
        onChange={(e) => {
          const val = e.target.value;
          setFilter((old = []) => [old[0], val ? parseInt(val, 10) : undefined]);
        }}
        placeholder={`Max (${max})`}
        size="small"
      />
    </Stack>
  );
}

// function fuzzyTextFilterFn(rows: Row[], id: number, filterValue: string) {
//   return matchSorter(rows, filterValue, { keys: [(row: Row) => row.values[id]] });
// }

// fuzzyTextFilterFn.autoRemove = (val: number) => !val;

export const renderFilterTypes: any = () => ({
  // fuzzyText: fuzzyTextFilterFn,
  text: (rows: Row[], id: string, filterValue: string) => {
    rows.filter((row: Row) => {
      const rowValue = row.values[id];
      return rowValue !== undefined ? String(rowValue).toLowerCase().startsWith(String(filterValue).toLowerCase()) : true;
    });
  }
});

export function filterGreaterThan(rows: Row[], id: number, filterValue: number) {
  return rows.filter((row: Row) => {
    const rowValue = row.values[id];
    return rowValue >= filterValue;
  });
}

filterGreaterThan.autoRemove = (val: number) => typeof val !== 'number';

export function useControlledState(state: TableState<{}>, { instance }: MetaBase<{}>) {
  return useMemo(() => {
    if (state.groupBy.length) {
      return {
        ...state,
        hiddenColumns: [...state.hiddenColumns!, ...state.groupBy].filter((d, i, all) => all.indexOf(d) === i)
      };
    }
    return state;
  }, [state]);
}

export function roundedMedian(leafValues: any) {
  let min = leafValues[0] || 0;
  let max = leafValues[0] || 0;

  leafValues.forEach((value: number) => {
    min = Math.min(min, value);
    max = Math.max(max, value);
  });

  return Math.round((min + max) / 2);
}
