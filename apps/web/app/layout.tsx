import './globals.css'

export const metadata = {
  title: 'Legal Lens - AI-Powered Legal Document Analysis',
  description: 'Analyze legal documents with AI for risk assessment and negotiation insights',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}