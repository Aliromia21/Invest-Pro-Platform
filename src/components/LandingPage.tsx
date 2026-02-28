import { useState } from 'react';
import { Star, TrendingUp, Shield, Users, ArrowRight, Menu, X, ChevronDown, Building2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface LandingPageProps {
  onNavigate: (page: 'landing' | 'login' | 'signup' | 'forgot-password') => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for contacting us! We will get back to you soon.');
    setContactForm({ name: '', email: '', message: '' });
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-white">InvestPro</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection('home')} className="text-blue-200 hover:text-white transition-colors">
                Home
              </button>
              <button onClick={() => scrollToSection('about')} className="text-blue-200 hover:text-white transition-colors">
                About Us
              </button>
              <button onClick={() => scrollToSection('projects')} className="text-blue-200 hover:text-white transition-colors">
                Projects
              </button>
              <button onClick={() => scrollToSection('customers')} className="text-blue-200 hover:text-white transition-colors">
                Our Customers
              </button>
              <button onClick={() => scrollToSection('reviews')} className="text-blue-200 hover:text-white transition-colors">
                Reviews
              </button>
              <button onClick={() => scrollToSection('contact')} className="text-blue-200 hover:text-white transition-colors">
                Contact Us
              </button>
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Button
                onClick={() => onNavigate('login')}
                variant="outline"
                className="bg-transparent border-white/20 text-white hover:bg-white/10"
              >
                Login
              </Button>
              <Button
                onClick={() => onNavigate('signup')}
                className="bg-gradient-to-r from-blue-500 to-purple-500"
              >
                Sign Up
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/10">
              <div className="flex flex-col gap-4">
                <button onClick={() => scrollToSection('home')} className="text-blue-200 hover:text-white transition-colors text-left">
                  Home
                </button>
                <button onClick={() => scrollToSection('about')} className="text-blue-200 hover:text-white transition-colors text-left">
                  About Us
                </button>
                <button onClick={() => scrollToSection('projects')} className="text-blue-200 hover:text-white transition-colors text-left">
                  Projects
                </button>
                <button onClick={() => scrollToSection('customers')} className="text-blue-200 hover:text-white transition-colors text-left">
                  Our Customers
                </button>
                <button onClick={() => scrollToSection('reviews')} className="text-blue-200 hover:text-white transition-colors text-left">
                  Reviews
                </button>
                <button onClick={() => scrollToSection('contact')} className="text-blue-200 hover:text-white transition-colors text-left">
                  Contact Us
                </button>
                <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
                  <Button onClick={() => onNavigate('login')} variant="outline" className="bg-transparent border-white/20 text-white">
                    Login
                  </Button>
                  <Button onClick={() => onNavigate('signup')} className="bg-gradient-to-r from-blue-500 to-purple-500">
                    Sign Up
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="container mx-auto px-4 py-20 md:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-white mb-6">
            Invest Smarter, Grow Faster
          </h1>
          <p className="text-blue-200 text-xl mb-8">
            Join thousands of investors earning daily returns with our proven investment packs. Start with as little as 100 USDT and watch your wealth grow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => onNavigate('signup')}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-lg px-8 py-6"
            >
              Get Started Now <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              onClick={() => scrollToSection('about')}
              variant="outline"
              className="bg-transparent border-white/20 text-white text-lg px-8 py-6 hover:bg-white/10"
            >
              Learn More
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <p className="text-white mb-1">$50M+</p>
              <p className="text-blue-200">Total Invested</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <p className="text-white mb-1">25,000+</p>
              <p className="text-blue-200">Active Investors</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <p className="text-white mb-1">$8M+</p>
              <p className="text-blue-200">Paid in Returns</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="bg-white/5 backdrop-blur-sm py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-white mb-4">About InvestPro</h2>
            <p className="text-blue-200 text-lg">
              We are a leading digital investment platform that empowers individuals to achieve financial freedom through smart, secure, and sustainable investment strategies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white mb-3">Secure & Reliable</h3>
              <p className="text-blue-200">
                Your investments are protected with industry-leading security measures and encryption technology.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white mb-3">Proven Returns</h3>
              <p className="text-blue-200">
                Our investment strategies have consistently delivered daily returns ranging from 1.5% to 3.0%.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white mb-3">Community Driven</h3>
              <p className="text-blue-200">
                Join a thriving community of investors and earn additional income through our referral program.
              </p>
            </div>
          </div>

          <div className="mt-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl p-8 md:p-12 border border-purple-300/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-white mb-4">Our Mission</h3>
                <p className="text-purple-100 mb-4">
                  To democratize wealth creation by providing accessible, transparent, and profitable investment opportunities for everyone, regardless of their financial background.
                </p>
                <p className="text-purple-100">
                  We believe that everyone deserves the opportunity to build wealth and achieve financial independence through smart investing.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white">✓</span>
                  </div>
                  <div>
                    <p className="text-white mb-1">Transparent Operations</p>
                    <p className="text-purple-200 text-sm">Full visibility into all transactions and returns</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white">✓</span>
                  </div>
                  <div>
                    <p className="text-white mb-1">24/7 Support</p>
                    <p className="text-purple-200 text-sm">Dedicated team ready to assist you anytime</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white">✓</span>
                  </div>
                  <div>
                    <p className="text-white mb-1">Fast Withdrawals</p>
                    <p className="text-purple-200 text-sm">Access your funds whenever you need them</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Investment Projects Section */}
      <section id="projects" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-white mb-4">Our Investment Projects</h2>
            <p className="text-blue-200 text-lg">
              Diversified portfolio of high-yield investment opportunities across multiple sectors
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Commercial Real Estate',
                location: 'Manhattan, New York',
                yield: '12.5% Annual',
                invested: '$8.5M',
                image: 'https://images.unsplash.com/photo-1703355685626-57abd3bfbd95?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjb21tZXJjaWFsJTIwYnVpbGRpbmd8ZW58MXx8fHwxNzYxNzE2NTEyfDA&ixlib=rb-4.1.0&q=80&w=1080',
                status: 'Active',
              },
              {
                title: 'Solar Energy Farm',
                location: 'California, USA',
                yield: '15.2% Annual',
                invested: '$12.3M',
                image: 'https://images.unsplash.com/photo-1628206554160-63e8c921e398?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZW5ld2FibGUlMjBlbmVyZ3klMjBzb2xhcnxlbnwxfHx8fDE3NjE2NzgzNzd8MA&ixlib=rb-4.1.0&q=80&w=1080',
                status: 'Active',
              },
              {
                title: 'Tech Startup Portfolio',
                location: 'Silicon Valley',
                yield: '22.8% Annual',
                invested: '$6.7M',
                image: 'https://images.unsplash.com/photo-1665360786492-ace5845fe817?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwc3RhcnR1cCUyMG9mZmljZXxlbnwxfHx8fDE3NjE3NTAzNTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
                status: 'Active',
              },
              {
                title: 'Luxury Residential',
                location: 'Miami, Florida',
                yield: '10.5% Annual',
                invested: '$15.2M',
                image: 'https://images.unsplash.com/photo-1557813282-bcd50093e38f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWFsJTIwZXN0YXRlJTIwZGV2ZWxvcG1lbnR8ZW58MXx8fHwxNzYxNzM0MjA1fDA&ixlib=rb-4.1.0&q=80&w=1080',
                status: 'Active',
              },
              {
                title: 'Crypto Trading Fund',
                location: 'Global Markets',
                yield: '28.3% Annual',
                invested: '$9.8M',
                image: 'https://images.unsplash.com/photo-1633534415766-165181ffdbb7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcnlwdG9jdXJyZW5jeSUyMHRyYWRpbmd8ZW58MXx8fHwxNzYxNzc0NTY5fDA&ixlib=rb-4.1.0&q=80&w=1080',
                status: 'Active',
              },
              {
                title: 'Agricultural Investment',
                location: 'Midwest, USA',
                yield: '11.8% Annual',
                invested: '$5.4M',
                image: 'https://images.unsplash.com/photo-1725972281307-bc3da61c7575?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZ3JpY3VsdHVyZSUyMGZhcm0lMjBpbnZlc3RtZW50fGVufDF8fHx8MTc2MTc3NDU2OXww&ixlib=rb-4.1.0&q=80&w=1080',
                status: 'Active',
              },
            ].map((project, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border border-white/20 group hover:border-blue-400 transition-all">
                <div className="relative h-48 overflow-hidden">
                  <ImageWithFallback
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-green-500 text-white text-xs rounded-full">
                      {project.status}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-white mb-2">{project.title}</h3>
                  <p className="text-blue-300 text-sm mb-4 flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    {project.location}
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-blue-200 text-xs mb-1">Expected Yield</p>
                      <p className="text-green-400">{project.yield}</p>
                    </div>
                    <div>
                      <p className="text-blue-200 text-xs mb-1">Total Invested</p>
                      <p className="text-white">{project.invested}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => onNavigate('signup')}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500"
                    size="sm"
                  >
                    Invest Now
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl p-8 border border-blue-300/30">
            <h3 className="text-white mb-3">Portfolio Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <p className="text-blue-200 text-sm mb-1">Total Projects</p>
                <p className="text-white text-2xl">6 Active</p>
              </div>
              <div>
                <p className="text-blue-200 text-sm mb-1">Total Value</p>
                <p className="text-white text-2xl">$57.9M</p>
              </div>
              <div>
                <p className="text-blue-200 text-sm mb-1">Average Yield</p>
                <p className="text-green-400 text-2xl">16.8%</p>
              </div>
              <div>
                <p className="text-blue-200 text-sm mb-1">Investors</p>
                <p className="text-white text-2xl">8,542</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Customers Section */}
      <section id="customers" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-white mb-4">Our Global Community</h2>
            <p className="text-blue-200 text-lg">
              Trusted by investors from over 150 countries worldwide
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { country: 'United States', investors: '5,842' },
              { country: 'United Kingdom', investors: '3,291' },
              { country: 'Germany', investors: '2,764' },
              { country: 'Canada', investors: '2,135' },
              { country: 'Australia', investors: '1,897' },
              { country: 'Singapore', investors: '1,543' },
              { country: 'UAE', investors: '1,276' },
              { country: 'Netherlands', investors: '1,089' },
            ].map((item, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
                <p className="text-white mb-2">{item.investors}</p>
                <p className="text-blue-200 text-sm">{item.country}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-blue-200 text-lg mb-8">Join investors from every corner of the globe</p>
            <Button
              onClick={() => onNavigate('signup')}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-lg px-8 py-6"
            >
              Start Investing Today
            </Button>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="bg-white/5 backdrop-blur-sm py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-white mb-4">What Our Investors Say</h2>
            <p className="text-blue-200 text-lg">
              Real testimonials from real investors who have achieved their financial goals with InvestPro
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                country: 'United States',
                rating: 5,
                text: 'InvestPro has completely changed my financial situation. I started with the Starter Pack and have now upgraded to Premium. The daily returns are consistent and withdrawals are always processed quickly.',
                earnings: '$12,450',
              },
              {
                name: 'Michael Chen',
                country: 'Singapore',
                rating: 5,
                text: 'The referral program alone has made this worthwhile. I\'ve referred 15 friends and the passive income keeps growing. Customer support is excellent and always responsive.',
                earnings: '$8,920',
              },
              {
                name: 'Emma Williams',
                country: 'United Kingdom',
                rating: 5,
                text: 'I was skeptical at first, but InvestPro has proven to be legitimate and reliable. The platform is easy to use, and I love the transparency in all transactions. Highly recommended!',
                earnings: '$15,780',
              },
              {
                name: 'David Martinez',
                country: 'Spain',
                rating: 5,
                text: 'Best investment platform I\'ve used. The Elite Pack has been incredible for me. Daily returns are exactly as promised and the VIP support team is always helpful.',
                earnings: '$34,200',
              },
              {
                name: 'Lisa Anderson',
                country: 'Canada',
                rating: 5,
                text: 'I started with just $500 and have grown my portfolio to over $5,000 in just a few months. The compound growth is amazing. Thank you InvestPro!',
                earnings: '$6,340',
              },
              {
                name: 'Ahmed Hassan',
                country: 'UAE',
                rating: 5,
                text: 'Professional platform with consistent returns. I\'ve been investing for 6 months now and have never had any issues. Withdrawals are fast and the interface is user-friendly.',
                earnings: '$9,650',
              },
            ].map((review, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-blue-100 mb-4 italic">"{review.text}"</p>
                <div className="border-t border-white/20 pt-4">
                  <p className="text-white">{review.name}</p>
                  <p className="text-blue-300 text-sm">{review.country}</p>
                  <p className="text-green-400 text-sm mt-2">Earned: {review.earnings}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-xl p-8 border border-yellow-300/30">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
              <span className="text-white text-3xl">4.9/5.0</span>
            </div>
            <p className="text-yellow-100">Average rating from 12,500+ reviews</p>
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-white mb-4">Get In Touch</h2>
              <p className="text-blue-200 text-lg">
                Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Contact Form */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
                <form onSubmit={handleSubmitContact} className="space-y-6">
                  <div>
                    <label className="text-blue-200 text-sm mb-2 block">Full Name</label>
                    <Input
                      type="text"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-blue-200 text-sm mb-2 block">Email Address</label>
                    <Input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-blue-200 text-sm mb-2 block">Message</label>
                    <Textarea
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="bg-white/10 border-white/20 text-white min-h-[120px]"
                      placeholder="How can we help you?"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-500">
                    Send Message
                  </Button>
                </form>
              </div>

              {/* Contact Info */}
              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h3 className="text-white mb-4">Contact Information</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-blue-200 text-sm mb-1">Email</p>
                      <p className="text-white">support@investpro.com</p>
                    </div>
                    <div>
                      <p className="text-blue-200 text-sm mb-1">Phone</p>
                      <p className="text-white">+1 (555) 123-4567</p>
                    </div>
                    <div>
                      <p className="text-blue-200 text-sm mb-1">Address</p>
                      <p className="text-white">123 Finance Street, New York, NY 10001</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-xl p-6 border border-green-300/30">
                  <h3 className="text-white mb-2">24/7 Support Available</h3>
                  <p className="text-green-100 text-sm">
                    Our dedicated support team is available round the clock to assist you with any questions or concerns.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h3 className="text-white mb-3">Follow Us</h3>
                  <div className="flex gap-4">
                    <button className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center transition-colors">
                      <span className="text-white text-sm">f</span>
                    </button>
                    <button className="w-10 h-10 rounded-full bg-sky-500 hover:bg-sky-600 flex items-center justify-center transition-colors">
                      <span className="text-white text-sm">t</span>
                    </button>
                    <button className="w-10 h-10 rounded-full bg-pink-500 hover:bg-pink-600 flex items-center justify-center transition-colors">
                      <span className="text-white text-sm">in</span>
                    </button>
                    <button className="w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors">
                      <span className="text-white text-sm">yt</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900/95 border-t border-white/10 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-white">InvestPro</span>
            </div>
            <p className="text-blue-200 mb-6">Your Gateway to Smart Investing</p>
            <p className="text-blue-300 text-sm">
              © 2025 InvestPro. All rights reserved. | Terms of Service | Privacy Policy
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
