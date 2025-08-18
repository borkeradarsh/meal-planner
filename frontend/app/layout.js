import '../styles/globals.css';

export const metadata = {
  title: 'Pantry AI Meal Planner',
  description: 'AI-powered meal planning based on your pantry items',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
