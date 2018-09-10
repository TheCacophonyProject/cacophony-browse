import {library} from '@fortawesome/fontawesome-svg-core';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import {faCog, faTrash} from '@fortawesome/free-solid-svg-icons';
import {
  faCaretSquareDown,
  faCaretSquareLeft,
  faCaretSquareRight,
  faCaretSquareUp,
  faWindowClose
} from '@fortawesome/free-regular-svg-icons';

// https://www.npmjs.com/package/@fortawesome/vue-fontawesome
library.add(
  faTrash,
  faCaretSquareDown,
  faCaretSquareUp,
  faCaretSquareRight,
  faCaretSquareLeft,
  faWindowClose,
  faCog
);

export default FontAwesomeIcon;
