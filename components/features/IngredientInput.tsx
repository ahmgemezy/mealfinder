"use client";

import { useState, KeyboardEvent } from "react";
import { X, Plus, Search } from "lucide-react";
import { useTranslations } from "next-intl";

interface IngredientInputProps {
    onSearch: (ingredients: string[]) => void;
    isLoading: boolean;
}

export default function IngredientInput({ onSearch, isLoading }: IngredientInputProps) {
    const t = useTranslations("SmartPantry");
    const [ingredients, setIngredients] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState("");

    const addIngredient = () => {
        const trimmed = inputValue.trim().toLowerCase();
        if (trimmed && !ingredients.includes(trimmed)) {
            setIngredients([...ingredients, trimmed]);
            setInputValue("");
        }
    };

    const removeIngredient = (ingToRemove: string) => {
        setIngredients(ingredients.filter((i) => i !== ingToRemove));
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addIngredient();
        }
    };

    const handleSearch = () => {
        if (ingredients.length > 0) {
            onSearch(ingredients);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6">
            {/* Input Area */}
            <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-2 flex items-center gap-2 focus-within:ring-2 focus-within:ring-orange-200 transition-all">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t("inputPlaceholder")}
                    className="flex-1 px-4 py-3 outline-none text-gray-700 placeholder-gray-400 bg-transparent"
                />
                <button
                    onClick={addIngredient}
                    disabled={!inputValue.trim()}
                    className="p-3 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    <Plus size={20} />
                </button>
            </div>

            {/* Active Ingredients Tags */}
            <div className="flex flex-wrap gap-2 min-h-[40px]">
                {ingredients.length === 0 && (
                    <p className="text-gray-400 text-sm italic w-full text-center">
                        {t("addIngredientHelp")}
                    </p>
                )}
                {ingredients.map((ing) => (
                    <span
                        key={ing}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500 text-white font-medium text-sm animate-in fade-in zoom-in duration-200"
                    >
                        {ing}
                        <button
                            onClick={() => removeIngredient(ing)}
                            className="hover:text-red-200 transition"
                        >
                            <X size={14} />
                        </button>
                    </span>
                ))}
            </div>

            {/* Search Button */}
            <div className="flex justify-center pt-4">
                <button
                    onClick={handleSearch}
                    disabled={ingredients.length === 0 || isLoading}
                    className={`
            group relative px-8 py-4 rounded-full bg-gray-900 text-white font-bold text-lg shadow-xl
            hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
            flex items-center gap-3
          `}
                >
                    {isLoading ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <Search size={20} className="group-hover:rotate-12 transition-transform" />
                            {t("findRecipesButton")}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
