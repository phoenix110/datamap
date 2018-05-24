/**
 * Created by qiushi.chen on 2017/08/08.
 */
// const argv = require('yargs').argv;
// const fs = require('fs-extra')

let env = process.env.DEPLOY_ENV;
export const __DEV__ = env === 'dev';
export const __PROD__ = env === 'prod';
export const __STABLE__ = env === 'staging';
export const __JUMP__ = env === 'jump';