const express = require('express');
const router = express.Router();
const config = require('config');
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

// const User = require('../../models/Users');
const Survey = require('../../models/Surveys');
const PersonalResult = require('../../models/PersonalResults');


const defaultSurvey = {
  title: "New Survey",
  json: {
    elements: [
      { type: "radiogroup", name: "question1", choices: ["item1", "item2", "item3"] },
    ],
  },
};


// @route    GET api/survey
// @desc     Get all surveys
// @access   Private
router.get("/", auth, async (req, res) => {
// router.get("/", auth, async (req, res) => {
  try {
    var gsName = [];
    const ss = await Survey.find().sort({ date: 1 });
    var surveys = ss;
    for(key in surveys){
      if(surveys[key].groupSet){
        for(gsID of surveys[key].groupSet){
          const temp = await GroupSet.findOne({ _id: gsID }, 'name');  
          // console.log("gsID-------", gsID);
          gsName.push(temp.name);  
        }
        surveys[key].groupSet = gsName;
        // console.log("gsID-------", surveys[key].gsName);
      }
    };
    // console.log("gsName-------", surveys);
    res.json(surveys);

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

// @route    GET api/survey/create
// @desc     Create default survey
// @access   Private

router.post("/create", auth, async (req, res) => {
  try {
    defaultSurvey.json.title = req.body.title;
    const newSurvey = new Survey({
      title: req.body.title,
      intro: req.body.intro,
      lang: req.body.lang,
      json: defaultSurvey.json,
    });

    await newSurvey.save();
    // console.log('________________create post', newSurvey.title);

    res.json(newSurvey);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    GET api/survey/createfromimport
// @desc     Create default survey
// @access   Private

router.post("/createfromimport", auth, async (req, res) => {
  try {
    // defaultSurvey.json.title = req.body.title;
    let tt = req.body.title + "  (Imported Survey)";
    const newSurvey = new Survey({
      title: tt,
      intro: req.body.intro,
      lang: req.body.lang,
      json: defaultSurvey.json,
    });

    await newSurvey.save();

    let surveyID = newSurvey._id;
    // console.log('________________data', req.body.sdata);
    const newpresult = new PersonalResult({
      surveyID: surveyID,
      customID: "imported",
      // surveyResult: req.body.sdata,
      surveyResultText: String(req.body.sdata),
      // surveyTime: req.body.surveyTime,
    });

    await newpresult.save();
    

    res.json(newSurvey);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    GET api/surveys/:id
// @desc     Get survey by ID
// @access   Private
router.get("/:id", async (req, res) => {
  try {
    const survey = await Survey.find({ _id: req.params.id });
    // const survey = await Survey.findById(req.params.id);

    if (!survey) {
      return res.status(404).json({ msg: "Survey not found" });
    }

    res.json(survey[0]);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Survey not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route    DELETE api/survey/:id
// @desc     Delete a survey
// @access   Private
router.delete("/:id", auth, async (req, res) => {
  try {
    await Survey.deleteOne({ _id: req.params.id }).then(async () => {
      const surveys = await Survey.find().sort({ date: 1 });
      res.json(surveys);
      // res.json({ msg: "Survey removed" });
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
    
    await PersonalResult.deleteMany({ surveyID: req.body.id });
    
    res.json(survey);
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    PUT api/survey/update/
// @desc     Update survey
// @access   Private
router.put("/groupset", auth, async (req, res) => {
  try {
      
      const survey = await Survey.findOneAndUpdate(
        { _id: req.body.id },
        { $set: { groupSet: req.body.groupSet } },
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
router.put("/impossible", async (req, res) => {
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
