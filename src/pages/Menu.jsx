import MenuCard from "../components/MenuCard";
import useFoodSearch from "../hooks/useFoodSearch";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Input, Select, Button, Tag, ConfigProvider, Drawer } from "antd";
import {
  CloseCircleOutlined,
  FilterOutlined,
  AppstoreOutlined,
  SortAscendingOutlined,
} from "@ant-design/icons";

import M1  from "../assets/img/mexican/burrito.jpg";
import M2  from "../assets/img/mexican/cheesynachos.jpg";
import M3  from "../assets/img/mexican/enchiladas.jpg";
import M4  from "../assets/img/mexican/guacamole.jpg";
import M5  from "../assets/img/mexican/quesadilla.jpg";
import F1  from "../assets/img/fastfood/bbqchicken.jpg";
import F2  from "../assets/img/fastfood/chickenwrap.jpg";
import F3  from "../assets/img/fastfood/doublecheeseburger.jpg";
import F4  from "../assets/img/fastfood/frenchfries.jpg";
import F5  from "../assets/img/fastfood/hotdogs.jpg";
import F6  from "../assets/img/fastfood/onionrings.jpg";
import I1  from "../assets/img/italian/calzone.jpg";
import I2  from "../assets/img/italian/garlicbread.jpg";
import I3  from "../assets/img/italian/lasangna.jpg";
import I4  from "../assets/img/italian/margheritapizza.jpg";
import I5  from "../assets/img/italian/risotto.jpg";
import I6  from "../assets/img/italian/whitesauce.jpg";
import A1  from "../assets/img/asian/friedrice.jpg";
import A2  from "../assets/img/asian/hakkanoodles.jpg";
import A3  from "../assets/img/asian/manchurian.jpg";
import A4  from "../assets/img/asian/springrolls.jpg";
import A5  from "../assets/img/asian/thaigreencurry.jpg";
import J1  from "../assets/img/japanese/bento.jpg";
import J2  from "../assets/img/japanese/misosoup.jpg";
import J3  from "../assets/img/japanese/sashimi.jpg";
import J4  from "../assets/img/japanese/tempura.jpg";
import J5  from "../assets/img/japanese/teriyaki.jpg";
import J6  from "../assets/img/japanese/udonnoodle.jpg";
import D1  from "../assets/img/desserts/brownie.jpg";
import D2  from "../assets/img/desserts/cheesecake.jpg";
import D3  from "../assets/img/desserts/chocolatecake.jpg";
import D4  from "../assets/img/desserts/cupcake.jpg";
import D5  from "../assets/img/desserts/donut.jpg";
import D6  from "../assets/img/desserts/waffles.jpg";
import H1  from "../assets/img/healthyveg/avocadotoast.jpg";
import H2  from "../assets/img/healthyveg/caesarsalad.jpg";
import H3  from "../assets/img/healthyveg/fruitbowl.jpg";
import H4  from "../assets/img/healthyveg/greeksalad.jpg";
import H5  from "../assets/img/healthyveg/quinoabowl.jpg";
import H6  from "../assets/img/healthyveg/veggiebowl.jpg";
import Aw1 from "../assets/img/americanwestern/bbqribs.jpg";
import Aw2 from "../assets/img/americanwestern/buffalowings.jpg";
import Aw3 from "../assets/img/americanwestern/clubsandwich.jpg";
import Aw4 from "../assets/img/americanwestern/grilledchickenbreast.jpg";
import Aw5 from "../assets/img/americanwestern/maccheese.jpg";
import Dr1 from "../assets/img/drinks/coldcoffee.jpg";
import Dr2 from "../assets/img/drinks/icedtea.jpg";
import Dr3 from "../assets/img/drinks/lemonade.jpg";
import Dr4 from "../assets/img/drinks/milkshake.jpg";
import Dr5 from "../assets/img/drinks/mojito.jpg";
import Dr6 from "../assets/img/drinks/orangejuice.jpg";

// ─── Static data 

const CATEGORIES = [
  { label: "All",           emoji: "🍽️" },
  { label: "Mexican",       emoji: "🌮" },
  { label: "Fast Food",     emoji: "🍔" },
  { label: "Italian",       emoji: "🍝" },
  { label: "Asian",         emoji: "🍜" },
  { label: "Japanese",      emoji: "🍱" },
  { label: "Desserts",      emoji: "🍰" },
  { label: "Healthy & Veg", emoji: "🥗" },
  { label: "American",      emoji: "🍖" },
  { label: "Drinks",        emoji: "🥤" },
];

const foods = [
  { id: 1,  name: "Burrito",              price: 220, image: M1,  category: "Mexican"       },
  { id: 2,  name: "Cheesy Nachos",        price: 180, image: M2,  category: "Mexican"       },
  { id: 3,  name: "Enchiladas",           price: 210, image: M3,  category: "Mexican"       },
  { id: 4,  name: "Guacamole",            price: 150, image: M4,  category: "Mexican"       },
  { id: 5,  name: "Quesadilla",           price: 200, image: M5,  category: "Mexican"       },
  { id: 6,  name: "BBQ Chicken",          price: 250, image: F1,  category: "Fast Food"     },
  { id: 7,  name: "Chicken Wrap",         price: 160, image: F2,  category: "Fast Food"     },
  { id: 8,  name: "Double Cheese Burger", price: 240, image: F3,  category: "Fast Food"     },
  { id: 9,  name: "French Fries",         price: 120, image: F4,  category: "Fast Food"     },
  { id: 10, name: "Hot Dogs",             price: 150, image: F5,  category: "Fast Food"     },
  { id: 11, name: "Onion Rings",          price: 140, image: F6,  category: "Fast Food"     },
  { id: 12, name: "Calzone",              price: 260, image: I1,  category: "Italian"       },
  { id: 13, name: "Garlic Bread",         price: 140, image: I2,  category: "Italian"       },
  { id: 14, name: "Lasagna",              price: 280, image: I3,  category: "Italian"       },
  { id: 15, name: "Margherita Pizza",     price: 240, image: I4,  category: "Italian"       },
  { id: 16, name: "Risotto",              price: 260, image: I5,  category: "Italian"       },
  { id: 17, name: "White Sauce Pasta",    price: 220, image: I6,  category: "Italian"       },
  { id: 18, name: "Fried Rice",           price: 180, image: A1,  category: "Asian"         },
  { id: 19, name: "Hakka Noodles",        price: 170, image: A2,  category: "Asian"         },
  { id: 20, name: "Manchurian",           price: 190, image: A3,  category: "Asian"         },
  { id: 21, name: "Spring Rolls",         price: 160, image: A4,  category: "Asian"         },
  { id: 22, name: "Thai Green Curry",     price: 240, image: A5,  category: "Asian"         },
  { id: 23, name: "Bento Box",            price: 320, image: J1,  category: "Japanese"      },
  { id: 24, name: "Miso Soup",            price: 150, image: J2,  category: "Japanese"      },
  { id: 25, name: "Sashimi",              price: 350, image: J3,  category: "Japanese"      },
  { id: 26, name: "Tempura",              price: 280, image: J4,  category: "Japanese"      },
  { id: 27, name: "Teriyaki",             price: 260, image: J5,  category: "Japanese"      },
  { id: 28, name: "Udon Noodles",         price: 210, image: J6,  category: "Japanese"      },
  { id: 29, name: "Brownie",              price: 140, image: D1,  category: "Desserts"      },
  { id: 30, name: "Cheesecake",           price: 180, image: D2,  category: "Desserts"      },
  { id: 31, name: "Chocolate Cake",       price: 170, image: D3,  category: "Desserts"      },
  { id: 32, name: "Cupcake",              price: 120, image: D4,  category: "Desserts"      },
  { id: 33, name: "Donut",               price: 110, image: D5,  category: "Desserts"      },
  { id: 34, name: "Waffles",              price: 160, image: D6,  category: "Desserts"      },
  { id: 35, name: "Avocado Toast",        price: 190, image: H1,  category: "Healthy & Veg" },
  { id: 36, name: "Caesar Salad",         price: 170, image: H2,  category: "Healthy & Veg" },
  { id: 37, name: "Fruit Bowl",           price: 150, image: H3,  category: "Healthy & Veg" },
  { id: 38, name: "Greek Salad",          price: 180, image: H4,  category: "Healthy & Veg" },
  { id: 39, name: "Quinoa Bowl",          price: 210, image: H5,  category: "Healthy & Veg" },
  { id: 40, name: "Veggie Bowl",          price: 200, image: H6,  category: "Healthy & Veg" },
  { id: 41, name: "BBQ Ribs",             price: 320, image: Aw1, category: "American"      },
  { id: 42, name: "Buffalo Wings",        price: 260, image: Aw2, category: "American"      },
  { id: 43, name: "Club Sandwich",        price: 210, image: Aw3, category: "American"      },
  { id: 44, name: "Grilled Chicken",      price: 280, image: Aw4, category: "American"      },
  { id: 45, name: "Mac & Cheese",         price: 220, image: Aw5, category: "American"      },
  { id: 46, name: "Cold Coffee",          price: 120, image: Dr1, category: "Drinks"        },
  { id: 47, name: "Iced Tea",             price: 110, image: Dr2, category: "Drinks"        },
  { id: 48, name: "Lemonade",             price: 100, image: Dr3, category: "Drinks"        },
  { id: 49, name: "Milkshake",            price: 140, image: Dr4, category: "Drinks"        },
  { id: 50, name: "Mojito",               price: 130, image: Dr5, category: "Drinks"        },
  { id: 51, name: "Orange Juice",         price: 120, image: Dr6, category: "Drinks"        },
];

const SORT_OPTIONS = [
  { value: "default",    label: "Recommended"       },
  { value: "price-asc",  label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "name-asc",   label: "Name: A → Z"       },
];


const antTheme = {
  token: {
    colorPrimary: "#f97316",
    borderRadius: 10,
    colorBorder:  "#e5e7eb",
  },
};



// ─── Stable mobile hook 
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  );

  useEffect(() => {
    let raf;
    const handler = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setIsMobile(window.innerWidth < 640));
    };
    window.addEventListener("resize", handler, { passive: true });
    handler();
    return () => {
      window.removeEventListener("resize", handler);
      cancelAnimationFrame(raf);
    };
  }, []);

  return isMobile;
};

//  Menu page Component
const Menu = () => {
  const { search, setSearch, filteredFoods } = useFoodSearch(foods);
  const isMobile = useIsMobile();

  const topRef = useRef(null);

  const [loading,        setLoading]        = useState(true);
  const [visible,        setVisible]        = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy,         setSortBy]         = useState("default");
  const [drawerOpen,     setDrawerOpen]     = useState(false);
  const [sortDrawerOpen, setSortDrawerOpen] = useState(false);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
    const t1 = setTimeout(() => setLoading(false), 600);
    const t2 = setTimeout(() => setVisible(true), 650);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setDrawerOpen(false);
      setSortDrawerOpen(false);
    }
  }, [isMobile]);

  const handleCategoryClick = useCallback((val) => {
    setActiveCategory(val);
    setDrawerOpen(false);
  }, []);

  const handleSortChange = useCallback((val) => {
    setSortBy(val);
    setSortDrawerOpen(false);
  }, []);

  const handleSearch  = useCallback((val) => setSearch(val), [setSearch]);

  const clearAll = useCallback(() => {
    setActiveCategory("All");
    setSearch("");
  }, [setSearch]);

  const displayedFoods = useMemo(() => {
    let list = filteredFoods;
    if (activeCategory !== "All") list = list.filter((f) => f.category === activeCategory);
    switch (sortBy) {
      case "price-asc":  return [...list].sort((a, b) => a.price - b.price);
      case "price-desc": return [...list].sort((a, b) => b.price - a.price);
      case "name-asc":   return [...list].sort((a, b) => a.name.localeCompare(b.name));
      default:           return list;
    }
  }, [filteredFoods, activeCategory, sortBy]);

  const countLabel = useMemo(() => {
    const n = displayedFoods.length;
    return `${n} item${n !== 1 ? "s" : ""}`;
  }, [displayedFoods]);

  const hasFilters      = activeCategory !== "All" || !!search;
  const activeSortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "Sort";

  return (
    <ConfigProvider theme={antTheme}>
      <div ref={topRef} className="min-h-screen bg-gray-50">

        {/* ── HERO */}
        <div className="bg-orange-500 py-6 px-4 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-1">
            Our Food Menu 🍽️
          </h1>
          <p className="text-orange-100 text-xs sm:text-sm md:text-base">
            Fresh ingredients · Made with love · Delivered fast
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8 py-4 sm:py-8">

          {/* Mobile toolbar */}
          <div className="flex flex-col gap-2 mb-4 sm:hidden">
            <Input.Search
              placeholder="Search for food..."
              allowClear
              size="large"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              onSearch={handleSearch}
              style={{ width: "100%" }}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setSortDrawerOpen(true)}
                className={`flex-1 min-w-0 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all
                  ${sortBy !== "default"
                    ? "border-orange-500 bg-orange-50 text-orange-600"
                    : "border-gray-200 bg-white text-gray-600"
                  }`}
              >
                <SortAscendingOutlined className="shrink-0" />
                <span className="truncate">{sortBy !== "default" ? activeSortLabel : "Sort"}</span>
              </button>
              <button
                onClick={() => setDrawerOpen(true)}
                className={`flex-1 min-w-0 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all
                  ${activeCategory !== "All"
                    ? "border-orange-500 bg-orange-50 text-orange-600"
                    : "border-gray-200 bg-white text-gray-600"
                  }`}
              >
                <FilterOutlined className="shrink-0" />
                <span className="truncate">{activeCategory !== "All" ? activeCategory : "Filter"}</span>
              </button>
            </div>
          </div>

          {/* Desktop toolbar */}
          <div className="hidden sm:flex gap-3 mb-5">
            <Input.Search
              placeholder="Search for food..."
              allowClear
              size="large"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              onSearch={handleSearch}
              style={{ flex: 1 }}
            />
            <Select
              value={sortBy}
              onChange={handleSortChange}
              options={SORT_OPTIONS}
              size="large"
              popupMatchSelectWidth={false}
              style={{ minWidth: 180 }}
            />
          </div>

          {/*  CATEGORY PILLS — desktop/tablet only */}
          <div className="hidden sm:block overflow-x-auto no-scrollbar pb-3 mb-5">
            <div className="flex gap-2 w-max">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => handleCategoryClick(cat.label)}
                  className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200
                    ${activeCategory === cat.label
                      ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-200"
                      : "bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-500"
                    }`}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── ACTIVE FILTER TAGS */}
          {hasFilters && (
            <div className="flex items-center gap-2 flex-wrap mb-3">
              {activeCategory !== "All" && (
                <Tag
                  color="orange"
                  closable
                  onClose={() => handleCategoryClick("All")}
                  style={{ fontSize: 12, padding: "2px 8px" }}
                >
                  {CATEGORIES.find((c) => c.label === activeCategory)?.emoji} {activeCategory}
                </Tag>
              )}
              {search && (
                <Tag
                  color="blue"
                  closable
                  onClose={() => handleSearch("")}
                  style={{ fontSize: 12, padding: "2px 8px" }}
                >
                  "{search}"
                </Tag>
              )}
              <Button
                size="small"
                type="text"
                icon={<CloseCircleOutlined />}
                onClick={clearAll}
                style={{ color: "#f97316", padding: 0 }}
              >
                Clear all
              </Button>
            </div>
          )}

          {/* ── RESULTS HEADER */}
          <div className="mb-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-800">
              {activeCategory === "All" ? "All Items" : activeCategory}
            </h2>
            {!loading && (
              <p className="text-xs text-gray-400 mt-0.5">{countLabel} available</p>
            )}
          </div>

          {/* ── FOOD GRID */}
          <div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 md:gap-6"
            style={{
              opacity:    visible ? 1 : 0,
              transform:  visible ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 0.4s ease, transform 0.4s ease",
            }}
          >
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow animate-pulse">
                  <div className="h-32 sm:h-44 bg-gray-200" />
                  <div className="p-3 sm:p-4 space-y-2">
                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                    <div className="h-7 sm:h-8 bg-gray-100 rounded-lg mt-2" />
                  </div>
                </div>
              ))
            ) : displayedFoods.length > 0 ? (
              displayedFoods.map((food, index) => (
                <div
                  key={food.id}
                  className="menu-card-anim"
                  style={{ animationDelay: `${Math.min(index, 11) * 40}ms` }}
                >
                  <MenuCard food={food} />
                </div>
              ))
            ) : (
              <div className="col-span-2 md:col-span-3 lg:col-span-4 text-center py-16">
                <p className="text-4xl sm:text-5xl mb-3">🔍</p>
                <p className="text-gray-500 font-semibold text-base sm:text-lg">No items found</p>
                <p className="text-gray-400 text-xs sm:text-sm mt-1">
                  Try a different search or category
                </p>
                <Button
                  type="primary"
                  shape="round"
                  size="large"
                  onClick={clearAll}
                  style={{ marginTop: 16 }}
                >
                  Show all items
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* ── CATEGORY DRAWER (mobile) */}
        <Drawer
          title={
            <div className="flex items-center gap-2 font-bold text-gray-800">
              <AppstoreOutlined style={{ color: "#f97316" }} />
              Choose Category
            </div>
          }
          placement="bottom"
          size="large"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          styles={{ body: { padding: "16px 16px 32px" }, wrapper: { maxHeight: "80vh" } }}
        >
          <div className="grid grid-cols-3 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                onClick={() => handleCategoryClick(cat.label)}
                className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-xs font-semibold transition-all active:scale-95
                  ${activeCategory === cat.label
                    ? "border-orange-500 bg-orange-50 text-orange-600"
                    : "border-gray-100 bg-white text-gray-600"
                  }`}
              >
                <span className="text-2xl leading-none">{cat.emoji}</span>
                <span className="leading-tight text-center">{cat.label}</span>
              </button>
            ))}
          </div>
        </Drawer>

        {/* ── SORT DRAWER (mobile) */}
        <Drawer
          title={
            <div className="flex items-center gap-2 font-bold text-gray-800">
              <SortAscendingOutlined style={{ color: "#f97316" }} />
              Sort By
            </div>
          }
          placement="bottom"
          size="large"
          open={sortDrawerOpen}
          onClose={() => setSortDrawerOpen(false)}
          styles={{ body: { padding: "12px 16px 32px" }, wrapper: { maxHeight: "60vh" } }}
        >
          <div className="flex flex-col gap-2">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleSortChange(opt.value)}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all
                  ${sortBy === opt.value
                    ? "border-orange-500 bg-orange-50 text-orange-600"
                    : "border-gray-100 bg-white text-gray-700"
                  }`}
              >
                {sortBy === opt.value && <span className="mr-2">✓</span>}
                {opt.label}
              </button>
            ))}
          </div>
        </Drawer>

        <style>{`
          .menu-card-anim {
            animation: fadeUp 0.35s ease both;
          }
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(18px); }
            to   { opacity: 1; transform: translateY(0);    }
          }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </div>
    </ConfigProvider>
  );
};

export default Menu;