import Link from "next/link"

export const metadata = {
  title: "Terms of Service",
  description: "Terms for using Jkboard and its shared demo.",
  robots: { index: false },
}

export default function TermsPage() {
  return (
    <>
      <div>
        <h1>Terms of Service</h1>
        <p className="mt-2 text-sm">Draft for review</p>
      </div>
      <section>
        <h2>Using Jkboard</h2>
        <p>Jkboard helps teams manage projects, tasks, and deadlines. Use your account for work you have permission to access and keep your sign-in credentials private.</p>
      </section>
      <section>
        <h2>Shared demo</h2>
        <p>Anyone can enter the demo with the public demo account. Other visitors can view and change shared workspace data. Use example data and leave out confidential information, personal records, and production work.</p>
      </section>
      <section>
        <h2>Workspace content and conduct</h2>
        <p>Only add content you are allowed to share. Respect other users’ privacy and access. Do not impersonate someone, attempt to gain unauthorized access, or interfere with other people’s use of the service.</p>
      </section>
      <section>
        <h2>Availability and access</h2>
        <p>Features and demo data may change. Keep a separate copy of work you need to retain. For help with access or a question about using your workspace, contact its administrator.</p>
      </section>
      <p>Read the <Link href="/privacy" className="underline underline-offset-4">Privacy Policy</Link> for details about account and workspace data.</p>
    </>
  )
}
