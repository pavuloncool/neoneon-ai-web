'use client'

// lib/gsap-svg.ts
// Pluginy SVG (DrawSVG — skreślenia, podkreślenia, linia „pióra”; MotionPath — znacznik na ścieżce).
// Osobny moduł jak gsap-text / gsap-scroll: płacą za niego tylko sekcje, które go importują.

import { gsap } from '@/lib/gsap'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'

gsap.registerPlugin(DrawSVGPlugin, MotionPathPlugin)

export { DrawSVGPlugin, MotionPathPlugin }
