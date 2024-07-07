'use client'
import { useEffect } from "react"

export default function ScrollTo({ scroll }) {
  useEffect(() => window.scrollTo(0, scroll), [])
  return (
    <></>
  )
}
