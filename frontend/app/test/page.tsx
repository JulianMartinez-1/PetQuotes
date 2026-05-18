"use client";

import { useState } from "react";

export default function TestPage() {
  const [count, setCount] = useState(0);
  
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-4">Test Page - Simple Rendering</h1>
      <p className="text-lg mb-4">Count: {count}</p>
      <button 
        onClick={() => setCount(c => c + 1)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Increment
      </button>
    </main>
  );
}
