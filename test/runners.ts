/**
 * The compilers and interpreters of the targets: how each builds and runs a converted program with its answers, and
 * outputsOf(), which builds and runs a list of them in one target.
 */
import assert from 'node:assert';
import {execFile, execFileSync} from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {promisify} from 'node:util';

import {convert, targets} from '../src/index.ts';
import type {Case} from './collection/types.ts';

export const has = (program: string) => {
  try {
    execFileSync('which', [program], {stdio: 'ignore'});
    return true;
  } catch {
    return false;
  }
};

const execute = promisify(execFile);

//runs a program with its answers, one on each line, and gives what it prints
const outputOf = (program: string, args: string[], inputs: (string | number)[]) =>
  new Promise<string>(resolve => {
    const child = execFile(program, args, {timeout: 10000}, (_error, stdout) => resolve(stdout.replace(/\n$/, '')));
    child.stdin!.on('error', () => {});
    child.stdin!.end(inputs.map(String).join('\n') + '\n');
  });

export type Runner = {
  tool: string;
  //whether the tool is there, when that needs more than its name on the path
  available?: () => boolean;
  //compiles the programs once, before they run, and gives the error of each that doesn't compile
  build?: (files: string[], dir: string) => Promise<Map<string, Error>>;
  run: (file: string, dir: string, inputs: Case['inputs']) => Promise<string>;
};

const DOTNET = {...process.env, DOTNET_NOLOGO: '1', DOTNET_CLI_TELEMETRY_OPTOUT: '1'};

//a .NET project of the programs in src, in C# or Visual Basic, with its properties; a Visual Basic one imports by
//itself only Microsoft.VisualBasic, which every Visual Basic project and vbc import, so a program has the rest
const dotnetProject = (properties: string[], extension: 'cs' | 'vb') =>
  [
    '<Project Sdk="Microsoft.NET.Sdk">',
    '  <PropertyGroup>',
    ...properties.map(property => `    ${property}`),
    '  </PropertyGroup>',
    '  <ItemGroup>',
    `    <Compile Include="../src/*.${extension}" />`,
    ...(extension === 'vb' ? ['    <Import Include="Microsoft.VisualBasic" />'] : []),
    '  </ItemGroup>',
    '</Project>',
    ''
  ].join('\n');

//runs the Main of the classic program of the namespace named
const DISPATCH = `static class Dispatch
{
    static void Main(string[] args)
    {
        var flags = System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Static;
        System.Type.GetType(args[0] + ".Program").GetMethod("Main", flags).Invoke(null, new object[] { new string[0] });
    }
}
`;

//runs the Main of the Visual Basic program of the namespace named
const DISPATCH_VB = `Module Dispatch
    Sub Main(args As String())
        Dim flags As System.Reflection.BindingFlags = System.Reflection.BindingFlags.Public Or System.Reflection.BindingFlags.Static
        System.Type.GetType(args(0) & ".Program").GetMethod("Main", flags).Invoke(Nothing, Nothing)
    End Sub
End Module
`;

const classOf = (file: string) => `P${path.parse(file).name}`;

//builds the C# or Visual Basic programs, all of them in one project since a build takes seconds, each in its own
//class or namespace; a program that doesn't build is left out of the next build. A modern C# program builds as dotnet
//new console builds it, which warns of values that may be null, and runs in Run() of its class; a classic one builds
//with C# 7.3 against .NET Standard 2.0, which .NET Framework 4.6.1 and later run, and runs in a project of its own, as
//a Visual Basic one does, in its namespace
const buildDotnet = (style: 'modern' | 'classic' | 'visualbasic') => async (files: string[], dir: string) => {
  const extension = style === 'visualbasic' ? 'vb' : 'cs';
  const {stdout: version} = await execute('dotnet', ['--version'], {env: DOTNET});
  const framework = `<TargetFramework>net${version.split('.')[0]}.0</TargetFramework>`;
  await fs.mkdir(path.join(dir, 'src'), {recursive: true});
  for (const file of files) {
    const lines = (await fs.readFile(file, 'utf8')).split('\n');
    //the lines a program starts with, its usings, or its Option and Imports
    const first = (line: string) => (extension === 'vb' ? /^(Option|Imports) /.test(line) : line.startsWith('using '));
    const usings = lines.filter(first);
    const rest = lines.filter(line => !first(line));
    const wrapped =
      style === 'modern'
        ? [...usings, `static class ${classOf(file)}`, '{', 'public static void Run()', '{', ...rest, '}', '}']
        : style === 'classic'
          ? [...usings, `namespace ${classOf(file)}`, '{', ...rest, '}']
          : [...usings, `Namespace ${classOf(file)}`, ...rest, 'End Namespace'];
    await fs.writeFile(path.join(dir, 'src', `${classOf(file)}.${extension}`), wrapped.join('\n'));
  }
  const projects =
    style === 'modern'
      ? {
          run: [
            '<OutputType>Exe</OutputType>',
            framework,
            '<Nullable>enable</Nullable>',
            '<ImplicitUsings>disable</ImplicitUsings>',
            '<WarningsAsErrors>nullable</WarningsAsErrors>'
          ]
        }
      : style === 'classic'
        ? {
            check: ['<TargetFramework>netstandard2.0</TargetFramework>', '<LangVersion>7.3</LangVersion>'],
            run: ['<OutputType>Exe</OutputType>', framework, '<StartupObject>Dispatch</StartupObject>']
          }
        : {
            run: [
              '<OutputType>Exe</OutputType>',
              framework,
              '<StartupObject>Dispatch</StartupObject>',
              '<RootNamespace></RootNamespace>',
              '<DisableImplicitNamespaceImports>true</DisableImplicitNamespaceImports>'
            ]
          };
  for (const [name, properties] of Object.entries(projects)) {
    await fs.mkdir(path.join(dir, name), {recursive: true});
    await fs.writeFile(path.join(dir, name, `${name}.${extension}proj`), dotnetProject(properties, extension));
  }
  if (style === 'classic') await fs.writeFile(path.join(dir, 'run', 'Dispatch.cs'), DISPATCH);
  if (style === 'visualbasic') await fs.writeFile(path.join(dir, 'run', 'Dispatch.vb'), DISPATCH_VB);

  const failed = new Map<string, Error>();
  for (let round = 0; round < 5; round++) {
    const built = files.filter(file => !failed.has(file));
    if (style === 'modern') {
      const programs = built.map(file => `    ["${classOf(file)}"] = ${classOf(file)}.Run,`);
      await fs.writeFile(
        path.join(dir, 'run', 'Main.cs'),
        [
          'var programs = new System.Collections.Generic.Dictionary<string, System.Action>',
          '{',
          ...programs,
          '};',
          'programs[args[0]]();'
        ].join('\n')
      );
    }
    let clean = true;
    for (const name of Object.keys(projects)) {
      try {
        await execute(
          'nice',
          ['-n', '19', 'dotnet', 'build', path.join(dir, name), '-c', 'Release', '-nologo', '-v', 'q'],
          {
            env: DOTNET,
            maxBuffer: 64 * 1024 * 1024
          }
        );
      } catch (error) {
        const output = String((error as {stdout?: string}).stdout ?? error);
        const errors = [...output.matchAll(/\/(P\d+)\.(?:cs|vb)\(\d+,\d+\): error .*$/gm)];
        if (!errors.length) throw error;
        for (const file of built) {
          const own = errors.filter(([, program]) => program === classOf(file)).map(([line]) => line);
          if (!own.length) continue;
          failed.set(file, new Error(`${name}: ${[...new Set(own)].join('\n')}`));
          await fs.rm(path.join(dir, 'src', `${classOf(file)}.${extension}`));
        }
        clean = false;
        break;
      }
    }
    if (clean) return failed;
  }
  throw new Error(`the ${extension === 'vb' ? 'Visual Basic' : 'C#'} programs did not build`);
};

//runs a C# or Visual Basic program of the project, by its class or namespace
const runDotnet = async (file: string, dir: string, inputs: Case['inputs'] = []) => {
  const release = path.join(dir, 'run', 'bin', 'Release');
  const [framework] = await fs.readdir(release);
  return outputOf('dotnet', [path.join(release, framework, 'run.dll'), classOf(file)], inputs);
};

//javac and java of the JDK in JAVA_HOME, else of the path; the modern shape of Java needs Java 25
const jdk = (tool: string) => (process.env.JAVA_HOME ? path.join(process.env.JAVA_HOME, 'bin', tool) : tool);
const hasJava25 = () => {
  try {
    const version = execFileSync(jdk('javac'), ['-version'], {encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']});
    return Number(/javac (\d+)/.exec(version)?.[1]) >= 25;
  } catch {
    return false;
  }
};

//the class of a Java program: the file of a compact source file names its class, and a classic Main has a package
const javaClassOf = (file: string, style: 'modern' | 'classic') =>
  style === 'modern' ? `P${path.basename(file, '.java')}` : `p${path.basename(file, '.java')}.Main`;

//builds the Java programs with one javac, since each start of it takes a second; a classic one builds for Java 8; a
//program that doesn't build is left out of the next build
const buildJava = (style: 'modern' | 'classic') => async (files: string[], dir: string) => {
  const sources = new Map<string, string>();
  for (const file of files) {
    const number = path.basename(file, '.java');
    const code = await fs.readFile(file, 'utf8');
    const source =
      style === 'modern' ? path.join(dir, 'src', `P${number}.java`) : path.join(dir, 'src', `p${number}`, 'Main.java');
    await fs.mkdir(path.dirname(source), {recursive: true});
    await fs.writeFile(source, style === 'modern' ? code : `package p${number};\n\n${code}`);
    sources.set(file, source);
  }
  const failed = new Map<string, Error>();
  for (let round = 0; round < 5; round++) {
    const built = files.filter(file => !failed.has(file));
    const options = style === 'modern' ? [] : ['--release', '8', '-Xlint:-options'];
    try {
      await execute(
        'nice',
        [
          '-n',
          '19',
          jdk('javac'),
          ...options,
          '-Xmaxerrs',
          '10000',
          '-d',
          path.join(dir, 'out'),
          ...built.map(file => sources.get(file)!)
        ],
        {maxBuffer: 64 * 1024 * 1024}
      );
      return failed;
    } catch (error) {
      const output = String((error as {stderr?: string}).stderr ?? error);
      const errors = [...output.matchAll(/^(.*\.java):\d+: error: .*$/gm)];
      if (!errors.length) throw error;
      for (const file of built) {
        const own = errors.filter(([, source]) => source === sources.get(file)).map(([line]) => line);
        if (own.length) failed.set(file, new Error(own.join('\n')));
      }
    }
  }
  throw new Error('the Java programs did not build');
};

const runJava =
  (style: 'modern' | 'classic') =>
  (file: string, dir: string, inputs: Case['inputs'] = []) =>
    outputOf(jdk('java'), ['-cp', path.join(dir, 'out'), javaClassOf(file, style)], inputs);

//kotlinc of KOTLIN_HOME, else of the path
const kotlinc = () => (process.env.KOTLIN_HOME ? path.join(process.env.KOTLIN_HOME, 'bin', 'kotlinc') : 'kotlinc');
const hasKotlin = () => {
  try {
    execFileSync(kotlinc(), ['-version'], {stdio: 'ignore'});
    return true;
  } catch {
    return false;
  }
};

//builds the Kotlin programs with one kotlinc, which starts slowly, each in a package of its own, into a jar with
//Kotlin's library; a program that doesn't build is left out of the next build
const buildKotlin = async (files: string[], dir: string) => {
  const sources = new Map<string, string>();
  await fs.mkdir(path.join(dir, 'src'), {recursive: true});
  for (const file of files) {
    const number = path.basename(file, '.kt');
    const source = path.join(dir, 'src', `p${number}.kt`);
    await fs.writeFile(source, `package p${number}\n\n${await fs.readFile(file, 'utf8')}`);
    sources.set(file, source);
  }
  const failed = new Map<string, Error>();
  for (let round = 0; round < 5; round++) {
    const built = files.filter(file => !failed.has(file));
    try {
      await execute(
        'nice',
        [
          '-n',
          '19',
          kotlinc(),
          '-nowarn',
          '-include-runtime',
          '-d',
          path.join(dir, 'programs.jar'),
          ...built.map(file => sources.get(file)!)
        ],
        {maxBuffer: 64 * 1024 * 1024}
      );
      return failed;
    } catch (error) {
      const output = String((error as {stderr?: string}).stderr ?? error);
      const errors = [...output.matchAll(/^(.*\.kt):\d+:\d+: error: .*$/gm)];
      if (!errors.length) throw error;
      for (const file of built) {
        const own = errors.filter(([, source]) => source === sources.get(file)).map(([line]) => line);
        if (own.length) failed.set(file, new Error(own.join('\n')));
      }
    }
  }
  throw new Error('the Kotlin programs did not build');
};

//runs a Kotlin program of the jar, by the class of its file, like p12.P12Kt
const runKotlin = (file: string, dir: string, inputs: Case['inputs'] = []) => {
  const number = path.basename(file, '.kt');
  return outputOf(jdk('java'), ['-cp', path.join(dir, 'programs.jar'), `p${number}.P${number}Kt`], inputs);
};

//assembly of the GNU assembler, in either syntax, which gcc builds and links with the C library
const runGnuAssembly = async (file: string, dir: string, inputs: Case['inputs'] = []) => {
  const binary = path.join(dir, path.basename(file, '.s'));
  await execute('nice', ['-n', '19', 'gcc', '-o', binary, file, '-lm']);
  return outputOf(binary, [], inputs);
};

export const RUNNERS: Record<string, Runner> = {
  cpp: {
    tool: 'g++',
    run: async (file, dir, inputs = []) => {
      const binary = path.join(dir, path.basename(file, '.cpp'));
      await execute('nice', ['-n', '19', 'g++', '-std=c++20', '-o', binary, file]);
      return outputOf(binary, [], inputs);
    }
  },
  python: {tool: 'python3', run: (file, _dir, inputs = []) => outputOf('python3', [file], inputs)},
  csharp: {tool: 'dotnet', build: buildDotnet('modern'), run: runDotnet},
  'csharp-classic': {tool: 'dotnet', build: buildDotnet('classic'), run: runDotnet},
  visualbasic: {tool: 'dotnet', build: buildDotnet('visualbasic'), run: runDotnet},
  c: {
    tool: 'gcc',
    run: async (file, dir, inputs = []) => {
      const binary = path.join(dir, path.basename(file, '.c'));
      await execute('nice', ['-n', '19', 'gcc', '-std=c99', '-pedantic', '-o', binary, file, '-lm']);
      return outputOf(binary, [], inputs);
    }
  },
  javascript: {
    tool: 'node',
    //prompt() of a browser: the next answer, from stdin
    build: async (_files, dir) => {
      await fs.writeFile(
        path.join(dir, 'prompt.cjs'),
        "const answers = require('node:fs').readFileSync(0, 'utf8').split('\\n');\nglobalThis.prompt = () => answers.shift() ?? null;\n"
      );
      return new Map();
    },
    run: (file, dir, inputs = []) =>
      outputOf(process.execPath, ['--require', path.join(dir, 'prompt.cjs'), file], inputs)
  },
  pascal: {
    tool: 'fpc',
    run: async (file, dir, inputs = []) => {
      const name = path.basename(file, '.pas');
      const out = path.join(dir, `${name}-out`);
      await fs.mkdir(out, {recursive: true});
      await execute('nice', ['-n', '19', 'fpc', '-ve', `-FE${out}`, file]);
      return outputOf(path.join(out, name), [], inputs);
    }
  },
  go: {
    tool: 'go',
    run: async (file, dir, inputs = []) => {
      const binary = path.join(dir, path.basename(file, '.go'));
      //the code is as gofmt lays it out
      assert.equal((await execute('gofmt', ['-d', file])).stdout, '');
      await execute('nice', ['-n', '19', 'go', 'build', '-o', binary, file]);
      return outputOf(binary, [], inputs);
    }
  },
  kotlin: {tool: 'kotlinc', available: hasKotlin, build: buildKotlin, run: runKotlin},
  php: {tool: 'php', run: (file, _dir, inputs = []) => outputOf('php', [file], inputs)},
  ruby: {tool: 'ruby', run: (file, _dir, inputs = []) => outputOf('ruby', [file], inputs)},
  lua: {tool: 'lua5.4', run: (file, _dir, inputs = []) => outputOf('lua5.4', [file], inputs)},
  tcl: {tool: 'tclsh', run: (file, _dir, inputs = []) => outputOf('tclsh', [file], inputs)},
  'x86-64': {tool: 'gcc', run: runGnuAssembly},
  'x86-64-att': {tool: 'gcc', run: runGnuAssembly},
  'x86-64-nasm': {
    tool: 'nasm',
    run: async (file, dir, inputs = []) => {
      const binary = path.join(dir, path.basename(file, '.asm'));
      await execute('nice', ['-n', '19', 'nasm', '-f', 'elf64', '-o', `${binary}.o`, file]);
      await execute('nice', ['-n', '19', 'gcc', '-o', binary, `${binary}.o`, '-lm']);
      return outputOf(binary, [], inputs);
    }
  },
  cobol: {
    tool: 'cobc',
    run: async (file, dir, inputs = []) => {
      const binary = path.join(dir, path.basename(file, '.cob'));
      await execute('nice', ['-n', '19', 'cobc', '-x', '-o', binary, file]);
      return outputOf(binary, [], inputs);
    }
  },
  fortran: {
    tool: 'gfortran',
    run: async (file, dir, inputs = []) => {
      const binary = path.join(dir, path.basename(file, '.f90'));
      await execute('nice', ['-n', '19', 'gfortran', '-o', binary, file]);
      return outputOf(binary, [], inputs);
    }
  },
  basic: {
    tool: 'fbc',
    run: async (file, dir, inputs = []) => {
      const binary = path.join(dir, path.basename(file, '.bas'));
      await execute('nice', ['-n', '19', 'fbc', '-x', binary, file]);
      return outputOf(binary, [], inputs);
    }
  },
  rust: {
    tool: 'rustc',
    run: async (file, dir, inputs = []) => {
      const binary = path.join(dir, path.basename(file, '.rs'));
      await execute('nice', ['-n', '19', 'rustc', '--edition', '2021', '-o', binary, file]);
      return outputOf(binary, [], inputs);
    }
  },
  swift: {
    tool: 'swiftc',
    run: async (file, dir, inputs = []) => {
      const binary = path.join(dir, path.basename(file, '.swift'));
      await execute('nice', ['-n', '19', 'swiftc', '-o', binary, file]);
      return outputOf(binary, [], inputs);
    }
  },
  java: {tool: 'javac 25', available: hasJava25, build: buildJava('modern'), run: runJava('modern')},
  'java-classic': {tool: 'javac 25', available: hasJava25, build: buildJava('classic'), run: runJava('classic')}
};

/**
 * Converts programs into a target in a folder, builds them, and runs each with its answers: what each prints, or the
 * error of one the target doesn't write, build or run.
 */
export const outputsOf = async (
  id: string,
  programs: {code: string; language: string; inputs?: Case['inputs']}[],
  dir: string
): Promise<(string | Error)[]> => {
  const runner = RUNNERS[id];
  const {extension} = targets.find(target => target.id === id)!;
  const outputs: (string | Error)[] = [];
  const files: {index: number; file: string}[] = [];
  for (const [index, {code, language}] of programs.entries()) {
    const result = convert(code, language, id);
    if (!('code' in result)) {
      outputs[index] = new Error(JSON.stringify(result));
      continue;
    }
    const file = path.join(dir, `${index}.${extension}`);
    await fs.writeFile(file, result.code);
    files.push({index, file});
  }
  const failed = runner.build
    ? await runner.build(
        files.map(({file}) => file),
        dir
      )
    : new Map<string, Error>();
  const queue = [...files];
  const work = async () => {
    for (let next; (next = queue.shift());) {
      try {
        outputs[next.index] = failed.get(next.file) ?? (await runner.run(next.file, dir, programs[next.index].inputs));
      } catch (error) {
        outputs[next.index] = error as Error;
      }
    }
  };
  await Promise.all(Array.from({length: Math.max(1, Math.floor(os.availableParallelism() / 2))}, work));
  return outputs;
};
