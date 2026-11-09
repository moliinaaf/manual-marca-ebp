import { initNavigation } from './navigation.js';
import { initColors } from './colors.js';
import { initColorLab } from './color-lab.js';
import { initChecklist } from './checklist.js';

// Rendered pages exist before this module is loaded.
initNavigation();
initColors();
initColorLab();
initChecklist();
