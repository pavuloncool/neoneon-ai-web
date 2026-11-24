'use client'

// lib/gsap-flip.ts
// Flip — zamiana wariantów w demo redakcji i zwinięcie formularza kontaktowego po wysłaniu.

import { gsap } from '@/lib/gsap'
import { Flip } from 'gsap/Flip'

gsap.registerPlugin(Flip)

export { Flip }
