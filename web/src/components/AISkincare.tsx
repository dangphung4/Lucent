/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { 
  CircleDashed, 
  Sparkles, 
  Bot, 
  Send, 
  Search, 
  Image as ImageIcon,
  Link as LinkIcon
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { getUserProducts, getUserRoutines, Product, Routine } from "@/lib/db";
import ReactMarkdown from 'react-markdown';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText, CoreMessage } from 'ai';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  files?: {
    data: Uint8Array;
    mimeType: string;
  }[];
  sources?: {
    uri: string;
    title?: string;
  }[];
  searchMetadata?: {
    webSearchQueries?: string[];
  };
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

interface Source {
  uri: string;
  title?: string;
}

// Example questions for first-time users
const EXAMPLE_QUESTIONS = [
  "Analyze my current skincare routine",
  "How should I layer my products for maximum effectiveness?",
  "What ingredients in my products help with acne?",
  "What are the latest skincare trends for 2025?",
  "Show me an image of a skincare routine checklist",
  "What's the best way to treat combination skin?"
];

// Example image prompts
const EXAMPLE_IMAGE_PROMPTS = [
  "Create an infographic about the correct order of skincare products",
  "Generate a relaxing spa scene with skincare products",
  "Design a skincare routine checklist illustration",
  "Show me a diagram of skin layers and how products penetrate",
  "Create a before/after illustration of hydrated vs dehydrated skin"
];

// Create a custom Google provider with API key
const customGoogle = createGoogleGenerativeAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY
});

// Add a fix for the AI SDK message format conversion
const convertToSDKMessage = (message: Message): CoreMessage => {
  return {
    role: message.role === 'user' ? 'user' : 'assistant',
    content: message.content
  } as CoreMessage;
};

// Helper function to extract URLs from response text
const extractURLsFromText = (text: string): Source[] => {
  // URLs often appear inside square or round brackets, or preceded by "source:" or "from:"
  const urlRegex = /(?:\[|\(|\bsource:|\bfrom:|\bhttps?:\/\/)[^\s[\]()<>"']+(?:(?:\([\w\d]+\)|[\w\d]+\.[!\w\d]+)+(?:[/\w\d#%&()=?:;,.@+~-]*[/\w\d#%&()=?:~-])?)/ig;
  const matches = text.match(urlRegex) || [];
  
  // Process matched URLs to clean them up
  const sources: Source[] = [];
  const urlSet = new Set<string>(); // To keep track of unique URLs
  
  for (const match of matches) {
    try {
      // Clean up the URL - remove brackets, punctuation at the end, etc.
      let cleanUrl = match.replace(/^\[|\]$|\($|\)$|^source:|^from:/i, '').trim();
      
      // Ensure URL has protocol
      if (!cleanUrl.startsWith('http')) {
        cleanUrl = 'https://' + cleanUrl;
      }
      
      // Remove trailing punctuation that might have been captured
      cleanUrl = cleanUrl.replace(/[.,;:)]$/, '');
      
      // Try to create a URL object to validate
      try {
        new URL(cleanUrl);
        
        // Only add if URL is unique
        if (!urlSet.has(cleanUrl)) {
          urlSet.add(cleanUrl);
          sources.push({
            uri: cleanUrl,
            title: new URL(cleanUrl).hostname
          });
        }
      } catch {
        // Not a valid URL, skip it
        console.log("Invalid URL extracted:", cleanUrl);
      }
    } catch (error) {
      console.log("Error processing URL from text:", match, error);
    }
  }
  
  return sources;
};

// Add necessary types for the provider metadata
interface GroundingMetadata {
  searchEntryPoint?: {
    renderedContent?: string;
  };
  webSearchQueries?: string[];
}

interface GoogleMetadata {
  citationMetadata?: {
    citations?: Array<{
      uri: string;
      title?: string;
    }>;
  };
  groundingMetadata?: GroundingMetadata;
  safetyRatings?: Array<{
    category?: string;
    probability?: string;
    probabilityScore?: number;
    severity?: string;
    severityScore?: number;
  }>;
}

// Extended result type to include experimental properties
interface ExtendedResult extends ReturnType<typeof generateText> {
  experimental_providerMetadata?: {
    google?: GoogleMetadata;
  };
}

/**
 * AISkincare component - Standalone AI chatbot page powered by Google Gemini for skincare advice
 */
export function AISkincare() {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi there! I\'m your skincare AI assistant. I can help answer questions about your skincare routine, product recommendations, or learn about ingredients. I can also search the web for the latest skincare information and create images to help visualize concepts.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstPrompt, setIsFirstPrompt] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'image'>('chat');
  const [userData, setUserData] = useState<UserData>({
    products: [],
    routines: [],
    skinConcerns: [],
    skinType: 'combination',
    routineDetails: []
  });
  const [fullScreenImage, setFullScreenImage] = useState<{url: string, alt: string} | null>(null);

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
      const userMessage: Message = { role: 'user', content: input };
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      setIsFirstPrompt(false);

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

      // Construct the system prompt
      const systemPrompt = activeTab === 'chat'
        ? `You are a skincare AI assistant that helps users with their skincare routines, product recommendations, and skincare advice. 
          
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
          9. Use web search to provide the most up-to-date information about skincare trends and research`
        : `You are an AI assistant that generates helpful skincare-related images based on user prompts. 
           Create visually appealing and informative images that help users understand skincare concepts.
           
           Guidelines for image generation:
           1. Create clean, professional designs with clear visual hierarchy
           2. Use color schemes that are pleasing and appropriate for skincare (soft blues, greens, pinks)
           3. Include helpful labels and annotations where appropriate
           4. Make the images educational and informative
           5. Avoid creating images that make medical claims
           
           Also provide a short text description of what you've created.`;

      // Convert previous messages to the format expected by AI SDK
      const convertedMessages = messages.slice(1).map(convertToSDKMessage);
      
      // Add the latest user message as a new message
      convertedMessages.push({
        role: 'user',
        content: input
      } as CoreMessage);

      // Create model configuration based on active tab
      let model;
      let providerOptions = {};
      
      if (activeTab === 'chat') {
        // Use web search for chat - ALWAYS search, not dynamic
        model = customGoogle('gemini-2.0-flash-exp', {
          useSearchGrounding: true,
          // Always trigger search, not just when the model thinks it's necessary
          dynamicRetrievalConfig: {
            mode: 'MODE_UNSPECIFIED' // This mode always triggers retrieval
          }
        });
      } else {
        // Use image generation for the image tab
        model = customGoogle('gemini-2.0-flash-exp');
        providerOptions = {
          google: { responseModalities: ['TEXT', 'IMAGE'] }
        };
      }

      // Generate response using AI SDK - fix to avoid passing both prompt and messages
      const result = await generateText({
          model,
          messages: [
              // Instead of system message, use a user message with instructions
              {
                  role: 'user',
                  content: systemPrompt
              },
              // Add all the converted user/assistant messages
              ...convertedMessages
          ],
          temperature: 0.7,
          maxTokens: 1000,
          providerOptions: providerOptions
      }) as unknown as ExtendedResult;

      // Extract the text response
      const aiMessageContent = (await result).text;
      
      // Create the assistant message
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: aiMessageContent 
      };
      
      // Enhanced metadata extraction to include all search grounding information
      interface GoogleMetadata {
        citationMetadata?: {
          citations?: Array<{
            uri: string;
            title?: string;
          }>;
        };
        groundingMetadata?: {
          webSearchQueries?: string[];
          searchEntryPoint?: {
            renderedContent?: string;
          };
          groundingSupports?: Array<{
            segment?: {
              text?: string;
              startIndex?: number;
              endIndex?: number;
            };
            groundingChunkIndices?: number[];
            confidenceScores?: number[];
          }>;
        };
        safetyRatings?: Array<{
          category?: string;
          probability?: string;
          probabilityScore?: number;
          severity?: string;
          severityScore?: number;
        }>;
      }
      
      // Log the full provider metadata for debugging
      console.log("Google provider metadata:", (await result).providerMetadata?.google);
      console.log("Result object:", result);
      if ((await result)?.providerMetadata?.google) {
        const googleMetadata = (await result).providerMetadata?.google as GoogleMetadata;
        // Extract citation metadata
        if (googleMetadata?.citationMetadata?.citations) {
          assistantMessage.sources = googleMetadata.citationMetadata.citations.map((citation) => ({
            uri: citation.uri,
            title: citation.title || new URL(citation.uri).hostname
          }));
        }
        
        // Extract search queries and other grounding metadata
        if (googleMetadata.groundingMetadata) {
          assistantMessage.searchMetadata = {
            webSearchQueries: googleMetadata.groundingMetadata.webSearchQueries || []
          };
        }
        
        // If sources are in the result object (AI SDK v4.2+), use them directly
        if ((await result).sources && (await result).sources.length > 0) {
          // Define interfaces for possible source formats
          interface UriSource {
            uri: string;
            title?: string;
          }
          
          interface CitationSource {
            citation: string;
          }
          
          assistantMessage.sources = (await result).sources.map(source => {
            // The AI SDK v4.2 uses a different format for sources
            // Check if it has the expected structure
            if ('uri' in source) {
              const uriSource = source as UriSource;
              return {
                uri: uriSource.uri,
                title: uriSource.title || new URL(uriSource.uri).hostname
              };
            } 
            // Handle AI SDK format where citation might be handled differently
            else if ('citation' in source) {
              const citationSource = source as CitationSource;
              const citationUrl = citationSource.citation || '';
              try {
                return {
                  uri: citationUrl,
                  title: new URL(citationUrl).hostname
                };
              } catch {
                // Ignore error and use fallback
                return {
                  uri: citationUrl,
                  title: 'Citation Source'
                };
              }
            }
            // Fallback with empty values
            return {
              uri: '',
              title: 'Unknown Source'
            };
          }).filter(source => source.uri !== ''); // Remove any empty sources
        }
      }

      // Extract and log direct sources from result
      if ((await result).sources) {
        console.log("Direct sources from result:", (await result).sources, typeof (await result).sources);
        
        try {
          // Directly assign sources from result object
          const sourcesFromResult = Array.isArray((await result).sources) ? (await result).sources.map(source => {
            console.log("Processing source:", source, typeof source);
            
            // Handle different source formats
            if (typeof source === 'object' && source !== null) {
              // Handle the Gemini sourceType format
              if ('sourceType' in source && source.sourceType === 'url' && 'url' in source) {
                return {
                  uri: source.url,
                  title: 'title' in source && typeof source.title === 'string' 
                    ? source.title 
                    : new URL(source.url).hostname
                };
              }
              // Handle standard uri format
              else if ('uri' in source && typeof source.uri === 'string') {
                const uri = source.uri;
                let title;
                try {
                  title = 'title' in source && typeof source.title === 'string' 
                    ? source.title 
                    : new URL(uri).hostname;
                } catch {
                  title = "Unknown Source";
                }
                return { uri, title };
              } 
              // Handle citation format
              else if ('citation' in source && typeof source.citation === 'string') {
                const citationUrl = source.citation;
                try {
                  return {
                    uri: citationUrl,
                    title: new URL(citationUrl).hostname
                  };
                } catch {
                  return {
                    uri: citationUrl,
                    title: 'Citation Source'
                  };
                }
              }
            }
            
            // Fallback for string sources
            if (typeof source === 'string') {
              try {
                return {
                  uri: source,
                  title: new URL(source).hostname
                };
              } catch {
                return {
                  uri: source,
                  title: 'Source'
                };
              }
            }
            
            // Unknown source format - return a structured error
            console.log("Unknown source format:", source);
            return {
              uri: "https://unknown-source.com",
              title: "Unknown Source Format"
            };
          }) : [];
          
          if (sourcesFromResult.length > 0) {
            console.log("Processed sources from result:", sourcesFromResult);
            assistantMessage.sources = sourcesFromResult as Source[];
          } else {
            console.log("No valid sources found in result.sources array");
          }
        } catch (error) {
          console.error("Error processing sources:", error);
        }
      } else {
        console.log("No sources available in the result object");
      }
      
      // Check for experimental provider metadata with search results
      try {
        // Access the result's metadata and use a type assertion for the experimental property
        const googleMetadataStandard = (await result).providerMetadata?.google as GoogleMetadata | undefined;
        const resultWithExperimental = result as any; // Use any for accessing non-standard properties
        const googleMetadataExperimental = resultWithExperimental?.experimental_providerMetadata?.google as GoogleMetadata | undefined;
        
        const renderedContent = 
          googleMetadataStandard?.groundingMetadata?.searchEntryPoint?.renderedContent ||
          googleMetadataExperimental?.groundingMetadata?.searchEntryPoint?.renderedContent;
        
        if (renderedContent) {
          console.log("Found search entry point content:", renderedContent.substring(0, 100) + "...");
          
          // Create a temporary DOM element to parse the HTML
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = renderedContent;
          
          // Extract links from the rendered content
          const links = tempDiv.querySelectorAll('a');
          const searchSources: Source[] = [];
          
          links.forEach(link => {
            const href = link.getAttribute('href');
            if (href) {
              try {
                // Check if it's a redirect URL from Google
                const url = new URL(href);
                // Get the actual destination URL if available
                let finalUrl = href;
                let title = link.textContent || url.hostname;
                
                // For Google redirect URLs, try to extract the final destination
                if (url.hostname.includes('google.com') && url.pathname.includes('redirect')) {
                  finalUrl = href; // Use the redirect URL as fallback
                  // The text content is often the search query
                  title = link.textContent || "Search Result";
                }
                
                searchSources.push({
                  uri: finalUrl,
                  title: title
                });
                
                console.log("Extracted link from search results:", finalUrl, title);
              } catch (e) {
                console.error("Failed to process search result link:", href, e);
              }
            }
          });
          
          if (searchSources.length > 0) {
            console.log("Extracted search sources:", searchSources);
            assistantMessage.sources = searchSources;
            
            // Also extract search queries
            const webSearchQueries = 
              googleMetadataStandard?.groundingMetadata?.webSearchQueries ||
              googleMetadataExperimental?.groundingMetadata?.webSearchQueries;
              
            if (webSearchQueries && Array.isArray(webSearchQueries)) {
              assistantMessage.searchMetadata = {
                webSearchQueries
              };
            }
          }
        }
      } catch (error) {
        console.error("Error processing search entry point:", error);
      }
      
      // Extract images if available
      if ((await result).files && (await result).files.length > 0) {
        console.log("Files in response:", (await result).files);
        
        // The AI SDK returns files that may have various properties
        // We need to safely handle them and convert to our Message format
        const processedFiles = await Promise.all(
          (await result).files.map(async (file) => {
            let data: Uint8Array;
            
            // Check if file has base64Data (Gemini format)
            if ('base64Data' in file && typeof file.base64Data === 'string') {
              // Convert base64 to Uint8Array
              try {
                const base64 = file.base64Data.replace(/^data:[^;]+;base64,/, '');
                const binaryString = atob(base64);
                const len = binaryString.length;
                data = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                  data[i] = binaryString.charCodeAt(i);
                }
              } catch (e) {
                console.error("Error converting base64 to Uint8Array:", e);
                data = new Uint8Array(0);
              }
            }
            // Fallback to blob if available (AI SDK format)
            else if ('blob' in file && file.blob instanceof Blob) {
              const buffer = await file.blob.arrayBuffer();
              data = new Uint8Array(buffer);
            } 
            // Last resort: empty array
            else {
              console.warn('File data not available in expected format', file);
              data = new Uint8Array(0);
            }
            
            return {
              data,
              mimeType: file.mimeType
            };
          })
        );
        
        assistantMessage.files = processedFiles;
      }

      // Fallback source extraction if no sources are provided by the API
      if (!assistantMessage.sources || assistantMessage.sources.length === 0) {
        console.log("No sources assigned to message, attempting to extract from text");
        
        // Try to extract URLs from the response text
        const extractedSources = extractURLsFromText(aiMessageContent);
        
        if (extractedSources.length > 0) {
          console.log("Extracted sources from text:", extractedSources);
          assistantMessage.sources = extractedSources;
        }
      }

      // Final check - log what's being added to the message
      console.log("Final assistant message with sources:", 
        assistantMessage.sources ? assistantMessage.sources.length : 0, 
        "sources being added to the messages array");

      // Add AI response to messages
      setMessages(prev => [...prev, assistantMessage]);
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

  const renderImageFromFile = (file: { data: Uint8Array; mimeType: string }) => {
    const blob = new Blob([file.data], { type: file.mimeType });
    const url = URL.createObjectURL(blob);
    
    const handleImageClick = () => {
      setFullScreenImage({url, alt: "Generated skincare image"});
    };
    
    const handleDownload = (e: React.MouseEvent) => {
      e.stopPropagation();
      const link = document.createElement('a');
      link.href = url;
      link.download = `skincare-image-${new Date().getTime()}.${file.mimeType.split('/')[1] || 'png'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    
    return (
      <div className="mt-4 relative group">
        <div 
          className="cursor-zoom-in overflow-hidden rounded-lg"
          onClick={handleImageClick}
        >
          <img 
            src={url} 
            alt="Generated image" 
            className="rounded-lg max-w-full shadow-md transition-transform group-hover:scale-[1.01]"
            onLoad={() => {
              // Don't revoke URL here as we need it for fullscreen and download
              // We'll revoke when component unmounts
            }} 
          />
        </div>
        
        <button
          onClick={handleDownload}
          className="absolute bottom-2 right-2 bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Download image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
        </button>
      </div>
    );
  };

  // Add fullscreen image modal component
  const renderFullScreenModal = () => {
    if (!fullScreenImage) return null;
    
    return (
      <div 
        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
        onClick={() => setFullScreenImage(null)}
      >
        <div className="relative max-w-6xl max-h-screen overflow-auto">
          <button 
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full text-white"
            onClick={() => setFullScreenImage(null)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          
          <img 
            src={fullScreenImage.url} 
            alt={fullScreenImage.alt} 
            className="max-w-full max-h-[calc(100vh-2rem)]" 
          />
          
          <a 
            href={fullScreenImage.url} 
            download={`skincare-image-${new Date().getTime()}.png`}
            className="absolute bottom-4 right-4 bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-full shadow-lg flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </a>
        </div>
      </div>
    );
  };

  const renderSources = (sources: Source[], searchMetadata?: { webSearchQueries?: string[] }) => {
    // Log what we're receiving for debugging
    console.log("Sources in renderSources:", sources);
    console.log("Search metadata in renderSources:", searchMetadata);
    
    // Only return null if there are literally NO sources
    if (!sources || (Array.isArray(sources) && sources.length === 0)) {
      // Add debug message in development
      if (import.meta.env.DEV) {
        return (
          <div className="mt-4 p-3 border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800/30 rounded-md">
            <p className="text-sm text-red-700 dark:text-red-400 font-medium">Debug: No sources received</p>
            <pre className="text-xs mt-2 overflow-auto max-h-40 p-2 bg-white dark:bg-black/40 rounded border border-red-200 dark:border-red-800/30">
              {JSON.stringify({ sources, searchMetadata }, null, 2)}
            </pre>
          </div>
        );
      }
      return null;
    }
    
    return (
      <div className="mt-4 space-y-3 border-t pt-3 border-purple-200/30 dark:border-purple-800/30">
        {/* Show search queries if available */}
        {searchMetadata?.webSearchQueries && searchMetadata.webSearchQueries.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-purple-700 dark:text-purple-400">
              <Search className="h-4 w-4" />
              <span>Searched for:</span>
            </div>
            <div className="space-y-1">
              {searchMetadata.webSearchQueries.map((query, idx) => (
                <div 
                  key={idx}
                  className="text-sm bg-purple-100/50 dark:bg-purple-900/30 px-2 py-1 rounded-md inline-block mr-2 mb-1"
                >
                  "{query}"
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Sources section - more prominent */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/40 px-2 py-1 rounded-md">
            <LinkIcon className="h-4 w-4" />
            <span>Web Sources:</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {sources.map((source, idx) => (
              <a 
                key={idx}
                href={source.uri}
                target="_blank"
                rel="noopener noreferrer" 
                className="flex items-center gap-2 p-3 rounded-md bg-purple-50/50 dark:bg-purple-900/10 hover:bg-purple-100/80 dark:hover:bg-purple-900/30 transition-colors group text-sm border border-purple-200/50 dark:border-purple-800/30"
              >
                <div className="flex-shrink-0 bg-purple-200 dark:bg-purple-800/50 h-6 w-6 rounded-md flex items-center justify-center">
                  <span className="text-xs font-medium text-purple-700 dark:text-purple-400">{idx + 1}</span>
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate font-medium text-purple-700 dark:text-purple-400 group-hover:underline">
                    {source.title || new URL(source.uri).hostname}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {new URL(source.uri).hostname}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Debug information in development mode */}
        {import.meta.env.DEV && (
          <details className="mt-4 border border-purple-200 dark:border-purple-800/30 rounded-md">
            <summary className="cursor-pointer p-2 bg-purple-50 dark:bg-purple-900/20 text-xs font-medium">
              Debug: Source Information
            </summary>
            <div className="p-2 text-xs overflow-auto max-h-40">
              <pre>{JSON.stringify({ sources, searchMetadata }, null, 2)}</pre>
            </div>
          </details>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-8">
      {/* Render the full screen modal if an image is selected */}
      {renderFullScreenModal()}
      
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
                Ask questions about your skincare routine, get personalized recommendations, or create visual guides for your skincare journey.
              </p>
            </div>
            <div className="hidden md:block">
              <div className="h-24 w-24 rounded-2xl bg-purple-500/40 flex items-center justify-center shadow-glow">
                <Sparkles className="h-12 w-12 text-purple-700 dark:text-purple-300" />
              </div>
            </div>
          </div>
        </div>

        {/* AI Mode Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'chat' | 'image')} className="mb-6">
          <TabsList className="grid grid-cols-2 w-full md:w-64">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              <span>Chat</span>
            </TabsTrigger>
            <TabsTrigger value="image" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              <span>Generate Images</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Web Search Info - Always visible and indicating it's always on */}
        {activeTab === 'chat' && (
          <div className="flex items-center px-4 py-2 rounded-lg bg-purple-100/50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/30 mb-4">
            <Search className="h-4 w-4 text-purple-700 dark:text-purple-400 mr-2" />
            <span className="text-sm text-muted-foreground">
              <span className="font-medium text-purple-700 dark:text-purple-400">Web search is ALWAYS enabled</span> - 
              Every response will include web search results with linked sources
            </span>
          </div>
        )}

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
                          
                          {/* Render generated images if available */}
                          {message.files?.map((file, fileIdx) => (
                            <div key={fileIdx}>
                              {renderImageFromFile(file)}
                            </div>
                          ))}
                          
                          {/* Render sources if available */}
                          {message.sources && renderSources(message.sources, message.searchMetadata)}
                          
                          {/* Example Questions for first-time users */}
                          {isFirstPrompt && index === 0 && (
                            <div className="mt-4 space-y-2">
                              <p className="font-medium">Try asking:</p>
                              <div className="flex flex-col gap-2">
                                {(activeTab === 'chat' ? EXAMPLE_QUESTIONS : EXAMPLE_IMAGE_PROMPTS).slice(0, 3).map((question, idx) => (
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
                      <span className="text-muted-foreground">
                        {activeTab === 'chat' ? 'Thinking...' : 'Creating image...'}
                      </span>
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
                    placeholder={activeTab === 'chat' 
                      ? "Ask about your skincare routine..." 
                      : "Describe the skincare image you want to create..."
                    }
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
                <span>{activeTab === 'chat' ? 'Example Questions' : 'Example Image Prompts'}</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {(activeTab === 'chat' ? EXAMPLE_QUESTIONS : EXAMPLE_IMAGE_PROMPTS).map((question, idx) => (
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