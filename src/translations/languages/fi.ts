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
    while: ['niin_kauan_kuin'],
    repeat: ['toista'],
    times: ['kertaa'],
    break: ['keskeytä'],
    continue: ['jatka'],
    for: ['jokaiselle'],
    from: ['alkaen'],
    to: ['asti'],
    step: ['askel'],
    in: ['joukossa'],
    add: ['lisää'],
    remove: ['poista'],
    function: ['funktio'],
    return: ['palauta'],
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
    e: ['e'],
    length: ['pituus'],
    upper: ['isot_kirjaimet'],
    lower: ['pienet_kirjaimet'],
    number: ['luvuksi'],
    text: ['tekstiksi'],
    split: ['jaa'],
    join: ['yhdistä']
  },
  quotes: [['”', '”']],
  messages: {
    syntaxError: 'Syntaksivirhe rivillä {line}.',
    indentError: 'Sisennysvirhe rivillä {line}: sisennä lohkot 4 välilyönnillä.',
    argumentError: {
      one: 'Rivi {line}: {function} ottaa {count} arvon.',
      other: 'Rivi {line}: {function} ottaa {count} arvoa.'
    },
    equalsError: 'Rivi {line}: vertaa kirjoittamalla == eikä =.',
    nameError: 'Rivi {line}: {name} on komento, joten se ei voi olla nimi; valitse toinen.',
    undefinedVariable: 'Rivi {line}: muuttujalla {variable} ei ole vielä arvoa.',
    undefinedFunction: 'Rivi {line}: funktiota {function} ei ole.',
    noValue: 'Rivi {line}: {function} ei palauta arvoa.',
    typeError: 'Rivi {line}: {operator} ei toimi näillä arvoilla.',
    listAsText:
      'Rivi {line}: listaa ei tulosteta sellaisenaan; yhdistä sen alkiot tekstiksi komennolla {join} tai tulosta ne yksi kerrallaan.',
    conditionError: 'Rivi {line}: ehdon täytyy olla tosi tai epätosi.',
    divisionByZero: 'Rivi {line}: jako nollalla.',
    mathError: 'Rivi {line}: {operator} ei anna tulosta tälle arvolle.',
    indexError: 'Rivi {line}: alkiota {index} ei ole.',
    itemError: 'Rivi {line}: listassa ei ole alkiota {item}.',
    memoryLimit: 'Rivi {line}: teksti tai lista kasvoi liian pitkäksi.',
    recursionLimit: 'Rivi {line}: liian monta sisäkkäistä funktiokutsua.',
    timeout: 'Ohjelma toimi liian kauan kysymättä syötettä.',
    unknownLanguage: 'Tuntematon kieli: {language}.'
  },
  warnings: {
    numberText:
      '{text} on teksti: vastaus kuten {number} on luku, eikä luku ole koskaan sama kuin teksti. Kirjoita {number} ilman lainausmerkkejä.'
  },
  conversion: {
    mixedTypes:
      'Rivi {line}: {target} ei voi kirjoittaa tätä ohjelmaa: {name} saa kahdenlaisia arvoja, kuten luvun ja tekstin.',
    mixedItems:
      'Rivi {line}: {target} ei voi kirjoittaa tätä ohjelmaa: listassa on kahdenlaisia alkioita, kuten lukuja ja tekstejä.',
    fixedArrays:
      'Rivi {line}: {target} ei voi kirjoittaa tätä ohjelmaa ensimmäisen kurssin kiinteillä taulukoilla, kuten listaa listoista tai funktiota, joka antaa listan.'
  }
};

export default translation;
