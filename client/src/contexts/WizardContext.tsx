import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type FlowchartSelection = {
  nodeId: string;
  label: string;
};

interface WizardContextType {
  selections: FlowchartSelection[];
  addSelection: (nodeId: string, label: string) => void;
  removeSelectionsAfter: (index: number) => void;
  clearSelections: () => void;
  isNodeSelected: (nodeId: string) => boolean;
  isNodeVisible: (nodeId: string, parentId: string | null) => boolean;
  getSelectedPath: () => string[];
}

const WizardContext = createContext<WizardContextType | null>(null);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [selections, setSelections] = useState<FlowchartSelection[]>([]);

  const addSelection = useCallback((nodeId: string, label: string) => {
    setSelections(prev => {
      const existingIndex = prev.findIndex(s => s.nodeId === nodeId);
      if (existingIndex >= 0) {
        return prev;
      }
      return [...prev, { nodeId, label }];
    });
  }, []);

  const removeSelectionsAfter = useCallback((index: number) => {
    setSelections(prev => prev.slice(0, index));
  }, []);

  const clearSelections = useCallback(() => {
    setSelections([]);
  }, []);

  const isNodeSelected = useCallback((nodeId: string) => {
    return selections.some(s => s.nodeId === nodeId);
  }, [selections]);

  const getSelectedPath = useCallback(() => {
    return selections.map(s => s.nodeId);
  }, [selections]);

  const isNodeVisible = useCallback((nodeId: string, parentId: string | null) => {
    if (nodeId === "start") return true;
    if (parentId === "start") return true;
    
    const selectedIds = selections.map(s => s.nodeId);
    
    if (selectedIds.includes(nodeId)) return true;
    
    if (parentId && selectedIds.includes(parentId)) return true;
    
    return false;
  }, [selections]);

  return (
    <WizardContext.Provider
      value={{
        selections,
        addSelection,
        removeSelectionsAfter,
        clearSelections,
        isNodeSelected,
        isNodeVisible,
        getSelectedPath,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
}

export function useWizardContext() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizardContext must be used within a WizardProvider");
  }
  return context;
}
