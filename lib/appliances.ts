export interface Appliance {
    name: string;
    icon: string;
    keywords: string[];
    searchTerm: string;
}

export const KITCHEN_APPLIANCES: Appliance[] = [
    {
        name: "Blender",
        icon: "🌪️",
        keywords: ["blend", "puree", "smoothie", "crush", "liquidize", "frappe"],
        searchTerm: "blender"
    },
    {
        name: "Air Fryer",
        icon: "♨️",
        keywords: ["air fry", "crisp", "airfryer", "air-fryer"],
        searchTerm: "air fryer"
    },
    {
        name: "Slow Cooker",
        icon: "🍲",
        keywords: ["slow cook", "crockpot", "stew", "simmer", "low heat", "crock pot"],
        searchTerm: "slow cooker"
    },
    {
        name: "Food Processor",
        icon: "🤖",
        keywords: ["process", "chop", "grind", "food processor", "mince", "pulse"],
        searchTerm: "food processor"
    },
    {
        name: "Stand Mixer",
        icon: "🥣",
        keywords: ["mix", "beat", "whip", "dough", "batter", "knead", "stand mixer"],
        searchTerm: "stand mixer"
    },
    {
        name: "Cast Iron Skillet",
        icon: "🍳",
        keywords: ["sear", "cast iron", "skillet", "pan fry", "steak"],
        searchTerm: "cast iron skillet"
    },
    {
        name: "Dutch Oven",
        icon: "🥘",
        keywords: ["dutch oven", "braise", "pot roast", "casserole dish"],
        searchTerm: "dutch oven"
    },
    {
        name: "Baking Sheet",
        icon: "🍪",
        keywords: ["bake", "roast", "sheet pan", "cookie sheet", "oven", "tray"],
        searchTerm: "baking sheet"
    },
    {
        name: "Kitchen Scale",
        icon: "⚖️",
        keywords: ["weigh", "grams", "oz", "scale", "measure", "weight"],
        searchTerm: "digital kitchen scale"
    },
    {
        name: "Measuring Cups",
        icon: "📏",
        keywords: ["cup", "tsp", "tbsp", "measure"],
        searchTerm: "measuring cups and spoons set"
    }
];

export const GENERIC_APPLIANCES: Appliance[] = [
    {
        name: "Chef's Knife",
        icon: "🔪",
        keywords: [],
        searchTerm: "chef knife"
    },
    {
        name: "Cutting Board",
        icon: "🪵",
        keywords: [],
        searchTerm: "cutting board"
    },
    {
        name: "Kitchen Towels",
        icon: "🧺",
        keywords: [],
        searchTerm: "kitchen towels"
    }
];
