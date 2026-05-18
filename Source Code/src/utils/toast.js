const log = (level, ...args) => {
  if (level === 'error') {
    console.error(...args);
    return;
  }
  if (level === 'warn') {
    console.warn(...args);
    return;
  }
  console.info(...args);
};

const toast = (...args) => log('info', ...args);

toast.success = (...args) => log('info', ...args);
toast.info = (...args) => log('info', ...args);
toast.error = (...args) => log('error', ...args);
toast.loading = (...args) => log('info', ...args);
toast.dismiss = () => {};

export default toast;

