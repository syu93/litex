const colors = {
  clear: 'background: none; color: #000000',
  log: 'border-radius: 3px; background: linear-gradient(315deg, #ff8f8f 0%, #2196F3 100%); color: #ffffff; padding: 0.15rem 0.25rem',
  warn: 'border-radius: 3px; background: linear-gradient(315deg, #f37b2b 0%, #2196F3 100%); color: #ffffff; padding: 0.15rem 0.25rem',
  error: 'border-radius: 3px; background: linear-gradient(315deg, #f32121 0%, #2196F3 100%); color: #ffffff; padding: 0.15rem 0.25rem'
};

export function logger(level, message, nobadge = false) {
  if (nobadge) return console[level](message);
  switch(level) {
    case 'log':
    case 'info':
      console.log(`%c[Litex]%c ${message}`, colors.log, colors.clear);
      break;
    case 'warn':
      console.warn(`%c[Litex][warn]%c ${message}`, colors.warn, colors.clear);
      break;
    case 'error':
      group('error', 'Error', () => {
        console.error(message)
      });
      break;
    default:
      console.log(`%c[Litex]%c ${message}`, colors.log, colors.clear);
      break;
  }
}

export function groupCollapsed(level, title, callback) {
  console.groupCollapsed(`%c[Litex] ${title}`, colors[level]);
  callback();
  console.groupEnd();
  return null;
}

export function group(level, title, callback) {
  console.group(`%c[Litex] ${title}`, colors[level]);
  callback();
  console.groupEnd();
  return null;
}