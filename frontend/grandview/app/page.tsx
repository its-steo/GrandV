"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Play,
  TrendingUp,
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-4 sm:mb-6 bg-gradient-to-r from-primary/10 to-secondary/10 text-primary border-primary/20">
            <Gift className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            New Platform Launch
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-balance mb-4 sm:mb-6">
            <span className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent [&:not(:has(.bg-gradient-to-r))]:text-orange-600 dark:[&:not(:has(.bg-gradient-to-r))]:text-orange-400">
              Earn Money
            </span>{" "}
            <span className="text-foreground">While You Shop</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground text-balance mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed">
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
              className="w-full sm:w-auto glass border-white/20 dark:border-gray-700/20 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-6 bg-transparent"
            >
              <Eye className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <Card key={index} className="glass-card border-white/20 dark:border-gray-700/20">
                <CardContent className="p-3 sm:p-6 text-center">
                  <div className="flex items-center justify-center mb-1 sm:mb-2 text-primary">{stat.icon}</div>
                  <div className="text-lg sm:text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-balance mb-3 sm:mb-4">
              <span className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent [&:not(:has(.bg-gradient-to-r))]:text-orange-600 dark:[&:not(:has(.bg-gradient-to-r))]:text-orange-400">
                Multiple Ways
              </span>{" "}
              <span className="text-foreground">to Earn & Shop</span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
              Our platform combines earning opportunities with convenient shopping features
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="space-y-4 sm:space-y-6">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className={`glass-card border-white/20 dark:border-gray-700/20 cursor-pointer transition-all duration-300 ${
                    activeFeature === index ? "border-primary/30 shadow-lg" : "hover:border-primary/20"
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div
                        className={`p-2 sm:p-3 rounded-lg transition-colors ${
                          activeFeature === index
                            ? "bg-gradient-to-r from-primary to-secondary text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
                        <p className="text-sm sm:text-base text-muted-foreground mb-3">{feature.description}</p>
                        <Badge variant="secondary" className="bg-primary/10 text-primary text-xs sm:text-sm">
                          {feature.rate}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="relative">
              <Card className="glass-card border-white/20 dark:border-gray-700/20 p-6 sm:p-8">
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-white">
                    {features[activeFeature].icon}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-foreground">
                    {features[activeFeature].title}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                    {features[activeFeature].description}
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full">
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                    <span className="font-semibold text-primary text-sm sm:text-base">
                      {features[activeFeature].rate}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section id="packages" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-balance mb-3 sm:mb-4">
              <span className="text-foreground">Choose Your</span>{" "}
              <span className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent [&:not(:has(.bg-gradient-to-r))]:text-orange-600 dark:[&:not(:has(.bg-gradient-to-r))]:text-orange-400">
                Earning Package
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
              Select a package that fits your earning goals and start making money today
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {packages.map((pkg, index) => (
              <Card
                key={index}
                className={`glass-card relative ${
                  pkg.popular ? "border-primary/30 shadow-xl sm:scale-105" : "border-white/20 dark:border-gray-700/20"
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-primary to-secondary text-white px-3 sm:px-4 py-1 text-xs sm:text-sm">
                      <Star className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-3 sm:pb-4 pt-6 sm:pt-8">
                  <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">{pkg.name}</CardTitle>
                  <div className="text-2xl sm:text-3xl font-bold text-primary">{pkg.price}</div>
                  <div className="text-sm sm:text-base text-muted-foreground">for {pkg.duration}</div>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full">
                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                      <span className="font-semibold text-primary text-sm sm:text-base">{pkg.rate} per view</span>
                    </div>
                  </div>
                  <ul className="space-y-2 sm:space-y-3">
                    {pkg.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2 sm:gap-3">
                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {pkg.popular ? (
                    <button className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 text-white shadow-lg bg-orange-600 hover:bg-orange-700">
                      Choose {pkg.name}
                      <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
                    </button>
                  ) : (
                    <Button
                      className="w-full glass border-white/20 dark:border-gray-700/20 bg-transparent text-sm"
                      variant="outline"
                    >
                      Choose {pkg.name}
                      <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-balance mb-3 sm:mb-4">
              <span className="text-foreground">How It</span>{" "}
              <span className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent [&:not(:has(.bg-gradient-to-r))]:text-orange-600 dark:[&:not(:has(.bg-gradient-to-r))]:text-orange-400">
                Works
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
              Get started in just a few simple steps and begin earning immediately
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
              <Card key={index} className="glass-card border-white/20 dark:border-gray-700/20 text-center">
                <CardContent className="p-6 sm:p-8">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-white">
                    {step.icon}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-primary mb-2">STEP {step.step}</div>
                  <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-foreground">{step.title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="glass-card border-white/20 dark:border-gray-700/20 bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardContent className="p-8 sm:p-12 text-center">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-balance mb-4 sm:mb-6">
                <span className="text-foreground">Ready to Start</span>{" "}
                <span className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent [&:not(:has(.bg-gradient-to-r))]:text-orange-600 dark:[&:not(:has(.bg-gradient-to-r))]:text-orange-400">
                  Earning?
                </span>
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground text-balance mb-6 sm:mb-8 max-w-2xl mx-auto">
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
                  className="w-full sm:w-auto glass border-white/20 dark:border-gray-700/20 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-6 bg-transparent"
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
      <footer className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 border-t border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                  <Zap className="h-3 w-3 sm:h-5 sm:w-5 text-white" />
                </div>
                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent [&:not(:has(.bg-gradient-to-r))]:text-orange-600 dark:[&:not(:has(.bg-gradient-to-r))]:text-orange-400">
                  GrandVire
                </span>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground">
                The ultimate platform for earning money through advertisements and smart shopping.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-foreground text-sm sm:text-base">Platform</h3>
              <ul className="space-y-1 sm:space-y-2 text-muted-foreground text-sm">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Packages
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Store
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Referrals
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-foreground text-sm sm:text-base">Support</h3>
              <ul className="space-y-1 sm:space-y-2 text-muted-foreground text-sm">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-foreground text-sm sm:text-base">Company</h3>
              <ul className="space-y-1 sm:space-y-2 text-muted-foreground text-sm">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-muted-foreground text-sm">
            <p>&copy; 2024 GrandVire. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
