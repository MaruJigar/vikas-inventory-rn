import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'qera.visit';

/** The salesman's active check-in. */
interface ActiveWorkingDay {
  id: string;
  checkedInAt: string;
}

/** The salesman's active shop visit (set after Start Visit). */
interface ActiveVisit {
  visitId: string;
  shopId: string;
  shopName: string;
}

interface VisitState {
  workingDay: ActiveWorkingDay | null;
  activeVisit: ActiveVisit | null;

  hydrate: () => Promise<void>;
  setWorkingDay: (wd: ActiveWorkingDay | null) => void;
  setActiveVisit: (visit: ActiveVisit | null) => void;
  /** Clear everything (e.g. on checkout or logout). */
  reset: () => void;
}

type Persisted = Pick<VisitState, 'workingDay' | 'activeVisit'>;

const persist = (state: Persisted) =>
  void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));

export const useVisitStore = create<VisitState>((set, get) => ({
  workingDay: null,
  activeVisit: null,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Persisted;
        set({
          workingDay: parsed.workingDay ?? null,
          activeVisit: parsed.activeVisit ?? null,
        });
      }
    } catch {
      // Never block app start on a corrupt cache.
    }
  },

  setWorkingDay: (workingDay) => {
    // Ending a working day also ends any in-flight visit.
    const activeVisit = workingDay ? get().activeVisit : null;
    set({ workingDay, activeVisit });
    persist({ workingDay, activeVisit });
  },

  setActiveVisit: (activeVisit) => {
    set({ activeVisit });
    persist({ workingDay: get().workingDay, activeVisit });
  },

  reset: () => {
    set({ workingDay: null, activeVisit: null });
    persist({ workingDay: null, activeVisit: null });
  },
}));
