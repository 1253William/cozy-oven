"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface ProductTabsProps {
  details: string;
  reviews?: Array<{
    author: string;
    rating: number;
    comment: string;
    date: string;
  }>;
}

export default function ProductTabs({ details, reviews = [] }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<"details" | "reviews">("details");

  // Mock reviews if none provided
  const displayReviews = reviews.length > 0 ? reviews : [
    {
      author: "Kwame A.",
      rating: 5,
      comment: "Absolutely delicious! The best I've ever had. Fresh and perfectly baked.",
      date: "2 days ago"
    },
    {
      author: "Ama B.",
      rating: 4,
      comment: "Great taste and quality. Will definitely order again!",
      date: "1 week ago"
    },
    {
      author: "John D.",
      rating: 5,
      comment: "Exceeded my expectations. Highly recommend!",
      date: "2 weeks ago"
    }
  ];

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="mt-8">
      {/* Tab buttons */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("details")}
          className={`pb-3 px-4 font-semibold transition-colors relative ${
            activeTab === "details"
              ? "text-[#2A2C22]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Details
          {activeTab === "details" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2A2C22]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("reviews")}
          className={`pb-3 px-4 font-semibold transition-colors relative ${
            activeTab === "reviews"
              ? "text-[#2A2C22]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Reviews ({displayReviews.length})
          {activeTab === "reviews" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2A2C22]" />
          )}
        </button>
      </div>

      {/* Tab content */}
      <div className="mt-6">
        {activeTab === "details" ? (
          <div className="text-gray-700 leading-relaxed">
            <p>{details}</p>
            <div className="mt-4 space-y-2 text-sm">
              <p><strong>Storage:</strong> Keep refrigerated for up to 5 days</p>
              <p><strong>Allergens:</strong> Contains wheat, eggs, and milk</p>
              <p><strong>Serving suggestion:</strong> Best served at room temperature or lightly toasted</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {displayReviews.map((review, index) => (
              <div key={index} className="border-b border-gray-100 pb-6 last:border-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">{review.author}</h4>
                    <p className="text-sm text-gray-500">{review.date}</p>
                  </div>
                  {renderStars(review.rating)}
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
