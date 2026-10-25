import { BusinessItem } from '@/components/business-page/public-page-view';

export interface IndustryPagePreset {
  id: string;
  name: string;
  category: string;
  defaultTagline: string;
  defaultAbout: string;
  sampleItems: BusinessItem[];
}

export const INDUSTRY_PAGE_PRESETS: IndustryPagePreset[] = [
  // 1. Tours, Travel & Holiday Packages
  {
    id: 'travel_holidays',
    name: 'Travel & Holiday Planner',
    category: 'Travel & Stays',
    defaultTagline: 'Custom Holiday Packages, Domestic & Outstation Tours at Guaranteed Best Rates',
    defaultAbout: 'We specialize in hassle-free holiday planning, flight & hotel bookings, family vacations, and custom itineraries with 24/7 travel assistance.',
    sampleItems: [
      {
        id: 'trv-1',
        title: 'Goa 3 Nights / 4 Days Holiday Package',
        category: 'Domestic Trips',
        description: 'Includes 4-star resort stay with pool, daily breakfast, South Goa sightseeing, airport pick & drop.',
        price: '₹8,999 / person',
        button_label: 'Inquire on WhatsApp',
        prefill_message: "Hi! I am interested in the Goa 3N/4D package. We are planning to travel soon. Please share day-wise itinerary and available dates.",
        badge: 'Top Seller • Breakfast Inc.',
      },
      {
        id: 'trv-2',
        title: 'Himachal Manali & Shimla Tour (5N/6D)',
        category: 'Domestic Trips',
        description: 'Deluxe hotel stay, Solang Valley snow excursion, Rohtang Pass permit assistance, private AC cab throughout.',
        price: '₹14,500 / person',
        button_label: 'Get Itinerary',
        prefill_message: "Hi! Please share the detailed itinerary and quote for the Himachal Manali & Shimla 5N/6D tour.",
        badge: 'Private AC Cab • 5 Nights',
      },
      {
        id: 'trv-3',
        title: 'Dubai Express 4N/5D with Desert Safari',
        category: 'International Trips',
        description: 'Desert Safari with BBQ dinner, Burj Khalifa 124th floor ticket, Marina Dhow Cruise, and UAE tourist visa.',
        price: '₹34,999 / person',
        button_label: 'Book on WhatsApp',
        prefill_message: "Hi! I'd like to book/inquire about the Dubai 4N/5D package including Visa and Desert Safari.",
        badge: 'Visa Included • 4-Star Stay',
      },
      {
        id: 'trv-4',
        title: 'Fast-Track Tourist & Visit Visa Processing',
        category: 'Visa & Flights',
        description: 'Hassle-free visa documentation for UAE, Schengen, UK, Singapore & Thailand with high approval rates.',
        price: 'Starting from ₹2,499',
        button_label: 'Check Visa Requirements',
        prefill_message: "Hi! I need assistance with a Tourist Visa application. Could you please guide me on documents and timeline?",
        badge: 'Express Service • 99% Approval',
      },
    ],
  },

  // 2. Hotels, Homestays & Resorts
  {
    id: 'hotels_resorts',
    name: 'Hotels, Resorts & Homestays',
    category: 'Travel & Stays',
    defaultTagline: 'Luxury Stay, Nature Views & Homely Hospitality — Direct WhatsApp Booking with 0% Commission',
    defaultAbout: 'Experience unforgettable hospitality with spacious rooms, fast Wi-Fi, mountain/pool views, multi-cuisine dining, and instant check-in.',
    sampleItems: [
      {
        id: 'htl-1',
        title: 'Deluxe King Room with Mountain View',
        category: 'Rooms',
        description: 'King-size bed, private balcony, complimentary high-speed Wi-Fi, 43" Smart TV, and 24/7 room service.',
        price: '₹2,799 / night',
        button_label: 'Check Availability',
        prefill_message: "Hi! I want to check availability for the Deluxe King Room. Dates: [Check-in] to [Check-out], [X] guests.",
        badge: 'Balcony View • Free Wi-Fi',
      },
      {
        id: 'htl-2',
        title: 'Executive Family Suite (2 Bedrooms)',
        category: 'Suites',
        description: 'Spacious 2-bedroom suite ideal for families (up to 4 adults), separate living room, bathtub, and breakfast included.',
        price: '₹5,499 / night',
        button_label: 'Reserve Suite',
        prefill_message: "Hi! Is the Executive Family Suite available for [Check-in date]? We are a family of [X]. Please share pricing.",
        badge: 'Breakfast Inc. • Sleeps 4',
      },
      {
        id: 'htl-3',
        title: 'Private Pool Villa / Cottage',
        category: 'Villas',
        description: 'Exclusive private plunge pool, lush garden sit-out, outdoor BBQ setup, and personal butler service on request.',
        price: '₹9,999 / night',
        button_label: 'Book Villa',
        prefill_message: "Hi! I am interested in reserving the Private Pool Villa for an upcoming weekend. Please share availability.",
        badge: 'Private Pool • Exclusive',
      },
    ],
  },

  // 3. Car Rentals, Drivers & Airport Travels
  {
    id: 'car_rentals',
    name: 'Car Rentals, Cabs & Drivers',
    category: 'Automotive & Travel',
    defaultTagline: '24/7 On-Time Airport Drops, Local Hourly Rentals & Outstation Trips with Sanitized Cars',
    defaultAbout: 'Professional chauffeurs, transparent per-km billing with zero hidden charges, clean AC cabs, and verified on-time arrival guarantee.',
    sampleItems: [
      {
        id: 'car-1',
        title: 'Airport Drop & Pickup (Sedan - Dzire / Etios)',
        category: 'Airport Cabs',
        description: 'Fixed door-to-terminal flat rate, luggage assistance, sanitized AC vehicle, zero cancellation fees.',
        price: '₹1,199 fixed',
        button_label: 'Book Cab on WhatsApp',
        prefill_message: "Hi! I need an Airport cab. Pickup location: [Address], Date & Time: [Time]. Please confirm booking.",
        badge: 'Fixed Fare • 0 Cancellation Fee',
      },
      {
        id: 'car-2',
        title: 'Outstation Round Trip (Innova Crysta 7-Seater)',
        category: 'Outstation',
        description: 'Spacious captain seats, powerful dual AC, verified experienced highway driver, perfect for family trips.',
        price: '₹18 / km (min 250km/day)',
        button_label: 'Get Trip Estimate',
        prefill_message: "Hi! Need an Innova Crysta for an outstation trip from [From] to [To] on [Dates]. Please share total estimate.",
        badge: '7 Seater • Highway Specialist',
      },
      {
        id: 'car-3',
        title: 'Local 8 Hours / 80 KMs City Package',
        category: 'Local Rentals',
        description: 'Unlimited stops for shopping, business meetings, or family functions within the city. Driver toll/parking extra at actuals.',
        price: '₹2,200 package',
        button_label: 'Book Local Rental',
        prefill_message: "Hi! I want to book the Local 8 Hr / 80 Km package for [Date]. Pickup location: [Address].",
        badge: '8 Hrs / 80 Km • City Trips',
      },
    ],
  },

  // 4. Loans, Mortgages & Financial Services
  {
    id: 'loans_mortgages',
    name: 'Loan & Mortgage Advisory',
    category: 'Finance & Legal',
    defaultTagline: 'Instant Loan Approvals Across 30+ Banks & NBFCs — Lowest Interest Rates & Fast Payout',
    defaultAbout: 'Authorised Direct Selling Agent (DSA). We compare 30+ leading banks to secure maximum loan eligibility, minimal paperwork, and doorstep document pickup.',
    sampleItems: [
      {
        id: 'loan-1',
        title: 'Home Loan & Balance Transfer',
        category: 'Home Loans',
        description: 'Interest rates starting from 8.35% p.a. Tenures up to 30 years with fast doorstep legal & technical verification.',
        price: 'Starting 8.35% p.a.',
        button_label: 'Check Eligibility',
        prefill_message: "Hi! I want to check my Home Loan eligibility. My approximate loan requirement is ₹[Amount]. Please advise.",
        badge: 'Rates from 8.35% • 30 Banks',
      },
      {
        id: 'loan-2',
        title: 'Unsecured Business Loan (Fast 48h Disbursal)',
        category: 'Business Loans',
        description: 'Collateral-free business capital up to ₹50 Lakhs based on GST turnover & bank statements. Minimal documentation.',
        price: 'Up to ₹50 Lakhs',
        button_label: 'Apply on WhatsApp',
        prefill_message: "Hi! I am looking for an Unsecured Business Loan for my firm. Average monthly turnover is ₹[Amount]. What are the requirements?",
        badge: 'Zero Collateral • 48h Approval',
      },
      {
        id: 'loan-3',
        title: 'Loan Against Property (LAP)',
        category: 'Property Loans',
        description: 'Unlock liquidity against commercial or residential property with lower EMI rates than personal loans.',
        price: 'Up to ₹5 Crores',
        button_label: 'Inquire on LAP',
        prefill_message: "Hi! I have a residential/commercial property and would like to explore Loan Against Property. Please contact me.",
        badge: 'High Value • Flexible Tenure',
      },
    ],
  },

  // 5. Interior Designers & Home Renovation
  {
    id: 'interior_design',
    name: 'Interior Design & Modular Living',
    category: 'Real Estate & Home',
    defaultTagline: 'Turnkey Luxury Interiors, Modular Kitchens & Wardrobes with 10-Year Warranty',
    defaultAbout: 'From 3D architectural renders to complete handover in 45 days. High-quality materials, transparent pricing, and zero project delays.',
    sampleItems: [
      {
        id: 'int-1',
        title: 'Complete 2BHK Interior Package',
        category: 'Full Home',
        description: 'Modular kitchen with acrylic finish, 2 wardrobes, TV unit, foyer unit, false ceiling with LED ambient lighting.',
        price: '₹3.99 Lakhs onwards',
        button_label: 'Get Free Estimate',
        prefill_message: "Hi! I recently got possession of my 2BHK apartment. I would like a free 3D design consultation and quote.",
        badge: '45-Day Handover • 10-Yr Warranty',
      },
      {
        id: 'int-2',
        title: 'Waterproof Modular Kitchen (Anti-Termite Marine Ply)',
        category: 'Kitchens',
        description: 'BWR/BWP marine ply cabinets, soft-close Blum/Hettich hinges, quartz/granite countertop integration.',
        price: '₹1.49 Lakhs onwards',
        button_label: 'Explore Designs',
        prefill_message: "Hi! I want to renovate / install a new modular kitchen. Please share your catalog and catalog price list.",
        badge: 'Hettich Hardware • Waterproof',
      },
      {
        id: 'int-3',
        title: 'Full Home 3D Visualizer & Site Inspection',
        category: 'Consultation',
        description: 'Expert architect site visit, laser floor plan measurement, 3D walkthrough render, and itemized transparent BOQ.',
        price: 'Free Consultation',
        button_label: 'Book Site Visit',
        prefill_message: "Hi! I would like to book a site measurement and 3D consultation for my flat in [Location].",
        badge: 'Doorstep Visit • Free 3D',
      },
    ],
  },

  // 6. Restaurants, Cafes & Cloud Kitchens
  {
    id: 'restaurants_food',
    name: 'Restaurants, Cafes & Catering',
    category: 'Food & Dining',
    defaultTagline: 'Authentic Flavors, Chef Specials & Party Catering — Direct WhatsApp Orders with Zero Swiggy Markup',
    defaultAbout: 'Fresh ingredients, hygienic preparation, rapid doorstep delivery, and custom catering menus for family get-togethers and corporate events.',
    sampleItems: [
      {
        id: 'res-1',
        title: 'Royal Dum Biryani Family Feast (Serves 4)',
        category: 'Main Course',
        description: 'Slow-cooked aromatic biryani with tender meat/paneer, Mirchi Ka Salan, creamy raita, gulab jamun, and beverage.',
        price: '₹899 combo',
        button_label: 'Order on WhatsApp',
        prefill_message: "Hi! I want to order the Royal Dum Biryani Family Feast for delivery to [Address].",
        badge: 'Serves 4 • Chef Special',
      },
      {
        id: 'res-2',
        title: 'Wood-Fired Gourmet Pizza Combo',
        category: 'Italian & Fast Food',
        description: 'Choice of 12" Handcrafted Thin Crust Pizza + Cheesy Garlic Breadsticks + 2 Cold Brews/Sodas.',
        price: '₹549 combo',
        button_label: 'Order Now',
        prefill_message: "Hi! I'd like to order the Wood-Fired Gourmet Pizza combo. Please share available toppings.",
        badge: 'Handcrafted Dough • Fresh Mozzarella',
      },
      {
        id: 'res-3',
        title: 'Corporate & Birthday Event Catering (20-100 Pax)',
        category: 'Catering',
        description: 'Full buffet setup with starters, live counters, main courses, desserts, and dedicated service staff.',
        price: '₹450 / plate onwards',
        button_label: 'Get Catering Quote',
        prefill_message: "Hi! We have an upcoming event for approx [X] people on [Date]. Please share your catering menu and quote.",
        badge: 'Live Counter • Full Buffet',
      },
    ],
  },
];
