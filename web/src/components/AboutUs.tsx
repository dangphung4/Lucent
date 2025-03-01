import { GithubIcon, LinkedinIcon, Mail, Globe, Users, Heart, Sparkles, Camera } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { motion } from "framer-motion";
import "./animations.css";

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
  interests: string[];
  social: {
    github?: string;
    linkedin?: string;
    email?: string;
    website?: string;
  };
}

const teamMembers: TeamMember[] = [
  {
    name: "Dang Phung",
    role: "Creator & Developer",
    bio: "Hey! I'm Dang, and I created Lucent for my girlfriend to help her track her skincare journey. If I'm not working on this, you can find me exploring new tech and probably trying out my girlfriend's skincare recommendations!",
    image: "/dang-profile.jpg",
    interests: ["Tech Enthusiast", "Guy", "Cheesecake boy", "Skincare Newbie"],
    social: {
      github: "https://github.com/dangphung4",
      linkedin: "https://linkedin.com/in/dang-phung",
      email: "dangphung4@gmail.com",
      website: "https://dangtphung.com"
    },
  },
  {
    name: "Shams Abbas",
    role: "Developer & Friend",
    bio: "Hi there! I'm Shams, and I joined forces with Dang to make Lucent even better. I've been helping Dang with planning out and designing the product. I'm a huge skincare lover so I'm trying to make this the best it can be.",
    image: "/shams-profile.jpg",
    interests: ["Design Enthusiast", "Skincare lover", "Tea Lover", "Matcha head"],
    social: {
      github: "https://github.com/ShamsAbbas98",
      linkedin: "https://linkedin.com/in/shams-a-abbas",
      email: "shamsabbas96@gmail.com",
    },
  },
];

const features = [
  { icon: Camera, label: "Progress Tracking", description: "Take photos to track your skin's journey" },
  { icon: Heart, label: "Personal Touch", description: "Made with love for skincare enthusiasts" },
  { icon: Users, label: "Growing Community", description: "Join others on their skincare journey" },
  { icon: Sparkles, label: "Regular Updates", description: "Always improving based on your feedback" },
];

export function AboutUs() {
  return (
    <div className="flex flex-col antialiased">
      {/* Hero Section with Enhanced Gradient Background */}
      <section className="relative overflow-hidden min-h-[70vh] flex items-center justify-center pt-16 pb-20 md:pt-24 md:pb-32">
        {/* Dynamic background with animated gradients */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-primary/5"></div>
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-gradient-radial from-primary/20 to-transparent rounded-full blur-3xl opacity-70 animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-gradient-radial from-primary/20 to-transparent rounded-full blur-3xl opacity-70 animate-pulse-slower"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] md:w-[800px] h-[500px] md:h-[800px] bg-gradient-radial from-primary/5 to-transparent rounded-full blur-3xl opacity-50"></div>
        </div>
        
        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="particles-container">
            {[...Array(15)].map((_, i) => (
              <div 
                key={i} 
                className={`particle particle-${i % 3}`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 10}s`,
                  opacity: 0.15 + Math.random() * 0.25,
                  width: `${2 + Math.random() * 3}px`,
                  height: `${2 + Math.random() * 3}px`
                }}
              ></div>
            ))}
          </div>
        </div>
        
        {/* Light streaks */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="light-streak light-streak-1"></div>
          <div className="light-streak light-streak-2"></div>
          <div className="light-streak light-streak-3"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center space-y-8"
          >
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-sm font-medium text-primary backdrop-blur-sm animate-pulse-slow border border-primary/20 shadow-glow">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-ping"></span>
              Our Story
            </div>
            
            <div className="space-y-6 max-w-3xl">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl/none">
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/90 to-primary/70 animate-gradient">
                  The Story Behind
                </span>
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-primary/90 via-primary/80 to-primary/70 animate-gradient animation-delay-300">
                  Lucent
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto backdrop-blur-sm bg-background/30 p-3 rounded-lg border border-primary/10 shadow-sm">
                What started as a personal project for tracking skincare routines has grown into something we're excited to share with everyone who's passionate about their skin journey.
              </p>
            </div>
          </motion.div>
        </div>
        
        {/* Enhanced Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
            className="absolute bottom-0 w-full h-full opacity-90"
            preserveAspectRatio="none"
          >
            <path
              fill="hsl(var(--muted))"
              fillOpacity="0.3"
              d="M0,128L48,144C96,160,192,192,288,186.7C384,181,480,139,576,138.7C672,139,768,181,864,181.3C960,181,1056,139,1152,122.7C1248,107,1344,117,1392,122.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>
      </section>

      {/* Origin Story Section - Enhanced with animations and gradients */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-muted/30"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        {/* Animated light streaks */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="light-streak light-streak-1 light-mode-visible"></div>
          <div className="light-streak light-streak-2 light-mode-visible"></div>
        </div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="particles-container">
            {[...Array(8)].map((_, i) => (
              <div 
                key={i} 
                className={`particle particle-${i % 3} light-mode-visible`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 8}s`,
                  opacity: 0.1 + Math.random() * 0.2,
                  width: `${2 + Math.random() * 2}px`,
                  height: `${2 + Math.random() * 2}px`
                }}
              ></div>
            ))}
          </div>
        </div>
        
        <div className="container mx-auto px-4 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-4xl mx-auto text-center space-y-8"
          >
            <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm animate-glow border border-primary/20 shadow-glow">
              Our Story
            </div>
            <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">How It All Started</h2>
            <p className="text-lg text-muted-foreground leading-relaxed backdrop-blur-sm bg-background/50 p-4 rounded-lg border border-primary/10 shadow-sm">
              Lucent began as a simple idea: to help my girlfriend keep track of her skincare products and routines. As we developed it, we realized that many people face the same challenges in managing their skincare journey. What started as a personal project has evolved into a tool that we hope can help everyone achieve their best skin.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Team Section - Enhanced with animations and card effects */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background pointer-events-none"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        {/* Decorative elements */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute right-0 top-0 h-[300px] w-[300px] rounded-full bg-gradient-to-b from-primary/5 to-transparent blur-3xl"></div>
          <div className="absolute left-0 bottom-0 h-[300px] w-[300px] rounded-full bg-gradient-to-t from-primary/5 to-transparent blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center mb-12"
          >
            <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm mb-4 animate-glow border border-primary/20 shadow-glow">
              Meet The Team
            </div>
            <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">The People Behind Lucent</h2>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.2 }}
              >
                <Card className="overflow-hidden group relative bg-gradient-to-br from-background to-primary/5 border-primary/20 hover:shadow-xl transition-all duration-300">
                  <div className="absolute inset-0 bg-grid-pattern opacity-5 group-hover:opacity-10 transition-opacity"></div>
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/10 rounded-full filter blur-xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
                  
                  <CardContent className="p-6 space-y-6 relative">
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-primary/20 group-hover:border-primary/40 transition-colors shadow-glow">
                          <img
                            src={member.image}
                            alt={member.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                member.name
                              )}&background=random&size=112`;
                            }}
                          />
                        </div>
                        <div className="absolute -bottom-2 -right-4 w-8 h-8 bg-primary/20 rounded-xl flex items-center justify-center group-hover:bg-primary/30 transition-colors animate-pulse-slow">
                          <Heart className="w-4 h-4 text-primary" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">{member.name}</h3>
                        <p className="text-muted-foreground">{member.role}</p>
                      </div>
                    </div>

                    <p className="text-muted-foreground leading-relaxed backdrop-blur-sm bg-background/50 p-3 rounded-lg border border-primary/10 shadow-sm">{member.bio}</p>

                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {member.interests.map((interest) => (
                          <Badge key={interest} variant="secondary" className="bg-primary/10 hover:bg-primary/20 border border-primary/20 animate-shimmer" style={{ animationDelay: `${Math.random() * 5}s` }}>
                            {interest}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center space-x-4">
                        {member.social.github && (
                          <a
                            href={member.social.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors hover:scale-110 transform"
                          >
                            <GithubIcon className="w-5 h-5" />
                          </a>
                        )}
                        {member.social.linkedin && (
                          <a
                            href={member.social.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors hover:scale-110 transform"
                          >
                            <LinkedinIcon className="w-5 h-5" />
                          </a>
                        )}
                        {member.social.email && (
                          <a
                            href={`mailto:${member.social.email}`}
                            className="text-muted-foreground hover:text-primary transition-colors hover:scale-110 transform"
                          >
                            <Mail className="w-5 h-5" />
                          </a>
                        )}
                        {member.social.website && (
                          <a
                            href={member.social.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors hover:scale-110 transform"
                          >
                            <Globe className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Enhanced with animations and card effects */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-muted/30"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        {/* Animated light streaks */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="light-streak light-streak-1 light-mode-visible"></div>
          <div className="light-streak light-streak-2 light-mode-visible"></div>
        </div>
        
        <div className="container mx-auto px-4 relative">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="max-w-5xl mx-auto"
          >
            <div className="text-center mb-12">
              <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm mb-4 animate-glow border border-primary/20 shadow-glow">
                What Makes Lucent Special
              </div>
              <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">Built with Love & Care</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  className="text-center space-y-3"
                >
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-glow group hover:bg-primary/20 transition-all duration-300 animate-pulse-slow" style={{ animationDelay: `${index * 0.5}s` }}>
                    <feature.icon className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="space-y-2">
                    <div className="font-semibold text-lg">{feature.label}</div>
                    <div className="text-sm text-muted-foreground backdrop-blur-sm bg-background/50 p-2 rounded-lg border border-primary/10 shadow-sm">
                      {feature.description}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Join Us Section - Enhanced with CTA and animations */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-primary/5 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute inset-0 bg-grid-pattern opacity-10 mask-gradient-to-b"></div>
          <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        </div>
        
        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="particles-container">
            {[...Array(10)].map((_, i) => (
              <div 
                key={i} 
                className={`particle particle-${i % 3}`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 10}s`,
                  opacity: 0.1 + Math.random() * 0.2,
                  width: `${2 + Math.random() * 2}px`,
                  height: `${2 + Math.random() * 2}px`
                }}
              ></div>
            ))}
          </div>
        </div>
        
        <div className="container mx-auto px-4 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="max-w-4xl mx-auto text-center space-y-8"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Join Us on This Journey
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed backdrop-blur-sm bg-background/50 p-4 rounded-lg border border-primary/10 shadow-sm">
              We're excited to help you track your skincare journey and achieve your best skin. Whether you're just starting out or you're a skincare enthusiast, Lucent is here to make your routine better, one day at a time.
            </p>
            
            <div className="pt-6">
              <Button
                size="lg"
                className="px-8 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10">Get Started Free</span>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Add CSS for mask gradient */}
      <style>
        {`
         .mask-gradient-to-b {
           mask-image: linear-gradient(to bottom, white, transparent);
           -webkit-mask-image: linear-gradient(to bottom, white, transparent);
         }
         
         /* Enhanced light streaks for light mode */
         .light-mode-visible.light-streak {
           background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.7), transparent);
           height: 2px;
         }
        `}
      </style>
    </div>
  );
} 