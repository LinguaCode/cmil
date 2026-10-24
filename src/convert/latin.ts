/**
 * Names in Latin letters, for the languages whose names have only them, like Pascal: each letter of an alphabet as it
 * is written in Latin letters, like անուն as anun and имя as imya. A letter of no alphabet here, like a Chinese one,
 * is left out.
 */

//the letters of the alphabets, in small letters; a capital is the same, with a capital first letter
const LETTERS: Record<string, string> = {
  //Armenian
  ...Object.fromEntries(
    [...'աբգդեզէըթժիլխծկհձղճմյնշոչպջռսվտրցւփքօֆև'].map((letter, index) => [
      letter,
      'a b g d e z e y t zh i l kh ts k h dz gh ch m y n sh o ch p j r s v t r ts v p k o f ev'.split(' ')[index]
    ])
  ),
  //Cyrillic, of Russian, Ukrainian and Serbian
  ...Object.fromEntries(
    [...'абвгґдђеєёжзиіїйјклљмнњопрстћуфхцчџшщъыьэюя'].map((letter, index) => [
      letter,
      'a b v g g d dj e ye yo zh z i i yi y j k l lj m n nj o p r s t c u f kh ts ch dz sh shch _ y _ e yu ya'.split(
        ' '
      )[index]
    ])
  ),
  //Greek, whose accents are left out with the other marks
  ...Object.fromEntries(
    [...'αβγδεζηθικλμνξοπρσςτυφχψω'].map((letter, index) => [
      letter,
      'a v g d e z i th i k l m n x o p r s s t y f ch ps o'.split(' ')[index]
    ])
  ),
  //Georgian
  ...Object.fromEntries(
    [...'აბგდევზთიკლმნოპჟრსტუფქღყშჩცძწჭხჯჰ'].map((letter, index) => [
      letter,
      'a b g d e v z t i k l m n o p zh r s t u p k gh q sh ch ts dz ts ch kh j h'.split(' ')[index]
    ])
  ),
  //Hebrew
  ...Object.fromEntries(
    [...'אבגדהוזחטיכךלמםנןסעפףצץקרשת'].map((letter, index) => [
      letter,
      'a b g d h v z kh t y k k l m m n n s a p p ts ts k r sh t'.split(' ')[index]
    ])
  ),
  //Arabic
  ...Object.fromEntries(
    [...'ءآأؤإئابةتثجحخدذرزسشصضطظعغفقكلمنهوىي'].map((letter, index) => [
      letter,
      '_ a a w i y a b a t th j h kh d dh r z s sh s d t z a gh f q k l m n h w a y'.split(' ')[index]
    ])
  ),
  //Thai, its consonants and the vowels written as letters
  ...Object.fromEntries(
    [...'กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรลวศษสหฬอฮะาำเแโใไ'].map((letter, index) => [
      letter,
      'k kh kh kh kh kh ng ch ch ch s ch y d t th th th n d t th th th n b p ph f ph f ph m y r l w s s s h l o h a a am e ae o ai ai'.split(
        ' '
      )[index]
    ])
  ),
  //the letters of Latin alphabets that are no letter with a mark
  ß: 'ss',
  æ: 'ae',
  ø: 'o',
  đ: 'd',
  ł: 'l',
  ı: 'i',
  ð: 'd',
  þ: 'th',
  œ: 'oe',
  ŋ: 'ng'
};

//Japanese kana, hiragana and katakana, with their voiced letters
const KANA = [
  'あa いi うu えe おo かka きki くku けke こko さsa しshi すsu せse そso たta ちchi つtsu てte とto なna にni ぬnu',
  'ねne のno はha ひhi ふfu へhe ほho まma みmi むmu めme もmo やya ゆyu よyo らra りri るru れre ろro わwa をo んn',
  'がga ぎgi ぐgu げge ごgo ざza じji ずzu ぜze ぞzo だda ぢji づzu でde どdo ばba びbi ぶbu べbe ぼbo ぱpa ぴpi ぷpu',
  'ぺpe ぽpo ゃya ゅyu ょyo ぁa ぃi ぅu ぇe ぉo'
]
  .join(' ')
  .split(' ');
for (const pair of KANA) {
  const [kana, latin] = [pair[0], pair.slice(1)];
  LETTERS[kana] = latin;
  //the katakana of a hiragana is 0x60 after it
  LETTERS[String.fromCodePoint(kana.codePointAt(0)! + 0x60)] = latin;
}

//Korean: a syllable is a first letter, a vowel and maybe a last letter, in the Revised Romanization of Korean
const KOREAN_FIRST = 'g kk n d tt r m b pp s ss _ j jj ch k t p h'.split(' ');
const KOREAN_VOWEL = 'a ae ya yae eo e yeo ye o wa wae oe yo u wo we wi yu eu ui i'.split(' ');
const KOREAN_LAST = '_ k k k n n n t l k m l l l p l m p p t t ng t t k t p t'.split(' ');
const korean = (syllable: number) => {
  const index = syllable - 0xac00;
  const last = KOREAN_LAST[index % 28];
  const vowel = KOREAN_VOWEL[Math.floor(index / 28) % 21];
  const first = KOREAN_FIRST[Math.floor(index / 28 / 21)];
  return `${first === '_' ? '' : first}${vowel}${last === '_' ? '' : last}`;
};

//two letters written as one sound: Armenian ու and Greek ου, u
const PAIRS: [RegExp, string][] = [
  [/ու/g, 'u'],
  [/Ու/g, 'U'],
  [/ου/g, 'ou'],
  [/Ου/g, 'Ou']
];

const capital = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/**
 * A name in Latin letters, digits and _: its letters of other alphabets as they are written in Latin letters, and
 * without the letters of none; empty when none of its letters has a Latin form.
 */
export const latinOf = (name: string): string => {
  let latin = '';
  const written = PAIRS.reduce((text, [pair, latin]) => text.replace(pair, latin), name);
  for (const letter of written) {
    if (/[A-Za-z0-9_]/.test(letter)) {
      latin += letter;
      continue;
    }
    const code = letter.codePointAt(0)!;
    if (code >= 0xac00 && code <= 0xd7a3) {
      latin += korean(code);
      continue;
    }
    const small = letter.toLowerCase();
    const known = LETTERS[small] ?? LETTERS[letter];
    if (known !== undefined) {
      const written = known === '_' ? '' : known;
      latin += small !== letter ? capital(written) : written;
      continue;
    }
    //a letter with a mark, like é or ά, without the mark
    const base = letter.normalize('NFD').replace(/\p{M}/gu, '');
    if (base !== letter && [...base].length) latin += latinOf(base);
  }
  return latin;
};
