import { SVGProps } from 'react';

import { ELanguage } from '../enums';

export interface LanguageOption {
  code: ELanguage;
  label: string;
  Icon: React.FunctionComponent<SVGProps<SVGSVGElement>>;
}
