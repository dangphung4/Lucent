import { GithubIcon, LinkedinIcon, Mail, Globe, Users, Heart, Sparkles, Camera } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";

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
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-primary/5 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="space-y-4 max-w-3xl">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/90 to-primary/70">
                The Story Behind Lucent
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                What started as a personal project for tracking skincare routines has grown into something we're excited to share with everyone who's passionate about their skin journey.
              </p>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-[10%] top-[20%] h-64 w-64 rounded-full bg-primary/5 blur-3xl"></div>
          <div className="absolute right-[10%] bottom-[20%] h-64 w-64 rounded-full bg-primary/5 blur-3xl"></div>
        </div>
      </section>

      {/* Origin Story Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              Our Story
            </div>
            <h2 className="text-3xl font-bold">How It All Started</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Lucent began as a simple idea: to help my girlfriend keep track of her skincare products and routines. As we developed it, we realized that many people face the same challenges in managing their skincare journey. What started as a personal project has evolved into a tool that we hope can help everyone achieve their best skin.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {teamMembers.map((member) => (
              <Card key={member.name} className="overflow-hidden group">
                <div className="p-6 space-y-6">
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-primary/10 group-hover:border-primary/20 transition-colors">
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
                      <div className="absolute -bottom-2 -right-4 w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Heart className="w-4 h-4 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{member.name}</h3>
                      <p className="text-muted-foreground">{member.role}</p>
                    </div>
                  </div>

                  <p className="text-muted-foreground leading-relaxed">{member.bio}</p>

                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {member.interests.map((interest) => (
                        <Badge key={interest} variant="secondary" className="bg-primary/5 hover:bg-primary/10">
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
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          <GithubIcon className="w-5 h-5" />
                        </a>
                      )}
                      {member.social.linkedin && (
                        <a
                          href={member.social.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          <LinkedinIcon className="w-5 h-5" />
                        </a>
                      )}
                      {member.social.email && (
                        <a
                          href={`mailto:${member.social.email}`}
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Mail className="w-5 h-5" />
                        </a>
                      )}
                      {member.social.website && (
                        <a
                          href={member.social.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Globe className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
                What Makes Lucent Special
              </div>
              <h2 className="text-3xl font-bold">Built with Love & Care</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center space-y-2">
                  <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold">{feature.label}</div>
                    <div className="text-sm text-muted-foreground">{feature.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Join Us Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl font-bold">Join Us on This Journey</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We're excited to help you track your skincare journey and achieve your best skin. Whether you're just starting out or you're a skincare enthusiast, Lucent is here to make your routine better, one day at a time.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
} 