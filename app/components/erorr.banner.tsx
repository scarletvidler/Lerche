export function ErrorBanner({
  message,
  children,
}: {
  message: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="p-5 m-6 rounded-lg bg-red-800/50">
      <h2 className="text-lg font-bold mb-2">Error: {message}</h2>
      {children}
    </div>
  );
}
