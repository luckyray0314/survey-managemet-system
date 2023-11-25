import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

// project import
// import { APP_DEFAULT_PATH } from 'config';
import { SurveyCreator, SurveyCreatorComponent } from 'survey-creator-react';

// Reducer import
import { dispatch } from 'store';
import { getSurvey, updateSurvey } from 'store/reducers/survey';

// assets
import 'survey-core/defaultV2.min.css';
import 'survey-creator-core/survey-creator-core.css';
import 'assets/css/Creator.css';

// ==============================|| ERROR 404 - MAIN ||============================== //

const Editor = () => {
  const { id } = useParams();
  // console.log("ID", id);

  const creator = useMemo(() => {
    const options = {
      // showLogicTab: true,
      // showTranslationTab: true
    };
    return new SurveyCreator(options);
  }, []);

  creator.isAutoSave = true;
  if (id)
    creator.saveSurveyFunc = (saveNo: number, callback: (no: number, success: boolean) => void) => {
      dispatch(updateSurvey({ id: id, json: creator.JSON, text: creator.text }));
      callback(saveNo, true);
    };

  useEffect(() => {
    (async () => {
      if (id) {
        const surveyAction = await dispatch(getSurvey(id));
        if (typeof surveyAction.payload.json === 'object') {
          creator.JSON = surveyAction.payload.json;
          creator.JSON.title = surveyAction.payload.title;
          // console.log('here')
        } else {
          creator.text = surveyAction.payload.json;
          creator.JSON.title = surveyAction.payload.title;
          // console.log('there')
        }
      }
    })();
  }, [dispatch, creator, id]);

  return (
    <>
      <SurveyCreatorComponent creator={creator} />
    </>
  );
};

export default Editor;
