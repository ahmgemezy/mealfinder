import { NextResponse } from 'next/server';

export async function GET() {
    const content = `
# Dish Shuffle

> Discover your next favorite meal with Dish Shuffle. Browse thousands of recipes from around the world.

## Overview

Dish Shuffle is a culinary discovery platform that helps users find recipes based on ingredients, cuisine, or random chance.

## Key Pages

- [Home](https://dishshuffle.com/)
- [Recipes](https://dishshuffle.com/recipes)
- [Surprise Me](https://dishshuffle.com/surprise-me)
- [Smart Pantry](https://dishshuffle.com/pantry)
- [Blog](https://dishshuffle.com/blog)
- [FAQ](https://dishshuffle.com/faq)
- [About](https://dishshuffle.com/about)

## Content Structure

- **Recipes**: Detailed cooking instructions, ingredients, nutritional info, and video tutorials.
- **Blog**: Culinary tips, guides, and food culture articles.
- **FAQ**: Answers to common cooking questions.

## API

We do not currently offer a public API.
`.trim();

    return new NextResponse(content, {
        headers: {
            'Content-Type': 'text/plain',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
    });
}
