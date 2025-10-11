import { app } from 'electron';
import log from 'electron-log';
import * as path from 'path';

log.transports.file.level = 'info';

log.transports.file.resolvePathFn = () =>
  path.join(app.getAppPath(), 'logs/main.log');

process.on('uncaughtException', (err) => {
  log.error(err);
});

const testLogger = log.create({ logId: 'modtest' });

testLogger.transports.file.level = 'info';

testLogger.transports.file.resolvePathFn = () =>
  path.join(app.getAppPath(), 'logs/modtest.log');

export function getMainLog() {
  return log;
}

export function mainLog(message: string) {
  log.info(message);
}

export function mainError(error: any) {
  log.error(error);
}

export function modTestLog(message: string) {
  testLogger.info(message);
}

export function modTestError(error: any) {
  testLogger.error(error);
}
