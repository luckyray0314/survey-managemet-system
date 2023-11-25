const express = require('express');
const router = express.Router();
const config = require('config');
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

// const User = require('../../models/Users');
const PersonalResult = require('../../models/PersonalResults');
const PersonalResultHistory = require('../../models/PersonalResultHistory');
const Survey = require('../../models/Surveys');
const GroupSet = require('../../models/GroupSets');

// @route    GET api/personalresult/:id
// @desc     Get pure survey results
// @access   Private
router.get("/:id",  auth, async (req, res) => {
// router.get("/", auth, async (req, res) => {
  try {
    const SurveyAllResults = await PersonalResult.find({ surveyID: req.params.id });
    const surveyTitle = await Survey.find({ _id: req.params.id });
    
    var resResults = [];
    var row;
    var temp;
    // console.log("QQQ", JSON.stringify(surveyTitle[0].json.pages));
    // if(surveyTitle[0]?.intro)
    if(surveyTitle[0]?.intro === "imported"){
      resResults = JSON.parse(String(SurveyAllResults[0].surveyResultText));
      // console.log("QQQ", resResults);

    }
    else{
      SurveyAllResults.forEach(element => {
        if(element.surveyResult){
          row = '{';
          for (const ques in element.surveyResult) {
            if(ques) {
              for (const page of surveyTitle[0].json.pages) {
                
                for (const elem of page.elements) {
                  if(elem.name === ques){
                    
                    for (const choice of elem.choices) {
                      
                      if(element.surveyResult[ques] === choice.value){
                        temp = '"' + elem.title +'":"' + choice.text+'",';
                        row += temp;
                        // console.log("TMP", String(temp));
                        break;
                      }
                      
                    }
                    break;
                  }
                }
                
              }
            }
          }
          // surveyTitle.
          // let ques = element.surveyResult.
          row = row.slice(0,-1);
          row += '}'

          resResults.push(JSON.parse(String(row)));
          // console.log("ROW", JSON.parse(String(row)));
        }
            
      });
    }
    
    // console.log(resResults);
    res.json(resResults);

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    GET api/personalresult/result/:id
// @desc     Get pure survey results
// @access   Private
router.get("/result/:id",  auth, async (req, res) => {
  // router.get("/", auth, async (req, res) => {
    try {
      const SurveyAllResults = await PersonalResult.find({ surveyID: req.params.id }, 'intro customID date surveyResult surveyResultText');
      const survey = await Survey.findOne({ _id: req.params.id });
      var gsName = [];
      
      var resResults = [];
      var row;
      var temp;
      if(survey.intro === "imported"){
        resResults = JSON.parse(String(SurveyAllResults[0].surveyResultText));
        // console.log("QQQ", resResults);
      }
      else{
        if(survey.groupSet){
          for(value of survey.groupSet){
            const temp = await GroupSet.findOne({ _id: value }, 'name answers');
            gsName.push(temp);  
          };
          SurveyAllResults.forEach(element => {
            if(element.surveyResult){
              row = '{';
              for (const ques in element.surveyResult) {
                if(ques) {
                  for (const page of survey.json.pages) {
                    for (const elem of page.elements) {
                      if(elem.name === ques){
                        let s1 = (elem.title.replace(/[?:;.\s]/g, "")).toLowerCase();
                        for(const gs of gsName){
                          let s2 = gs.name.replace(/[?:;.\s]/g, "").toLowerCase();
                          if(s1 === s2){
                            for (const choice of elem.choices) {
                            
                              if(element.surveyResult[ques] === choice.value){
                                temp = '"' + elem.title +'":"' + choice.text+'",';
                                row += temp;
                                // console.log("TMP", String(temp));
                                break;
                              }
                              
                            }
                          }
                        }
                        break;
                      }
                    }
                    
                  }
                }
              }
              row += '"' + 'customID' +'":"' + element.customID+'",';
              row += '"' + 'date' +'":"' + element.date+'"';
              // row = row.slice(0,-1);
              row += '}'
  
              resResults.push(JSON.parse(String(row)));
              // console.log("ROW", JSON.parse(String(row)));
            }
                
          });
        }
        else{
          SurveyAllResults.forEach(element => {
            if(element.surveyResult){
              row = '{';
              for (const ques in element.surveyResult) {
                if(ques) {
                  for (const page of survey.json.pages) {
                    
                    for (const elem of page.elements) {
                      if(elem.name === ques){
                        
                        for (const choice of elem.choices) {
                          
                          if(element.surveyResult[ques] === choice.value){
                            temp = '"' + elem.title +'":"' + choice.text+'",';
                            row += temp;
                            // console.log("TMP", String(temp));
                            break;
                          }
                          
                        }
                        break;
                      }
                    }
                    
                  }
                }
              }
              row = row.slice(0,-1);
              row += '}'
    
              resResults.push(JSON.parse(String(row)));
            }
          });
        }
      }
      // console.log('gsID------', SurveyAllResults);
      
      res.json(resResults);
  
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  });

// @route    POST api/survey/:id
// @desc     Copy survey
// @access   Private
router.post("copy/:id", auth, async (req, res) => {
    try {
      const survey = await Survey.findOne({ _id: req.params.id });

      if (survey) {
        const newTitle = survey.title + "-copy";
        newSurvey = new Survey({
          title: newTitle,
          intro: survey.intro,
          lang: survey.lang,
          json: survey.json,
          text: survey.text,
          groupSet: survey.groupSet,
          custom: survey.custom
        });
  
        await newSurvey.save();

        const surveys = await Survey.find().sort({ date: 1 });
        res.json(surveys);
        
        // return res.status(400).json({
        //   errors: [{ msg: "Survey copyed" }],
        // });
      }

    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route    GET api/personalresult/save
// @desc     Create default survey
// @access   Private

router.post("/save", async (req, res) => {
  try {
    const newpresult = new PersonalResult({
      surveyID: req.body.id,
      customID: req.body.customID,
      surveyResult: req.body.surveyResult,
      surveyResultText: req.body.surveyResultText,
      // surveyTime: req.body.surveyTime,
    });

    await newpresult.save();

    const newpresulthistory = new PersonalResultHistory({
      surveyID: req.body.id,
      customID: req.body.customID,
      surveyResult: req.body.surveyResult,
      surveyResultText: req.body.surveyResultText,
      // surveyTime: req.body.surveyTime,
    });

    await newpresulthistory.save();
    // console.log('________________create post', newSurvey.title);

    res.json(newpresult);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});



// @route    GET api/personalresult/:id
// @desc     Get survey by ID
// @access   Private
// router.get("/:id", async (req, res) => {
//   try {
//     const surveyResult = await PersonalResult.find({ surveyID: req.params.id });
//     // const survey = await Survey.findById(req.params.id);

//     if (!surveyResult) {
//       return res.status(404).json({ msg: "Survey not found" });
//     }

//     res.json(surveyResult);
//   } catch (err) {
//     console.error(err.message);
//     if (err.kind === "ObjectId") {
//       return res.status(404).json({ msg: "Survey not found" });
//     }
//     res.status(500).send("Server Error");
//   }
// });

// @route    DELETE api/survey/:id
// @desc     Delete a survey
// @access   Private
router.delete("/:id", auth, async (req, res) => {
  try {
    await PersonalResult.deleteMany({ surveyID: req.params.id }).then(async () => {
      // const personalresult = await PersonalResult.find().sort({ date: 1 });
      // res.json(surveys);
      res.json({ msg: "Result removed" });
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Survey not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route    PUT api/survey/update/
// @desc     Update survey
// @access   Private
router.put("/update", auth, async (req, res) => {
  try {
    if (req.body.json.title) {
      newName = req.body.json.title;
      survey = await Survey.findOneAndUpdate(
        { _id: req.body.id },
        { $set: { title: newName, json: req.body.json } },
        { new: true, upsert: true }
      );
    } else
      survey = await Survey.findOneAndUpdate(
        { _id: req.body.id },
        { $set: { json: req.body.json } },
        { new: true, upsert: true }
      );
    res.json(survey);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    PUT api/survey/custom/
// @desc     Update survey
// @access   Private
router.put("/custom", auth, async (req, res) => {
  try {
      let ss = await Survey.findOne({ _id: req.body.id });
      
      let customID = String(req.body.custom);
      let newCustom = {};
      // console.log("++++++++++++", Object.is(customID), keys);
      if(ss.custom){
        newCustom = ss.custom;
        newCustom[customID] = "possible";
      }
      else{
        newCustom[customID] = "possible";
      }
      console.log("NNNNN", newCustom);
      survey = await Survey.findOneAndUpdate(
        { _id: req.body.id },
        { $set: { custom: newCustom} },
        { new: true, upsert: true }
      );
    
    res.json(survey);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    PUT api/survey/impossible/
// @desc     Update survey
// @access   Private
router.put("/impossible", auth, async (req, res) => {
  try {
      let ss = await Survey.findOne({ _id: req.body.id });
      
      let customID = String(req.body.custom);
      let newCustom = {};
      // console.log("++++++++++++", Object.is(customID), keys);
      if(ss.custom){
        newCustom = ss.custom;
        newCustom[customID] = "impossible";
      }
      else{
        newCustom[customID] = "impossible";
      }
      // console.log("NNNNN", newCustom);
      survey = await Survey.findOneAndUpdate(
        { _id: req.body.id },
        { $set: { custom: newCustom} },
        { new: true, upsert: true }
      );
    
    res.json(survey);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
