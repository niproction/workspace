// Minimal wrapper — setup/login pages render without the admin shell.
// Protected pages under (dashboard)/ get the shell via their own layout.
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
