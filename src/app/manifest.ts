import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ប្រព័ន្ធគ្រប់គ្រងវិទ្យាល័យរដ្ឋកម្ពុជា - MoEYS High School Management System',
    short_name: 'MoEYS SMS',
    description: 'ប្រព័ន្ធគ្រប់គ្រងទិន្នន័យសិស្ស ពិន្ទុ និងវត្តមានស្របតាមស្តង់ដារក្រសួងអប់រំ យុវជន និងកីឡា',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1d4ed8',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
