import React from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl sm:text-5xl font-bold mb-10 text-center text-yellow-400 uppercase">
          Terms & Conditions
        </h1>

        <div className="space-y-8 space-y-6 leading-relaxed text-muted-foreground  ">
          <section>
            <h2 className="text-2xl text-white font-semibold  mb-3">
              1. The Promoter
            </h2>
            <p className="">
              <strong>Ringtone Riches</strong>
              <br />
              Our correspondence address is:
              <br />
             1 West Havelock Street, South Shields, Tyne and Wear, NE33 5AF.
            </p>
            <p>
              If you wish to contact us for any reason, please email:{" "}
              <a
                href="mailto:support@ringtoneriches.co.uk"
                className="text-yellow-400 hover:underline"
              >
                support@ringtoneriches.co.uk
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl text-white font-semibold  mb-3">
              2. The Competitions
            </h2>
            <p>
              These terms and conditions apply to all competitions listed on the
              Promoter’s website at{" "}
              <a
                href="https://www.ringtoneriches.co.uk"
                className="text-yellow-400 hover:underline"
              >
                www.ringtoneriches.co.uk
              </a>{" "}
              – The Competitions “Website”
            </p>
            <p>
              All competitions are skill-based competitions. Entry fees for
              online entries are payable each time you enter unless the “Free
              Entry Route” is chosen. Where the Promoter offers an easy or
              multiple-choice question, a free entry route is available.
            </p>
            <p>
              To be in with a chance of winning, every Entrant must correctly
              answer a question or solve a problem set by the Promoter (the
              “Competition Question”).
            </p>
          </section>

          <section>
            <h2 className="text-2xl text-white font-semibold  mb-3">
              3. Competition Entry
            </h2>
            <div className="space-y-4">
              <p>
                3.1. The competition will run between the opening and closing
                dates specified on the Website. These dates shall be referred to
                as the “Opening Date” and “Closing Date” respectively. All times
                and dates referred to are the times and dates in the United
                Kingdom.
              </p>
              <p>
                3.2 The Promoter reserves the right to change the Opening and
                Closing Dates. If the Promoter does change the Opening Date
                and/or the Closing Date of a competition, the new details will
                be displayed on the Website.  We will do this a maximum of 2
                times and only then in exceptional circumstances to make each
                competition as fair as possible to all participants.  An
                exceptional circumstance could be a UK wide internet outage or
                server failure, however, we would not expect any of these things
                to happen but rest assured should anything happen we will do our
                very best to make sure participants are not inconvenienced.
              </p>
              <p>
                3.3 All competition entries must be received by the Promoter no
                later than the specified time on the Closing Date. All
                competition entries received after the specified time on the
                Closing Date may be disqualified without a refund.
              </p>
              <p>
                3.4 . The maximum number of entries to the competition will be
                stated on the Website. The number of entries you can make may be
                limited if the maximum number of entries is reached.
              </p>

              <p>3.5 To enter the competition:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Go to the website and view the competition question.</li>
                <li>
                  select your answer to the competition question and the
                  required number of entries.
                </li>
                <li>
                  complete the checkout process and submit the online entry
                  form; then
                </li>
                <li>
                  complete the payment to receive your order confirmation.
                </li>
              </ul>

              <p>
                3.6 . All entries must be submitted in the English language.
                Entries in languages other than English will automatically be
                disqualified and no refund will be given.  Allowances for poor
                spelling will of course be made, but illegible entries will be
                excluded
              </p>
              <p>
                3.7 The Promoter will send confirmation that your entry has been
                received, and your allocated ticket number(s).
              </p>
              <p>
                3.8 The Promoter will not accept responsibility for competition
                entries that are not completed, are lost, or are delayed
                regardless of cause, including, for example, as a result of any
                equipment failure, technical malfunction, postal delays,
                systems, satellite, network, server, computer hardware or
                software failure of any kind.
              </p>
              <p>
                3.9 By purchasing entries and submitting a competition entry,
                you are entering into a contract with the Promoter and are
                agreeing to be bound by these terms and conditions
              </p>
              <p>
                3.10. Under the Gambling Act 2005, the availability of a free
                entry deems the competition does not fall within the definition
                of a lottery. Consequently, you may enter the competition for
                free by complying with the following conditions:
              </p>
            </div>

            <div className="space-y-3">
              <ul className="list-disc ml-6 space-y-1">
                <li>
                  send your entry on a postcard by first or second class post to
                  the Promoter at the competition address shown on all
                  competitions.  We do not allow entries inside envelopes, a
                  standard UK-sized postcard is 148mm x 105mm, any entry
                  significantly different to these sizes will not be accepted,
                  e.g. an entry on a significantly smaller or larger postcard
                </li>
                <li>include with your entry.</li>
                <li>
                  The competition you are entering as stated on the website.
                </li>
                <li>your full name and date of birth.</li>
                <li>your address.</li>
                <li>
                  {" "}
                  a contact telephone number and email address registered on
                  your account on our website; and
                </li>
                <li>your answer to the Competition Question.</li>
                <li>incomplete or illegible entries will be disqualified.</li>
                <li>
                  you may submit free entries for any competition however each
                  free entry must be submitted separately. Multiple entries in
                  one envelope or one postcard will not be accepted and will be
                  counted as one single entry.
                </li>
                <li>
                  by entering the competition, you are confirming that you meet
                  the criteria and accept these terms and conditions.
                </li>
                <li>
                  your entry must be received by the Promoter before the Closing
                  Date. Entries received post-Closing Date will not be accepted.
                </li>
                <li>
                  the Promoter will not confess receipt of your entry nor
                  confirm if your solution to the Competition Question is
                  correct.
                </li>
                <li>
                  if the number of paid and free entries reaches the competition
                  limit before your free entry is received, your submission will
                  not be accepted.
                </li>
                <li>
                  Entrants must have created an account on the Website for the
                  free entry to be processed. All details on the postcard MUST
                  resemble the details on the account and phone and email must
                  match to receive the order confirmation and ticket number.
                  Postal entries in violation of this term cannot be processed.
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl text-white font-semibold  mb-3">
              4. Choosing a Winner
            </h2>
            <p>
              4.1 All Entrants who answer the Competition Question correctly
              will be placed into a draw and the winner will be chosen by Google
              random draw generator. The random draw will take place live on a
              social media platform as soon as reasonably possible and, in any
              event, within 7 days of the Closing Date (“Draw Date”).
            </p>
            <p>
              4.2 All Entrants will have their names and ticket numbers put into
              a spreadsheet and/or readable page. This spreadsheet/page will be
              visible during the live draw. If you wish to have your name
              censored from the spreadsheet for the live draw, please contact{" "}
              <a
                href="mailto:support@ringtoneriches.co.uk"
                className="text-yellow-400 hover:underline"
              >
                support@ringtoneriches.co.uk
              </a>{" "}
              with reasonable time left before the prize draw takes place. 
              However, as part of the competition terms, all winners agree to be
              named live and on any media relating to winners that we may
              publish.  This does not override any data protection rights you
              may have of course and should any winner wish to make any changes
              or use their right to be forgotten please email{" "}
              <a
                href="mailto:support@ringtoneriches.co.uk"
                className="text-yellow-400 hover:underline"
              >
                support@ringtoneriches.co.uk
              </a>{" "}
              For assistance with entries, please email us at{" "}
              <a
                href="mailto:support@ringtoneriches.co.uk"
                className="text-yellow-400 hover:underline"
              >
                support@ringtoneriches.co.uk
              </a>{" "}
            </p>
          </section>

          <section className="my-12">
            <h2 className="text-white text-2xl font-bold mb-6">
              5. Eligibility
            </h2>

            <div className="space-y-4  leading-relaxed text-muted-foreground">
              <p>
                <strong>5.1.</strong> The competitions are only open to all
                residents in the <strong>United Kingdom</strong> aged{" "}
                <strong>18 years or over</strong>, excluding:
              </p>
              <ul className="list-disc list-inside ml-4">
                <li>(a) employees of the Promoter;</li>
                <li>
                  (b) employees of agents or suppliers of the Promoter who are
                  professionally connected with the competition or its
                  administration; or
                </li>
                <li>
                  (c) members of the immediate families or households of (a) and
                  (b) above.
                </li>
              </ul>

              <p>
                <strong>5.2.</strong> By entering the competition, you confirm
                that you are eligible to do so and eligible to claim any prize
                you may win. The Promoter may require you to provide proof that
                you are eligible to enter the competition. If you fail to
                provide the Promoter with any such proof or other information
                that they may require within a reasonable time, you may be
                disqualified from the competition.
              </p>

              <p>
                <strong>5.3.</strong> The Promoter will not accept competition
                entries that are:
              </p>
              <ul className="list-disc list-inside ml-4">
                <li>(a) automatically generated by computer; or</li>
                <li>(b) incomplete.</li>
              </ul>

              <p>
                <strong>5.4.</strong> The Promoter reserves all rights to
                disqualify you if your conduct is contrary to the spirit or
                intention of the prize competition.
              </p>

              <p>
                <strong>5.5.</strong> No refunds of the entry fee will be given
                in any event, including:
              </p>
              <ul className="list-disc list-inside ml-4">
                <li>
                  (a) if, following your entry into the competition, you
                  subsequently find out that you are not eligible to enter the
                  competition or claim the Prize;
                </li>
                <li>
                  (b) if, following your entry into the competition the
                  eligibility criteria for entering the competition or claiming
                  the Prize changes and you are no longer eligible; or
                </li>
                <li>
                  (c) if you are disqualified from the competition by the
                  Promoter for any reason.
                </li>
              </ul>

              <p>
                <strong>5.6.</strong> Entrants can enter each competition as
                many times as they wish until the maximum number of entries per
                user has been submitted and until the maximum number of entries
                for the competition has been received. Entrants submitting free
                entries must submit each entry separately. Bulk entries, if
                received, will not be accepted and will only be counted as one
                single entry. Entries may be limited if the maximum number of
                entries for the competition is reached.
              </p>

              <p>
                <strong>5.7.</strong> An Entry will be declared void, or the
                Promoter may seek recovery of the Prize (without any refund
                provided) if the Entrant or Winner is found to have engaged in:
              </p>
              <ul className="list-disc list-inside ml-4">
                <li>(a) any form of fraud (actual or apparent);</li>
                <li>(b) fraudulent misrepresentation;</li>
                <li>(c) fraudulent concealment;</li>
                <li>
                  (d) hacking or interference with the proper functioning of the
                  website; or
                </li>
                <li>
                  (e) amending, or unauthorised use of, any of the code that
                  constitutes the website.
                </li>
              </ul>
            </div>
          </section>

          <section className="my-12">
            <h2 className="text-white text-2xl font-bold mb-6">
              6. The Prize
            </h2>

            <div className="space-y-4  leading-relaxed">
              <p>
                <strong>6.1.</strong> The prize for the competition is described
                on the Website (the “Prize”). Details of the Prize are, to the
                best of the Promoter’s knowledge, information, and belief,
                correct as of the Opening Date.
              </p>

              <p>
                <strong>6.2.</strong> Prizes will not have a cash alternative.
              </p>

              <p>
                <strong>6.3.</strong> Prizes are always new and as described,
                purchased from a reputable retail outlet and you will receive
                the prize in the same condition as any new product purchased
                from a retailer. Price advertised as value will be the retail
                price at the time of posting the competition.
              </p>

              <p>
                <strong>6.4.</strong> The Prize may be supplied by a third-party
                supplier (the “Supplier”). Details of the Supplier (if any) will
                be provided on the Website.
              </p>

              <p>
                <strong>6.5.</strong> The Promoter reserves the right to
                substitute the Prize for an alternative prize (“Prize”) in the
                following circumstances, however please be aware that we will
                pay any prize irrespective of the amount of tickets sold and the
                full amount of any cash prize:
              </p>
              <ul className="list-disc list-inside ml-4">
                <li>
                  (a) the Prize becomes unavailable due to damage, theft, fire
                  or any event out of our control — all of ringtoneriches.co.uk
                  prizes are purchased prior to the prizes being offered, with
                  receipt in hand;
                </li>
                <li>
                  (b) other circumstances beyond the reasonable control of the
                  Promoter make it necessary to do so;
                </li>
              </ul>

              <p>
                <strong>6.6.</strong> The Prize is not negotiable or
                transferable.
              </p>

              <p>
                <strong>6.7.</strong> The Sur-Ron main draw will have{" "}
                <strong>4 × £500 winners</strong> based on ticket sales:
              </p>
              <ul className="list-disc list-inside ml-4">
                <li>• 5000➕ Tickets Sold (1️⃣ × £500)</li>
                <li>• 6000➕ Tickets Sold (2️⃣ × £500)</li>
                <li>• 7000➕ Tickets Sold (3️⃣ × £500)</li>
                <li>• 8000➕ Tickets Sold (4️⃣ × £500 Runner Up Winners)</li>
              </ul>
              <p>
                In the event that under 5000 tickets are sold, only the main
                prize will be won.
              </p>

              <p>
                <strong>6.8.</strong>{" "}
                <em>Promotion of Cash Prizes Over £1,000</em>
              </p>
              <p>
                By entering our competitions, you agree that if you win a cash
                prize exceeding £1,000, we may use your first name, surname,
                general location (e.g., town/city), and photographs or video
                content related to your win for promotional purposes. This
                includes featuring your win on our website, social media
                channels, and other marketing materials.
              </p>
            </div>
          </section>

          <section className="my-12">
            <h2 className="text-white text-2xl font-bold mb-6">
              7. Winners
            </h2>

            <div className="space-y-4  leading-relaxed">
              <p>
                <strong>7.1.</strong> The decision of the Promoter is final, and
                no correspondence or discussion will be entered into.
              </p>

              <p>
                <strong>7.2.</strong> The Winner’s full name will be announced
                during the live draw. If you wish for your name to be censored
                on our spreadsheet or page during the live draw, please contact{" "}
                <a
                  href="mailto:support@ringtoneriches.co.uk"
                  className="text-yellow-400 hover:underline"
                >
                  support@ringtoneriches.co.uk
                </a>{" "}
                with reasonable time left before the prize draw takes place.
              </p>

              <p>
                <strong>7.3.</strong> The Promoter will contact the winner
                personally as soon as practicable after the Draw Date using the
                telephone number or email address provided with the competition
                entry. If the winner cannot be contacted, is not available, or
                has not claimed the Prize within 14 days of the Draw Date, the
                Promoter reserves the right to offer the Prize to another
                Entrant (“The Alternate Winner“) selected at random in the same
                method as before from the remaining correct entries received
                before the Closing Date. The Alternate Winner shall have 14 days
                from notification of their status by the Promoters to
                communicate their acceptance of the Prize. This process shall
                continue until a winner accepts the Prize.
              </p>

              <p>
                <strong>7.4.</strong> The Promoter must either publish or make
                available information that indicates that a valid award took
                place. To comply with this obligation, the Promoter will publish
                the full name and county/town of residence of major prize
                winners on the Website.
              </p>

              <p>
                <strong>7.5.</strong> If you object to any or all of your full
                name, county/town of residence, and winning entry being
                published or made available, please contact the Promoter at{" "}
                <a
                  href="mailto:support@ringtoneriches.co.uk"
                  className="text-yellow-400 hover:underline"
                >
                  support@ringtoneriches.co.uk
                </a>{" "}
                before the Closing Date. In such circumstances, the Promoter
                must still provide the information to the Advertising Standards
                Authority on request.
              </p>
            </div>
          </section>

          <section className="my-12">
            <h2 className="text-white text-2xl font-bold mb-6">
              8. Claiming the Prize
            </h2>

            <div className="space-y-4  leading-relaxed">
              <p>
                <strong>8.1.</strong> You must claim the Prize personally. The
                Prize may not be claimed by a third party on your behalf.
                Details of how the Prize will be delivered to you (or made
                available for collection) are published on the Website or
                available on request.
              </p>

              <p>
                <strong>8.2.</strong> If your details, including contact
                information, change at any time you should notify the Promoter
                as soon as reasonably possible. Notifications should be sent to
                the Promoter via email to{" "}
                <a
                  href="mailto:support@ringtoneriches.co.uk"
                  className="text-yellow-400 hover:underline"
                >
                  support@ringtoneriches.co.uk
                </a>
                . Notifications must include details of the competition you have
                entered, your old details, and your new details. If your details
                change within 7 days of the Closing Date, the Promoter will use
                your old details if it needs to try to contact you.
              </p>

              <p>
                <strong>8.3.</strong> Any Cash Prize will be transferred
                directly to the winner’s nominated bank account. The winner must
                provide evidence that they are the sole or joint beneficiary of
                the bank account. Failure to do so within 14 days will result in
                disqualification from the competition and the winner forfeiting
                the prize. In such circumstances, the Promoter reserves the
                right to offer the Prize to the next eligible Entrant selected
                from the correct entries that were received before the Closing
                Date.
              </p>

              <p>
                <strong>8.4.</strong> The Promoter does not accept any
                responsibility and is not liable to pay any compensation if you
                are unable to or do not take up the Prize.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              9. Storage
            </h2>
            <p>
              The Promoter can store the chosen Prize free of charge for up to
              30 days after notifying the Winner, at the end of which the Prize
              will be delivered to the Winner. If the Prize needs to be stored
              by the Promoter for more than 30 days, then this shall be at the
              entire cost of the Winner where such cost will need to be paid by
              the Winner to the Promoter before the Winner receives the Prize.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              10. Limitation of Liability
            </h2>
            <p>
              Insofar as is permitted by law, the Promoter, its agents, or
              distributors will not in any circumstances be responsible or
              liable to compensate the Winner or accept any liability for any
              loss, damage, personal injury, or death occurring as a result of
              taking up the Prize except where it is caused by the negligence of
              the Promoter, its agents or distributors or that of their
              employees. Your statutory rights are not affected.
            </p>
          </section>

          <section className="my-12">
            <h2 className="text-white text-2xl font-bold mb-6">
              11. Data Protection and Publicity
            </h2>

            <div className="space-y-4  leading-relaxed">
              <p>
                <strong>11.1.</strong> By entering the competition, you agree
                that any personal information provided by you with the
                competition entry may be held and used only by the Promoter or
                its agents and suppliers to administer the competition or as
                otherwise set out in the Promoter’s Privacy Policy, a copy of
                which is available on the Website.
              </p>

              <p>
                <strong>11.2.</strong> If you are the Winner of the competition,
                you agree that the Promoter may use your name, image, and town
                or county of residence to announce the Winner of this
                competition. You further agree to participate in any reasonable
                publicity required by the Promoter.
              </p>

              <p>
                <strong>11.3.</strong> If you do not wish to participate in any
                publicity, you must notify the Promoter before the Closing Date.
                This will not affect your chances of winning the Prize. If you
                do not agree to participate in any publicity about the
                competition, we may still provide your details to the
                Advertising Standards Authority and/or any law enforcement
                agencies and HMRC if requested to do so about money laundering
                or fraud. This is a legal requirement that we must comply with
                to prove that the competition has been properly administered and
                the Prize awarded.
              </p>

              <p>
                <strong>11.4.</strong> If you are the Winner of the competition,
                you may be required to provide further personal information and
                proof of your identity to confirm your eligibility to claim the
                Prize and transfer ownership of the Prize to you. You consent to
                the use of your information in this way. You are entitled to
                request further details about how your personal information is
                being used. You may also withdraw your consent to your personal
                information being used in such a way but by doing so you may
                prevent the Prize being transferred to you. In such
                circumstances, you will be deemed to have withdrawn from the
                competition and forfeit the Prize. You will not be entitled to
                any refund of your entry fee. The Promoter reserves the right to
                offer the Prize to the next eligible Entrant selected from the
                correct entries that were received before the Closing Date.
              </p>

              <p>
                <strong>11.5.</strong> Please note that under data protection
                laws you are entitled to request that the Promoter does not
                contact you and removes your details from its database. If you
                make such a request, you will be withdrawing from the
                competition as it will not be possible to contact you if you are
                the winner. You will not be entitled to any refund of any entry
                fee if you withdraw from the competition. If you do not wish any
                of your details to be used by the Promoter for promotional
                purposes, please email the Promoter at{" "}
                <a
                  href="mailto:support@ringtoneriches.co.uk"
                  className="text-yellow-400 hover:underline"
                >
                  support@ringtoneriches.co.uk
                </a>{" "}
                before the Closing Date.
              </p>
            </div>
          </section>

          <section className="my-12">
            <h2 className="text-white text-2xl font-bold mb-6">
              12. Your Account
            </h2>
            <div className="space-y-4  leading-relaxed">
              <p>
                <strong>12.1.</strong> You must keep your account password
                secure and secret at all times and take steps to prevent it from
                being used without your permission. You must (a) memorise your
                password and never tell it to anyone, (b) never write your
                password down (including on your computer or other electronic
                devices) or record it in a way that can be understood by someone
                else, (c) destroy any communications from the Promoter
                concerning your password as soon as you have read them, (d)
                avoid using a password that is easy to guess, (e) ensure that
                no-one else (apart from you) uses your account while you and/or
                your devices are logged on to the Website (including by logging
                on to your devices through a mobile, Wi-Fi or shared access
                connection they are using), (f) log off or exit from your
                account when not using it, and (g) keep your password or other
                access information secret.
              </p>

              <p>
                <strong>12.2.</strong> Your password and login details are
                personal to you and should not be given to anyone else and/or
                used to provide shared access e.g. over a network. You must use
                a password that is unique to your account, and maintain good
                internet security.
              </p>

              <p>
                <strong>12.3.</strong> You must contact the Promoter immediately
                if you believe, suspect, or know that anyone apart from you has
                used your account and/or given any instruction concerning it
                without your permission, or if you believe, suspect, or know
                someone else knows your password.
              </p>

              <p>
                <strong>12.4.</strong> If you forget your password, you can
                reset it by following the instructions on the Website (as long
                as you can provide the relevant security information requested
                or required by the Promoter).
              </p>

              <p>
                <strong>12.5.</strong> The Promoter shall not be responsible
                and/or liable for any and/or all consequences arising out of
                and/or relating to any and/or all breaches of this rule 12.5. by
                you. Furthermore, the Promoter shall not, in any event, be
                responsible and/or liable for any actions and/or inactions that
                you may take and/or consequences that you may suffer and/or
                incur as a result of using and/or in connection with the
                Website.
              </p>
            </div>
          </section>

          <section className="my-12">
            <h2 className="text-white text-2xl font-bold mb-6">
              13. Unauthorised Use and Expiry of Your Debit Card
            </h2>
            <div className="space-y-4  leading-relaxed">
              <p>
                <strong>13.1.</strong> If you notify your nominated bank (or
                building society) that your debit card has been used without
                your permission about a Competition and, and your nominated bank
                (or building society) asks the Promoter to return the relevant
                amount to your nominated bank (or building society) account, the
                Promoter may suspend your account and ask you to contact the
                Promoter. The Promoter accepts no responsibility and will have
                no liability for any chargebacks.
              </p>

              <p>
                <strong>13.2.</strong> If your debit card is due to expire, the
                Promoter will use reasonable efforts to return the funds in your
                account to your debit card before midnight on the day it
                expires. If it is not able to do so, the Promoter will use
                reasonable efforts to alert you of this and you should, in these
                circumstances, contact the Promoter to arrange another
                appropriate way for the Promoter to return the funds to you.
              </p>
            </div>
          </section>

          <section className="my-12">
            <h2 className="text-white text-2xl font-bold mb-6">
              14. General
            </h2>
            <div className="space-y-4  leading-relaxed">
              <p>
                <strong>14.1.</strong> The Promoter reserves the right to amend
                these terms and conditions from time to time. The latest version
                of these terms and conditions will be available on the Website.
              </p>

              <p>
                <strong>14.2.</strong> If there is any reason to believe that
                there has been a breach of these terms and conditions, the
                Promoter may, at its sole discretion, reserve the right to
                exclude you from participating in the competition and any future
                competitions.
              </p>

              <p>
                <strong>14.3.</strong> The Promoter reserves the right to hold,
                void, suspend, cancel, or amend the Prize competition where it
                becomes necessary to do so.
              </p>

              <p>
                <strong>14.4.</strong> The Website may contain hyperlinks to
                websites operated by parties other than us. Such hyperlinks are
                provided for your reference and convenience only. We do not
                control such websites and are not responsible for their content
                and/or the privacy or other practices of such websites. It is up
                to you to take precautions to ensure that whatever links they
                select and/or software you download from such websites are free
                of viruses. Our inclusion of hyperlinks to such websites does
                not imply any endorsement of the material on such websites,
                association, sponsorship, and/or partnership with their
                operators. You must not create a text hyperlink to the Website
                without our prior written consent.
              </p>

              <p>
                <strong>14.5.</strong> These terms and conditions shall be
                governed by England and Wales law, and the parties submit to the
                exclusive jurisdiction of the courts of England and Wales.
              </p>

              <p>
                <strong>14.6.</strong> Under the Contracts (Rights of Third
                Parties) Act 1999 (as amended or re-enacted from time to time,
                and any subordinate legislation made under that act) or
                otherwise, a person who is not a party to these terms and
                conditions has no rights to enforce any provision of these terms
                and conditions.
              </p>

              <p>
                <strong>14.7.</strong> If any provision (or part of a provision)
                of these terms and conditions is decided by a court of competent
                jurisdiction to be void and/or unenforceable, that decision will
                only affect the particular provision (or part of the provision),
                and will not, in itself, make the other provisions void or
                unenforceable.
              </p>

              <p>
                <strong>14.8.</strong> You should print a copy of these terms
                and conditions and keep them for your records.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              Text Message Marketing
            </h2>
            <p>
              By checking the SMS marketing tickbox at checkout, you consent to
              receive marketing text messages (e.g. promos, cart reminders) from
              Ringtone Riches at the number provided, including messages sent by
              autodialer. Consent is not a condition of any purchase. Message
              and data rates may apply. Message frequency varies. You can
              unsubscribe at any time by replying STOP or clicking the
              unsubscribe link (where available). Review our Privacy Policy and
              Terms of Service for more information.
            </p>
          </section>

          {/* <p className="text-sm text-gray-400 pt-8 border-t border-gray-700">
            Last updated: {new Date().toLocaleDateString()}
          </p> */}
        </div>
      </main>

      <Footer />
    </div>
  );
}
