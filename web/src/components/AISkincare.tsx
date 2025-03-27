import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { CircleDashed, Sparkles, Bot, Send } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getUserProducts, getUserRoutines, Product, Routine } from "@/lib/db";
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface UserData {
  products: Product[];
  routines: Routine[];
  skinConcerns: string[];
  skinType: string;
  routineDetails: {
    name: string;
    type: string;
    steps: {
      productName: string;
      productBrand: string;
      category: string;
      stepOrder: number;
    }[];
  }[];
}

// Example questions for first-time users
const EXAMPLE_QUESTIONS = [
  "Analyze my current skincare routine",
  "How should I layer my products for maximum effectiveness?",
  "Can you recommend a better order for my morning routine?",
  "What ingredients in my products help with acne?",
  "I have combination skin with both acne and dryness - how should I balance treatment?",
  "Which products might be causing irritation?"
];

/**
 * AISkincare component - Standalone AI chatbot page powered by Google Gemini for skincare advice
 */
export function AISkincare() {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi there! I\'m your skincare AI assistant. I can help answer questions about your skincare routine, product recommendations, and more. What would you like to know?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstPrompt, setIsFirstPrompt] = useState(true);
  const [userData, setUserData] = useState<UserData>({
    products: [],
    routines: [],
    skinConcerns: [],
    skinType: 'combination',
    routineDetails: []
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Load user data
  useEffect(() => {
    if (!currentUser?.uid) return;

    const fetchUserData = async () => {
      try {
        // Get user products
        const products = await getUserProducts(currentUser.uid);
        
        // Get user routines
        const routines = await getUserRoutines(currentUser.uid);
        
        // Use default skin concerns and type since we don't have those in the User type
        // In a real app, you might store this in a separate user profile document
        const skinConcerns = ['acne', 'dryness'];
        const skinType = 'combination';
        
        // Create detailed routine information
        const routineDetails = await Promise.all(routines.map(async (routine) => {
          const steps = routine.steps || [];
          const detailedSteps = await Promise.all(steps.map(async (step, index) => {
            // Find product details for this step
            const product = products.find(p => p.id === step.productId);
            return {
              productName: product?.name || 'Unknown Product',
              productBrand: product?.brand || 'Unknown Brand',
              category: product?.category || 'Unknown Category',
              stepOrder: index + 1
            };
          }));
          
          return {
            name: routine.name || 'Unnamed Routine',
            type: routine.type || 'daily',
            steps: detailedSteps
          };
        }));
        
        // Set user data
        setUserData({
          products,
          routines,
          skinConcerns,
          skinType,
          routineDetails
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [currentUser]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Set chat container height to viewport height on mobile
  useEffect(() => {
    const setContainerHeight = () => {
      if (chatContainerRef.current && window.innerWidth < 768) {
        const viewportHeight = window.innerHeight;
        const headerHeight = 60; // Approximate header height
        const inputHeight = 80; // Approximate input area height
        chatContainerRef.current.style.height = `${viewportHeight - headerHeight - inputHeight}px`;
      } else if (chatContainerRef.current) {
        chatContainerRef.current.style.height = '500px'; // Default height for desktop
      }
    };

    setContainerHeight();
    window.addEventListener('resize', setContainerHeight);
    return () => window.removeEventListener('resize', setContainerHeight);
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    try {
      setIsLoading(true);
      
      // Add user message
      const userMessage = { role: 'user' as const, content: input };
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      setIsFirstPrompt(false);

      // Initialize Gemini API
      const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Create detailed context from user data
      const userContext = `
        User Information:
        - Skin Type: ${userData.skinType}
        - Skin Concerns: ${userData.skinConcerns.join(', ')}
        
        Current Products (${userData.products.length}):
        ${userData.products.map(p => `- ${p.name} by ${p.brand} (${p.category}): ${p.status}`).join('\n')}
        
        Detailed Skincare Routines:
        ${userData.routineDetails.map(routine => {
          return `
          ## ${routine.name} (${routine.type})
          ${routine.steps.map(step => 
            `${step.stepOrder}. ${step.productName} by ${step.productBrand} (${step.category})`
          ).join('\n')}
          `;
        }).join('\n\n')}
      `;

      // Prepare chat history
      const chatHistory = messages.slice(1).map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }));

      // Add system prompt and user context at the beginning of the chat
      const systemPrompt = {
        role: "user" as const,
        parts: [{ 
          text: `You are a skincare AI assistant that helps users with their skincare routines, product recommendations, and skincare advice. 
          
          Here is detailed information about the current user:
          ${userContext}
          
          When giving advice:
          1. Be specific and personalized based on the user's skin type and concerns
          2. Refer to their current products and routines when relevant
          3. Focus on evidence-based skincare advice
          4. Always clarify when you're giving general advice vs. personalized recommendations
          5. Avoid making claims about treating medical conditions
          6. Format your responses using Markdown for clarity - use headings, lists, and emphasis
          7. When analyzing routines, comment on product order, potential interactions, and missing steps
          8. Keep your responses concise and mobile-friendly - use short paragraphs and bullet points
          
          Now respond to the user's messages in a friendly, helpful tone.`
        }]
      };

      // Add system response acknowledging the context
      const systemResponse = {
        role: "model" as const,
        parts: [{ text: "I understand the user's profile and will provide personalized skincare advice with proper formatting." }]
      };

      // Create chat history with system prompt
      const fullChatHistory = [systemPrompt, systemResponse, ...chatHistory];

      // Add the latest user message
      fullChatHistory.push({
        role: "user" as const,
        parts: [{ text: input }]
      });

      // Get response from Gemini
      const result = await model.generateContent({
        contents: fullChatHistory,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      });

      const response = result.response;
      const aiMessageContent = response.text();

      // Add AI response to messages
      setMessages(prev => [...prev, { role: 'assistant', content: aiMessageContent }]);
    } catch (error) {
      console.error("Error generating response:", error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm sorry, I encountered an error processing your request. Please try again later." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionClick = (question: string) => {
    setInput(question);
    // We need to delay the execution of handleSendMessage slightly
    // to ensure the input state is updated properly
    setTimeout(() => {
      handleSendMessage();
    }, 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-8">
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-7xl">
        {/* Hero Section - Enhanced for standalone page */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500/40 via-purple-400/30 to-background border border-purple-500/40 dark:border-purple-700/30 p-4 md:p-8 mb-6">
          <div className="absolute inset-0 bg-grid-pattern opacity-15"></div>
          <div className="relative flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
            <div className="flex-1 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/30 text-purple-700 dark:text-purple-400 text-sm font-medium mb-2 shadow-md backdrop-blur-sm border border-purple-500/40">
                <Bot className="h-4 w-4" />
                AI Skincare Assistant
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 text-purple-700 dark:text-purple-300">
                Your Personal Skincare AI
              </h1>
              <p className="text-muted-foreground max-w-xl backdrop-blur-sm bg-background/50 p-3 rounded-lg border border-purple-500/30 shadow-sm text-lg">
                Ask questions about your skincare routine, get personalized product recommendations, or learn about ingredients that work best for your skin concerns.
              </p>
            </div>
            <div className="hidden md:block">
              <div className="h-24 w-24 rounded-2xl bg-purple-500/40 flex items-center justify-center shadow-glow">
                <Sparkles className="h-12 w-12 text-purple-700 dark:text-purple-300" />
              </div>
            </div>
          </div>
        </div>

        <div className="md:space-y-6 flex flex-col">
          {/* Chat Interface */}
          <Card className="border shadow-md flex-1 flex flex-col overflow-hidden">
            <CardContent className="p-0 flex flex-col h-full">
              {/* Messages Container */}
              <div 
                ref={chatContainerRef}
                className="overflow-y-auto p-3 md:p-6 space-y-4 flex-1"
              >
                {messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`flex items-start gap-3 ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-purple-700 dark:text-purple-400" />
                      </div>
                    )}
                    <div 
                      className={`max-w-[85%] p-3 rounded-lg ${
                        message.role === 'assistant' 
                          ? 'bg-card border border-border shadow-sm prose prose-sm dark:prose-invert max-w-none' 
                          : 'bg-purple-500 text-white shadow'
                      }`}
                    >
                      {message.role === 'assistant' ? (
                        <>
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                          
                          {/* Example Questions for first-time users */}
                          {isFirstPrompt && index === 0 && (
                            <div className="mt-4 space-y-2">
                              <p className="font-medium">Try asking:</p>
                              <div className="flex flex-col gap-2">
                                {EXAMPLE_QUESTIONS.slice(0, 3).map((question, idx) => (
                                  <button
                                    key={idx}
                                    className="text-left px-3 py-2 bg-purple-100 dark:bg-purple-900/50 hover:bg-purple-200 dark:hover:bg-purple-800/50 rounded-lg text-sm transition-colors"
                                    onClick={() => handleQuestionClick(question)}
                                  >
                                    {question}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                    {message.role === 'user' && (
                      <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center">
                        <span className="text-white text-xs font-medium">You</span>
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-purple-700 dark:text-purple-400" />
                    </div>
                    <div className="max-w-[85%] p-3 rounded-lg bg-card border border-border shadow-sm flex items-center">
                      <CircleDashed className="h-4 w-4 mr-2 animate-spin text-purple-500" />
                      <span className="text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t p-3 md:p-4 mt-auto">
                <div className="flex gap-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about your skincare routine..."
                    className="min-h-[50px] md:min-h-[60px] resize-none"
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    size="icon" 
                    className="h-auto bg-purple-500 hover:bg-purple-600"
                    disabled={isLoading || !input.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Desktop Example Questions */}
          <Card className="border shadow-sm hidden md:block mt-6">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span>Example Questions</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {EXAMPLE_QUESTIONS.map((question, idx) => (
                  <Button 
                    key={idx} 
                    variant="outline" 
                    className="justify-start h-auto py-2 px-3 text-left whitespace-normal font-normal"
                    onClick={() => setInput(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 