"use client"

export default function MinimalPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Minimal Test Page</h1>
      <p>This page has no dependencies.</p>
      <button 
        onClick={() => alert("Button clicked!")}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Click me
      </button>
    </div>
  )
}