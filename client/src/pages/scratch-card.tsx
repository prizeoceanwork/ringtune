import ScratchCard from '@/components/games/scratch-card';
import ScratchCardTest from '@/components/games/scratch-card-test';
import { Competition } from '@shared/schema';
import React, { useState } from 'react'

const scratchcard = () => {
   const [showScratchCard, setShowScratchCard] = useState(false);
    const dummyCompetition : Competition = {
      id: "comp1",
      title: "Win a Dream Car!",
      description: "Scratch to reveal your prize",
      imageUrl: null,
      type: "scratch",
      ticketPrice: "2.50",
      maxTickets: null,
      soldTickets: null,
      prizeData: {},
      isActive: true,
      createdAt: null,
      updatedAt: null,
    };
  return (
   <div>
        <ScratchCardTest
          competition={dummyCompetition}
          isPurchasing={false}
          onPurchase={() => alert("Buying a real card…")}
          onClose={() => setShowScratchCard(false)} 
        />
    </div>
  )
}

export default scratchcard