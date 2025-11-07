import React from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function PlayResponsibly() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-8 gradient-text">
          Play Responsibly: Keeping Your Participation Enjoyable
        </h1>

        <div className="space-y-6 leading-relaxed text-muted-foreground">
          <p>
            At <span className="font-semibold text-foreground">Ringtone Riches</span>, we want your experience to remain positive, enjoyable, and within your comfort zone. Our competitions are designed purely for entertainment and should never cause financial pressure or distress. We encourage all participants to take part responsibly and to stay aware of their spending and time.
          </p>

          <h2 className="text-2xl font-semibold text-foreground mt-10">Understanding Your Spending</h2>
          <p>
          Responsible participation begins with awareness. Take time to reflect on how much you spend on competitions and ensure it fits comfortably within your personal budget.
          </p>
          <p>Ask yourself</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Am I setting clear limits on how much I spend?</li>
            <li>Am I keeping track of my entries and costs?</li>
            <li>Are competition entries taking priority over essential expenses?</li>
            <li>Am I using money intended for other purposes to take part?</li>
          </ul>

          <h2 className="text-2xl font-semibold text-foreground mt-10">Tips for Mindful Participation</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Set a Budget: Decide how much you are comfortable spending and stay within that amount.</li>
            <li>Manage Your Time: Take regular breaks and maintain perspective.</li>
            <li>Avoid Chasing Losses: Each draw is independent—do not increase spending to recover previous entries.</li>
            <li>Play for Enjoyment: Focus on the fun and excitement rather than the outcome.</li>
            <li>Review Regularly: Check your spending and habits to ensure everything remains healthy.</li>
            <li>Seek Support: Talk to trusted friends or family if you have any concerns.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-foreground mt-10">Recognising Potential Difficulties</h2>
          <p>You may wish to take a break or seek support if you notice any of the following:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Spending more than you can comfortably afford</li>
            <li>Feeling preoccupied with competitions or entries</li>
            <li>Concealing your spending or participation</li>
            <li>Feeling guilt, stress, or anxiety related to competitions</li>
            <li>Neglecting personal or financial responsibilities</li>
            <li>Trying to win back previous losses by entering more competitions</li>
          </ul>

          <h2 className="text-2xl font-semibold text-foreground mt-10">Taking a Break or Seeking Support</h2>
          <p>
            Your wellbeing is important to us. If you feel you need a break from competitions, we can help.
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>
              Temporary Account Suspension: You may contact our support team to temporarily block your account for a chosen period.
            </li>
            <li>
           Permanent Account Closure: You may request permanent closure of your account if you would like a longer break.
            </li>
          </ul>

          <p>
           For assistance or to discuss any concerns, please contact support@ringtoneriches.co.uk. Our goal is to ensure that every customer enjoys the thrill of competition safely, responsibly, and within their means.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
