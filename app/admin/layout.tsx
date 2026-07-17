import type { Metadata } from "next";

// The admin area is private: it is linked from nowhere on the public site, and
// this keeps it out of search engines too. Note this is only about exposure —
// what actually protects it is the login and the API requiring a valid token.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
