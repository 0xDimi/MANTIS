import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export async function resolve(specifier, context, defaultResolve) {
  if (specifier.startsWith('@/')) {
    const basePath = path.join(process.cwd(), specifier.slice(2));
    const candidates = [basePath, `${basePath}.ts`, `${basePath}.tsx`, `${basePath}.js`, `${basePath}.mjs`];

    for (const candidate of candidates) {
      if (existsSync(candidate)) {
        return {
          url: pathToFileURL(candidate).href,
          shortCircuit: true
        };
      }
    }
  }

  return defaultResolve(specifier, context, defaultResolve);
}
