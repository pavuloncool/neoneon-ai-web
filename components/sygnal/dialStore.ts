'use client'

// components/sygnal/dialStore.ts
// Podmiana pozycji jednego koła przez stronę: artykuł zgłasza swoje śródtytuły (ArticleDial),
// a koło w layoucie (SiteDial) pokazuje je zamiast menu z Sanity. Po wyjściu ze strony — z powrotem menu.

import { useSyncExternalStore } from 'react'
import type { DialItem } from './SignalDial'

export interface DialOverride {
  items: DialItem[]
  current: string | null
}

let state: DialOverride | null = null
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

export function setDialOverride(next: DialOverride | null) {
  state = next
  emit()
}

export function setDialCurrent(current: string | null) {
  if (!state || state.current === current) return
  state = { ...state, current }
  emit()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useDialOverride(): DialOverride | null {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => null,
  )
}
