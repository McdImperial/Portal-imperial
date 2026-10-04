import { readFileSync } from 'fs';
import { join } from 'path';

export default function GestaoImperial() {
  const htmlPath = join(process.cwd(), 'public/gestao-imperial/index.html');
  const htmlContent = readFileSync(htmlPath, 'utf-8');

  return (
    <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
  );
}
