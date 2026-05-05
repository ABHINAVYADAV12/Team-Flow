import './globals.css';

export const metadata = {
  title: 'TeamFlow — Task Manager',
  description: 'A full-stack team task manager with role-based access control',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
