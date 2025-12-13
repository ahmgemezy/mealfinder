export interface Appliance {
    name: string;
    image: string;
    keywords: string[];
    searchTerm: string;
}

export const KITCHEN_APPLIANCES: Appliance[] = [
    {
        name: "Blender",
        image: "/images/appliances/blender.png",
        keywords: ["blend", "puree", "smoothie", "crush", "liquidize", "frappe"],
        searchTerm: "blender"
    },
    {
        name: "Air Fryer",
        image: "/images/appliances/air-fryer.png",
        keywords: ["air fry", "crisp", "airfryer", "air-fryer"],
        searchTerm: "air fryer"
    },
    {
        name: "Slow Cooker",
        image: "/images/appliances/slow-cooker.png",
        keywords: ["slow cook", "crockpot", "stew", "simmer", "low heat", "crock pot"],
        searchTerm: "slow cooker"
    },
    {
        name: "Food Processor",
        image: "/images/appliances/food-processor.png",
        keywords: ["process", "chop", "grind", "food processor", "mince", "pulse"],
        searchTerm: "food processor"
    },
    {
        name: "Stand Mixer",
        image: "/images/appliances/stand-mixer.png",
        keywords: ["mix", "beat", "whip", "dough", "batter", "knead", "stand mixer"],
        searchTerm: "stand mixer"
    },
    {
        name: "Cast Iron Skillet",
        image: "/images/appliances/skillet.png",
        keywords: ["sear", "cast iron", "skillet", "pan fry", "steak"],
        searchTerm: "cast iron skillet"
    },
    {
        name: "Dutch Oven",
        image: "/images/appliances/dutch-oven.png",
        keywords: ["dutch oven", "braise", "pot roast", "casserole dish"],
        searchTerm: "dutch oven"
    },
    {
        name: "Baking Sheet",
        image: "/images/appliances/baking-sheet.png",
        keywords: ["bake", "roast", "sheet pan", "cookie sheet", "oven", "tray"],
        searchTerm: "baking sheet"
    },
    {
        name: "Kitchen Scale",
        image: "/images/appliances/scale.png",
        keywords: ["weigh", "grams", "oz", "scale", "measure", "weight"],
        searchTerm: "digital kitchen scale"
    },
    {
        name: "Measuring Cups",
        image: "/images/appliances/measuring-cups.png",
        keywords: ["cup", "tsp", "tbsp", "measure"],
        searchTerm: "measuring cups and spoons set"
    }
];

export const GENERIC_APPLIANCES: Appliance[] = [
    {
        name: "Chef's Knife",
        image: "/images/appliances/knife.png",
        keywords: [],
        searchTerm: "chef knife"
    },
    {
        name: "Cutting Board",
        image: "/images/appliances/cutting-board.png",
        keywords: [],
        searchTerm: "cutting board"
    },
    {
        name: "Kitchen Towels",
        image: "/images/appliances/towels.png",
        keywords: [],
        searchTerm: "kitchen towels"
    }
];
