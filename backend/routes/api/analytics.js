const express = require('express');
const router = express.Router();
const config = require('config');
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

// const User = require('../../models/Users');
const Analytics = require('../../models/Analytics');
const User = require('../../models/Users');


// @route    GET api/analytics/:id
// @desc     Get all surveys
// @access   Private
router.get("/", auth, async (req, res) => {
// router.get("/", auth, async (req, res) => {
  try {
    const surveys = await Survey.find().sort({ date: 1 });
    // console.log("BACKEND",surveys);
    res.json(surveys);

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});


// @route    POST api/analytics/:id
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

// @route    post api/analytics/
// @desc     Create default survey
// @access   Private

router.post("/", auth, async (req, res) => {
  try {
    
    const newAnalytics = new Analytics({
      surveyID: req.body.surveyID,
      noticedQuestion: req.body.noticedQuestion,
      groupSet: req.body.groupSet,
      weightingResult: req.body.weightingResult,
      weights: req.body.weights,
    });

    await newAnalytics.save();
    // console.log('________________create post', newSurvey.title);

    res.json(newAnalytics);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    GET api/analyticss/:id
// @desc     Get survey by ID
// @access   Private
router.get("/:id", async (req, res) => {
  try {
    const analytics = await Analytics.find({ surveyID: req.params.id });
    // const survey = await Survey.findById(req.params.id);

    if (!analytics) {
      return res.status(404).json({ msg: "Survey not found" });
    }

    res.json(analytics[0]);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Survey not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route    DELETE api/analytics/:id
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

// @route    PUT api/analytics/update/
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

// @route    PUT api/analytics/custom/
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

// @route    PUT api/analytics/impossible/
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
