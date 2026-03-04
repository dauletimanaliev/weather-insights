import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, User, Bot, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

// Predefined FAQ Data (Kazakh)
const faqs = [
  {
    id: "add_city",
    question: "Қаланы қалай қосамын?",
    answer: "Қаланы қосу үшін 'Іздеу' (Search) бетіне өтіп, қаланың атын жазыңыз. Нәтижелерден қажетті қаланы таңдасаңыз, ол сіздің тізіміңізге қосылады.",
  },
  {
    id: "delete_city",
    question: "Сақталған қаланы қалай өшіремін?",
    answer: "Басты беттегі қалалар тізімінен қаланың жанындағы қоқыс жәшігін (Trash2) басыңыз. Содан кейін өшіруді растаңыз.",
  },
  {
    id: "sport_recommendations",
    question: "Спорт ұсыныстары қалай жұмыс істейді?",
    answer: "Спорт ұсыныстары ағымдағы ауа райы жағдайлары мен ауа сапасына негізделеді. Біз сізге қай спорт түрлері бойынша далада шұғылдануға болатынын және қайсысы тиімдірек екенін көрсетеміз.",
  },
  {
    id: "update_weather",
    question: "Ауа райы қаншалықты жиі жаңарады?",
    answer: "Ауа райы деректері сіз бетті жаңартқан сайын немесе жаңа қалаға кірген кезде автоматты түрде жаңарады.",
  },
  {
    id: "uv_index",
    question: "УК (Ультракүлгін) индексі деген не?",
    answer: "УК индексі күн сәулесінің радиация деңгейін көрсетеді. Индекс жоғары болса (әдетте 3-тен жоғары), күннен қорғайтын крем (SPF) жағуды ұсынамыз.",
  },
  {
    id: "weather_charts",
    question: "Температура графигін қалай түсінемін?",
    answer: "Иә, қала парақшасына кірген соң төменгі жағында бір күндік және 7 күндік ауа райы графиктері бар. Ондағы көк сызықтар жауын-шашын мөлшерін, ал қызыл/сары сызықтар температураны білдіреді.",
  },
  {
    id: "clothing_advice",
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

            {/* FAQ Options */}
            <div className="p-4 bg-muted/30 border-t border-border/50">
              <p className="text-xs text-muted-foreground font-medium mb-3 flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5" />
                Сұрағыңызды таңдаңыз:
              </p>
              <ScrollArea className="h-32 pr-4 -mr-4">
                <div className="flex flex-col gap-2">
                  {faqs.map((faq) => (
                    <Button
                      key={faq.id}
                      variant="outline"
                      size="sm"
                      className="justify-start h-auto py-2 px-3 text-left w-full text-xs font-normal whitespace-normal hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-colors"
                      onClick={() => handleQuestionSelect(faq)}
                      disabled={isTyping}
                    >
                      {faq.question}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
