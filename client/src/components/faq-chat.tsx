import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, User, Bot, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

// Predefined FAQ Data (Kazakh)
type CategoryId = "all" | "general" | "weather" | "cities";

const categories = [
  { id: "all", label: "Барлығы" },
  { id: "general", label: "Жалпы" },
  { id: "weather", label: "Ауа райы" },
  { id: "cities", label: "Қалалар" },
] as const;

const faqs = [
  {
    id: "add_city",
    categoryId: "cities",
    question: "Қаланы қалай қосамын?",
    answer: "Қаланы қосу үшін 'Іздеу' (Search) бетіне өтіп, қаланың атын жазыңыз. Нәтижелерден қажетті қаланы таңдасаңыз, ол сіздің тізіміңізге қосылады.",
  },
  {
    id: "delete_city",
    categoryId: "cities",
    question: "Сақталған қаланы қалай өшіремін?",
    answer: "Басты беттегі қалалар тізімінен қаланың жанындағы қоқыс жәшігін (Trash2) басыңыз. Содан кейін өшіруді растаңыз.",
  },
  {
    id: "sport_recommendations",
    categoryId: "general",
    question: "Спорт ұсыныстары қалай жұмыс істейді?",
    answer: "Спорт ұсыныстары ағымдағы ауа райы жағдайлары мен ауа сапасына негізделеді. Біз сізге қай спорт түрлері бойынша далада шұғылдануға болатынын және қайсысы тиімдірек екенін көрсетеміз.",
  },
  {
    id: "update_weather",
    categoryId: "weather",
    question: "Ауа райы қаншалықты жиі жаңарады?",
    answer: "Ауа райы деректері сіз бетті жаңартқан сайын немесе жаңа қалаға кірген кезде автоматты түрде жаңарады.",
  },
  {
    id: "uv_index",
    categoryId: "weather",
    question: "УК (Ультракүлгін) индексі деген не?",
    answer: "УК индексі күн сәулесінің радиация деңгейін көрсетеді. Индекс жоғары болса (әдетте 3-тен жоғары), күннен қорғайтын крем (SPF) жағуды ұсынамыз.",
  },
  {
    id: "weather_charts",
    categoryId: "weather",
    question: "Температура графигін қалай түсінемін?",
    answer: "Иә, қала парақшасына кірген соң төменгі жағында бір күндік және 7 күндік ауа райы графиктері бар. Ондағы көк сызықтар жауын-шашын мөлшерін, ал қызыл/сары сызықтар температураны білдіреді.",
  },
  {
    id: "clothing_advice",
    categoryId: "general",
    question: "Киім таңдауға ұсыныстар бар ма?",
    answer: "Әрине! Басты беттегі 'Ақылды кеңестер' бөлімі ағымдағы ауа райына қарай қандай киім үлгісі сәйкес келетінін көрсетеді.",
  }
];

type Message = {
  id: string;
  sender: "user" | "bot";
  text: string;
};

export function FaqChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryId>("all");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "Сәлеметсіз бе! Мен SkyCast көмекшісімін. Ауа райына және функционалға байланысты сұрағыңыз бар ма?",
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleQuestionSelect = (faq: typeof faqs[0]) => {
    // Add user question
    const newMessages = [...messages, { id: Date.now().toString(), sender: "user" as const, text: faq.question }];
    setMessages(newMessages);
    
    // Simulate thinking/typing
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: "bot" as const, text: faq.answer }]);
    }, 600);
  };

  const filteredFaqs = faqs.filter(faq => activeCategory === "all" || faq.categoryId === activeCategory);

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              size="icon"
              className="h-16 w-16 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              <MessageCircle className="h-7 w-7 text-primary-foreground" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-50 w-[calc(100vw-2rem)] md:w-[28rem] max-w-lg h-[650px] max-h-[85vh] flex flex-col shadow-2xl rounded-2xl overflow-hidden glass-panel border border-border/50 bg-background/80 backdrop-blur-xl"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-accent p-4 flex items-center justify-between text-primary-foreground">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                <span className="font-semibold font-display">Қолдау қызметі (FAQ)</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-primary-foreground hover:bg-white/20 hover:text-white"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 dark:bg-slate-950/50" ref={scrollRef}>
              {messages.map((msg) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id}
                  className={`flex gap-2 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {msg.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted text-foreground rounded-tl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2"
                >
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5 w-16">
                    <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </motion.div>
              )}
            </div>

            {/* FAQ Categories Select */}
            <div className="px-4 py-2 bg-muted/20 border-t border-border/50">
               <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {categories.map((cat) => (
                    <Button
                      key={cat.id}
                      variant="outline"
                      size="sm"
                      className={`shrink-0 rounded-full h-8 text-xs font-medium transition-colors ${
                        activeCategory === cat.id 
                          ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground border-primary"
                          : "bg-background/50 hover:bg-muted text-muted-foreground"
                      }`}
                      onClick={() => setActiveCategory(cat.id as CategoryId)}
                    >
                      {cat.label}
                    </Button>
                  ))}
               </div>
            </div>

            {/* FAQ Options */}
            <div className="px-4 pb-4 pt-2 bg-muted/20">
              <ScrollArea className="h-32 pr-4 -mr-4">
                <AnimatePresence mode="popLayout">
                  <div className="flex flex-col gap-2">
                    {filteredFaqs.map((faq) => (
                      <motion.div
                        key={faq.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="justify-start h-auto py-2 px-3 text-left w-full text-xs font-normal whitespace-normal hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-colors"
                          onClick={() => handleQuestionSelect(faq)}
                          disabled={isTyping}
                        >
                          {faq.question}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              </ScrollArea>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
