import { Loader2, Heart } from 'lucide-react'

export function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="mx-auto mb-4 p-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full w-fit">
          <Heart className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Setting up your family...</h2>
        <p className="text-gray-600 mb-6">We're preparing your personalized family calendar</p>
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      </div>
    </div>
  )
}
