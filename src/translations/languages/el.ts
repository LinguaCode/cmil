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
    in: ['σε'],
    add: ['πρόσθεσε'],
    remove: ['αφαίρεσε'],
    function: ['συνάρτηση'],
    return: ['επίστρεψε'],
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
    e: ['e'],
    length: ['μήκος'],
    upper: ['κεφαλαία'],
    lower: ['πεζά'],
    number: ['σε_αριθμό'],
    text: ['σε_κείμενο'],
    split: ['χώρισε'],
    join: ['ένωσε']
  },
  quotes: [['«', '»']],
  messages: {
    syntaxError: 'Συντακτικό σφάλμα στη γραμμή {line}.',
    indentError: 'Σφάλμα εσοχής στη γραμμή {line}: κάντε εσοχή στα μπλοκ με 4 κενά.',
    argumentError: {
      one: 'Γραμμή {line}: η {function} παίρνει {count} τιμή.',
      other: 'Γραμμή {line}: η {function} παίρνει {count} τιμές.'
    },
    equalsError: 'Γραμμή {line}: για σύγκριση γράψτε == αντί για =.',
    nameError: 'Γραμμή {line}: το {name} είναι εντολή, οπότε δεν μπορεί να είναι όνομα· διαλέξτε άλλο.',
    undefinedVariable: 'Γραμμή {line}: το {variable} δεν έχει ακόμα τιμή.',
    undefinedFunction: 'Γραμμή {line}: δεν υπάρχει συνάρτηση {function}.',
    noValue: 'Γραμμή {line}: η {function} δεν επιστρέφει τιμή.',
    typeError: 'Γραμμή {line}: το {operator} δεν λειτουργεί με αυτές τις τιμές.',
    listAsText:
      'Γραμμή {line}: μια λίστα δεν τυπώνεται όπως είναι· ενώστε τα στοιχεία της σε κείμενο με το {join} ή τυπώστε τα ένα ένα.',
    conditionError: 'Γραμμή {line}: μια συνθήκη πρέπει να είναι αληθής ή ψευδής.',
    divisionByZero: 'Γραμμή {line}: διαίρεση με το μηδέν.',
    mathError: 'Γραμμή {line}: το {operator} δεν έχει αποτέλεσμα για αυτή την τιμή.',
    indexError: 'Γραμμή {line}: δεν υπάρχει στοιχείο {index}.',
    itemError: 'Γραμμή {line}: η λίστα δεν έχει το στοιχείο {item}.',
    memoryLimit: 'Γραμμή {line}: ένα κείμενο ή μια λίστα έγινε πολύ μεγάλο.',
    recursionLimit: 'Γραμμή {line}: πάρα πολλές εμφωλευμένες κλήσεις συναρτήσεων.',
    timeout: 'Το πρόγραμμα έτρεξε πολλή ώρα χωρίς να ζητήσει είσοδο.',
    unknownLanguage: 'Άγνωστη γλώσσα: {language}.'
  },
  warnings: {
    numberText:
      'Το {text} είναι κείμενο: μια απάντηση όπως {number} είναι αριθμός, και ένας αριθμός δεν ισούται ποτέ με κείμενο. Γράψε {number} χωρίς εισαγωγικά.'
  },
  conversion: {
    mixedTypes:
      'Γραμμή {line}: η {target} δεν μπορεί να γράψει αυτό το πρόγραμμα· το {name} παίρνει τιμές δύο ειδών, όπως έναν αριθμό και ένα κείμενο.',
    mixedItems:
      'Γραμμή {line}: η {target} δεν μπορεί να γράψει αυτό το πρόγραμμα· μια λίστα έχει στοιχεία δύο ειδών, όπως αριθμούς και κείμενα.',
    fixedArrays:
      'Γραμμή {line}: η {target} δεν μπορεί να γράψει αυτό το πρόγραμμα με τους σταθερούς πίνακες ενός πρώτου μαθήματος, όπως μια λίστα από λίστες ή μια συνάρτηση που δίνει λίστα.'
  }
};

export default translation;
