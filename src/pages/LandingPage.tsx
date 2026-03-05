import { Link } from 'react-router-dom';
import { CheckCircle, TrendingUp, Brain, Leaf, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Just Do It</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">About</a>
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
            <Link to="/login" className="text-gray-600 hover:text-gray-900 transition-colors">Login</Link>
            <Link 
              to="/signup" 
              className="px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Get Started
            </Link>
          </div>
          {/* Mobile menu button - you can expand this later */}
          <button className="md:hidden p-2 text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-8">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          Now with AI-powered suggestions
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Build Habits That<br />
          <span className="text-emerald-600">Save the Planet</span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          Track your eco-friendly habits, get personalized sustainability suggestions, 
          and watch your positive impact grow with beautiful analytics.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            to="/signup" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white text-lg rounded-lg hover:bg-gray-800 transition-all hover:scale-105 font-medium"
          >
            Start Your Journey
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-700 border border-gray-300 text-lg rounded-lg hover:bg-gray-50 transition-all font-medium"
          >
            Already have an account?
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Everything You Need to Succeed</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to help you build lasting sustainable habits.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <div className="group p-8 bg-gray-50 rounded-2xl border border-gray-200 hover:border-emerald-500 hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CheckCircle className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Habit Tracking</h3>
              <p className="text-gray-600 leading-relaxed">
                Track daily and weekly sustainability habits with intelligent reminders and automatic reset functionality.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="group p-8 bg-gray-50 rounded-2xl border border-gray-200 hover:border-purple-500 hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Brain className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI-Powered Suggestions</h3>
              <p className="text-gray-600 leading-relaxed">
                Get personalized eco-friendly habit recommendations tailored to your lifestyle and sustainability goals.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="group p-8 bg-gray-50 rounded-2xl border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Beautiful Analytics</h3>
              <p className="text-gray-600 leading-relaxed">
                Visualize your progress with interactive charts. Track streaks, completion rates, and your overall impact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="about" className="py-20 lg:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">Start building sustainable habits in three simple steps.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Create Your Habits</h3>
              <p className="text-gray-600">Add eco-friendly habits you want to build, set them as daily or weekly.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Track Daily</h3>
              <p className="text-gray-600">Check off habits as you complete them and build consistency streaks.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Watch Impact Grow</h3>
              <p className="text-gray-600">See your progress with charts and discover new habits with AI suggestions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gray-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to Make a Difference?</h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of users building sustainable habits and tracking their positive impact on the planet.
          </p>
          <Link 
            to="/signup" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 text-white text-lg rounded-lg hover:bg-emerald-600 transition-all hover:scale-105 font-medium"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
              <ul className="space-y-2 text-gray-600">
                <li><Link to="/login" className="hover:text-gray-900">Login</Link></li>
                <li><Link to="/signup" className="hover:text-gray-900">Sign Up</Link></li>
                <li><a href="#features" className="hover:text-gray-900">Features</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Help Center</a></li>
                <li><a href="#" className="hover:text-gray-900">Blog</a></li>
                <li><a href="#" className="hover:text-gray-900">Community</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-gray-900">About</a></li>
                <li><a href="#" className="hover:text-gray-900">Contact</a></li>
                <li><a href="#" className="hover:text-gray-900">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Privacy</a></li>
                <li><a href="#" className="hover:text-gray-900">Terms</a></li>
                <li><a href="#" className="hover:text-gray-900">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Just Do It</span>
            </div>
            <p className="text-gray-500 text-sm">© 2026 Just Do It. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}