//the words of the CMIL commands in Greek
import type {Translation} from '../types.ts';

const translation: Translation = {
  words: {
    input: ['διάβασε'],
    print: ['γράψε'],
    if: ['αν'],
    else: ['αλλιώς'],
    then: ['τότε'],
    or: ['ή'],
    and: ['και'],
    not: ['όχι'],
    false: ['ψευδής'],
    true: ['αληθής'],
    do: ['κάνε'],
    while: ['όσο'],
    repeat: ['επανάλαβε'],
    times: ['φορές'],
    break: ['διάκοψε'],
    continue: ['συνέχισε'],
    for: ['για'],
    from: ['από'],
    to: ['μέχρι'],
    step: ['με_βήμα'],
    function: ['συνάρτηση'],
    random: ['τυχαία'],
    pow: ['δύναμη'],
    sqr: ['τετράγωνο'],
    sqrt: ['τετραγωνική_ρίζα'],
    round: ['στρογγυλοποίηση'],
    floor: ['στρογγυλοποίηση_κάτω'],
    ceil: ['στρογγυλοποίηση_πάνω'],
    abs: ['απόλυτη_τιμή'],
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
    for: 'A new word; it needs a native review.',
    from: 'A new word; it needs a native review.',
    to: 'A new word; it needs a native review.',
    step: 'A new word; it needs a native review.'
  },
  //translated without a native speaker: the messages need a native review
  messages: {
    syntaxError: 'Συντακτικό σφάλμα στη γραμμή {line}.',
    indentError: 'Σφάλμα εσοχής στη γραμμή {line}: κάντε εσοχή στα μπλοκ με 4 κενά.',
    argumentError: 'Γραμμή {line}: μια μαθηματική συνάρτηση έχει λάθος ορίσματα.',
    equalsError: 'Γραμμή {line}: για σύγκριση γράψτε == αντί για =.',
    undefinedVariable: 'Γραμμή {line}: το {variable} δεν έχει ακόμα τιμή.',
    typeError: 'Γραμμή {line}: το {operator} δεν λειτουργεί με αυτές τις τιμές.',
    conditionError: 'Γραμμή {line}: μια συνθήκη πρέπει να είναι αληθής ή ψευδής.',
    divisionByZero: 'Γραμμή {line}: διαίρεση με το μηδέν.',
    mathError: 'Γραμμή {line}: το {operator} δεν έχει αποτέλεσμα για αυτή την τιμή.',
    memoryLimit: 'Γραμμή {line}: ένα κείμενο έγινε πολύ μεγάλο.',
    timeout: 'Το πρόγραμμα έτρεξε πολλή ώρα χωρίς να ζητήσει είσοδο.',
    unknownLanguage: 'Άγνωστη γλώσσα: {language}.'
  }
};

export default translation;
