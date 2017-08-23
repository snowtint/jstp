'use strict';

const jstp = require('../..');

function stringifySession(session) {
  if (!(session instanceof jstp.Session)) {
    throw new TypeError('session is expected to be a jstp.Session object');
  }
  const copy = Object.assign(Object.create(null), session);
  copy.buffer = Array.from(copy.buffer);
  copy.connection = null;
  return JSON.stringify(copy);
}

function parseSession(sessionString) {
  const sessionCopy = JSON.parse(sessionString);
  sessionCopy.buffer = new Map(sessionCopy.buffer);
  return Object.assign(new jstp.Session(), sessionCopy);
}


module.exports = {
  stringifySession,
  parseSession,
};
