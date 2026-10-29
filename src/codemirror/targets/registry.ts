/**
 * The colors of the targets targetLanguage() has, each registered by its entry, cmil/codemirror/targets/<writer>, when
 * it is imported, or loaded by the targetLanguage() of cmil/codemirror/targets when a target is first shown.
 */
import type {LanguageSupport} from '@codemirror/language';

import type {TargetId} from '../../targets.ts';

/** The CodeMirror language of each of a writer's targets. */
export type Supports = Partial<Record<TargetId, () => LanguageSupport | Promise<LanguageSupport>>>;

const SUPPORTS: Supports = {};

/** Gives targetLanguage() the language of each of the targets. */
export const registerTargetLanguages = (supports: Supports): void => {
  Object.assign(SUPPORTS, supports);
};

/** The language of a target, once its entry is imported. */
export const supportOf = (target: string): Supports[TargetId] =>
  Object.hasOwn(SUPPORTS, target) ? SUPPORTS[target as TargetId] : undefined;
