export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-[page-in_0.22s_ease-out] motion-reduce:animate-none">
      {children}
    </div>
  );
}
