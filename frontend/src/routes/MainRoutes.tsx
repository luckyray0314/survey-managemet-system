import { lazy } from 'react';

// project import
import MainLayout from 'layout/MainLayout';
import CommonLayout from 'layout/CommonLayout';
import Loadable from 'components/Loadable';
import AuthGuard from 'utils/route-guard/AuthGuard';

// pages routing
const MaintenanceError = Loadable(lazy(() => import('pages/maintenance/404')));
const MaintenanceError500 = Loadable(lazy(() => import('pages/maintenance/500')));
const MaintenanceUnderConstruction = Loadable(lazy(() => import('pages/maintenance/under-construction')));
const MaintenanceComingSoon = Loadable(lazy(() => import('pages/maintenance/coming-soon')));

// render - sample page
const SamplePage = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const MainPage = Loadable(lazy(() => import('pages/extra-pages/main-page')));
const CreateNew = Loadable(lazy(() => import('pages/extra-pages/create-new')));
const AllSurveys = Loadable(lazy(() => import('pages/extra-pages/all-surveys')));
const AllGroupSets = Loadable(lazy(() => import('pages/extra-pages/all-groupsets')));
const Analytics = Loadable(lazy(() => import('pages/extra-pages/analytics')));
const AllResults = Loadable(lazy(() => import('pages/extra-pages/all-results')));
const Results = Loadable(lazy(() => import('pages/extra-pages/results')));
const Help = Loadable(lazy(() => import('pages/extra-pages/help')));

// other page
const EditSurvey = Loadable(lazy(() => import('pages/extra-pages/survey/edit-survey')));
const RunSurvey = Loadable(lazy(() => import('pages/extra-pages/survey/run-survey')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: (
        <AuthGuard>
          <MainLayout />
        </AuthGuard>
      ),
      children: [
        {
          path: 'sample-page',
          element: <SamplePage />
        },
        {
          path: 'all-surveys',
          element: <AllSurveys />
        },
        {
          path: 'all-groupsets',
          element: <AllGroupSets />
        },
        {
          path: 'analytics',
          element: <Analytics />
        },
        {
          path: 'results',
          element: <AllResults />
        },
        {
          path: 'results/:id',
          element: <Results />
        },
        {
          path: 'create-new',
          element: <CreateNew />
        },
        {
          path: 'help',
          element: <Help />
        }
      ]
    },
    {
      path: '/maintenance',
      element: <CommonLayout />,
      children: [
        {
          path: '404',
          element: <MaintenanceError />
        },
        {
          path: '500',
          element: <MaintenanceError500 />
        },
        {
          path: 'under-construction',
          element: <MaintenanceUnderConstruction />
        },
        {
          path: 'coming-soon',
          element: <MaintenanceComingSoon />
        }
      ]
    },
    {
      path: '/',
      element: (
        <AuthGuard>
          <CommonLayout />
        </AuthGuard>
      ),
      children: [
        {
          path: 'edit-survey/:id',
          element: <EditSurvey />
        }
      ]
    },
    {
      path: '/',
      element: <CommonLayout />,
      children: [
        {
          path: 'run-survey/:id/:customID',
          element: <RunSurvey />
        },
        {
          path: '404',
          element: <MaintenanceError />
        },
        {
          path: '/',
          element: <MainPage />
        }
      ]
    }
  ]
};

export default MainRoutes;
