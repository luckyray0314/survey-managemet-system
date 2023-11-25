import { useEffect, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';

// third-party
import ReactApexChart, { Props as ChartProps } from 'react-apexcharts';

// project import
import useConfig from 'hooks/useConfig';

// types
import { ThemeMode } from 'types/config';

// chart options
const columnChartOptions = {
  chart: {
    type: 'bar',
    height: 350
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '55%',
      endingShape: 'rounded'
    }
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    show: true,
    width: 2,
    colors: ['transparent']
  },
  xaxis: {
    categories: ['Non weighted', 'Cell Weighting', 'Raking', 'Linear Regression', 'Logistic Regression', 'Weight Tuning']
  },
  yaxis: {
    title: {
      text: '$ (thousands)'
    }
  },
  fill: {
    opacity: 1
  },
  tooltip: {
    y: {
      formatter(val: number) {
        // return `$ ${val} thousands`;
        return `${val}`;
      }
    }
  },
  legend: {
    show: true,
    fontFamily: `'Roboto', sans-serif`,
    position: 'bottom',
    offsetX: 10,
    offsetY: 10,
    labels: {
      useSeriesColors: false
    },
    markers: {
      width: 16,
      height: 16,
      radius: 5
    },
    itemMargin: {
      horizontal: 15,
      vertical: 8
    }
  },
  responsive: [
    {
      breakpoint: 600,
      options: {
        yaxis: {
          show: false
        }
      }
    }
  ]
};

// ==============================|| APEXCHART - COLUMN ||============================== //

const ApexColumnChart = ({ data }: { data: any }) => {
  // const ApexColumnChart = () => {
  const theme = useTheme();
  const { mode } = useConfig();

  const { primary } = theme.palette.text;
  const line = theme.palette.divider;
  const grey200 = theme.palette.grey[200];

  const secondary = theme.palette.primary[700];
  const primaryMain = theme.palette.primary.main;
  const successDark = theme.palette.success.main;
  const error = theme.palette.error.main;
  const orangeDark = theme.palette.warning.main;

  // const [series] = useState([
  //   {
  //     name: 'Net Profit',
  //     data: [44, 55, 57, 56, 61]
  //   },
  //   {
  //     name: 'Revenue',
  //     data: [76, 85, 101, 98, 87]
  //   },
  //   {
  //     name: 'Free Cash Flow',
  //     data: [35, 41, 36, 26, 45]
  //   }
  // ]);

  const [options, setOptions] = useState<ChartProps>(columnChartOptions);

  useEffect(() => {
    setOptions((prevState) => ({
      ...prevState,
      // colors: [secondary, primaryMain, successDark],
      colors: [secondary, primaryMain, successDark, error, orangeDark],
      // labels: Object(data[0]),
      xaxis: {
        labels: {
          style: {
            colors: [primary, primary, primary, primary, primary, primary, primary, primary, primary]
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: [primary]
          }
        }
      },
      grid: {
        borderColor: line
      },
      legend: {
        labels: {
          colors: 'grey.500'
        }
      },
      theme: {
        mode: mode === ThemeMode.DARK ? 'dark' : 'light'
      }
    }));
  }, [mode, primary, line, grey200, secondary, primaryMain, successDark]);

  return (
    <Box id="chart" sx={{ bgcolor: 'transparent' }}>
      <ReactApexChart options={options} series={data} type="bar" height={350} />
      {/* <ReactApexChart options={options} series={series} type="bar" height={350} /> */}
    </Box>
  );
};

export default ApexColumnChart;
