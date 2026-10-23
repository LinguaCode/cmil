//the words of the CMIL commands in Polish
import type {Translation} from '../types.ts';

const translation: Translation = {
  words: {
    input: ['wczytaj'],
    print: ['wypisz'],
    if: ['jeśli'],
    else: ['inaczej'],
    then: ['wtedy'],
    or: ['lub'],
    and: ['i'],
    not: ['nie'],
    false: ['fałsz'],
    true: ['prawda'],
    do: ['robić'],
    while: ['dopóki'],
    repeat: ['powtórzyć'],
    times: ['razy'],
    break: ['przerwij'],
    continue: ['dalej'],
    for: ['dla'],
    from: ['od'],
    to: ['do'],
    step: ['krok'],
    in: ['wśród'],
    add: ['dodaj'],
    remove: ['usuń'],
    function: ['funkcja'],
    return: ['zwróć'],
    random: ['losowy'],
    pow: ['potęga'],
    sqr: ['kwadrat'],
    sqrt: ['pierwiastek_kwadratowy'],
    round: ['zaokrąglij'],
    floor: ['zaokrąglij_w_dół'],
    ceil: ['zaokrąglij_w_górę'],
    abs: ['wartość_bezwzględna'],
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
    length: ['długość'],
    upper: ['wielkie_litery'],
    lower: ['małe_litery'],
    number: ['na_liczbę'],
    text: ['na_tekst'],
    split: ['podziel'],
    join: ['połącz']
  },
  quotes: [['„', '”']],
  messages: {
    syntaxError: 'Błąd składni w wierszu {line}.',
    indentError: 'Błąd wcięcia w wierszu {line}: wcinaj bloki o 4 spacje.',
    argumentError: {
      one: 'Wiersz {line}: {function} przyjmuje {count} wartość.',
      few: 'Wiersz {line}: {function} przyjmuje {count} wartości.',
      many: 'Wiersz {line}: {function} przyjmuje {count} wartości.',
      other: 'Wiersz {line}: {function} przyjmuje {count} wartości.'
    },
    equalsError: 'Wiersz {line}: aby porównać, pisz == zamiast =.',
    nameError: 'Wiersz {line}: {name} to polecenie, więc nie może być nazwą; wybierz inną.',
    undefinedVariable: 'Wiersz {line}: {variable} nie ma jeszcze wartości.',
    undefinedFunction: 'Wiersz {line}: nie ma funkcji {function}.',
    noValue: 'Wiersz {line}: {function} nie zwraca wartości.',
    typeError: 'Wiersz {line}: {operator} nie działa z tymi wartościami.',
    conditionError: 'Wiersz {line}: warunek musi być prawdziwy albo fałszywy.',
    divisionByZero: 'Wiersz {line}: dzielenie przez zero.',
    mathError: 'Wiersz {line}: {operator} nie ma wyniku dla tej wartości.',
    indexError: 'Wiersz {line}: nie ma elementu {index}.',
    itemError: 'Wiersz {line}: na liście nie ma elementu {item}.',
    memoryLimit: 'Wiersz {line}: tekst lub lista stały się za długie.',
    recursionLimit: 'Wiersz {line}: za dużo zagnieżdżonych wywołań funkcji.',
    timeout: 'Program działał zbyt długo, nie prosząc o dane.',
    unknownLanguage: 'Nieznany język: {language}.'
  },
  conversion: {
    mixedTypes:
      'Wiersz {line}: {target} nie może zapisać tego programu: {name} dostaje wartości dwóch rodzajów, np. liczbę i tekst.',
    mixedItems:
      'Wiersz {line}: {target} nie może zapisać tego programu: lista ma elementy dwóch rodzajów, np. liczby i teksty.'
  }
};

export default translation;
