export function Header({ content }: { content?: string }) {
  return (
    <header className="text-center">
      <h1 className="p-5">{content ?? "Lerche"}</h1>
    </header>
  );
}