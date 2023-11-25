import { useState, ReactNode } from 'react';

// material-ui
import { Alert, Box, Button, Step, Stepper, StepLabel, Typography } from '@mui/material';

// project import
import MainCard from 'components/MainCard';
import FirstStep from './analytics/first-step';
import SecondStep from './analytics/second-step';
import ThirdStep from './analytics/third-step';

const steps = ['Select a survey for Analytics', 'Select the purpose of survey & Connect survey to GroupSets', 'Analytics completed!'];

interface StepWrapperProps {
  children?: ReactNode;
  index: number;
  value: number;
}

function StepWrapper({ children, value, index, ...other }: StepWrapperProps) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// ==============================|| STEPPER - LINEAR ||============================== //

export default function Analytics() {
  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set<number>());

  const isStepOptional = (step: number) => step === 4;

  const isStepSkipped = (step: number) => skipped.has(step);

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      // You probably want to guard against something like this,
      // it should never occur unless someone's actively trying to break something.
      throw new Error("You can't skip a step that isn't optional.");
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const hlStepperCodeString = '';

  return (
    <MainCard title="Analytics" codeString={hlStepperCodeString}>
      <>
        <Stepper activeStep={activeStep}>
          {steps.map((label, index) => {
            const stepProps: { completed?: boolean } = {};
            const labelProps: {
              optional?: ReactNode;
            } = {};
            if (isStepOptional(index)) {
              labelProps.optional = <Typography variant="caption">Optional</Typography>;
            }
            if (isStepSkipped(index)) {
              stepProps.completed = false;
            }
            return (
              <Step key={label} {...stepProps}>
                <StepLabel {...labelProps}>{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
        {activeStep === steps.length ? (
          <>
            <Alert sx={{ my: 3 }}>All steps completed - you&apos;re finished</Alert>
            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
              <Box sx={{ flex: '1 1 auto' }} />
              <Button onClick={handleReset} color="error" variant="contained">
                Reset
              </Button>
            </Box>
          </>
        ) : (
          <>
            <StepWrapper value={activeStep} index={0}>
              <Typography>
                <FirstStep />
              </Typography>
            </StepWrapper>
            <StepWrapper value={activeStep} index={1}>
              <Typography>
                <SecondStep />
              </Typography>
            </StepWrapper>
            <StepWrapper value={activeStep} index={2}>
              <Typography>
                <ThirdStep />
              </Typography>
            </StepWrapper>
            <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
              <Button variant="outlined" disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
                Back
              </Button>
              <Box sx={{ flex: '1 1 auto' }} />
              {isStepOptional(activeStep) && (
                <Button color="error" onClick={handleSkip} sx={{ mr: 1 }}>
                  Skip
                </Button>
              )}
              <Button onClick={handleNext} variant="contained" color={activeStep === steps.length - 1 ? 'success' : 'primary'}>
                {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </Box>
          </>
        )}
      </>
    </MainCard>
  );
}
