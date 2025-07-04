/* 
 * src/pages/Home.tsx
 * Home page component for Kairos Frontend
 * Displays welcome message and counter functionality with Tailwind styling
 */
import { Dispatch, SetStateAction } from 'react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

interface HomeProps {
  count: number
  setCount: Dispatch<SetStateAction<number>>
}

function Home({ count, setCount }: HomeProps) {
  return (
    <div className="text-center space-y-8">
      {/* Hero Section */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
          Welcome to Kairos
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          A modern React application built with TypeScript, Tailwind CSS, and best practices.
        </p>
      </div>

      {/* Counter Card */}
      <div className="max-w-md mx-auto">
        <Card>
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              Interactive Counter
            </h2>
            <div className="space-y-4">
              <Button
                onClick={() => setCount(count => count + 1)}
                variant="primary"
                size="lg"
              >
                Count is {count}
              </Button>
              <p className="text-sm text-gray-600">
                Edit <code className="bg-gray-100 px-2 py-1 rounded text-sm">src/App.tsx</code> and save to test HMR
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <Card>
          <h3 className="text-lg font-semibold mb-2">TypeScript</h3>
          <p className="text-gray-600">
            Type-safe development with excellent IDE support and compile-time error checking.
          </p>
        </Card>
        
        <Card>
          <h3 className="text-lg font-semibold mb-2">Tailwind CSS</h3>
          <p className="text-gray-600">
            Utility-first CSS framework for rapid UI development with consistent design.
          </p>
        </Card>
        
        <Card>
          <h3 className="text-lg font-semibold mb-2">React Router</h3>
          <p className="text-gray-600">
            Declarative routing for React applications with nested routes support.
          </p>
        </Card>
      </div>

      {/* Documentation Links */}
      <div className="pt-8">
        <p className="text-gray-600 mb-4">
          Click on the logos to learn more:
        </p>
        <div className="flex justify-center space-x-8">
          <a
            href="https://vitejs.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Vite Documentation
          </a>
          <a
            href="https://react.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            React Documentation
          </a>
          <a
            href="https://tailwindcss.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Tailwind CSS
          </a>
        </div>
      </div>
    </div>
  )
}

export default Home