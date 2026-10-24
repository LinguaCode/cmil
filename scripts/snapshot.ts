/**
 * A snapshot of the conversion: every program of the specification, and others, like the lessons of LinguaCode,
 * converted into every target and compared with a baseline, so a change of a converter shows each program it changes,
 * and a refactor none. The baseline is in .snapshot/, which git ignores.
 *
 *   npm run snapshot -- --save                    writes the baseline
 *   npm run snapshot                              lists each program whose conversion changed, and how
 *   npm run snapshot -- --targets c,x86-64        only these targets
 *   npm run snapshot -- --programs lessons.json   also the programs of a JSON list of {name, language, code}
 *
 * It ends with 1 when a conversion changed, so a script can stop there.
 */
import fs from 'node:fs';
import path from 'node:path';
import {parseArgs} from 'node:util';

import {convert, targets} from '../src/index.ts';
import {ERRORS, SUCCESSES} from '../test/collection/programs.ts';

const DIRECTORY = path.join(import.meta.dirname, '../.snapshot');
//the lines of a changed program shown, at most
const SHOWN = 20;

type Program = {name: string; language: string; code: string};

//the lines only one of two texts has, in order, by their longest common sequence: - for the first, + for the second
const differences = (before: string[], after: string[]): string[] => {
  const common = before.map(() => new Array<number>(after.length + 1).fill(0));
  common.push(new Array<number>(after.length + 1).fill(0));
  for (let i = before.length - 1; i >= 0; i--) {
    for (let j = after.length - 1; j >= 0; j--) {
      common[i][j] = before[i] === after[j] ? common[i + 1][j + 1] + 1 : Math.max(common[i + 1][j], common[i][j + 1]);
    }
  }
  const lines: string[] = [];
  let [i, j] = [0, 0];
  while (i < before.length || j < after.length) {
    if (i < before.length && j < after.length && before[i] === after[j]) {
      i++;
      j++;
    } else if (j < after.length && (i === before.length || common[i][j + 1] >= common[i + 1][j])) {
      lines.push(`+ ${after[j++]}`);
    } else {
      lines.push(`- ${before[i++]}`);
    }
  }
  return lines;
};

const {values} = parseArgs({
  options: {
    save: {type: 'boolean'},
    targets: {type: 'string'},
    programs: {type: 'string', multiple: true}
  }
});

const programs: Program[] = [
  ...[...SUCCESSES, ...ERRORS].map(({path: name, language, code}) => ({name, language, code: code!})),
  ...(values.programs ?? []).flatMap((file): Program[] => JSON.parse(fs.readFileSync(file, 'utf8')))
];
const chosen = values.targets?.split(',');
const unknown = chosen?.filter(id => !targets.some(target => target.id === id));
if (unknown?.length) throw new Error(`Unknown targets: ${unknown.join(', ')}`);

let changed = 0;
fs.mkdirSync(DIRECTORY, {recursive: true});
for (const {id} of targets.filter(target => !chosen || chosen.includes(target.id))) {
  //each program's conversion: its code with the CMIL line of each line, its problems, its error, or what the
  //converter threw
  const now = Object.fromEntries(
    programs.map(({name, language, code}) => {
      let conversion;
      try {
        conversion = convert(code, language, id);
      } catch (error) {
        conversion = {thrown: String(error)};
      }
      return [`${name} [${language}]`, JSON.stringify(conversion)];
    })
  );
  const file = path.join(DIRECTORY, `${id}.json`);
  if (values.save) {
    fs.writeFileSync(file, JSON.stringify(now, null, 1));
    continue;
  }
  if (!fs.existsSync(file)) throw new Error(`No baseline of ${id}: run npm run snapshot -- --save first`);
  const before: Record<string, string> = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const key of new Set([...Object.keys(before), ...Object.keys(now)])) {
    if (before[key] === now[key]) continue;
    changed++;
    const text = (conversion?: string) => {
      if (conversion === undefined) return [];
      const result = JSON.parse(conversion);
      return 'code' in result ? result.code.split('\n') : [conversion];
    };
    const lines = differences(text(before[key]), text(now[key]));
    console.log(`${id}: ${key}${before[key] === undefined ? ' (new)' : now[key] === undefined ? ' (gone)' : ''}`);
    //a change of the lines alone, of which CMIL line each line comes from
    if (!lines.length) console.log('  the CMIL lines of its lines changed');
    lines.slice(0, SHOWN).forEach(line => console.log(`  ${line}`));
    if (lines.length > SHOWN) console.log(`  … ${lines.length - SHOWN} more`);
  }
}
if (values.save) console.log(`Saved the conversion of ${programs.length} programs in ${DIRECTORY}`);
else console.log(changed ? `${changed} conversions changed` : `No conversion of ${programs.length} programs changed`);
process.exitCode = changed ? 1 : 0;
