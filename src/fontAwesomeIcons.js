import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faBatteryFull,
  faBatteryThreeQuarters,
  faBatteryHalf,
  faBatteryQuarter,
  faBatteryEmpty,
  faCog,
  faTrash,
  faVideo,
  faMusic,
  faCheckCircle,
  faAngleLeft,
  faAngleDoubleLeft,
  faAngleRight,
  faAngleDoubleRight,
  faQuestion,
  faAsterisk
} from '@fortawesome/free-solid-svg-icons';
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
  faCog,
  faBatteryFull,
  faBatteryThreeQuarters,
  faBatteryHalf,
  faBatteryQuarter,
  faBatteryEmpty,
  faVideo,
  faMusic,
  faCheckCircle,
  faAngleLeft,
  faAngleDoubleLeft,
  faAngleRight,
  faAngleDoubleRight,
  faQuestion,
  faAsterisk
);

export default FontAwesomeIcon;
