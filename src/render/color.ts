import { CSSColor } from '../cssom/dict';

export function mapColor(color: CSSColor): string {
  // Since canvas includes color parser, we don't have to do a thing
  switch (color.type) {
    case 'hash':
      return '#' + color.value;
    case 'identifier':
      return color.value;
    case 'rgb':
      return `rgb(${color.args.join(',')})`;
  }
}
