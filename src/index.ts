import Config from './config';
import {
	globalConfig
} from './methods/common';

export * from './types';
export * from './processors';
export * from './methods';

export type I18nConfigInstance = Config;

export default globalConfig;
