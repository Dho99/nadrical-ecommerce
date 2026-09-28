export interface NewsArticle {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  published_at: string
  author: string
  cover_image_url: string
}

export const DUMMY_NEWS: NewsArticle[] = [
  {
    id: 'news-1',
    title: 'New Summer Collection Launch: Electronics & Gadgets',
    slug: 'summer-collection-electronics-gadgets',
    excerpt:
      'Discover the latest tech arrivals for summer 2026. Exclusive discounts on trending electronics and smart gadgets.',
    content: `
# New Summer Collection: Electronics & Gadgets

We're thrilled to announce the arrival of our curated summer collection featuring the latest electronics and smart gadgets.

## What's New

From wireless earbuds to portable chargers, we've handpicked the best tech for your summer adventures. All items come with our 2-year guarantee and 14-day returns.

### Featured Products
- **Wireless Earbuds** — Crystal clear audio with 30-hour battery life
- **Portable Chargers** — Fast-charging, compact design
- **Smart Watches** — Health tracking, notifications, 7-day battery
- **Action Cameras** — 4K recording, waterproof, stabilization

## Special Offer

Get **15% off** on all electronics when you use code **SUMMER2026** at checkout. Valid until end of August.

### Why Shop with Us
- ✓ Authentic products from official brands
- ✓ Free shipping within 48 hours
- ✓ 2-year warranty included
- ✓ 14-day returns, no questions asked

Visit our [Electronics section](/products?category=electronics) to explore the full collection.
    `,
    category: 'Product Launches',
    tags: ['new', 'electronics', 'summer', 'discount'],
    published_at: '2026-09-15T10:30:00Z',
    author: 'Nadrical Team',
    cover_image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=400&fit=crop',
  },
  {
    id: 'news-2',
    title: 'Customer Success Story: Fashion Entrepreneur',
    slug: 'customer-story-fashion-entrepreneur',
    excerpt:
      'Meet Rina, who built her fashion brand using Nadrical wholesale platform. Her inspiring journey from idea to 10K monthly orders.',
    content: `
# From Idea to 10K Orders: Rina's Fashion Success Story

Meet **Rina Wijaya**, a 28-year-old fashion entrepreneur who turned her passion into a thriving business using Nadrical's wholesale platform.

## The Beginning

Rina started with a simple idea: high-quality, affordable fashion for young professionals. With just 500K budget, she began sourcing items from our platform and selling through her own online store.

## The Growth

**Month 1–3:** 50 orders/month, learning the ropes
**Month 4–6:** 200 orders/month, first repeat customers
**Month 7–9:** 1,000 orders/month, expanded product line
**Current:** 10K+ orders/month, 50+ employees

## Her Success Tips

1. **Start small** — Don't over-invest upfront
2. **Focus on quality** — Happy customers become repeat buyers
3. **Build community** — Engage with customers on social media
4. **Use data** — Track which products sell best
5. **Keep learning** — Stay updated on trends

## What Changed

"Nadrical made wholesale simple. I never had to worry about stock or shipping. I focused on customer experience, and the business grew naturally."

---

**Want to start your own business?** Explore our [Wholesale program](/) or contact our support team for guidance.
    `,
    category: 'Customer Stories',
    tags: ['success', 'business', 'wholesale', 'inspiration'],
    published_at: '2026-09-10T14:15:00Z',
    author: 'Marketing Team',
    cover_image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop',
  },
  {
    id: 'news-3',
    title: '5 Essential Tips for Packing Like a Pro',
    slug: 'guide-packing-tips-pro',
    excerpt:
      'Master the art of smart packing with these 5 expert tips. Save space, protect your items, and travel stress-free.',
    content: `
# 5 Essential Packing Tips: Pack Like a Pro

Whether you're traveling for a weekend or a month, smart packing saves space and protects your belongings. Here are our top 5 tips.

## Tip 1: Roll, Don't Fold

Rolling clothes uses 30% less space than folding. It also reduces wrinkles and makes items easier to locate in your bag.

## Tip 2: Use Packing Cubes

Organize by category (underwear, socks, shirts) in separate cubes. Perfect for quick access and keeps luggage tidy.

## Tip 3: Wear Your Bulkiest Items

Shoes and jackets take up space — wear them during travel instead. Save luggage space for lighter items.

## Tip 4: Protect Fragile Items

Electronics and souvenirs need care:
- Wrap in soft clothing
- Use bubble wrap from our [Accessories section](/products?category=accessories)
- Keep in center of bag for cushioning

## Tip 5: Make a Packing List

Plan outfits before packing. Mix and match pieces to minimize items while maximizing outfit combinations.

## Pro Bonus: Compression Bags

Vacuum-sealed bags reduce bulk by 50%. Great for seasonal clothing storage or travel.

---

Ready to gear up? Check our [Travel Essentials](/) collection for packing bags, organizers, and accessories.
    `,
    category: 'Tips & Guides',
    tags: ['tutorial', 'packing', 'travel', 'tips'],
    published_at: '2026-09-05T09:45:00Z',
    author: 'Lifestyle Editor',
    cover_image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop',
  },
  {
    id: 'news-4',
    title: 'Exclusive: September Flash Sale — Up to 50% Off',
    slug: 'flash-sale-september-50-percent',
    excerpt:
      'Limited-time flash sale this weekend only. Up to 50% off selected categories: Electronics, Apparel, Home & Living.',
    content: `
# Flash Sale Alert: 50% Off This Weekend Only 🎉

**Dates:** Saturday–Sunday (Sept 28–29)
**Time:** 10 AM — 11:59 PM (All timezones)
**Code:** FLASH50 (automatically applied)

## Featured Discounts

### Electronics — Up to 40% Off
- Wireless earbuds
- Smart watches
- Portable chargers
- Action cameras

### Apparel — Up to 50% Off
- Summer dresses
- T-shirts & tops
- Jeans & pants
- Accessories

### Home & Living — Up to 35% Off
- Kitchen gadgets
- Bedding sets
- Decorative items
- Storage solutions

## How to Participate

1. Browse your favorite category
2. Add items to cart
3. Code **FLASH50** auto-applies (no typing needed)
4. Checkout as usual — free shipping applies

## Terms

- Valid Sept 28–29 only
- Selected items only (check product tags)
- Limit 5 items per customer
- Applies to first purchase only

## Don't Miss Out

These deals sell fast. Set a reminder for Saturday morning and be first in line!

[Shop Now](/products)
    `,
    category: 'Seasonal Promotions',
    tags: ['sale', 'discount', 'flash', 'limited-time'],
    published_at: '2026-09-26T16:20:00Z',
    author: 'Promotions Team',
    cover_image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=400&fit=crop',
  },
  {
    id: 'news-5',
    title: 'Loyalty Program Update: New Tier System',
    slug: 'loyalty-program-new-tiers',
    excerpt:
      'Introducing a revamped loyalty program with 4 tiers. Earn faster, unlock exclusive perks, and enjoy VIP benefits.',
    content: `
# Introducing the New Loyalty Tier System

We've upgraded our loyalty program to reward you better. Starting October 1, earn points faster and unlock exclusive perks.

## The 4 New Tiers

### Bronze (0–500 points)
- 1 point per $1 spent
- Birthday bonus: 50 points
- Access to member sales

### Silver (501–2000 points)
- 1.5 points per $1 spent
- Early access to new products
- Free shipping (already included)
- Monthly mystery reward

### Gold (2001–5000 points)
- 2 points per $1 spent
- VIP customer support (chat priority)
- Exclusive product launches
- 10% bonus points on birthday

### Platinum (5000+ points)
- 3 points per $1 spent
- Personal shopping assistant
- Free express shipping
- Exclusive platinum-only sales
- Quarterly gifts

## How Points Work

Points redeem for:
- 100 points = $5 discount
- 250 points = $15 discount
- 500 points = $40 discount

## Migration from Old Program

Your existing points **auto-convert** at a 1:1 ratio. No action needed — you're already in the new system!

## What This Means for You

Reach Silver by year-end and enjoy 1.5X points on every purchase. That's an extra $50+ in rewards annually.

[View Your Points](/profile) — Check your current tier and earnings.
    `,
    category: 'Announcements',
    tags: ['loyalty', 'rewards', 'announcement', 'new'],
    published_at: '2026-09-20T11:00:00Z',
    author: 'Customer Success',
    cover_image_url: 'https://images.unsplash.com/photo-1576091160550-112173f7f869?w=800&h=400&fit=crop',
  },
  {
    id: 'news-6',
    title: 'Behind the Scenes: Our Warehouse Operations',
    slug: 'behind-scenes-warehouse-operations',
    excerpt:
      'Ever wondered how we ship 48 hours? Take a virtual tour of our Jakarta warehouse and see the process in action.',
    content: `
# Behind the Scenes: How We Ship in 48 Hours

Have you wondered how Nadrical fulfills orders so fast? Let's peek inside our Jakarta warehouse.

## The Process

### 1. Order Received (10 AM)
Your order lands in our system instantly. Our AI-powered system prioritizes picking sequence.

### 2. Picking (10:15 AM)
Trained staff locate items in our 5,000+ SKU inventory using mobile devices. Average pick time: 8 minutes per order.

### 3. Quality Check (10:25 AM)
Every item inspected for defects, correct variants, and packaging integrity. Zero tolerance for errors.

### 4. Packing (10:35 AM)
Items wrapped securely in branded packaging. Handwritten thank-you notes included (yes, every order!).

### 5. Label & Sort (10:50 AM)
Barcoded labels applied. Orders sorted by courier zone for optimal routing.

### 6. Handoff (11:00 AM)
Pickup by our courier partners (Gojek, Grab, JNE). Tracking info sent to customer.

### 7. Delivery (Within 48 hours)
Your package arrives with care. Track in real-time via your order page.

## Our Commitment

- **99.2%** on-time delivery rate
- **0.3%** damage rate (industry avg: 2%)
- **100%** accuracy guarantee

## Behind the Numbers

- 50,000+ orders/month
- 25 full-time warehouse staff
- 500+ sq meters of organized storage
- 12-hour operating hours (7 AM — 7 PM)

---

Your order isn't just a transaction — it's handled by real people who care about getting it right. Thank you for your patience and trust!
    `,
    category: 'Company News',
    tags: ['operations', 'transparency', 'behind-scenes'],
    published_at: '2026-09-12T13:30:00Z',
    author: 'Operations Team',
    cover_image_url: 'https://images.unsplash.com/photo-1586528116039-c48148d2e6d7?w=800&h=400&fit=crop',
  },
  {
    id: 'news-7',
    title: '7 Home Organization Hacks for Small Spaces',
    slug: 'guide-home-organization-small-spaces',
    excerpt:
      'Maximize your small space with these 7 clever organization tricks. Expert tips from interior designers.',
    content: `
# 7 Home Organization Hacks for Small Spaces

Living in a small apartment doesn't mean clutter. Here are 7 smart organization hacks to maximize every inch.

## Hack 1: Vertical Storage

Use walls, not just floors:
- Floating shelves above furniture
- Wall-mounted organizers
- Pegboards for tools & accessories
- Under-bed storage boxes

## Hack 2: Multi-Functional Furniture

Invest in pieces that serve double duty:
- Ottoman with hidden storage
- Bed frame with drawers
- Coffee table with shelves
- Wall-mounted desk (folds when not in use)

## Hack 3: Drawer Dividers

Organize within drawers:
- Cutlery organizers for utensils
- Cube dividers for undergarments
- Shoe organizers for socks
- Bamboo dividers for any drawer

## Hack 4: Door Space

Don't waste door real estate:
- Over-door organizers
- Hanging shoe racks
- Hooks for bags & jackets
- Full-length mirror (doubles as decor)

## Hack 5: Color Coding & Labels

Visual organization:
- Label storage boxes
- Color-code by category
- Use clear containers (see contents instantly)
- QR codes for inventory tracking

## Hack 6: Declutter Ruthlessly

Marie Kondo method:
1. Hold each item
2. Ask: "Does this spark joy?"
3. Keep: YES | Donate: NO
4. Result: Only meaningful items remain

## Hack 7: Seasonal Rotation

Store off-season items:
- Winter jackets in summer
- Holiday decorations under bed
- Beach gear in winter
- Frees 30% of daily space

## Shop Smart Organizers

Browse our [Home & Living](/products?category=home) section for storage solutions, organizers, and multi-functional furniture.

---

Small space? Big style. Organization is the secret!
    `,
    category: 'Tips & Guides',
    tags: ['organization', 'diy', 'home', 'tutorial'],
    published_at: '2026-09-08T10:00:00Z',
    author: 'Home & Living Editor',
    cover_image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=400&fit=crop',
  },
  {
    id: 'news-8',
    title: 'New Partnership: Nadrical × StyleHub Collab Collection',
    slug: 'partnership-nadrical-stylehub-collab',
    excerpt: "Exciting announcement: We've partnered with StyleHub to bring you exclusive limited-edition fashion pieces. Pre-order now.",
    content: `
# Exclusive: Nadrical × StyleHub Collab Collection 👗

We're thrilled to announce our partnership with **StyleHub**, a leading Indonesian fashion brand. Together, we're creating something special.

## The Collab

Limited-edition pieces designed specifically for this partnership:
- 50 unique styles
- Sustainable materials
- Handcrafted details
- Numbered certificates of authenticity

## Highlights

### Capsule Collections
1. **Urban Nomad** — Versatile pieces for city living
2. **Minimalist Chic** — Timeless classics with modern twist
3. **Bold Statements** — Eye-catching designs for fashion lovers

### Price Range
- $30–$80 per piece (competitive for collab quality)
- 5–15% cheaper than StyleHub's solo releases

### Availability
- Pre-order: Sept 28 — Oct 4
- Stock: 500 pieces total
- Limited quantity — first-come, first-served
- Expected delivery: Mid-October

## Why This Partnership

StyleHub shares our values:
- ✓ Sustainable fashion
- ✓ Supporting local artisans
- ✓ Quality over quantity
- ✓ Fair labor practices

## Exclusive Preview

Registered members get **first access** 24 hours early. [Register now](/register) to unlock early access.

## Behind the Design

Meet the designers behind this collection in our [Instagram live](/) on Sept 30 at 7 PM. Ask questions, see sketches, learn their inspiration.

---

[Pre-Order Now](/products) — Spots are filling fast!
    `,
    category: 'Product Launches',
    tags: ['collab', 'fashion', 'limited-edition', 'announcement'],
    published_at: '2026-09-22T15:45:00Z',
    author: 'Brand Partnerships',
    cover_image_url: 'https://images.unsplash.com/photo-1556821552-5c63b67baf0e?w=800&h=400&fit=crop',
  },
  {
    id: 'news-9',
    title: 'Sustainable Shopping: How Your Purchases Impact the Planet',
    slug: 'guide-sustainable-shopping-impact',
    excerpt:
      'Learn how conscious shopping choices reduce waste and support ethical businesses. Be part of the change.',
    content: `
# Sustainable Shopping: How Your Choices Matter

Every purchase tells a story. Here's how shopping consciously can create positive impact.

## The Problem

- **92 billion** tons of textiles wasted annually
- **10%** of global CO2 comes from fashion industry
- **87%** of textile waste ends up in landfills
- Workers in developing countries face unfair wages

## Our Commitment

Nadrical is working toward sustainability:

### 1. Ethical Sourcing
- Partner with fair-trade suppliers
- Support local artisans
- Transparent supply chain
- No child labor (certified)

### 2. Sustainable Materials
- Prioritize organic cotton, recycled polyester
- Partner with eco-conscious brands
- Reduce packaging plastic by 60% (goal: 2027)
- Bamboo packaging tape instead of plastic

### 3. Carbon Neutral Shipping
- Offset shipping emissions via TreeplantingCo
- Consolidate orders to reduce vehicles
- Support electric vehicle fleet expansion
- By 2027: Fully carbon-neutral operations

### 4. Circular Economy
- Take-back program for used clothing
- Refurbish & resell (lower prices)
- Partner with recycling centers for non-reusable items
- Give second life to products

## How You Can Help

### Shop Mindfully
1. **Buy less, choose well** — Quality over quantity
2. **Check labels** — Look for eco-certifications
3. **Support ethical brands** — See our [Certified Partners](/)
4. **Extend product life** — Care guides on product pages

### Return & Recycle
- We accept returns/donations
- Give items a second life (and save $)
- Proper recycling ensures zero landfill

### Share Knowledge
- Tell friends about sustainable choices
- Review products (highlight durability)
- Support brands making positive impact

## By the Numbers

If 1 million customers switch to sustainable choices:
- **3 million** kg of CO2 prevented
- **10 million** liters of water saved
- **50 million** pieces diverted from landfills
- **500,000+** artisans supported

---

Your shopping power is real. Let's create change together.

[Shop Sustainable Brands](/) — Filter by "Eco-Certified"
    `,
    category: 'Tips & Guides',
    tags: ['sustainability', 'eco-friendly', 'conscious', 'impact'],
    published_at: '2026-09-17T12:15:00Z',
    author: 'Sustainability Team',
    cover_image_url: 'https://images.unsplash.com/photo-1532996122724-8f3c2cd83c5d?w=800&h=400&fit=crop',
  },
  {
    id: 'news-10',
    title: 'Android App Launch: Shop Anywhere, Anytime',
    slug: 'android-app-launch-announcement',
    excerpt:
      'After months of development, our native Android app is finally here. Download now and get exclusive app-only deals.',
    content: `
# 🚀 Android App Launch: Shop Smarter, Faster

We're excited to announce the launch of the official Nadrical Android app. Download today and get **500 bonus points** (worth $25).

## What's Included

### Fast & Smooth
- Native performance (not web-based)
- Lightning-fast loading
- Offline browsing (browse saved items without internet)
- Smooth animations & transitions

### Exclusive Features
- **App-only deals** — Weekly exclusive discounts
- **Push notifications** — Never miss sales or order updates
- **Saved collections** — Quick access to favorite items
- **One-tap checkout** — Saved payment methods & addresses
- **AR preview** — See how clothes fit (coming soon)

### User Favorites
- Dark mode (easy on the eyes)
- Wishlist sync across devices
- Order history with quick reorder
- Live chat support (reply faster on app)
- Loyalty points tracker

## Download Now

- **Google Play Store** — [Download](/)
- **Alternative:** [APK direct download](/)
- Available for Android 7.0+

## Bonus: Launch Week Special

**Sept 28 — Oct 4:**
- Download app → Verify account → **500 bonus points** (auto-credited)
- First app purchase → Extra **10% off** (code: APP2026)
- Refer friends → Both get 100 points each

## What's Next

- iOS app (October 2026)
- AR fitting room (preview in beta)
- Voice search (native Android integration)
- Augmented reality product visualization

## Feedback Welcome

Help us improve:
- Rate the app (5⭐ helps us grow)
- Send feedback via in-app form
- Report bugs immediately
- Feature requests considered for v1.1

---

**Download the Nadrical app today** and join thousands of smart shoppers who are already enjoying the convenience.

Questions? Chat with our team in the app or visit [Support](/faq).
    `,
    category: 'Announcements',
    tags: ['app', 'android', 'launch', 'technology'],
    published_at: '2026-09-25T09:00:00Z',
    author: 'Product Team',
    cover_image_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=400&fit=crop',
  },
  {
    id: 'news-11',
    title: 'Q3 Results: Record Sales & Customer Growth',
    slug: 'q3-results-record-sales',
    excerpt:
      'Nadrical achieved record Q3 sales with 150% YoY growth. Thank you to our amazing community of customers and partners.',
    content: `
# Q3 2026 Results: We Hit New Milestones 🎉

We're thrilled to share our Q3 performance. Your support made this possible.

## The Numbers

| Metric | Q3 2026 | Q3 2025 | Growth |
|--------|---------|---------|--------|
| Total Sales | $5.2M | $2.1M | **+148%** |
| Orders | 180K | 75K | **+140%** |
| Active Users | 320K | 140K | **+129%** |
| Customer Satisfaction | 4.8/5 | 4.5/5 | **+0.3** |
| On-Time Delivery | 99.2% | 96.1% | **+3.1%** |

## Key Achievements

✓ Launched news platform (you're reading it!)
✓ Expanded warehouse capacity by 40%
✓ Onboarded 500+ new sellers
✓ Reached 99.2% on-time delivery rate
✓ Reduced return rate to 2.8% (industry avg: 4.2%)

## What Drove Growth

1. **Customer Trust** — 4.8/5 rating across all platforms
2. **Fast Shipping** — 48-hour delivery became our standard
3. **Community** — Stories like Rina's inspire others to shop & sell
4. **Quality** — We never compromise on product authenticity
5. **Support** — 24/7 customer service (avg response: 2 minutes)

## Looking Ahead (Q4 & Beyond)

- iOS app launch (October)
- Expansion to Malaysia & Singapore (Beta: Dec 2026)
- New sustainability initiative (carbon-neutral by 2027)
- AI-powered recommendations (personalized shopping)
- Live shopping events (influencer collabs)

## Thank You

This growth is 100% because of you. Our customers, sellers, and team make Nadrical possible.

---

**Together, we're building the future of Southeast Asian ecommerce.** 🌏

[View Investor Page](/) — For press releases and detailed reports.
    `,
    category: 'Company News',
    tags: ['announcement', 'growth', 'milestone', 'results'],
    published_at: '2026-09-23T14:00:00Z',
    author: 'Leadership Team',
    cover_image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop',
  },
  {
    id: 'news-12',
    title: 'How to Style Minimalist Fashion: 30 Days, 30 Outfits',
    slug: 'guide-minimalist-fashion-30-outfits',
    excerpt:
      'Master minimalist style with just 10 core pieces. We show you how to create 30 different outfits from a capsule wardrobe.',
    content: `
# Minimalist Fashion Challenge: 30 Days, 30 Outfits

Ever heard of capsule wardrobes? Create 30 unique outfits with just 10 core pieces. Here's how.

## The 10 Core Pieces

1. **White t-shirt** — Versatile, timeless
2. **Black blazer** — Elevates any outfit
3. **Dark jeans** — The ultimate neutral
4. **White sneakers** — Comfortable & stylish
5. **Black flats** — Versatile & professional
6. **Neutral button-up** (khaki/beige) — Mix & match champion
7. **Simple white sweater** — Layering essential
8. **Black pants** — Dressier than jeans
9. **Minimal belt** — Define silhouette
10. **Neutral scarf** — Add dimension

## Week 1: Basics

**Days 1–3:** White tee + dark jeans variations
- With blazer (casual)
- With button-up (layered)
- With sweater (cozy)

**Days 4–7:** Black pants styling
- With white tee + blazer (professional)
- With button-up alone (elegant)
- With sweater + belt (put-together)

## Week 2: Layering

**Days 8–14:** Build complexity with layers
- Tee + sweater + blazer (3 layers)
- Button-up + blazer + scarf (textured)
- Tee + sweater + belt (definition)
- Mix & match shoes (flats vs sneakers)

## Week 3: Styling Tricks

**Days 15–21:** Use accessories & styling
- Scarf as belt or neck tie
- Blazer worn oversized
- Sleeves rolled vs. buttoned
- Tucked in vs. loose fit

## Week 4: Embrace Repetition

**Days 22–30:** Confidence in consistency
- You'll notice which combos you love
- Style becomes intuitive
- You save time & money
- Wardrobe feels intentional

## The Benefits

✓ **Save Money** — No impulse buys
✓ **Save Time** — Faster mornings (5 min to outfit)
✓ **Look Put-Together** — Intentional style
✓ **Reduce Waste** — Only buy what works
✓ **Boost Confidence** — Wear what you love

## Start Your Capsule

Ready? Check our [Minimalist Essentials](/products) collection:
- Quality basics at fair prices
- Sustainably made
- Lifetime care support

## Pro Tips

1. **Invest in quality** — These pieces are your foundation
2. **Choose a color palette** — Stick to 3–4 neutrals
3. **Prioritize fit** — Proper fit > perfect price
4. **Build slowly** — Add pieces over time
5. **Keep what works** — Donate what doesn't

---

**Your style, simplified.** Join our #CapsuleWardrobe challenge on Instagram — tag 3 friends & inspire them!
    `,
    category: 'Tips & Guides',
    tags: ['fashion', 'minimalism', 'style', 'tutorial'],
    published_at: '2026-09-18T11:20:00Z',
    author: 'Fashion Editor',
    cover_image_url: 'https://images.unsplash.com/photo-1595777707802-221aca19bcbb?w=800&h=400&fit=crop',
  },
]

export const NEWS_CATEGORIES = Array.from(new Set(DUMMY_NEWS.map((n) => n.category)))
export const NEWS_TAGS = Array.from(new Set(DUMMY_NEWS.flatMap((n) => n.tags)))
