"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Play,
  ShoppingCart,
  CreditCard,
  Users,
  Star,
  CheckCircle,
  ArrowRight,
  Eye,
  Package,
  Wallet,
  Shield,
  Zap,
  Gift,
  Target,
  DollarSign,
} from "lucide-react"
import { getReferralCodeFromUrl } from "@/lib/auth"

export default function LandingPage() {
  const [activeFeature, setActiveFeature] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const referralCode = getReferralCodeFromUrl()
    if (referralCode) {
      router.push("/auth")
    }
  }, [router])

  const features = [
    {
      icon: <Eye className="h-6 w-6" />,
      title: "View Ads & Earn",
      description: "Watch advertisements and earn money based on your package tier",
      rate: "KSH 90-120 per view",
    },
    {
      icon: <ShoppingCart className="h-6 w-6" />,
      title: "Shop Products",
      description: "Browse and purchase from our extensive product catalog",
      rate: "Thousands of products",
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: "Lipa Mdogo Mdogo",
      description: "Buy now, pay later with flexible installment plans",
      rate: "40% deposit only",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Referral System",
      description: "Invite friends and earn from their activities",
      rate: "Unlimited earnings",
    },
  ]

  const packages = [
    {
      name: "Starter",
      price: "KSH 1,000",
      rate: "KSH 90",
      duration: "30 days",
      features: ["Basic ad viewing", "Standard support", "Mobile access"],
      popular: false,
    },
    {
      name: "Professional",
      price: "KSH 2,500",
      rate: "KSH 100",
      duration: "30 days",
      features: ["Enhanced ad viewing", "Priority support", "Desktop & mobile", "Analytics dashboard"],
      popular: true,
    },
    {
      name: "Premium",
      price: "KSH 5,000",
      rate: "KSH 120",
      duration: "30 days",
      features: ["Premium ad viewing", "24/7 support", "All platforms", "Advanced analytics", "Exclusive offers"],
      popular: false,
    },
  ]

  const stats = [
    { label: "Active Users", value: "50K+", icon: <Users className="h-5 w-5" /> },
    { label: "Total Earnings", value: "KSH 10M+", icon: <DollarSign className="h-5 w-5" /> },
    { label: "Products Available", value: "5K+", icon: <Package className="h-5 w-5" /> },
    { label: "Success Rate", value: "98%", icon: <Target className="h-5 w-5" /> },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Hero Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-4 sm:mb-6 bg-orange-500/20 text-orange-300 border-orange-500/30">
            <Gift className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            New Platform Launch
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-balance mb-4 sm:mb-6">
            <span className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
              Earn Money
            </span>{" "}
            <span>While You Shop</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 text-balance mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed">
            Join thousands of users earning money by viewing advertisements, shopping with installment plans, and
            building their referral network. Start your earning journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12">
            <Link href="/auth">
              <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-base sm:text-lg font-medium transition-all disabled:pointer-events-none disabled:opacity-50 h-12 sm:h-10 px-6 sm:px-8 py-3 sm:py-6 text-white shadow-lg bg-orange-600 hover:bg-orange-700">
                <Play className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Start Earning Now
              </button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto glass-card border-white/20 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-6 bg-transparent hover:bg-white/10"
            >
              <Eye className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <Card key={index} className="glass-card border-white/20">
                <CardContent className="p-3 sm:p-6 text-center">
                  <div className="flex items-center justify-center mb-1 sm:mb-2 text-orange-400">{stat.icon}</div>
                  <div className="text-lg sm:text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-gray-300">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-balance mb-3 sm:mb-4">
              <span className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                Multiple Ways
              </span>{" "}
              <span>to Earn & Shop</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 text-balance max-w-2xl mx-auto">
              Our platform combines earning opportunities with convenient shopping features
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="space-y-4 sm:space-y-6">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className={`glass-card border-white/20 cursor-pointer transition-all duration-300 ${
                    activeFeature === index ? "border-orange-500/30 shadow-lg" : "hover:border-orange-500/20"
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div
                        className={`p-2 sm:p-3 rounded-lg transition-colors ${
                          activeFeature === index
                            ? "bg-orange-500/20 text-orange-300"
                            : "bg-white/10 text-gray-300"
                        }`}
                      >
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-semibold mb-2">{feature.title}</h3>
                        <p className="text-sm sm:text-base text-gray-300 mb-3">{feature.description}</p>
                        <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 text-xs sm:text-sm border-orange-500/30">
                          {feature.rate}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="glass-card border-white/20 p-6 sm:p-8 rounded-xl">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="p-2 sm:p-3 bg-orange-500/20 rounded-lg text-orange-300">
                  {features[activeFeature].icon}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold">{features[activeFeature].title}</h3>
              </div>
              <p className="text-base sm:text-lg text-gray-300 mb-4 sm:mb-6 leading-relaxed">
                {features[activeFeature].description}
              </p>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 text-orange-300">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-sm sm:text-base">High earning potential</span>
                </div>
                <div className="flex items-center gap-2 text-orange-300">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-sm sm:text-base">Flexible schedule</span>
                </div>
                <div className="flex items-center gap-2 text-orange-300">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-sm sm:text-base">Easy to get started</span>
                </div>
              </div>
              <Button className="w-full mt-6 sm:mt-8 bg-orange-600 text-white hover:bg-orange-700 text-base sm:text-lg py-5 sm:py-6">
                Learn More <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section id="packages" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-balance mb-3 sm:mb-4">
              <span className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                Choose Your
              </span>{" "}
              <span>Earning Package</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 text-balance max-w-2xl mx-auto">
              Select the perfect plan to maximize your earnings and access premium features
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {packages.map((pkg, index) => (
              <Card
                key={index}
                className={`glass-card border-white/20 relative overflow-hidden ${
                  pkg.popular ? "border-orange-500/30 shadow-lg" : ""
                }`}
              >
                {pkg.popular && (
                  <Badge className="absolute top-4 right-4 bg-orange-500/20 text-orange-300 border-orange-500/30">
                    <Star className="h-3 w-3 mr-1" /> Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center pb-0">
                  <CardTitle className="text-xl sm:text-2xl font-bold mb-2">{pkg.name}</CardTitle>
                  <div className="text-2xl sm:text-3xl font-bold mb-2">{pkg.price}</div>
                  <div className="text-sm text-gray-300">Activation Fee</div>
                </CardHeader>
                <CardContent className="p-6 sm:p-8">
                  <div className="text-center mb-6 sm:mb-8">
                    <div className="text-2xl sm:text-3xl font-bold text-orange-400">{pkg.rate}</div>
                    <div className="text-sm text-gray-300">Per Ad View</div>
                  </div>
                  <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                    {pkg.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-center gap-2 text-sm sm:text-base text-gray-300">
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full text-base sm:text-lg py-5 sm:py-6 ${
                      pkg.popular ? "bg-orange-600 hover:bg-orange-700" : "bg-blue-500 hover:bg-blue-600"
                    } text-white`}
                  >
                    Choose Plan
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-balance mb-3 sm:mb-4">
              <span>How It</span>{" "}
              <span className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                Works
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 text-balance max-w-2xl mx-auto">
              Get started in three simple steps and begin earning immediately
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                step: "1",
                title: "Sign Up & Choose Package",
                description: "Create your account and select an earning package that suits your goals",
                icon: <Package className="h-6 w-6 sm:h-8 sm:w-8" />,
              },
              {
                step: "2",
                title: "View Ads & Shop",
                description: "Watch advertisements to earn money and browse our product catalog",
                icon: <Eye className="h-6 w-6 sm:h-8 sm:w-8" />,
              },
              {
                step: "3",
                title: "Earn & Withdraw",
                description: "Track your earnings and withdraw your money anytime through our wallet system",
                icon: <Wallet className="h-6 w-6 sm:h-8 sm:w-8" />,
              },
            ].map((step, index) => (
              <Card key={index} className="glass-card border-white/20 text-center">
                <CardContent className="p-6 sm:p-8">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-orange-300">
                    {step.icon}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-orange-400 mb-2">STEP {step.step}</div>
                  <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">{step.title}</h3>
                  <p className="text-sm sm:text-base text-gray-300">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-4xl mx-auto">
          <Card className="glass-card border-white/20 bg-orange-500/5">
            <CardContent className="p-8 sm:p-12 text-center">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-balance mb-4 sm:mb-6">
                <span>Ready to Start</span>{" "}
                <span className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                  Earning?
                </span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-300 text-balance mb-6 sm:mb-8 max-w-2xl mx-auto">
                Join thousands of users who are already earning money through our platform. Sign up today and get
                started immediately.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Link href="/auth">
                  <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-base sm:text-lg font-medium transition-all disabled:pointer-events-none disabled:opacity-50 h-12 sm:h-10 px-6 sm:px-8 py-3 sm:py-6 text-white shadow-lg bg-orange-600 hover:bg-orange-700">
                    <Zap className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Get Started Now
                  </button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto glass-card border-white/20 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-6 bg-transparent hover:bg-white/10"
                >
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 border-t border-white/20 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Zap className="h-3 w-3 sm:h-5 sm:w-5 text-orange-300" />
                </div>
                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                  GrandVire
                </span>
              </div>
              <p className="text-sm sm:text-base text-gray-300">
                The ultimate platform for earning money through advertisements and smart shopping.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Platform</h3>
              <ul className="space-y-1 sm:space-y-2 text-gray-300 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Packages
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Store
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Referrals
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Support</h3>
              <ul className="space-y-1 sm:space-y-2 text-gray-300 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Company</h3>
              <ul className="space-y-1 sm:space-y-2 text-gray-300 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-300 text-sm">
            <p>&copy; 2024 GrandVire. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}