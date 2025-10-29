import React from "react";
import { Competition } from "@shared/schema";
import { useLocation } from "wouter";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface FeaturedCompetitionsProps {
  competitions: Competition[];
}

export default function FeaturedCompetitions({ competitions }: FeaturedCompetitionsProps) {
  const [, setLocation] = useLocation();

  // Filter only instant ones & limit to 5
  const instantCompetitions = competitions
    .filter((c) => c.type === "instant")
    .slice(0, 5);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: true,
    pauseOnHover: true,
    adaptiveHeight: true,
  };

  const handleViewCompetition = (id: string) => {
    setLocation(`/competition/${id}`);
  };

   return (
    <div className="w-full  ">
      <div className="max-w-7xl mx-auto px-4">
        <Slider
          {...sliderSettings}
          className="featured-competitions-slider"
        >
          {instantCompetitions.map((competition) => (
            <div
              key={competition.id}
              className="rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="flex flex-col md:flex-row min-h-[400px] md:min-h-[500px]">
                {/* Left Section — Content */}
                <div className="flex-1 flex flex-col justify-center p-8 md:p-12 space-y-6">
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                    {competition.title}
                  </h3>

                  <div className="space-y-4">
                    <p className="text-xl md:text-2xl lg:text-3xl font-bold text-amber-400">
                      £{parseFloat(competition.ticketPrice).toFixed(2)} per entry
                    </p>

                    <button
                      onClick={() => handleViewCompetition(competition.id)}
                      className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-3 md:py-4 px-8 md:px-12 rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-lg md:text-xl"
                    >
                      ENTER NOW
                    </button>
                  </div>
                </div>

                {/* Right Section — Full Image */}
                <div className="flex-1">
                  <img
                    src={
                      competition.imageUrl ||
                      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80"
                    }
                    alt={competition.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>

      <style>{`
        /* Custom slider styling */
        .featured-competitions-slider .slick-dots {
          bottom: 20px;
        }
        
        .featured-competitions-slider .slick-dots li button:before {
          color: white;
          opacity: 0.5;
          font-size: 12px;
        }
        
        .featured-competitions-slider .slick-dots li.slick-active button:before {
          opacity: 1;
          color: #f59e0b;
        }
        
        /* Large Yellow Arrows */
        
        
        .featured-competitions-slider .slick-prev {
          left: 15px;
        }
        
        .featured-competitions-slider .slick-next {
          right: 15px;
        }
        
        .featured-competitions-slider .slick-prev:before,
        .featured-competitions-slider .slick-next:before {
          font-size: 40px;
          color: white;
          opacity: 1;
          font-weight: bold;
        }
        
        
        
        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .featured-competitions-slider .slick-prev,
          .featured-competitions-slider .slick-next {
            width: 60px;
            height: 60px;
          }
          
          .featured-competitions-slider .slick-prev:before,
          .featured-competitions-slider .slick-next:before {
            font-size: 30px;
          }
          
          .featured-competitions-slider .slick-prev {
            left: 10px;
          }
          
          .featured-competitions-slider .slick-next {
            right: 10px;
          }
        }
      `}</style>
    </div>
  );
}