/* 
 * src/pages/About.tsx
 * About page component for Kairos Frontend
 * Displays information about the project and its technologies
 */
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

function About() {
  const technologies = [
    'React 18',
    'TypeScript',
    'Vite',
    'Tailwind CSS',
    'Headless UI',
    'React Router v6',
    'ESLint',
    'Prettier',
    'Storybook'
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">About Kairos</h1>
        <p className="text-xl text-gray-600">
          Learn more about this modern React frontend application
        </p>
      </div>

      {/* Project Description */}
      <Card>
        <h2 className="text-2xl font-semibold mb-4">Project Overview</h2>
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 leading-relaxed mb-4">
            Kairos is a modern React frontend application built with the latest web technologies 
            and best practices. It serves as a robust foundation for building scalable, 
            maintainable, and performant web applications.
          </p>
          <p className="text-gray-600 leading-relaxed">
            The project emphasizes developer experience with comprehensive tooling for code quality, 
            type safety, and component development. Every aspect of the setup is designed to promote 
            productivity and maintainability.
          </p>
        </div>
      </Card>

      {/* Technologies Used */}
      <Card>
        <h2 className="text-2xl font-semibold mb-4">Technologies Used</h2>
        <div className="space-y-4">
          <p className="text-gray-600">
            This project leverages modern web development tools and frameworks:
          </p>
          <div className="flex flex-wrap gap-2">
            {technologies.map((tech) => (
              <Badge key={tech} variant="primary">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      </Card>

      {/* Features */}
      <Card>
        <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">Development Experience</h3>
            <ul className="text-gray-600 space-y-1 text-sm">
              <li>• Hot Module Replacement (HMR)</li>
              <li>• TypeScript for type safety</li>
              <li>• ESLint + Prettier for code quality</li>
              <li>• Path aliases for clean imports</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">UI & Styling</h3>
            <ul className="text-gray-600 space-y-1 text-sm">
              <li>• Tailwind CSS utility classes</li>
              <li>• Headless UI components</li>
              <li>• Responsive design patterns</li>
              <li>• Dark mode support</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">Routing & Navigation</h3>
            <ul className="text-gray-600 space-y-1 text-sm">
              <li>• React Router v6</li>
              <li>• Nested routing support</li>
              <li>• Code splitting ready</li>
              <li>• SEO-friendly URLs</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">Component Development</h3>
            <ul className="text-gray-600 space-y-1 text-sm">
              <li>• Storybook for component docs</li>
              <li>• Reusable UI components</li>
              <li>• Accessibility best practices</li>
              <li>• Component testing ready</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Getting Started */}
      <Card>
        <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
        <div className="space-y-4">
          <p className="text-gray-600">
            To start developing with this project:
          </p>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <code className="text-sm text-gray-800 block">npm install</code>
            <code className="text-sm text-gray-800 block">npm run dev</code>
            <code className="text-sm text-gray-800 block">npm run storybook</code>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default About