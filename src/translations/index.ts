import ar from './languages/ar.ts';
import ca from './languages/ca.ts';
import cs from './languages/cs.ts';
import da from './languages/da.ts';
import de from './languages/de.ts';
import el from './languages/el.ts';
import en from './languages/en.ts';
import esES from './languages/es-ES.ts';
import fi from './languages/fi.ts';
import fr from './languages/fr.ts';
import he from './languages/he.ts';
import hu from './languages/hu.ts';
import hyAM from './languages/hy-AM.ts';
import it from './languages/it.ts';
import ja from './languages/ja.ts';
import ka from './languages/ka.ts';
import ko from './languages/ko.ts';
import nl from './languages/nl.ts';
import no from './languages/no.ts';
import pl from './languages/pl.ts';
import ptPT from './languages/pt-PT.ts';
import ro from './languages/ro.ts';
import ru from './languages/ru.ts';
import sk from './languages/sk.ts';
import sl from './languages/sl.ts';
import sq from './languages/sq.ts';
import sr from './languages/sr.ts';
import svSE from './languages/sv-SE.ts';
import th from './languages/th.ts';
import uk from './languages/uk.ts';
import vi from './languages/vi.ts';
import zhCN from './languages/zh-CN.ts';

/**
 * A command and its words in one language; alternative words are separated with |.
 */
export type Translation = {
  command: string;
  definition: string;
};

//translations of the commands, one file per language
const translations: Record<string, Translation[]> = {
  ar,
  ca,
  cs,
  da,
  de,
  el,
  en,
  'es-ES': esES,
  fi,
  fr,
  he,
  hu,
  'hy-AM': hyAM,
  it,
  ja,
  ka,
  ko,
  nl,
  no,
  pl,
  'pt-PT': ptPT,
  ro,
  ru,
  sk,
  sl,
  sq,
  sr,
  'sv-SE': svSE,
  th,
  uk,
  vi,
  'zh-CN': zhCN
};

export default translations;
