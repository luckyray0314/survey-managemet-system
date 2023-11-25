const express = require('express');
const router = express.Router();
const config = require('config');
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

const Survey = require('../../models/Surveys');
const GroupSet = require('../../models/GroupSets');
const User = require('../../models/Users');

// @route   GET api/survey/:id
// @desc    Protected route (check if the user exists)
// @access  Public
// router.get('/', auth, async (req, res) => {
//   try {
//     console.log(req.survey.id);
//     const survey = await Survey.findOne({ id: req.survey.id });
//     res.json(survey);
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).send('Server Error');
//   }
// });

// @route    GET api/groupset
// @desc     Get all groupSets
// @access   Private
router.get("/", auth, async (req, res) => {
// router.get("/", auth, async (req, res) => {
  try {
    const groupsets = await GroupSet.find().sort({ date: 1 });
    // console.log("BACKEND",surveys);
    res.json(groupsets);

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/create", auth, async (req, res) => {
  try {
    const newGroupSet = new GroupSet({
      name: req.body.name,
      participants: req.body.participants,
    });

    await newGroupSet.save();
    // console.log('________________create post', newSurvey.title);

    res.json(newGroupSet);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    GET api/groupset/:id
// @desc     Get survey by ID
// @access   Private
router.get("/:id", async (req, res) => {
  try {
    const groupset = await GroupSet.find({ _id: req.params.id });
    // const survey = await Survey.findById(req.params.id);

    if (!groupset) {
      return res.status(404).json({ msg: "Survey not found" });
    }

    res.json(groupset[0]);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Survey not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route    DELETE api/survey/:id
// @desc     Delete a groupset
// @access   Private
router.delete("/:id", auth, async (req, res) => {
  try {
    await GroupSet.deleteOne({ _id: req.params.id }).then(async () => {
      const gss = await GroupSet.find().sort({ date: 1 });
      res.json(gss);
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

// @route    PUT api/groupset/answer/
// @desc     Update groupset
// @access   Private
router.put("/answer", auth, async (req, res) => {
  try {
    // console.log("sfasfsdfasfasfssfasfd");
      let gs = await GroupSet.findOne({ _id: req.body.id });
      let answer = '{"name":"'+req.body.name+'", "size":"' + req.body.size+'"}';
      if(gs.answers){
        newAnswers = [...gs.answers, JSON.parse(answer)];
      }
      else{
        newAnswers = [JSON.parse(answer)];
      }
      // console.log("sfasfsdfasfasfssfasfd", newAnswers);
      const answers = await GroupSet.findOneAndUpdate(
        { _id: req.body.id },
        { $set: { answers: newAnswers} },
        { new: true, upsert: true }
      );
    
    res.json(answers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    PUT api/groupset/answer/
// @desc     Update groupset
// @access   Private
router.put("/changeParticipants", auth, async (req, res) => {
  try {
    // console.log("sfasfsdfasfasfssfasfd");
      // let gs = await GroupSet.findOne({ _id: req.body.id });
      
      const gs = await GroupSet.findOneAndUpdate(
        { _id: req.body.id },
        { $set: { participants: req.body.participants} },
        { new: true, upsert: true }
      );
    res.json(gs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    DELETE api/survey/delanswer
// @desc     Delete a groupset
// @access   Private
router.put("/delanswer", auth, async (req, res) => {
  try {
    let gs = await GroupSet.findOne({ _id: req.body.id });
    // let newAnswers = [];
    if(gs.answers){
      newAnswers = gs.answers;
      let ff = false;
      for(let i = 0; i<newAnswers.length-1; i++){
        if(gs.answers[i].name === req.body.name){
          ff = true;
          continue;
        }
        if(ff){
          newAnswers[i].name = gs.answers[i+1].name;
          newAnswers[i].size = gs.answers[i+1].size;
        }
        else{
          newAnswers[i].name = gs.answers[i].name;
          newAnswers[i].size = gs.answers[i].size;
        }
        
      }
      newAnswers = newAnswers.slice(0, -1);
    }
    else{
      newAnswers = null;
    }
    
    const groupSet = await GroupSet.findOneAndUpdate(
      { _id: req.body.id },
      { $set: { answers: newAnswers} },
      { new: true, upsert: true }
    );
    
    // const groupSets = await GroupSet.find().sort({ date: 1 });
    res.json(groupSet);
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    POST api/groupset/copy/:id
// @desc     Copy groupset
// @access   Private
router.post("/copy/:id", auth, async (req, res) => {
  try {
    const groupSet = await GroupSet.findOne({ _id: req.params.id });

    if (groupSet) {
      const newName = groupSet.name + "-copy";
      newGroupSet = new GroupSet({
        name: newName,
        participants: groupSet.participants,
        answers: groupSet.answers
      });

      await newGroupSet.save();

      const groupSets = await GroupSet.find().sort({ date: 1 });
      res.json(groupSets);
      
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

// @route    PUT api/groupset/update/
// @desc     Update groupset size
// @access   Private
router.put("/update", auth, async (req, res) => {
  try {
    let gs = await GroupSet.findOne({ _id: req.body.id });
    if(gs.answers){
      newAnswers = gs.answers;
      for(let i = 0; i<newAnswers.length; i++){
        if(newAnswers[i].name === req.body.name){
          newAnswers[i].size = String(req.body.size);
          break;
        }
      }
    }
    else{
      newAnswers = null;
    }
    
    const groupSet = await GroupSet.findOneAndUpdate(
      { _id: req.body.id },
      { $set: { answers: newAnswers} },
      { new: true, upsert: true }
    );
    
    // const groupSets = await GroupSet.find().sort({ date: 1 });
    res.json(groupSet);
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
