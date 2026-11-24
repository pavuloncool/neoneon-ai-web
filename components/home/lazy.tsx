'use client'

// components/home/lazy.tsx
// Sekcje strony głównej poniżej pierwszego ekranu jako osobne pliki JS (next/dynamic z SSR — HTML bez zmian).
// Hero zostaje w głównym pakiecie (pierwszy ekran). Bez podziału cała strona była jednym plikiem ~200 KB,
// którego wykonanie blokowało wątek główny i opóźniało LCP (Lighthouse mobile, iteracja 14).

import dynamic from 'next/dynamic'

export const AiRole = dynamic(() => import('./AiRole').then((m) => m.AiRole))
export const Problem = dynamic(() => import('./Problem').then((m) => m.Problem))
export const Audience = dynamic(() => import('./Audience').then((m) => m.Audience))
export const Services = dynamic(() => import('./Services').then((m) => m.Services))
export const Process = dynamic(() => import('./Process').then((m) => m.Process))
export const Pricing = dynamic(() => import('./Pricing').then((m) => m.Pricing))
export const About = dynamic(() => import('./About').then((m) => m.About))
export const Faq = dynamic(() => import('./Faq').then((m) => m.Faq))
export const FromBlog = dynamic(() => import('./FromBlog').then((m) => m.FromBlog))
export const FinalCta = dynamic(() => import('./FinalCta').then((m) => m.FinalCta))
