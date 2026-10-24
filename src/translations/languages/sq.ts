//the words of the CMIL commands in Albanian
import type {Translation} from '../types.ts';

const translation: Translation = {
  words: {
    input: ['lexo'],
    print: ['shkruaj'],
    if: ['nëse'],
    else: ['përndryshe'],
    then: ['atëherë'],
    or: ['ose'],
    and: ['dhe'],
    not: ['jo'],
    false: ['e rreme'],
    true: ['e vërtetë'],
    do: ['bëj'],
    while: ['përderisa'],
    repeat: ['përsërit'],
    times: ['herë'],
    break: ['ndalo'],
    continue: ['vazhdo'],
    for: ['për'],
    from: ['nga'],
    to: ['deri'],
    step: ['hap'],
    in: ['në'],
    add: ['shto'],
    remove: ['hiq'],
    function: ['funksioni'],
    return: ['kthe'],
    random: ['të_rastit'],
    pow: ['fuqi'],
    sqr: ['katror'],
    sqrt: ['rrënja_katrore'],
    round: ['rrumbullakos'],
    floor: ['rrumbullakos_poshtë'],
    ceil: ['rrumbullakos_lart'],
    abs: ['vlera_absolute'],
    sin: ['sin'],
    cos: ['cos'],
    tan: ['tan'],
    cot: ['ctg'],
    arcsin: ['arcsin'],
    arccos: ['arccos'],
    arctan: ['arctan'],
    arccot: ['arcctg'],
    log: ['log'],
    ln: ['ln'],
    lg: ['lg'],
    pi: ['pi'],
    e: ['e'],
    length: ['gjatësia'],
    upper: ['shkronja_të_mëdha'],
    lower: ['shkronja_të_vogla'],
    number: ['në_numër'],
    text: ['në_tekst'],
    split: ['ndaj'],
    join: ['bashko']
  },
  quotes: [['«', '»']],
  messages: {
    syntaxError: 'Gabim sintakse në rreshtin {line}.',
    indentError: 'Gabim kryeradhe në rreshtin {line}: kryeradhi blloqet me 4 hapësira.',
    argumentError: {
      one: 'Rreshti {line}: {function} merr {count} vlerë.',
      other: 'Rreshti {line}: {function} merr {count} vlera.'
    },
    equalsError: 'Rreshti {line}: për të krahasuar, shkruaj == në vend të =.',
    nameError: 'Rreshti {line}: {name} është një komandë, ndaj nuk mund të jetë emër; zgjidh një tjetër.',
    undefinedVariable: 'Rreshti {line}: {variable} nuk ka ende vlerë.',
    undefinedFunction: 'Rreshti {line}: nuk ka funksion {function}.',
    noValue: 'Rreshti {line}: {function} nuk kthen asnjë vlerë.',
    typeError: 'Rreshti {line}: {operator} nuk punon me këto vlera.',
    listAsText:
      'Rreshti {line}: një listë nuk shtypet ashtu siç është; bashko elementet e saj në një tekst me {join}, ose shtypi ato një nga një.',
    conditionError: 'Rreshti {line}: një kusht duhet të jetë i vërtetë ose i rremë.',
    divisionByZero: 'Rreshti {line}: pjesëtim me zero.',
    mathError: 'Rreshti {line}: {operator} nuk ka rezultat për këtë vlerë.',
    indexError: 'Rreshti {line}: nuk ka element {index}.',
    itemError: 'Rreshti {line}: lista nuk ka elementin {item}.',
    memoryLimit: 'Rreshti {line}: një tekst ose një listë u bë shumë i gjatë.',
    recursionLimit: 'Rreshti {line}: shumë thirrje funksionesh brenda njëra-tjetrës.',
    timeout: 'Programi punoi shumë gjatë pa kërkuar hyrje.',
    unknownLanguage: 'Gjuhë e panjohur: {language}.'
  },
  conversion: {
    mixedTypes:
      'Rreshti {line}: {target} nuk mund ta shkruajë këtë program: {name} merr vlera të dy llojeve, si një numër dhe një tekst.',
    mixedItems:
      'Rreshti {line}: {target} nuk mund ta shkruajë këtë program: një listë ka elemente të dy llojeve, si numra dhe tekste.',
    fixedArrays:
      'Rreshti {line}: {target} nuk mund ta shkruajë këtë program me vargjet fikse të një kursi të parë, si një listë listash ose një funksion që jep një listë.'
  }
};

export default translation;
