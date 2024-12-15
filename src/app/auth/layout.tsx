export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-full flex-1 flex-col">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
 
        </div>
        {children}
      </div>
    </div>
  );
}
