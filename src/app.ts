/// <reference path="models/drag-drop-interfaces.ts" />
/// <reference path="models/project-models.ts" />
/// <reference path="utils/validation.ts" />
/// <reference path="state/project-state.ts" />
/// <reference path="decorators/decorator.ts" />
import { ProjectInput } from './components/project-input.ts';
import { ProjectList } from './components/project-list.ts';
import { projectState } from './state/project-state.ts';

// Base Component Class

new ProjectInput();
new ProjectList('active');
new ProjectList('finished');

projectState.updateListeners();
