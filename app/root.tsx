import { Outlet, Scripts } from 'react-router';

export default function Root() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>Lerche</title>
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
