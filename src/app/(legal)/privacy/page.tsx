export const metadata = {
  title: "Privacy Policy",
  description: "How Jkboard uses account, session, and shared workspace data.",
  robots: { index: false },
}

export default function PrivacyPage() {
  return (
    <>
      <div>
        <h1>Privacy Policy</h1>
        <p className="mt-2 text-sm">Draft for review</p>
      </div>
      <section>
        <h2>Data used to run Jkboard</h2>
        <p>Jkboard uses your name, email address, and sign-in information to create and authenticate your account. It stores workspace information entered by members, including project and task details, deadlines, assignments, and membership records. Session records support sign-in and may include an IP address and browser information.</p>
      </section>
      <section>
        <h2>Who can see workspace information</h2>
        <p>Members of the shared workspace can see projects, tasks, and member information, including names and email addresses. The public demo grants access to that shared workspace. Use example data in the demo and keep personal or confidential information out of it.</p>
      </section>
      <section>
        <h2>Hosting and browser storage</h2>
        <p>Vercel hosts the application and Neon provides its database. Jkboard uses a session cookie to keep you signed in and browser storage to remember your theme preference. You can clear those settings through your browser.</p>
      </section>
      <section>
        <h2>Questions and requests</h2>
        <p>Contact your workspace administrator through the channel your team uses for access requests if you need to ask about, correct, or request removal of information associated with your account.</p>
      </section>
    </>
  )
}
