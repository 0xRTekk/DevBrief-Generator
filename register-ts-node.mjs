import { register } from 'node:module';

const projectUrl = new URL('./', import.meta.url);

register('ts-node/esm', projectUrl);
