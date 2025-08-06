# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application for rural housing matching - a swipe-based mobile-first app that helps users find suitable rural properties in Korea. The app uses a personality questionnaire to create user preferences and matches them with rural properties using a weighted scoring algorithm.

## Commands

### Development
```bash
npm run dev        # Start development server (localhost:3000)
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run Next.js linting
```

### Testing
No test framework is currently configured in this project.

## Architecture

### Core App Flow
1. **Welcome Screen** → **Questionnaire** → **Main Dashboard** → **Matching (Swipe)** → **Results**
2. Additional screens: Property Detail, Contact, Community, Stories, Guide

### Key Components Structure

**Main Page (`src/app/page.tsx`)**
- Single-page application with state-based navigation
- Manages 8 different app states: `welcome | questionnaire | matching | results | propertyDetail | contact | main | community | stories | guide`
- Handles user preferences collection and property matching workflow

**Swipe Interface (`src/components/SwipeStack.tsx`, `SwipeCard.tsx`)**
- Card-based swiping interface using Framer Motion animations
- Stack of max 3 visible cards with depth effect
- Swipe left (reject) / right (like) gesture handling

**Matching Algorithm (`src/lib/matching.ts`)**
- Weighted scoring system across 6 categories:
  - Living Style (25%) - matches property type with user preference
  - Social Style (20%) - considers community population size
  - Work Style (15%) - evaluates location suitability for work type
  - Hobby Style (15%) - matches natural features and cultural activities
  - Pace (10%) - considers community demographics
  - Budget (15%) - fits within user's price range
- Returns properties sorted by match score (0-100%)

### Data Structure

**User Preferences** (collected via questionnaire):
- `livingStyle`: minimalist | cozy | traditional | modern
- `socialStyle`: community-oriented | independent | family-focused | creative  
- `workStyle`: remote-worker | farmer | entrepreneur | retiree
- `hobbyStyle`: nature-lover | culture-enthusiast | sports-fan | crafts-person
- `pace`: slow | balanced | active
- `budget`: low (<30만원) | medium (30-80만원) | high (>80만원)

**Property Data** includes location, pricing, property details, features, surroundings, and community information.

### Technology Stack
- **Framework**: Next.js 15 with App Router and React 19
- **Styling**: Tailwind CSS 4 with custom utility classes
- **Animation**: Framer Motion for card transitions and gestures  
- **Icons**: Lucide React icon library
- **TypeScript**: Strict mode enabled
- **State Management**: React useState (no external state management)

### File Organization
```
src/
├── app/           # Next.js app router (layout, page, globals.css)
├── components/    # React components (QuestionCard, SwipeCard, SwipeStack)  
├── data/          # Static data (questions, properties, stories)
├── lib/           # Utilities (matching algorithm)
└── types/         # TypeScript type definitions
```

## Development Notes

- **Mobile-first design**: All components optimized for mobile viewport
- **Korean content**: UI text and data are in Korean language
- **Path alias**: `@/*` maps to `./src/*`
- **No backend**: Uses static sample data, no API integration
- **Animation heavy**: Extensive use of Framer Motion for smooth UX
- **Single-page app**: Navigation handled via React state, not Next.js routing