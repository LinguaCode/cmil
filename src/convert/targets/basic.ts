/**
 * BASIC: what a teacher writes, in FreeBASIC, the BASIC of QBasic's heritage that builds on Linux, that prints what
 * the CMIL program prints. Numbers are Integer or Double, texts String, lists dynamic arrays, which count from 0 and
 * grow by ReDim Preserve; print joins its values with &, and the answers of the user come from the console, which
 * Open Cons reads, also from a pipe. Names have only Latin letters, as in Pascal, whatever their case. What arrays
 * can't hold, like a list of lists or a function that gives a list, is a problem, as in C. The helpers a program
 * needs come first, each with what it is for, then the functions of the program, then the program.
 */
import {COMMAND} from '../../constants/index.ts';
import TRANSLATION from '../../translations/index.ts';
import {Grammar, UNARY, fromZero, mathOf, type Code} from '../code.ts';
import {
  Before,
  Helpers,
  Names,
  Trivia,
  type FixedArrays,
  Writer,
  assignedIn,
  callsIn,
  changedIn,
  definitionOf,
  isJoined,
  isText,
  hasEffect,
  joinedParts,
  linesOf,
  neverEqual,
  stepOf,
  type Converted
} from '../emit.ts';
import {branchesApart, loopMade, loopOf, statementsOf, testsOf, type Braces} from '../statements.ts';
import {isList, type Type, type Types} from '../types.ts';
import type {ProgramTree} from '../../program.ts';
import type {Writers} from '../registry.ts';
import type {Expression, Statement} from '../../core/types.ts';

//the words of FreeBASIC, in small letters, which a program's names can't be whatever their case: its keywords and
//the names of its library, which FreeBASIC reserves, its operators, the names the C headers the helpers include
//declare, crt/stdio.bi and crt/math.bi, and the helpers
const RESERVED = new Set(
  [
    '_ abs abstract access acos acos_ acosf acosl alias allocate and andalso any append as asc asin asin_ asinf',
    'asinl asm assert assertwarn atan_ atan2 atan2_ atan2f atan2l atanf atanl atn base beep bin binary bit bitreset',
    'bitset bload boolean bsave bufsiz byref byte byval call callocate case cast cbool cbrt cbrtf cbrtl cbyte cdbl',
    'cdecl ceil ceilf ceill chain chdir chr cint circle class clear clearerr clng clngint close cls color command',
    'common condbroadcast condcreate conddestroy condsignal condwait cons const constructor contains continue',
    'copysign copysignf copysignl cos cos_ cosf cosh coshf coshl cosl cptr __crt_linux_stdio_bi__ __crt_math_bi__',
    '__crt_stdarg_bi__ __crt_stddef_bi__ __crt_stdio_bi__ cshort csign csng csrlin cubyte cuint culng culngint cunsg',
    'curdir cushort cva_arg cva_copy cva_end cva_start cvd cvi cvl cvlongint cvs cvshort data __date__ date',
    '__date_iso__ deallocate declare defbyte defdbl defined defint deflng deflongint defshort defsng defstr defubyte',
    'defuint defulng defulongint defushort delete destructor dim dir do _domain double draw dylibfree dylibload',
    'dylibsymbol dynamic else elseif encoding end endif enum environ eof eof_ eqv erase erf erfc erfcf erff erfn erl',
    'ermn err error exec exepath exit exp exp_ exp2 exp2f exp2l expf expl explicit export extends extern fabs fabsf',
    'fabsl false __fastcall __fb_64bit__ __fb_arg_count__ __fb_arg_extract__ __fb_arg_leftof__ __fb_arg_rightof__',
    'fb_arrayboundchk fb_arrayclear fb_arrayclearobj fb_arraydestructobj fb_arraydestructstr fb_arrayerase',
    'fb_arrayeraseobj fb_arraylbound fb_arrayredimex fb_arrayredimobj fb_arrayredimpresvex fb_arrayredimpresvobj',
    'fb_arrayredimto fb_arraysngboundchk fb_arraystrerase fb_arrayubound fb_asc __fb_asm__ fb_assert fb_assertwarn',
    'fb_atexit __fb_backend__ fb_booltostr fb_booltowstr __fb_build_date__ __fb_build_date_iso__ __fb_build_sha1__',
    'fb_chr fb_color fb_consoleinput fb_consoleview fb_cvd fb_cvdfromlongint fb_cvl fb_cvlfroms fb_cvlongint',
    'fb_cvlongintfromd fb_cvs fb_cvsfroml fb_cvshort fb_datareadbool fb_datareadbyte fb_datareaddouble',
    'fb_datareadint fb_datareadlongint fb_datareadshort fb_datareadsingle fb_datareadstr fb_datareadubyte',
    'fb_datareaduint fb_datareadulongint fb_datareadushort fb_datareadwstr fb_datarestore __fb_debug__ fb___divdi3',
    'fb_doubletostr fb_doubletowstr fb_end __fb_err__ fb_errorgetnum fb_errorresume fb_errorresumenext',
    'fb_errorsetfuncname fb_errorsethandler fb_errorsetmodname fb_errorsetnum fb_errorthrowat fb_errorthrowex',
    '__fb_eval__ fb_fileclose fb_filecloseall fb_fileget fb_filegetarray fb_filegetarrayiob fb_filegetarraylarge',
    'fb_filegetarraylargeiob fb_filegetiob fb_filegetlarge fb_filegetlargeiob fb_filegetstr fb_filegetstriob',
    'fb_filegetstrlarge fb_filegetstrlargeiob fb_filegetwstr fb_filegetwstriob fb_filegetwstrlarge',
    'fb_filegetwstrlargeiob fb_fileinput fb_filelineinput fb_filelineinputwstr fb_filelock fb_filelocklarge',
    'fb_fileopen fb_fileopencom fb_fileopencons fb_fileopenencod fb_fileopenerr fb_fileopenlpt fb_fileopenpipe',
    'fb_fileopenqb fb_fileopenscrn fb_fileopenshort fb_fileput fb_fileputarray fb_fileputarraylarge fb_fileputlarge',
    'fb_fileputstr fb_fileputstrlarge fb_fileseek fb_fileseeklarge fb_filestrinput fb_filetell fb_fileunlock',
    'fb_fileunlocklarge fb_filewstrinput fb___fixunsdfdi fb_floattostr fb_floattowstr __fb_fpmode__ __fb_fpu__',
    '__fb_gcc__ fb_gfxdraw fb_gfxdrawstring fb_gfxellipse fb_gfxget fb_gfximagecreate fb_gfximagecreateqb fb_gfxline',
    'fb_gfxpaint fb_gfxpalette fb_gfxpaletteget fb_gfxpaletteget64 fb_gfxpalettegetusing fb_gfxpalettegetusing64',
    'fb_gfxpaletteusing fb_gfxpaletteusing64 fb_gfxpoint fb_gfxpset fb_gfxput fb_gfxscreen fb_gfxscreenqb fb_gfxview',
    'fb_gfxwindow __fb_gui__ fb_hputadd fb_hputalpha fb_hputand fb_hputblend fb_hputcustom fb_hputor fb_hputpreset',
    'fb_hputpset fb_hputtrans fb_hputxor fb_hstrdeltemp __fb_iif__ fb_init fb_initsignals fb_inputbool fb_inputbyte',
    'fb_inputdouble fb_inputint fb_inputlongint fb_inputshort fb_inputsingle fb_inputstring fb_inputubyte',
    'fb_inputuint fb_inputulongint fb_inputushort fb_inputwstr fb_inttostr fb_inttowstr fb_istypeof __fb_join__',
    '__fb_lang__ fb_leftself fb_lineinput fb_lineinputwstr __fb_linux__ fb_longinttostr fb_longinttowstr',
    'fb_lprintbool fb_lprintbyte fb_lprintdouble fb_lprintint fb_lprintlongint fb_lprintshort fb_lprintsingle',
    'fb_lprintstring fb_lprintubyte fb_lprintuint fb_lprintulongint fb_lprintushort fb_lprintusinginit fb_lprintvoid',
    'fb_lprintwstr fb_ltrim fb_ltrimany fb_ltrimex fb___main fb_mcount fb_memcopy fb_memcopyclear fb_memmove',
    'fb_memswap __fb_min_version__ fb_mkd fb_mki fb_mkl fb_mklongint fb_mks fb_mkshort fb___moddi3 fb__monstartup',
    '__fb_mt__ fb_nullptrchk __fb_optimize__ __fb_option_byval__ __fb_option_dynamic__ __fb_option_escape__',
    '__fb_option_explicit__ __fb_option_gosub__ __fb_option_private__ __fb_out_dll__ __fb_out_exe__ __fb_out_lib__',
    '__fb_out_obj__ fb_pageset fb_pow fb_printbool fb_printbyte fb_printdouble fb_printint fb_printlongint',
    'fb_printshort fb_printsingle fb_printspc fb_printstring fb_printtab fb_printubyte fb_printuint fb_printulongint',
    'fb_printushort fb_printusingboolean fb_printusingdouble fb_printusingend fb_printusinginit fb_printusinglongint',
    'fb_printusingsingle fb_printusingstr fb_printusingulongint fb_printusingwstr fb_printvoid fb_printwstr',
    '__fb_query_symbol__ __fb_quote__ fb_readxy fb_rename fb_rtrim fb_rtrimany fb_rtrimex __fb_signature__',
    'fb_stralloctempdescf fb_stralloctempdescz fb_stralloctempdesczex fb_stralloctempresult fb_strassign',
    'fb_strassignmid fb_strcompare fb_strconcat fb_strconcatassign fb_strconcatbyref fb_strdelete fb_strfill1',
    'fb_strfill2 fb_strinit fb_strinstr fb_strinstrany fb_strinstrrev fb_strinstrrevany fb_strlcase2 fb_strlen',
    'fb_strlset fb_strmid fb_strrset fb_strswap fb_strtowstr fb_strucase2 fb_threadcall fb_trim fb_trimany fb_trimex',
    'fb___udivdi3 fb_uinttostr fb_uinttowstr fb_ulonginttostr fb_ulonginttowstr fb___umoddi3 __fb_uniqueid__',
    '__fb_uniqueid_pop__ __fb_uniqueid_push__ __fb_unix__ __fb_unquote__ fb_valbool __fb_vectorize__',
    '__fb_ver_major__ __fb_ver_minor__ __fb_ver_patch__ __fb_version__ fb_width fb_widthdev fb_widthfile',
    'fb_writebool fb_writebyte fb_writedouble fb_writeint fb_writelongint fb_writeshort fb_writesingle',
    'fb_writestring fb_writeubyte fb_writeuint fb_writeulongint fb_writeushort fb_writevoid fb_writewstr',
    'fb_wstralloc fb_wstrasc fb_wstrassign fb_wstrassignfroma fb_wstrassignmid fb_wstrassigntoa',
    'fb_wstrassigntoa_init fb_wstrchr fb_wstrcompare fb_wstrconcat fb_wstrconcatassign fb_wstrconcataw',
    'fb_wstrconcatwa fb_wstrdelete fb_wstrfill1 fb_wstrfill2 fb_wstrinstr fb_wstrinstrany fb_wstrinstrrev',
    'fb_wstrinstrrevany fb_wstrlcase2 fb_wstrlen fb_wstrlset fb_wstrltrim fb_wstrltrimany fb_wstrltrimex fb_wstrmid',
    'fb_wstrrset fb_wstrrtrim fb_wstrrtrimany fb_wstrrtrimex fb_wstrswap fb_wstrtostr fb_wstrtrim fb_wstrtrimany',
    'fb_wstrtrimex fb_wstrucase2 __fb_x86__ fclose fdim fdimf fdiml feof ferror fflush fgetc fgetpos fgets fgetwc',
    'fgetws field __file__ filename_max __file_nq__ fix flip floor floorf floorl fma fmaf fmal fmax fmaxf fmaxl fmin',
    'fminf fminl fmod fmodf fmodl fopen fopen_max for _fpclass_nd _fpclass_ninf _fpclass_nn _fpclass_nz _fpclass_pd',
    '_fpclass_pinf _fpclass_pn _fpclass_pz _fpclass_qnan _fpclass_snan fp_infinite fp_nan fp_normal fprintf',
    'fp_subnormal fputc fputs fputwc fputws fp_zero frac fre fread freefile freopen frexp frexpf frexpl fscanf fseek',
    'fsetpos ftell __function__ function __function_nq__ fwprintf fwrite fwscanf get getc getchar getjoystick getkey',
    'getmouse gets getw getwc getwchar gosub goto hex hibyte hiword huge_valf huge_vall hypot hypotf hypotl if iif',
    'ilogb ilogbf ilogbl imageconvertrow imagecreate imagedestroy imageinfo imp implements import include infinity',
    'inkey inp input instr instrrev int integer _iofbf _iolbf _ionbf is join kill lbound lcase ldexp ldexpf ldexpl',
    'left len let lettercount letterof letters lgamma lgammaf lgammal lib __line__ line llrint llrintf llrintl',
    'llround llroundf llroundl lobyte loc local locate lock lof log log_ log10 log10f log10l log1p log1pf log1pl',
    'log2 log2f log2l logb logbf logbl logf logl long longint loop loword lpos lprint lrint lrintf lrintl lround',
    'lroundf lroundl lset l_tmpnam ltrim m_1_pi m_2_pi m_2_sqrtpi m_e mid __mingw_fpclass_defined mkd mkdir mki mkl',
    'mklongint mks mkshort m_ln10 m_ln2 m_log10e m_log2e mod modf modff modfl m_pi m_pi_2 m_pi_4 m_sqrt1_2 m_sqrt2',
    'multikey mutexcreate mutexdestroy mutexlock mutexunlock name namespace nan nan_ nanf nanl nearbyint nearbyintf',
    'nearbyintl new next nextafter nextafterf not null object oct offsetof on open operator option or orelse out',
    'output _overflow overload paint palette pascal __path__ pclose pcopy peek perror pi _ploss pmap point',
    'pointcoord pointer poke popen pos pow powf powl preserve preset print printf private procptr property protected',
    'pset p_tmpdir ptr public put putc putchar puts putw putwc putwchar random randomize read readtext reallocate',
    'redim rem remainder remainderf remainderl remove removeitem remquo remquof remquol rename reset restore resume',
    'return rewind rgb rgba right rint rintf rintl rmdir rnd round roundf roundl roundto rset rtrim run sadd scalbln',
    'scalblnf scalblnl scalbn scalbnf scalbnl scanf scope screen screencontrol screencopy screenevent screenglproc',
    'screeninfo screenlist screenlock screenptr screenres screenset screensync screenunlock seek seek_cur seek_end',
    'seek_set select setbuf setdate setenviron setmouse settime setvbuf sgn shared shell shl short show shr sin sin_',
    'sinf _sing single sinh sinhf sinhl sinl sizeof sleep snprintf snwprintf space spc splitat splitwords sprintf',
    'sqr sqrt sqrtf sqrtl sscanf static stdcall stderr stdin stdout step stop str string strptr sub swap swprintf',
    'swscanf system tab tan tan_ tanf tanh tanhf tanhl tanl tempnam tgamma tgammaf tgammal then this __thiscall',
    'threadcall threadcreate threadwait __time__ time timer _tloss tmpfile tmp_max tmpnam to trim true trunc truncf',
    'truncl type typeof ubound ubyte ucase uinteger ulong ulongint _underflow ungetc ungetwc union unlock unsigned',
    'until ushort using va_arg va_first val valint vallng valuint valulng va_next var varptr vfprintf vfscanf',
    'vfwprintf vfwscanf view virtual vprintf vscanf vsnprintf vsnwprintf vsprintf vsscanf vswprintf vswscanf',
    'vwprintf vwscanf wait wbin wchr wend whex while width window windowtitle winput with woct wpopen wprintf write',
    'wscanf wspace wstr wstring xor zstring'
  ]
    .join(' ')
    .split(' ')
);

//the precedence of FreeBASIC's operators, from the loosest: Not binds more loosely than a comparison, so Not a = b is
//Not (a = b), & more loosely than + and -, and ^ more tightly than - before a number, so -2 ^ 2 is -(2 ^ 2)
const PRECEDENCE: Record<string, number> = {
  OrElse: 1,
  AndAlso: 2,
  '=': 4,
  '<>': 4,
  '<': 4,
  '>': 4,
  '<=': 4,
  '>=': 4,
  '&': 5,
  '+': 6,
  '-': 6,
  Mod: 7,
  '*': 8,
  '/': 8,
  '^': UNARY + 1
};
const NOT = 3;

const OPERATORS: Record<string, string> = {
  [COMMAND.AND]: 'AndAlso',
  [COMMAND.OR]: 'OrElse',
  '==': '=',
  '!=': '<>',
  '%': 'Mod'
};

const basic = new Grammar(PRECEDENCE);
const name = (text: string) => basic.atom(text);

//a power: a value with a sign is in brackets before ^, like (-2) ^ 2, and needn't be after it, like 2 ^ -1
const power = (base: Code, exponent: Code) => basic.binary('^', base, exponent, [PRECEDENCE['^'] + 1, UNARY]);

//a text as FreeBASIC writes it: in double quotes, with "" for a quote; one with a new line or a tab is a text of
//escapes, like !"one\ntwo"
const literal = (text: string): string =>
  /[\n\t]/.test(text)
    ? `!"${text.replace(/[\\"\n\t]/g, mark => ({'\\': '\\\\', '"': '\\"', '\n': '\\n', '\t': '\\t'})[mark]!)}"`
    : `"${text.replaceAll('"', '""')}"`;

//the blocks of FreeBASIC, ended by End If, Loop and Next, or by Loop While of a loop that tests its condition after
//its block
const BLOCKS: Braces = {head: text => text, tail: text => text};

//the types of the items of a list, by which its helpers are overloaded
type Kind = 'Integer' | 'Double' | 'String' | 'Boolean';

type HelperContext = {words: [string, string]; kinds: Kind[]};
type Helper = {code: (context: HelperContext) => string[]; uses?: string[]; imports?: string[]};

//a value of a kind as a text, as CMIL prints it
const textOf = (kind: Kind, value: string, words: [string, string]) =>
  kind === 'Integer'
    ? `Str(${value})`
    : kind === 'Double'
      ? `Show(${value})`
      : kind === 'Boolean'
        ? `IIf(${value}, ${literal(words[0])}, ${literal(words[1])})`
        : value;

//the helpers, by name, in the order they are written: what they include, the helpers they use, and their code, for
//the kinds of the lists they are written for
const HELPERS: Record<string, Helper> = {
  readText: {
    code: () => [
      "' an answer of the user, as a text, from the console of the program",
      'Function ReadText() As String',
      '    Dim As String answer',
      '    Line Input #1, answer',
      '    Return answer',
      'End Function'
    ]
  },
  show: {
    imports: ['crt/stdio.bi'],
    code: () => [
      "' a real number as CMIL prints it, with up to 12 digits, by sprintf() of C",
      'Function Show(ByVal value As Double) As String',
      '    Dim As ZString * 32 text',
      '    sprintf(@text, "%.12g", value)',
      '    Return text',
      'End Function'
    ]
  },
  letterCount: {
    code: () => [
      "' the letters of a text: a letter like ա has more than one byte, and each byte after its first is 10xxxxxx",
      'Function LetterCount(ByVal text As String) As Integer',
      '    Dim As Integer count = 0',
      '    For i As Integer = 0 To Len(text) - 1',
      '        If (text[i] And &HC0) <> &H80 Then count += 1',
      '    Next',
      '    Return count',
      'End Function'
    ]
  },
  letterOf: {
    code: () => [
      "' the letter of a text at a place, from 1, with all the bytes of a letter like ա",
      'Function LetterOf(ByVal text As String, ByVal place As Integer) As String',
      '    Dim As Integer count = 0',
      '    Dim As String letter',
      '    For i As Integer = 0 To Len(text) - 1',
      '        If (text[i] And &HC0) <> &H80 Then count += 1',
      '        If count = place Then letter &= Chr(text[i])',
      '    Next',
      '    Return letter',
      'End Function'
    ]
  },
  letters: {
    code: () => [
      "' the letters of a text, each a text of its own, into a list",
      'Sub Letters(ByVal text As String, result() As String)',
      '    Erase result',
      '    For i As Integer = 0 To Len(text) - 1',
      '        If (text[i] And &HC0) <> &H80 Then ReDim Preserve result(UBound(result) + 1)',
      '        result(UBound(result)) &= Chr(text[i])',
      '    Next',
      'End Sub'
    ]
  },
  splitWords: {
    code: () => [
      "' the words of a text, between its spaces, into a list",
      'Sub SplitWords(ByVal text As String, words() As String)',
      '    Erase words',
      '    Dim As String word',
      '    For i As Integer = 1 To Len(text) + 1',
      '        Dim As String mark = Mid(text, i, 1)',
      '        If mark = " " OrElse mark = Chr(9) OrElse mark = Chr(10) OrElse mark = "" Then',
      '            If word <> "" Then',
      '                ReDim Preserve words(UBound(words) + 1)',
      '                words(UBound(words)) = word',
      '                word = ""',
      '            End If',
      '        Else',
      '            word &= mark',
      '        End If',
      '    Next',
      'End Sub'
    ]
  },
  splitAt: {
    uses: ['letters'],
    code: () => [
      '\' the parts of a text between a separator, with the empty ones, into a list; its letters for ""',
      'Sub SplitAt(ByVal text As String, ByVal separator As String, parts() As String)',
      '    If separator = "" Then',
      '        Letters(text, parts())',
      '        Return',
      '    End If',
      '    Erase parts',
      '    Dim As Integer start = 1',
      '    Do',
      '        Dim As Integer found = InStr(start, text, separator)',
      '        ReDim Preserve parts(UBound(parts) + 1)',
      '        If found = 0 Then',
      '            parts(UBound(parts)) = Mid(text, start)',
      '            Exit Do',
      '        End If',
      '        parts(UBound(parts)) = Mid(text, start, found - start)',
      '        start = found + Len(separator)',
      '    Loop',
      'End Sub'
    ]
  },
  join: {
    code: ({words, kinds}) =>
      kinds.flatMap((kind, index) => [
        ...(index ? [''] : ["' the items of a list as they are printed, with a separator between them"]),
        `Function Join${index ? '' : ' Overload'} (list() As ${kind}, ByVal separator As String) As String`,
        '    Dim As String text',
        '    For i As Integer = 0 To UBound(list)',
        '        If i > 0 Then text &= separator',
        `        text &= ${textOf(kind, 'list(i)', words)}`,
        '    Next',
        '    Return text',
        'End Function'
      ])
  },
  contains: {
    code: ({kinds}) =>
      kinds.flatMap((kind, index) => [
        ...(index ? [''] : ["' whether a list has an item"]),
        `Function Contains${index ? '' : ' Overload'} (list() As ${kind}, ByVal value As ${kind}) As Boolean`,
        '    For i As Integer = 0 To UBound(list)',
        '        If list(i) = value Then Return True',
        '    Next',
        '    Return False',
        'End Function'
      ])
  },
  removeItem: {
    code: ({kinds}) =>
      kinds.flatMap((kind, index) => [
        ...(index ? [''] : ["' removes the first item of a list that is a value"]),
        `Sub RemoveItem${index ? '' : ' Overload'} (list() As ${kind}, ByVal value As ${kind})`,
        '    For i As Integer = 0 To UBound(list)',
        '        If list(i) = value Then',
        '            For j As Integer = i To UBound(list) - 1',
        '                list(j) = list(j + 1)',
        '            Next',
        '            If UBound(list) = 0 Then',
        '                Erase list',
        '            Else',
        '                ReDim Preserve list(UBound(list) - 1)',
        '            End If',
        '            Return',
        '        End If',
        '    Next',
        'End Sub'
      ])
  },
  roundTo: {
    uses: ['show'],
    code: () => [
      "' a number rounded to a count of decimals, a half up, after rounding it like it is printed, so 1.005 is 1.01",
      'Function RoundTo(ByVal number As Double, ByVal digits As Integer) As Double',
      '    Dim As Double factor = 10 ^ digits',
      '    Return Int(Val(Show(number * factor)) + 0.5) / factor',
      'End Function'
    ]
  }
};

//the BASIC type of a value that isn't a list
const scalar = (type: Type): Kind =>
  type === 'real' ? 'Double' : type === 'text' ? 'String' : type === 'boolean' ? 'Boolean' : 'Integer';

/**
 * What BASIC's arrays can't hold, besides what no language of them can: a function that gives a list, a loop that
 * changes the list it goes over, and an item added to or set in a list in no variable.
 */
export const BASIC_ARRAYS: FixedArrays = {listResults: true, changedLoops: true, changedInPlace: ['add', 'setItem']};

/**
 * Writes a program in BASIC, which BASIC_ARRAYS can hold.
 */
export const toBasic = (tree: ProgramTree, types: Types, sourceCode: string): Converted => {
  const names = new Names(tree.names, RESERVED, {caseless: true, latin: true});
  const trivia = new Trivia(tree.comments, sourceCode, "'");
  const includes = new Set<string>();
  const helpers = new Helpers(HELPERS, includes);
  //the kinds of the lists each helper of lists is written for, like Join(list() As Integer, …)
  const forKinds = new Map<string, Set<Kind>>();
  const {words: commands} = TRANSLATION[tree.language];
  const words: [string, string] = [commands.true[0], commands.false[0]];
  const definitions = tree.statements.filter(
    (statement): statement is Statement & {type: 'function'} => statement.type === 'function'
  );
  //the lines a statement needs first, like a list a function is given
  const pending = new Before();
  //whether the program reads answers, has random numbers, or pi
  let reads = false;
  let random = false;
  let pi = false;
  //the loops around the statement being written, innermost last, which Exit and Continue name
  const loops: ('For' | 'Do')[] = [];
  //whether the function being written gives a value, or is a Sub
  let gives = true;

  const typeOf = (node: Expression): Type => types.expressions.get(node) ?? 'unknown';
  const code = (node: Expression) => basic.print(expression(node));

  //the kind of the items of a list, which arrays have only of numbers, texts and booleans
  const kindOf = (list: Type): Kind => {
    const item = isList(list) ? list.list : 'unknown';
    return scalar(item);
  };

  //a helper of lists for the kind of a list
  const listHelper = (helper: string, list: Type) => {
    helpers.use(helper);
    if (!forKinds.has(helper)) forKinds.set(helper, new Set());
    forKinds.get(helper)!.add(kindOf(list));
    if (helper === 'join' && kindOf(list) === 'Double') helpers.use('show');
  };

  //a boolean in the words of the program's language, as CMIL prints it, of a comparison too, which is -1 or 0
  const inWords = (node: Expression) =>
    basic.call('IIf', [expression(node), name(literal(words[0])), name(literal(words[1]))]);

  //a value as a text: a text as it is, a whole number by Str(), which has no space before it, as Print has, and a real
  //number and a boolean as CMIL prints them
  const asText = (node: Expression, part = false): Code => {
    const type = typeOf(node);
    if (type === 'text') return expression(node);
    if (type === 'whole') return part ? expression(node) : basic.call('Str', [expression(node)]);
    if (type === 'boolean') return inWords(node);
    helpers.use('show');
    return basic.call('Show', [expression(node)]);
  };

  //values joined into a text with &, which writes a whole number as Str() does
  const joinText = (parts: Expression[]): Code =>
    parts.map(part => asText(part, parts.length > 1)).reduce((left, right) => basic.binary('&', left, right));

  //the array of a list: the variable it is in, or an array made first for a list in no variable, like a list a
  //procedure is given
  const arrayOf = (node: Expression, mutable = false): string => {
    const kind = kindOf(typeOf(node));
    if (node.type === 'variable') return names.of(node.name);
    const items = names.fresh(['items', 'list']);
    const {declared, assigned, declarations} = listForms(items, node, mutable, kind);
    //made again before each test of a loop's condition, it is a dynamic array
    pending.add(declared, {declare: declarations, compute: assigned, node});
    return items;
  };
  //a list as a procedure gets it, like scores()
  const listOf = (node: Expression, mutable = false): Code => name(`${arrayOf(node, mutable)}()`);

  //the lines that give a list in an array its items, of a list of items or of split(): declaring the array, a fixed
  //one for a list that never grows nor shrinks, given its items at once; giving it them again; and its declaration
  //alone, of a dynamic array, for a loop that gives them again before each test of its condition
  const listForms = (
    list: string,
    node: Expression,
    dynamic: boolean,
    kind = kindOf(typeOf(node))
  ): {declared: string[]; assigned: string[]; declarations: string[]} => {
    if (node.type === 'list') {
      const items = node.items.map(item => code(item));
      const declarations = [`Dim As ${kind} ${list}()`];
      if (!items.length) return {declared: declarations, assigned: [`Erase ${list}`], declarations};
      const filled = items.map((item, index) => `${list}(${index}) = ${item}`);
      const declared = dynamic
        ? [`ReDim As ${kind} ${list}(${items.length - 1})`, ...filled]
        : [`Dim As ${kind} ${list}(${items.length - 1}) = {${items.join(', ')}}`];
      return {declared, assigned: [`ReDim ${list}(${items.length - 1})`, ...filled], declarations};
    }
    if (node.type === 'call' && node.name === COMMAND.SPLIT) {
      const [text, separator] = node.args;
      helpers.use(separator ? 'splitAt' : 'splitWords');
      const call = separator
        ? `SplitAt(${code(text)}, ${code(separator)}, ${list}())`
        : `SplitWords(${code(text)}, ${list}())`;
      const declarations = [`Dim As String ${list}()`];
      return {declared: [...declarations, call], assigned: [call], declarations};
    }
    throw new Error('No BASIC array for a list from another list or a function');
  };
  const listInto = (
    list: string,
    node: Expression,
    declares: boolean,
    dynamic: boolean,
    kind = kindOf(typeOf(node))
  ): string[] => listForms(list, node, dynamic, kind)[declares ? 'declared' : 'assigned'];

  const expression = (node: Expression): Code => {
    switch (node.type) {
      case 'value':
        if (node.constant === 'pi') {
          pi = true;
          return name('PI');
        }
        if (node.constant === 'e') return basic.call('Exp', [name('1')]);
        if (typeof node.value === 'string') return name(literal(node.value));
        if (typeof node.value === 'boolean') return name(node.value ? 'True' : 'False');
        if (node.value < 0) return basic.unary('-', name(String(-node.value)));
        return name(String(node.value));
      case 'list':
        throw new Error('No BASIC for a list here');
      case 'template':
        return joinText(joinedParts(node, types));
      case 'variable':
        return name(names.of(node.name));
      case 'index':
        if (isList(typeOf(node.target)))
          return basic.call(arrayOf(node.target), [fromZero(basic, node.index, expression)]);
        helpers.use('letterOf');
        return basic.call('LetterOf', [expression(node.target), expression(node.index)]);
      case 'input':
        reads = true;
        helpers.use('readText');
        return typeOf(node) === 'real' ? basic.call('Val', [basic.call('ReadText', [])]) : basic.call('ReadText', []);
      case 'userCall': {
        const definition = definitionOf(definitions, node.name);
        const changed = changedIn(definition.body);
        return basic.call(
          names.of(node.name),
          node.args.map((arg, index) =>
            isList(typeOf(arg)) ? listOf(arg, changed.has(definition.parameters[index])) : expression(arg)
          )
        );
      }
      case 'call':
        return builtIn(node);
      case 'unary':
        if (node.operator === COMMAND.NOT) return basic.unary('Not ', expression(node.operand), NOT);
        return basic.unary(node.operator, expression(node.operand));
      case 'binary':
        return binary(node);
    }
  };

  const binary = (node: Expression & {type: 'binary'}): Code => {
    const left = typeOf(node.left);
    const right = typeOf(node.right);

    if (node.operator === '+' && typeOf(node) === 'text') return joinText(joinedParts(node, types));
    if (node.operator === COMMAND.IN) {
      if (isList(right)) {
        listHelper('contains', right);
        return basic.call('Contains', [listOf(node.right), expression(node.left)]);
      }
      return basic.binary('>', basic.call('InStr', [expression(node.right), expression(node.left)]), name('0'));
    }
    if (node.operator === '%' && (left === 'real' || right === 'real')) {
      includes.add('crt/math.bi');
      return basic.call('fmod', [expression(node.left), expression(node.right)]);
    }
    const operator = OPERATORS[node.operator] ?? node.operator;
    if (node.operator === COMMAND.AND || node.operator === COMMAND.OR) {
      const first = expression(node.left);
      const mark = pending.mark;
      const second = expression(node.right);
      if (pending.mark === mark || !hasEffect(node.right)) return basic.binary(operator, first, second);
      //the right side makes a value with an effect on lines of its own, which CMIL computes only when the left side
      //doesn't decide: the left side in a variable first, then those lines and the right side, in an If
      const made = pending.take(mark);
      const test = names.fresh(['test', 'either']);
      const unless = [
        `If ${node.operator === COMMAND.AND ? test : `Not ${test}`} Then`,
        ...linesOf(made).map(text => `    ${text}`),
        `    ${test} = ${basic.print(second)}`,
        'End If'
      ];
      pending.add([`Dim As Boolean ${test} = ${basic.print(first)}`, ...unless], {
        declare: [`Dim As Boolean ${test}`],
        compute: [`${test} = ${basic.print(first)}`, ...unless],
        node
      });
      return name(test);
    }
    if (node.operator === '==' || node.operator === '!=') {
      //values of different types are never equal in CMIL; FreeBASIC doesn't compare them
      if (neverEqual(left, right)) return name(node.operator === '==' ? 'False' : 'True');
    }
    return basic.binary(operator, expression(node.left), expression(node.right));
  };

  const builtIn = (node: Expression & {type: 'call'}): Code => {
    const [first] = node.args;
    const args = () => node.args.map(expression);
    switch (node.name) {
      case COMMAND.POW:
        return power(expression(first), expression(node.args[1]));
      case COMMAND.SQR:
        return first.type === 'variable' || first.type === 'value'
          ? basic.binary('*', expression(first), expression(first))
          : power(expression(first), name('2'));
      case COMMAND.ROUND:
        if (node.args.length === 2) {
          helpers.use('roundTo');
          return basic.call('RoundTo', args());
        }
        if (typeOf(first) === 'whole') return expression(first);
        return basic.call('Int', [basic.binary('+', expression(first), name('0.5'))]);
      case COMMAND.FLOOR:
        return typeOf(first) === 'whole' ? expression(first) : basic.call('Int', args());
      case COMMAND.CEIL:
        //the ceiling of a number is the floor of its opposite, turned around
        return typeOf(first) === 'whole'
          ? expression(first)
          : basic.unary('-', basic.call('Int', [basic.unary('-', expression(first))]));
      case COMMAND.ABS:
        return basic.call('Abs', args());
      case COMMAND.LG:
        return basic.binary('/', basic.call('Log', args()), basic.call('Log', [name('10')]));
      case COMMAND.RANDOM: {
        random = true;
        const [min, max] = node.args.length === 1 ? [null, first] : node.args;
        const count = min
          ? basic.binary('+', basic.binary('-', expression(max), expression(min)), name('1'))
          : expression(max);
        return basic.binary(
          '+',
          basic.call('Int', [basic.binary('*', name('Rnd'), count)]),
          min ? expression(min) : name('1')
        );
      }
      case COMMAND.LENGTH:
        if (isList(typeOf(first))) return basic.binary('+', basic.call('UBound', [name(arrayOf(first))]), name('1'));
        helpers.use('letterCount');
        return basic.call('LetterCount', args());
      case COMMAND.UPPER:
        return basic.call('UCase', args());
      case COMMAND.LOWER:
        return basic.call('LCase', args());
      case COMMAND.NUMBER:
        return typeOf(first) === 'text' ? basic.call('Val', args()) : expression(first);
      case COMMAND.TEXT:
        return asText(first);
      case COMMAND.JOIN: {
        listHelper('join', typeOf(first));
        return basic.call('Join', [listOf(first), node.args[1] ? expression(node.args[1]) : name('""')]);
      }
      case COMMAND.SPLIT:
        return listOf(node);
    }
    const formula = mathOf(
      basic,
      node.name,
      args(),
      (method, values) => basic.call(MATH[method], values),
      () => {
        pi = true;
        return name('PI');
      }
    );
    if (formula) return formula;
    throw new Error(`No BASIC for ${node.name}`);
  };

  //what Print prints
  const printed = (node: Expression): string => {
    if (isText(node) && node.value === '') return 'Print';
    if (isJoined(node, types)) return `Print ${basic.print(joinText(joinedParts(node, types)))}`;
    return `Print ${basic.print(asText(node))}`;
  };

  //the lines a statement needs first, then the statement
  const flushed = (texts: string[]) => {
    const all = [...linesOf(pending.take()), ...texts];
    return all;
  };

  //whether a list grows or shrinks in a scope, so it is a dynamic array, rather than a fixed one
  let dynamic = new Set<string>();

  const block = statementsOf({
    trivia,
    names,
    braces: BLOCKS,
    declare: (variable, type) => {
      if (isList(type)) return [`Dim As ${kindOf(type)} ${names.of(variable)}()`];
      return [`Dim As ${scalar(type)} ${names.of(variable)}`];
    },
    write: (statement, context) => {
      const {comment, declares, scope} = context;
      //writes the lines a statement needs first, then the statement, with the comment after its last line
      const lines = (texts: string[]) => {
        if (texts.length) texts[texts.length - 1] += comment;
        flushed(texts).forEach(text => context.line(text));
      };
      //writes the lines the head of a block needs first
      const before = () => flushed([]).forEach(text => context.line(text));
      //writes a loop, which Exit and Continue in it name
      const loop = (kind: 'For' | 'Do', write: () => void) => {
        loops.push(kind);
        write();
        loops.pop();
      };
      switch (statement.type) {
        case 'print':
          lines([printed(statement.expression)]);
          return;
        case 'assign': {
          const type = scope.get(statement.name)!;
          const variable = names.of(statement.name);
          const value = statement.expression;
          if (isList(type)) {
            types.expressions.set(value, type);
            lines(listInto(variable, value, declares, dynamic.has(statement.name)));
            return;
          }
          //an answer, read from the console of the program
          if (value.type === 'input') {
            reads = true;
            const read = typeOf(value) === 'real' ? `Input #1, ${variable}` : `Line Input #1, ${variable}`;
            lines([...(declares ? [`Dim As ${scalar(type)} ${variable}`] : []), read]);
            return;
          }
          const text = code(value);
          lines([declares ? `Dim As ${scalar(type)} ${variable} = ${text}` : `${variable} = ${text}`]);
          return;
        }
        case 'setItem': {
          const item = basic.call(names.of((statement.target as {name: string}).name), [
            fromZero(basic, statement.index, expression)
          ]);
          lines([`${basic.print(item)} = ${code(statement.expression)}`]);
          return;
        }
        case 'add': {
          const list = names.of((statement.target as {name: string}).name);
          const value = code(statement.expression);
          lines([`ReDim Preserve ${list}(UBound(${list}) + 1)`, `${list}(UBound(${list})) = ${value}`]);
          return;
        }
        case 'remove':
          listHelper('removeItem', typeOf(statement.target));
          lines([`RemoveItem(${basic.print(listOf(statement.target, true))}, ${code(statement.expression)})`]);
          return;
        case 'call':
          lines([code(statement.call)]);
          return;
        case 'return':
          lines([gives && statement.expression ? `Return ${code(statement.expression)}` : 'Return']);
          return;
        case 'if': {
          const tests = testsOf(statement, pending, condition => code(condition));
          before();
          context.blocks(
            branchesApart(statement, tests, (test, index) => `${index ? 'ElseIf' : 'If'} ${test} Then`, 'Else'),
            undefined,
            'End If'
          );
          return;
        }
        case 'while':
          loop('Do', () => {
            const test = code(statement.condition);
            const again = loopMade(context, statement, pending.take());
            context.blocks([loopOf(statement, `Do While ${test}`, again)], undefined, 'Loop');
          });
          return;
        case 'doWhile':
          loop('Do', () => {
            const tail = {text: `Loop While ${code(statement.condition)}`, line: statement.line};
            const again = loopMade(context, statement, pending.take());
            context.blocks([{text: 'Do', line: statement.doLine, body: statement.body, ...again}], tail);
          });
          return;
        case 'repeat':
          loop('For', () => {
            const counter = context.fresh(['i', 'j', 'k']);
            const head = loopOf(statement, `For ${counter} As Integer = 1 To ${code(statement.count)}`);
            before();
            context.blocks([head], undefined, 'Next');
          });
          return;
        case 'for':
          loop('For', () => {
            const counter = names.of(statement.name);
            const type = scope.get(statement.name)!;
            const {down, size, signed} = stepOf(statement);
            const step = size
              ? ` Step ${down ? '-' : ''}${basic.print(basic.bracketed(expression(size), UNARY))}`
              : down
                ? ' Step -1'
                : '';
            const start = declares ? `${counter} As ${scalar(type)}` : counter;
            //a real last value, like Sqr(n), is the whole number a whole counter reaches, which For would round to
            const to = expression(statement.to);
            const reached = (down: boolean) =>
              down ? basic.unary('-', basic.call('Int', [basic.unary('-', to)])) : basic.call('Int', [to]);
            //by the sign of a step that shows only as the program runs
            const last =
              type !== 'whole' || typeOf(statement.to) !== 'real'
                ? to
                : signed
                  ? basic.call('IIf', [basic.binary('>', expression(size!), name('0')), reached(false), reached(true)])
                  : reached(down);
            const head = loopOf(statement, `For ${start} = ${code(statement.from)} To ${basic.print(last)}${step}`);
            before();
            context.blocks([head], undefined, 'Next');
          });
          return;
        case 'forEach':
          loop('For', () => {
            const type = typeOf(statement.expression);
            const variable = names.of(statement.name);
            const counter = context.fresh(['i', 'j', 'k']);
            const item = scope.get(statement.name)!;
            const given = (value: string) =>
              declares ? `Dim As ${scalar(item)} ${variable} = ${value}` : `${variable} = ${value}`;
            let head: string;
            let first: string;
            if (isList(type)) {
              //CMIL goes over the items the list had when the loop started, which an array would need copied
              const array = arrayOf(statement.expression);
              head = `For ${counter} As Integer = 0 To UBound(${array})`;
              first = given(`${array}(${counter})`);
            } else {
              //the letters of a text, each a text of its own
              helpers.use('letterCount');
              helpers.use('letterOf');
              const text = code(statement.expression);
              head = `For ${counter} As Integer = 1 To LetterCount(${text})`;
              first = given(`LetterOf(${text}, ${counter})`);
            }
            before();
            context.blocks([loopOf(statement, head, {first: [first]})], undefined, 'Next');
          });
          return;
        case 'break':
          lines([`Exit ${loops[loops.length - 1]}`]);
          return;
        case 'continue':
          lines([`Continue ${loops[loops.length - 1]}`]);
          return;
      }
    }
  });

  //the lists of a scope that grow or shrink, or that it gives a function that changes them, and those given more
  //than one value, which are ReDim'd
  const growing = (statements: Statement[]) => {
    const lists = changedIn(statements);
    for (const [variable, count] of assignedIn(statements)) if (count > 1) lists.add(variable);
    return lists;
  };

  //a function of the program: a list is its array, a text and a number its own copy, ByVal; a function that gives no
  //value is a Sub
  const signature = (definition: Statement & {type: 'function'}) => {
    const scope = types.variables.get(definition.name)!;
    const result = types.results.get(definition.name)!;
    const parameters = definition.parameters.map(parameter => {
      const type = scope.get(parameter)!;
      if (isList(type)) {
        return `${names.of(parameter)}() As ${kindOf(type)}`;
      }
      return `ByVal ${names.of(parameter)} As ${scalar(type)}`;
    });
    return result === 'unknown'
      ? `Sub ${names.of(definition.name)}(${parameters.join(', ')})`
      : `Function ${names.of(definition.name)}(${parameters.join(', ')}) As ${scalar(result)}`;
  };

  const functions = new Writer('    ');
  for (const definition of definitions) {
    const scope = types.variables.get(definition.name)!;
    gives = types.results.get(definition.name) !== 'unknown';
    dynamic = growing(definition.body);
    trivia.before(functions, definition.line);
    functions.line(`${signature(definition)}${trivia.after(definition.line)}`, definition.line);
    functions.block(() => block(functions, definition.body, scope, new Set(definition.parameters)));
    functions.line(gives ? 'End Function' : 'End Sub');
    functions.blank();
  }
  gives = true;
  dynamic = growing(tree.statements.filter(statement => statement.type !== 'function'));
  const main = new Writer('    ');
  block(main, tree.statements, types.variables.get('')!, new Set());
  trivia.rest(main);

  //a function called by one written before it needs its Declare first
  const forwards = definitions.filter((definition, index) =>
    definitions.slice(0, index).some(earlier => callsIn(earlier).has(definition.name))
  );

  const out = new Writer('    ');
  for (const include of ['crt/stdio.bi', 'crt/math.bi'].filter(each => includes.has(each))) {
    out.line(`#include "${include}"`);
  }
  if (pi) {
    out.blank();
    out.line('Const PI As Double = 3.141592653589793');
  }
  helpers.write(out, (helper, helperName) => helper.code({words, kinds: [...(forKinds.get(helperName) ?? [])]}));
  if (forwards.length) {
    out.blank();
    forwards.forEach(definition => out.line(`Declare ${signature(definition)}`));
  }
  out.blank();
  out.append(functions);
  out.blank();
  if (reads) out.line("Open Cons For Input As #1 ' the answers of the user");
  if (random) out.line("Randomize ' other random numbers each time");
  out.append(main);
  return out.converted();
};

//the functions of math by the names most languages give them, as FreeBASIC names them
const MATH: Record<string, string> = {
  sqrt: 'Sqr',
  sin: 'Sin',
  cos: 'Cos',
  tan: 'Tan',
  asin: 'Asin',
  acos: 'Acos',
  atan: 'Atn',
  log: 'Log',
  pow: 'Pow'
};

/** The writer of BASIC: its targets, which cmil/convert/basic gives convert(). */
export const WRITERS: Writers = {basic: {typed: true, fixedArrays: BASIC_ARRAYS, write: toBasic}};
