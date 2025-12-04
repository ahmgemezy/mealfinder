# Dish Shuffle 🍽️

**Dish Shuffle** is a modern, feature-rich recipe discovery application built with Next.js 15, TypeScript, and Tailwind CSS. It helps users decide what to eat by providing random meal suggestions, detailed recipes, and a seamless browsing experience.

## 🚀 Features

- 🎲 **Surprise Me** - Get random meal suggestions
- 🔍 **Browse & Search** - Explore recipes by category, cuisine, or search query
- ❤️ **Favorites** - Save your favorite recipes (requires authentication)
- 🌍 **Multi-language Support** - Available in English, Spanish, and French
- 🎨 **Premium UI/UX** - Beautiful, modern design with dark mode support
- 📱 **Mobile-First** - Optimized for all devices
- 🔄 **Dual-API System** - Flexible recipe data from TheMealDB or Spoonacular

- `hybrid` - Use both APIs (TheMealDB as primary, Spoonacular for fallback/advanced features)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (for authentication and recipe caching)
- Spoonacular API key (optional, only if using Spoonacular provider)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/dishshuffle.git
cd dishshuffle
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Recipe API Configuration
RECIPE_API_PROVIDER=mealdb

# Spoonacular API Key (optional, only if using Spoonacular)
SPOONACULAR_API_KEY=your_spoonacular_api_key
```

4. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Spoonacular Setup (Optional)

If you want to use Spoonacular API:

1. Sign up at [https://spoonacular.com/food-api](https://spoonacular.com/food-api)
2. Get your API key from the dashboard
3. Add it to your `.env.local`:
   ```bash
   SPOONACULAR_API_KEY=your_api_key_here
   RECIPE_API_PROVIDER=spoonacular
   ```

**Rate Limits:** The free tier includes 150 requests/day. The app implements aggressive caching to minimize API calls.

## Technology Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Authentication:** Supabase Auth
- **Database:** Supabase (PostgreSQL)
- **Recipe APIs:** TheMealDB & Spoonacular
- **Internationalization:** next-intl
- **Deployment:** Vercel-ready

## Project Structure

```
dishshuffle/
├── app/                    # Next.js app router pages
├── components/             # React components
├── lib/
│   ├── api/               # API integration layer
│   │   ├── index.ts       # Unified API interface
│   │   ├── mealdb.ts      # TheMealDB implementation
│   │   └── spoonacular.ts # Spoonacular implementation
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── messages/              # i18n translation files
└── public/                # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TheMealDB API](https://www.themealdb.com/api.php)
- [Spoonacular API](https://spoonacular.com/food-api/docs)

## License

MIT
