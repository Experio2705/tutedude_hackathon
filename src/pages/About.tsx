import { Navbar } from "@/components/Navbar";
import { BackButton } from "@/components/BackButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Users, Shield, Target } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-6 py-8">
        <BackButton to="/" />
        
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-brand-gradient bg-clip-text text-transparent">
              About SourceMart
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Connecting vendors with reliable suppliers to streamline raw material sourcing 
              for restaurants, cafes, and food businesses across India.
            </p>
          </div>

          {/* Mission & Vision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-primary" />
                  <span>Our Mission</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  To simplify raw material sourcing by creating a transparent, efficient 
                  marketplace that connects food businesses with trusted suppliers, 
                  ensuring quality ingredients at competitive prices.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Leaf className="w-5 h-5 text-primary" />
                  <span>Our Vision</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  To become India's leading platform for food supply chain management, 
                  promoting sustainable sourcing practices and supporting local farmers 
                  and suppliers across the country.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Key Features */}
          <Card>
            <CardHeader>
              <CardTitle>Why Choose SourceMart?</CardTitle>
              <CardDescription>
                We provide comprehensive solutions for your sourcing needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Verified Suppliers</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    All suppliers are verified for quality, reliability, and business credentials.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Quality Assurance</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Rigorous quality checks and rating systems ensure you get the best products.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Competitive Pricing</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Direct supplier connections eliminate middlemen, offering you better prices.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-primary">500+</div>
                <p className="text-sm text-muted-foreground">Verified Suppliers</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-primary">1000+</div>
                <p className="text-sm text-muted-foreground">Active Vendors</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-primary">50+</div>
                <p className="text-sm text-muted-foreground">Cities Covered</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-primary">99%</div>
                <p className="text-sm text-muted-foreground">Customer Satisfaction</p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Get in Touch</CardTitle>
              <CardDescription>
                Have questions? We're here to help you succeed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Business Hours</h4>
                  <p className="text-sm text-muted-foreground">
                    Monday - Friday: 9:00 AM - 6:00 PM<br />
                    Saturday: 9:00 AM - 2:00 PM<br />
                    Sunday: Closed
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Support</h4>
                  <p className="text-sm text-muted-foreground">
                    Email: support@sourcemart.com<br />
                    Phone: +91 1234567890<br />
                    WhatsApp: +91 9876543210
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}