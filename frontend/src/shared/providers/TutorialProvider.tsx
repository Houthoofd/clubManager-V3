import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import * as ReactJoyride from "react-joyride";
const Joyride = (ReactJoyride as any).default || (ReactJoyride as any).Joyride || ReactJoyride;
const STATUS = ReactJoyride.STATUS;
const EVENTS = ReactJoyride.EVENTS;
const ACTIONS = ReactJoyride.ACTIONS;
type Step = ReactJoyride.Step;
import { useAuth } from "../hooks/useAuth";
import { apiClient } from "../api/apiClient";
import { toast } from "sonner";

interface TutorialContextType {
  runTutorial: (tutorialId: string, steps: Step[]) => void;
  hasSeenTutorial: (tutorialId: string) => boolean;
  advanceTutorial: () => void;
  stopTutorial: () => void;
  isActive: boolean;
  stepIndex: number;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error("useTutorial must be used within a TutorialProvider");
  }
  return context;
};

export const TutorialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [seenTutorials, setSeenTutorials] = useState<string[]>([]);
  
  const [tutorialKey, setTutorialKey] = useState(0);
  
  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentTutorialId, setCurrentTutorialId] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (user?.id && isAuthenticated) {
      apiClient.get(`/users/${user.id}/tutorials`).then((res: any) => {
        if (res.data?.success) {
          setSeenTutorials(res.data.tutorials || []);
        }
      }).catch(console.error);
    }
  }, [user?.id, isAuthenticated]);

  const hasSeenTutorial = useCallback((tutorialId: string) => {
    return seenTutorials.includes(tutorialId);
  }, [seenTutorials]);

  const runTutorial = useCallback((tutorialId: string, newSteps: Step[]) => {
    setSteps(newSteps);
    setCurrentTutorialId(tutorialId);
    setStepIndex(0);
    setTutorialKey((prev) => prev + 1);
    setRun(true);
  }, []);

  const advanceTutorial = useCallback(() => {
    if (joyrideRef.current) {
      joyrideRef.current.getHelpers().next();
    }
  }, []);

  const stopTutorial = useCallback(() => {
    setRun(false);
  }, []);

  const handleJoyrideCallback = async (data: any) => {
    const { action, index, status, type } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
    
    if (finishedStatuses.includes(status)) {
      setRun(false);
      setStepIndex(0);
      if (user?.id && currentTutorialId && !seenTutorials.includes(currentTutorialId)) {
        try {
          await apiClient.post(`/users/${user.id}/tutorials`, { tutorialId: currentTutorialId });
          setSeenTutorials(prev => [...prev, currentTutorialId]);
        } catch (error) {
          console.error("Erreur lors de l'enregistrement du tutoriel", error);
        }
      }
    } else if (type === EVENTS.TOOLTIP) {
      setStepIndex(index);
    } else if (type === EVENTS.TARGET_NOT_FOUND) {
      console.error(`Joyride: target not found for step ${index}`, data);
      toast.error(`Cible ${data.step?.target} introuvable (Etape ${index + 1}). Action: ${action}`);
      setRun(false);
    }
  };

  return (
    <TutorialContext.Provider value={{ runTutorial, hasSeenTutorial, advanceTutorial, stopTutorial, isActive: run, stepIndex }}>
      {children}
      <Joyride
        key={tutorialKey}
        stepIndex={stepIndex}
        steps={steps}
        run={run}
        continuous
        showSkipButton
        callback={handleJoyrideCallback}
        locale={{
          back: "Précédent",
          close: "Fermer",
          last: "Terminer",
          next: "Suivant",
          skip: "Passer",
        }}
      />
    </TutorialContext.Provider>
  );
};
