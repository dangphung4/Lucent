import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { CircleDashed, Sparkles, Bot, Send } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getUserProducts, getUserRoutines, getRoutineCompletions, Product, Routine } from "@/lib/db";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface UserData {
  products: Product[];
  routines: Routine[];
  skinConcerns: string[];
  skinType: string;
}

/**
 * DashboardAI component - AI chatbot powered by Google Gemini for skincare advice
 */
const DashboardAI = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi there! I\'m your skincare AI assistant. I can help answer questions about your skincare routine, product recommendations, and more. What would you like to know?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    products: [],
    routines: [],
    skinConcerns: [],
    skinType: 'combination',
  });

  // this is markdown, will nee
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
        
        // Set user data
        setUserData({
          products,
          routines,
          skinConcerns,
          skinType,
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

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    try {
      setIsLoading(true);
      
      // Add user message
      const userMessage = { role: 'user' as const, content: input };
      setMessages(prev => [...prev, userMessage]);
      setInput('');

      // Initialize Gemini API
      const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Create context from user data
      const userContext = `
        User Information:
        - Skin Type: ${userData.skinType}
        - Skin Concerns: ${userData.skinConcerns.join(', ')}
        
        Current Products (${userData.products.length}):
        ${userData.products.map(p => `- ${p.name} by ${p.brand} (${p.category}): ${p.status}`).join('\n')}
        
        Current Routines:
        ${userData.routines.map(r => {
          // Ensure we have a name and handle potential missing properties
          const routineName = r.name || 'Unnamed Routine';
          // Since time may not exist on the Routine type, we'll use a default
          const routineType = r.type || 'daily';
          const steps = r.steps || [];
          return `- ${routineName} (${routineType}): ${steps.length} steps`;
        }).join('\n')}
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
          
          Here is information about the current user:
          ${userContext}
          
          When giving advice:
          1. Be specific and personalized based on the user's skin type and concerns
          2. Refer to their current products and routines when relevant
          3. Focus on evidence-based skincare advice
          4. Always clarify when you're giving general advice vs. personalized recommendations
          5. Avoid making claims about treating medical conditions
          
          Now respond to the user's messages in a friendly, helpful tone.`
        }]
      };

      // Add system response acknowledging the context
      const systemResponse = {
        role: "model" as const,
        parts: [{ text: "I understand the user's profile and will provide personalized skincare advice." }]
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
          maxOutputTokens: 800,
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500/40 via-purple-400/30 to-background border border-purple-500/40 dark:border-purple-700/30 p-6">
        <div className="absolute inset-0 bg-grid-pattern opacity-15"></div>
        <div className="relative flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/30 text-purple-700 dark:text-purple-400 text-sm font-medium mb-2 shadow-md backdrop-blur-sm border border-purple-500/40">
              <Bot className="h-4 w-4" />
              AI Skincare Assistant
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-2 text-purple-700 dark:text-purple-300">
              Your Personal Skincare AI
            </h2>
            <p className="text-muted-foreground max-w-xl backdrop-blur-sm bg-background/50 p-2 rounded-lg border border-purple-500/30 shadow-sm">
              Ask questions about your skincare routine, get personalized product recommendations, or learn about skincare ingredients.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="h-16 w-16 rounded-2xl bg-purple-500/40 flex items-center justify-center shadow-glow">
              <Sparkles className="h-8 w-8 text-purple-700 dark:text-purple-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <Card className="border shadow-sm">
        <CardContent className="p-0">
          {/* Messages Container */}
          <div className="h-[500px] overflow-y-auto p-4 space-y-4">
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
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'assistant' 
                      ? 'bg-card border border-border shadow-sm' 
                      : 'bg-purple-500 text-white shadow'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
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
                <div className="max-w-[80%] p-3 rounded-lg bg-card border border-border shadow-sm flex items-center">
                  <CircleDashed className="h-4 w-4 mr-2 animate-spin text-purple-500" />
                  <span className="text-muted-foreground">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your skincare routine..."
                className="min-h-[60px] resize-none"
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

      {/* Tips Section */}
      <Card className="border shadow-sm">
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            <span>Example Questions</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              "What's a good morning routine for my skin type?",
              "Can you recommend products for my skin concerns?",
              "How should I layer my skincare products?",
              "What ingredients should I look for to help with acne?",
              "Can you analyze my current routine and suggest improvements?",
              "How often should I exfoliate with my skin type?"
            ].map((question, idx) => (
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
  );
};

export default DashboardAI; 