import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { Link } from "react-router-dom";
import { Carousel } from "antd";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";

import Img1 from "../assets/navimg/1.avif";
import Img2 from "../assets/navimg/2.avif";
import Img3 from "../assets/navimg/3.avif";
import Img4 from "../assets/navimg/4.avif";
import Img5 from "../assets/navimg/5.avif";
import Img6 from "../assets/navimg/6.avif";
import Img7 from "../assets/navimg/7.avif";
import Img8 from "../assets/navimg/8.avif";
import Img9 from "../assets/navimg/9.avif";
import Img10 from "../assets/navimg/10.avif";
import Img11 from "../assets/navimg/11.avif";
import Img12 from "../assets/navimg/12.avif";
import Img13 from "../assets/navimg/13.avif";
import Img14 from "../assets/navimg/14.avif";
import Img15 from "../assets/navimg/15.avif";


import C1 from "../assets/carosel/C1.jpg";
import C2 from "../assets/carosel/C2.jpg";
import C3 from "../assets/carosel/C3.jpg";
import C4 from "../assets/carosel/C4.jpg";
import C5 from "../assets/carosel/C5.jpg";
import C6 from "../assets/carosel/C6.jpg";


const scrollCategories = [
  { name: "Pizzas", image: Img1 },
  { name: "Biryani", image: Img2 },
  { name: "Cakes", image: Img3 },
  { name: "Shake", image: Img4 },
  { name: "Pure Veg", image: Img5 },
  { name: "Paratha", image: Img6 },
  { name: "Burgers", image: Img7 },
  { name: "Pasta", image: Img8 },
  { name: "Chinese", image: Img9 },
  { name: "South Indian", image: Img10 },
  { name: "North Indian", image: Img11 },
  { name: "Ice Cream", image: Img12 },
  { name: "Salads", image: Img13 },
  { name: "Rolls", image: Img14 },
  { name: "Momos", image: Img15 },
];

const carouselItems = [C1, C2, C3, C4, C5, C6];

const allRestaurants = [
  {
    id: 1, name: "Pizza Hut", category: "Pizzas", rating: 4.2, time: "30-40 min",
    offers: "50% off up to ₹100",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=660&q=80",
    emoji: "🍕",
  },
  {
    id: 2, name: "Dominos", category: "Pizzas", rating: 4.0, time: "25-35 min",
    offers: "Free delivery",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=660&q=80",
    emoji: "🍕",
  },
  {
    id: 3, name: "SS Biryani", category: "Biryani", rating: 4.5, time: "20-30 min",
    offers: "20% off",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=660&q=80",
    emoji: "🍛",
  },
  {
    id: 4, name: "Burger King", category: "Burgers", rating: 4.1, time: "15-25 min",
    offers: "Buy 1 Get 1",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=660&q=80",
    emoji: "🍔",
  },
  {
    id: 5, name: "Annapoorna", category: "South Indian", rating: 4.6, time: "20-30 min",
    offers: "₹75 off above ₹299",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=660&q=80",
    emoji: "🥘",
  },
  {
    id: 6, name: "A2B", category: "Pure Veg", rating: 4.4, time: "25-35 min",
    offers: "10% cashback",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=660&q=80",
    emoji: "🥗",
  },
  {
    id: 7, name: "Cake World", category: "Cakes", rating: 4.3, time: "35-45 min",
    offers: "15% off",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=660&q=80",
    emoji: "🎂",
  },
  {
    id: 8, name: "Wow Momos", category: "Momos", rating: 4.2, time: "20-30 min",
    offers: "Free delivery",
    image: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=660&q=80",
    emoji: "🥟",
  },
];

// ── Category colour badge map 
const categoryColors = {
  Pizzas: "bg-red-100 text-red-600",
  Biryani: "bg-yellow-100 text-yellow-700",
  Burgers: "bg-orange-100 text-orange-600",
  "South Indian": "bg-green-100 text-green-700",
  "Pure Veg": "bg-emerald-100 text-emerald-700",
  Cakes: "bg-pink-100 text-pink-600",
  Momos: "bg-purple-100 text-purple-600",
};


// ── Emoji background colours for fallback card 
const emojiBgColors = {
  Pizzas: "from-red-100 to-red-200",
  Biryani: "from-yellow-100 to-yellow-200",
  Burgers: "from-orange-100 to-orange-200",
  "South Indian": "from-green-100 to-green-200",
  "Pure Veg": "from-emerald-100 to-emerald-200",
  Cakes: "from-pink-100 to-pink-200",
  Momos: "from-purple-100 to-purple-200",
};

// ── RestaurantCard: isolated so onError state doesn't re-render whole list 
const RestaurantCard = ({ res }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow hover:shadow-xl transition-all duration-300 overflow-hidden group hover:-translate-y-2 active:scale-95">

      {/* ── Card Image  */}
      <div className="h-32 min-[480px]:h-36 md:h-40 relative overflow-hidden bg-orange-50">
        {!imgError ? (
          <img
            src={res.image}
            alt={res.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          
          <div
            className={`w-full h-full flex items-center justify-center text-6xl bg-linear-to-br ${emojiBgColors[res.category] || "from-orange-100 to-orange-200"
              }`}
          >
            {res.emoji}
          </div>
        )}

        {/* Offers badge */}
        {res.offers && (
          <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 to-transparent px-3 py-2">
            <p className="text-white text-xs font-semibold truncate">
              🏷️ {res.offers}
            </p>
          </div>
        )}
      </div>

      {/* ── Card Body */}
      <div className="p-4">
        <h3 className="font-bold text-gray-800 text-sm min-[480px]:text-base truncate">{res.name}</h3>

        {/* Category badge */}
        <span
          className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${categoryColors[res.category] || "bg-gray-100 text-gray-600"
            }`}
        >
          {res.category}
        </span>

        {/* Rating + Time */}
        <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <span className="text-yellow-400">⭐</span>
            <span className="font-semibold text-gray-700">{res.rating}</span>
          </span>
          <span className="text-xs">🕐 {res.time}</span>
        </div>

        {/* View Menu button */}
        <Link to="/menu" className="block mt-3">
          <button className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-sm font-semibold py-2 rounded-xl transition-colors">
            View Menu
          </button>
        </Link>
      </div>
    </div>
  );
};

const Home = () => {
  const scrollRef = useRef(null);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Simulate data fetch 
  useEffect(() => {
    const timer = setTimeout(() => {
      setRestaurants(allRestaurants);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // ── Filter by category  
  const filteredRestaurants = useMemo(() => {
    if (selectedCategory === "All") return restaurants;
    return restaurants.filter((r) => r.category === selectedCategory);
  }, [restaurants, selectedCategory]);

  // ── Horizontal scroll  
  const handleScroll = useCallback((direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const move = direction === "left" ? -el.clientWidth / 2 : el.clientWidth / 2;
    el.scrollBy({ left: move, behavior: "smooth" });
  }, []);

  const handleCategoryClick = useCallback((name) => {
    setSelectedCategory(name);
  }, []);

  return (
    <div className="bg-white min-h-screen">
      <main className="max-w-7xl mx-auto px-3 min-[480px]:px-4 md:px-10 lg:px-24">

        {/* ── CATEGORY STRIP   */}
        <section className="pt-8 pb-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl md:text-2xl font-bold">What's on your mind?</h2>
            <div className="flex gap-2">
              <button
                onClick={() => handleScroll("left")}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
              >
                <ArrowLeftOutlined />
              </button>
              <button
                onClick={() => handleScroll("right")}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
              >
                <ArrowRightOutlined />
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex overflow-x-auto gap-4 no-scrollbar pb-2">
          
            {scrollCategories.map((item, index) => (
              <div
                key={index}
                onClick={() => handleCategoryClick(item.name)}
                className="shrink-0 flex flex-col items-center cursor-pointer group"
              >
                <div
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 transition group-hover:scale-110
                    ${selectedCategory === item.name
                      ? "border-orange-500 scale-110"
                      : "border-transparent"
                    }`}
                >
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <p className="mt-1.5 text-xs text-center font-semibold truncate w-16 md:w-20">
                  {item.name}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CAROUSEL */}
        <section className="mt-4 mb-10 rounded-2xl overflow-hidden shadow">
          <Carousel autoplay>
            {carouselItems.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Banner ${i + 1}`}
                className="w-full h-36 min-[480px]:h-44 min-[830px]:h-64 lg:h-80 object-cover"
              />
            ))}
          </Carousel>
        </section>

        {/* ── RESTAURANT GRID   */}
        <section className="pb-16">
          <div className="flex items-center justify-between mb-5 ">
            <h2 className="text-xl md:text-2xl font-bold">
              Restaurants
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({selectedCategory})
              </span>
            </h2>
            {!loading && (
              <span className="text-xs text-gray-400">
                {filteredRestaurants.length} found
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 min-[830px]:grid-cols-3 lg:grid-cols-4 gap-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden shadow animate-pulse ">
                  <div className="h-36 bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              ))
            ) : filteredRestaurants.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <p className="text-4xl mb-3">😢</p>
                <p className="text-gray-500 font-medium">
                  No restaurants found for "{selectedCategory}"
                </p>
                <button
                  onClick={() => setSelectedCategory("All")}
                  className="mt-4 text-orange-500 text-sm font-semibold underline"
                >
                  Show all restaurants
                </button>
              </div>
            ) : (
              filteredRestaurants.map((res) => (
                <RestaurantCard key={res.id} res={res} />
              ))
            )}
          </div>
        </section>

      </main>
    </div>
  );
};

export default Home;