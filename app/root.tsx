import { Outlet, Scripts } from "react-router";
import "./style/index.css";

export default function Root() {
  return (
    <html className="" lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Lerche</title>
      </head>
      <body>
        <div className="bg-gradient-to-br from-black via-purple-900 to-black min-h-screen text-white center">
          <Outlet />
        </div>
        <Scripts />
      </body>
    </html>
  );
}
