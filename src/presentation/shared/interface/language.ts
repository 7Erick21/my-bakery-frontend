import type { SVGProps } from 'react';

import type { ELanguage } from '../enums';

export interface LanguageOption {
  code: ELanguage;
  label: string;
  Icon: React.FunctionComponent<SVGProps<SVGSVGElement>>;
}
