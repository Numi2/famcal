"use client"

export default function FamilyCalendarHome() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center">Family Calendar</h1>
      <p className="text-center mt-4">Welcome to your family calendar!</p>
      <div className="text-center mt-8">
        <button 
          onClick={() => alert('Setup clicked!')}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Set Up Your Family
        </button>
      </div>
    </div>
  )
}
