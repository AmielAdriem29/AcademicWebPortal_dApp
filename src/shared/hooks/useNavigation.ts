import { useState } from 'react';
import type { NavSection } from '../shared/types';

export function useNavigation(initial: NavSection = 'vault') {
  const [active, setActive] = useState<NavSection>(initial);
  return { active, navigate: setActive };
}