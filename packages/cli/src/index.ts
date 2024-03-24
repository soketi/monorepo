#!/usr/bin/env node --no-warnings --experimental-modules --es-module-specifier-resolution=node

process.title = 'soketi';

import { cli } from './lib/cli';
cli();
