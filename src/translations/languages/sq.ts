//the words of the CMIL commands in Albanian
import type {Translation} from '../types.ts';

const translation: Translation = {
  words: {
    input: ['të_dhëna'],
    output: ['shkruaj'],
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
    function: ['funksioni'],
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
    ctg: ['ctg'],
    arcsin: ['arcsin'],
    arccos: ['arccos'],
    arctan: ['arctan'],
    arcctg: ['arcctg'],
    log: ['log'],
    ln: ['ln'],
    lg: ['lg'],
    pi: ['pi'],
    e: ['e']
  },
  notes: {
    input: 'Means data; would lexo (read) be better?'
  },
  //translated without a native speaker: the messages need a native review
  messages: {
    syntaxError: 'Gabim sintakse në rreshtin {line}.',
    indentError: 'Gabim kryeradhe në rreshtin {line}: kryeradhi blloqet me 4 hapësira.',
    argumentError: 'Rreshti {line}: një funksion matematik ka argumente të gabuara.',
    undefinedVariable: 'Rreshti {line}: {variable} nuk ka ende vlerë.',
    memoryLimit: 'Rreshti {line}: një tekst u bë shumë i gjatë.',
    timeout: 'Programi punoi shumë gjatë pa kërkuar hyrje.',
    unknownLanguage: 'Gjuhë e panjohur: {language}.'
  }
};

export default translation;
