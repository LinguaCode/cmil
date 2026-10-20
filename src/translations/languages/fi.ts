//the words of the CMIL commands in Finnish
import type {Translation} from '../types.ts';

const translation: Translation = {
  words: {
    input: ['syötä'],
    print: ['tulosta'],
    if: ['jos'],
    else: ['muuten'],
    then: ['niin'],
    or: ['tai'],
    and: ['ja'],
    not: ['ei'],
    false: ['epätosi'],
    true: ['tosi'],
    do: ['tehdä'],
    while: ['kun'],
    repeat: ['toista'],
    times: ['kertaa'],
    break: ['keskeytä'],
    continue: ['jatka'],
    function: ['funktio'],
    random: ['satunnainen'],
    pow: ['potenssi'],
    sqr: ['neliö'],
    sqrt: ['neliöjuuri'],
    round: ['pyöristä'],
    floor: ['pyöristä_alas'],
    ceil: ['pyöristä_ylös'],
    abs: ['itseisarvo'],
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
    e: ['e']
  },
  notes: {
    while: 'Means when; is there a short word for as long as?'
  },
  //translated without a native speaker: the messages need a native review
  messages: {
    syntaxError: 'Syntaksivirhe rivillä {line}.',
    indentError: 'Sisennysvirhe rivillä {line}: sisennä lohkot 4 välilyönnillä.',
    argumentError: 'Rivi {line}: matemaattisella funktiolla on väärät argumentit.',
    equalsError: 'Rivi {line}: vertaa kirjoittamalla == eikä =.',
    undefinedVariable: 'Rivi {line}: muuttujalla {variable} ei ole vielä arvoa.',
    typeError: 'Rivi {line}: {operator} ei toimi näillä arvoilla.',
    conditionError: 'Rivi {line}: ehdon täytyy olla tosi tai epätosi.',
    divisionByZero: 'Rivi {line}: jako nollalla.',
    mathError: 'Rivi {line}: {operator} ei anna tulosta tälle arvolle.',
    memoryLimit: 'Rivi {line}: teksti kasvoi liian pitkäksi.',
    timeout: 'Ohjelma toimi liian kauan kysymättä syötettä.',
    unknownLanguage: 'Tuntematon kieli: {language}.'
  }
};

export default translation;
