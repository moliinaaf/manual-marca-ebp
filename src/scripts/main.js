import { initNavigation } from './navigation.js';
import { initColors } from './colors.js';
import { initColorLab } from './color-lab.js';
import { initToneOfVoice } from './tone-of-voice.js';
import { initChecklist } from './checklist.js';
import { initExperience } from './experience.js';
import { initLogoViewer } from './logo-viewer.js';
import { initScrollStack } from './scroll-stack.js';
import { initTypographyTypewriter } from './typography-typewriter.js';

// Rendered pages exist before this module is loaded.
initNavigation();
initColors();
initColorLab();
initToneOfVoice();
initChecklist();

initExperience();
initLogoViewer();
initTypographyTypewriter();
initScrollStack();
