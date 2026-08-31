import './globals.css';

export const metadata = {
  title: 'ProjectForge AI — AI Project Intelligence & Execution Platform',
  description: 'Transform natural-language project ideas into structured, feasibility-checked, execution-ready software blueprints with multi-agent intelligence.',
  keywords: ['AI Project Management', 'Software Architecture Generator', 'Task Planning', 'Skill Gap Analysis', 'Project Health Score'],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-dark-bg text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
