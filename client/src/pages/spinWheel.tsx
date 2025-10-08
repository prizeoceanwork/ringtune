import SpinWheel from '@/components/games/spin-wheel';
import { Competition } from '@shared/schema';
import React from 'react'

const spinWheel = () => {

     const dummySpinCompetition: Competition = {
        id: "spin1",
        title: "Spin & Win Jackpot!",
        description: "Spin the wheel to reveal your prize!",
        imageUrl: null,
        type: "spin", // ✅ must be one of "scratch" | "spin" | "instant"
        ticketPrice: "5.00",
        maxTickets: null,
        soldTickets: null,
        prizeData: [
          { amount: 10,  },
        { amount: 25,},
        { amount: 100, },
        { amount: 500,  },
        { amount: 100, },
        { amount: 500,  },
        { amount: 250, },
        { amount: 750,  },
        ],
        isActive: true,
        createdAt: null,
        updatedAt: null,
      };
  return (
    <div> <SpinWheel
              competition={dummySpinCompetition}
              isPurchasing={false}
              onPurchase={() => alert("Buying a real spin…")}
            /></div>
  )
}

export default spinWheel