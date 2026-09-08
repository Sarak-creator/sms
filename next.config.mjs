import fs from 'node:fs';

// Patch Windows filesystem EISDIR bug where readlink on regular files throws EISDIR instead of EINVAL
const patchReadlink = () => {
  const origSync = fs.readlinkSync;
  fs.readlinkSync = function(p, o) {
    try {
      return origSync.call(fs, p, o);
    } catch (e) {
      if (e && (e.code === 'EISDIR' || e.code === 'UNKNOWN')) {
        const err = new Error(`EINVAL: invalid argument, readlink '${p}'`);
        err.code = 'EINVAL';
        throw err;
      }
      throw e;
    }
  };

  const origAsync = fs.readlink;
  fs.readlink = function(p, ...args) {
    const cb = typeof args[args.length - 1] === 'function' ? args.pop() : null;
    const opts = args[0];
    origAsync.call(fs, p, opts, (err, linkString) => {
      if (err && (err.code === 'EISDIR' || err.code === 'UNKNOWN')) {
        const customErr = new Error(`EINVAL: invalid argument, readlink '${p}'`);
        customErr.code = 'EINVAL';
        if (cb) return cb(customErr);
      }
      if (cb) cb(err, linkString);
    });
  };

  if (fs.promises && fs.promises.readlink) {
    const origPromise = fs.promises.readlink;
    fs.promises.readlink = async function(p, o) {
      try {
        return await origPromise.call(fs.promises, p, o);
      } catch (e) {
        if (e && (e.code === 'EISDIR' || e.code === 'UNKNOWN')) {
          const err = new Error(`EINVAL: invalid argument, readlink '${p}'`);
          err.code = 'EINVAL';
          throw err;
        }
        throw e;
      }
    };
  }
};
patchReadlink();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["lucide-react"],
  experimental: {
    serverComponentsExternalPackages: ["pg", "pg-native", "@prisma/client", "prisma"],
  },
  webpack: (config) => {
    config.resolve.symlinks = false;
    return config;
  },
};

export default nextConfig;
