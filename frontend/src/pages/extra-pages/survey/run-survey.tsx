import { useParams } from 'react-router';
import { useEffect, useState, useMemo } from 'react';

import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';

// Reducer import
import { dispatch, useSelector } from 'store';
import { getSurvey, impossibleCustom } from 'store/reducers/survey';
import { savePersonalResult } from 'store/reducers/personalresult';

import { useNavigate } from 'react-router';

// assets
import 'survey-core/defaultV2.min.css';
import 'survey-creator-core/survey-creator-core.css';
import 'assets/css/Creator.css';
import 'assets/css/animation.css';

var doAnimantion = true;
var direct = 1;
var old_direct = 1;
var rtl = false;

const animate = (show: boolean) => {
  // const element = document.getElementById("surveyElement");
  const x = document.querySelectorAll('div.sd-body');

  console.log('animate---------', show);
  console.log('Xanimate-------------', x);

  // For animation
  const element = x[0];
  if (!!element) {
    const list = element.classList;

    if (direct === 1 && old_direct === 1) {
      if (!list.contains('expandable')) {
        list.add('expandable');
        if (list.contains('down')) list.remove('down');
      }
      if (show) {
        list.add('expandable_show');
        if (list.contains('down_show')) list.remove('down_show');
      } else {
        list.remove('expandable_show');
      }
    }

    if (direct === 0 && old_direct === 0) {
      if (!list.contains('down')) {
        list.add('down');
        if (list.contains('expandable')) list.remove('expandable');
      }
      if (show) {
        list.add('down_show');
        if (list.contains('expandable_show')) list.remove('expandable_show');
      } else {
        list.remove('down_show');
      }
    }

    if (direct === 1 && old_direct === 0) {
      if (!list.contains('expandable')) {
        list.add('expandable');
        if (list.contains('down')) list.remove('down');
      }
      if (show) {
        list.add('expandable_show');
        if (list.contains('down_show')) list.remove('down_show');
      } else {
        list.remove('expandable_show');
      }
    }

    if (direct === 0 && old_direct === 1) {
      if (!list.contains('down')) {
        list.add('down');
        if (list.contains('expandable')) list.remove('expandable');
      }
      if (show) {
        list.add('down_show');
        if (list.contains('expandable_show')) list.remove('expandable_show');
      } else {
        list.remove('down_show');
      }
    }
  }
};

const addLetter = (show: boolean) => {
  const y = document.querySelectorAll('span.sd-item__decorator');
  const z = document.querySelectorAll('div.sd-radio');

  // For A, B, C ...
  for (let j = 0; j < y.length; j++) {
    const myspan = y[j];
    if (myspan) {
      const list = myspan.classList;
      if (list.contains('sd-radio__decorator')) {
        list.remove('sd-radio__decorator');
      }
      if (show) {
        list.remove('sd-radio__decorator');
        // console.log("num>>>>>>>", list);
      }
    }
  }

  for (let i = 0; i < z.length; i++) {
    const mydiv = z[i];
    if (mydiv) {
      const mylabel = mydiv.firstChild as HTMLInputElement;
      const divclass = mydiv.classList;

      const text = mylabel.children[2];
      let num = i + 1;
      let letter: string = '';
      switch (num) {
        case 1:
          letter = 'A';
          break;
        case 2:
          letter = 'B';
          break;
        case 3:
          letter = 'C';
          break;

        case 4:
          letter = 'D';
          break;

        case 5:
          letter = 'E';
          break;

        case 6:
          letter = 'F';
          break;

        case 7:
          letter = 'G';
          break;

        case 8:
          letter = 'H';
          break;

        case 9:
          letter = 'I';
          break;

        case 10:
          letter = 'J';
          break;

        case 11:
          letter = 'K';
          break;

        case 12:
          letter = 'L';
          break;
        case 13:
          letter = 'M';
          break;
        case 14:
          letter = 'N';
          break;

        case 15:
          letter = 'O';
          break;

        case 16:
          letter = 'P';
          break;

        case 17:
          letter = 'Q';
          break;

        case 18:
          letter = 'R';
          break;

        case 19:
          letter = 'S';
          break;

        case 20:
          letter = 'T';
          break;

        case 21:
          letter = 'U';
          break;

        case 22:
          letter = 'V';
          break;

        case 23:
          letter = 'W';
          break;

        case 24:
          letter = 'X';
          break;

        case 25:
          letter = 'Y';
          break;

        case 26:
          letter = 'Z';
          break;

        default:
          letter = '...';
      }

      if (show) {
        // console.log("num>>>>>>>", mydiv);
        if (divclass.contains('sd-item--checked')) {
          var svgspan = document.createElement('span');
          svgspan.style.width = '100%';
          if (rtl) {
            svgspan.innerHTML =
              '<div data-qa="icon-check-svg" style="float:left;"><svg height="13" width="16"><path d="M14.293.293l1.414 1.414L5 12.414.293 7.707l1.414-1.414L5 9.586z"></path></svg></div>';
          } else
            svgspan.innerHTML =
              '<div data-qa="icon-check-svg" style="float:right;"><svg height="13" width="16"><path d="M14.293.293l1.414 1.414L5 12.414.293 7.707l1.414-1.414L5 9.586z"></path></svg></div>';
          mylabel.appendChild(svgspan);
        }

        if (rtl) {
          const strText = text.children[0];
          // console.log('textt----------', strText);
          const list = strText.classList;
          list.add('text-right');
        }

        let spans = mylabel.childNodes;
        let span_add = spans[1] as HTMLSpanElement;
        span_add.innerHTML = letter;
      }
    }
  }
};

const Run = () => {
  const { id, customID } = useParams();
  // dispatch(getSurvey(String(id)));
  const { survey, status } = useSelector((state) => state.survey);
  const navigate = useNavigate();
  const [model, SetModel] = useState<Model>(new Model(survey?.json));

  useEffect(() => {
    if (status === 'idle' && id) dispatch(getSurvey(String(id)));
    if (survey?.custom) {
      let custom = Object(survey?.custom);
      if (custom[String(customID)] === 'possible') {
      } else {
        navigate('/404');
      }
    }

    // return () => window.removeEventListener('wheel', handleScroll);
    console.log('kk---------');
  }, []);

  useMemo(() => {
    if (survey) {
      SetModel(new Model(survey?.json));
      if (survey?.lang !== 'en') rtl = true;
    }
    // animate();
  }, [survey]);

  useEffect(() => {
    // animate(true);
    addLetter(true);
    model.goNextPageAutomatic = true;

    model.onCurrentPageChanging.add(function (sender: Model, options: any) {
      if (!doAnimantion) return;
      options.allowChanging = false;
      setTimeout(function () {
        doAnimantion = false;
        sender.currentPage = options.newCurrentPage;
        // console.log('Current--------------', JSON.parse(JSON.stringify(sender.currentPage)));
        doAnimantion = true;
      }, 500);
      if (options.isNextPage) {
        old_direct = direct;
        direct = 1;
      }
      if (options.isPrevPage) {
        old_direct = direct;
        direct = 0;
      }
      if (sender.isFirstPage) {
        old_direct = 1;
        direct = 1;
      }
      if (sender.isLastPage) {
        old_direct = 0;
        direct = 0;
      }
      console.log('Prev---------------', JSON.parse(JSON.stringify(sender.currentPage)));
      animate(false);
    });
    model.onCurrentPageChanged.add(function (sender: Model, options: any) {
      console.log('Current---------------', JSON.parse(JSON.stringify(sender.currentPage)));
      setTimeout(
        function () {
          animate(true);
          addLetter(true);
        },
        10,
        true
      );
    });
    model.onCompleting.add(function (sender: Model, options: any) {
      if (!doAnimantion) return;
      options.allowComplete = false;
      setTimeout(function () {
        doAnimantion = false;
        sender.doComplete();
        doAnimantion = true;
      }, 500);
      animate(false);
    });
    model.onAfterRenderSurvey.add((sender: Model, options: any) => {
      animate(true);
    });

    model.onComplete.add((sender: Model) => {
      dispatch(
        savePersonalResult({
          id: id as string,
          customID: 'customID' as string,
          surveyResult: sender.data,
          surveyResultText: JSON.stringify(sender.data),
          surveyTime: 'stime'
        })
      );
      dispatch(impossibleCustom({ id: id as string, custom: customID as string }));
    });

    let handleScroll = (event: WheelEvent) => {
      if (event.deltaY > 30) {
        model.nextPage();
      }
      if (event.deltaY < -30) {
        model.prevPage();
      }
      console.log('survey----', JSON.parse(JSON.stringify(model)));
    };
    window.addEventListener('wheel', handleScroll);
  }, [model]);

  return (
    <>
      {survey?.lang === 'en' ? (
        <Survey model={model} />
      ) : (
        <div style={{ direction: 'rtl' }}>
          <Survey model={model} />
        </div>
      )}
    </>
  );
};

export default Run;
