import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  User,
  GraduationCap,
  Calendar,
  DollarSign,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Info,
  RefreshCw,
  FileCheck
} from "lucide-react";
import VoiceRecorderVisualizer from "./components/VoiceRecorderVisualizer";
import ScholarshipModal from "./components/ScholarshipModal";
import ScholarshipCard from "./components/ScholarshipCard";
import { SCHOLARSHIPS_DATA, matchStudentScholarships } from "./data/scholarshipsData";
import { apiUrl } from "./config/api";
import ReactMarkdown from "react-markdown";
import "./SmartScholar.css";

const languages = [
  { code: "en-IN", name: "English (India)", greeting: "Hello! 👋 I am SevaSathi AI. Tell me your name, family income, and course, and I will find all the scholarships you can apply for!" },
  { code: "kn-IN", name: "ಕನ್ನಡ (Kannada)", greeting: "ನಮಸ್ಕಾರ! 👋 ನಾನು ಸೇವಾಸಾಥಿ AI. ನಿಮ್ಮ ಹೆಸರು, ವಾರ್ಷಿಕ ಆದಾಯ ಮತ್ತು ಕೋರ್ಸ್ ತಿಳಿಸಿ, ನೀವು ಅರ್ಜಿ ಸಲ್ಲಿಸಬಹುದಾದ ವಿದ್ಯಾರ್ಥಿವೇತನಗಳನ್ನು ನಾನು ಹುಡುಕಿಕೊಡುತ್ತೇನೆ!" },
  { code: "hi-IN", name: "हिन्दी (Hindi)", greeting: "नमस्ते! 👋 मैं सेवासाथी AI हूँ। मुझे अपना नाम, पारिवारिक आय और अपनी पढ़ाई बताइए, मैं आपके लिए सभी उपयुक्त छात्रवृत्तियां ढूंढ दूंगा!" },
  { code: "ml-IN", name: "മലയാളം (Malayalam)", greeting: "നമസ്കാരം! 👋 ഞാൻ സേവാസാഥി AI. നിങ്ങളുടെ പേര്, കുടുംബ വരുമാനം, പഠിക്കുന്ന കോഴ്സ് എന്നിവ പറയൂ, നിങ്ങൾക്ക് യോഗ്യമായ സ്കോളർഷിപ്പുകൾ കണ്ടെത്താം!" },
  { code: "ta-IN", name: "தமிழ் (Tamil)", greeting: "வணக்கம்! 👋 நான் சேவாசாதி AI. உங்கள் பெயர், குடும்ப வருமானம் மற்றும் படிப்பை தெரிவியுங்கள், உங்களுக்கு ஏற்ற கல்வி உதவித்தொகைகளை கூறுகிறேன்!" },
  { code: "te-IN", name: "తెలుగు (Telugu)", greeting: "నమస్కారం! 👋 నేను సేవాసాథి AI. మీ పేరు, వార్షిక ఆదాయం మరియు కోర్సు వివరాలు చెప్పండి, మీరు దరఖాస్తు చేసుకోగల స్కాలర్‌షిప్‌లను నేను చూపిస్తాను!" },
];

export default function SmartScholar({ studentProfile, onUpdateProfile, initialPrompt = "" }) {
  const [language, setLanguage] = useState("en-IN");
  const [inputMessage, setInputMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const recognitionRef = useRef(null);
  const chatBottomRef = useRef(null);

  // Initialize messages
  const [messages, setMessages] = useState([
    {
      id: "welcome-1",
      sender: "bot",
      text: languages[0].greeting,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      suggestedQuestions: [
        "Find scholarships for my profile",
        "Scholarships for income under ₹2.5 Lakhs",
        "AICTE Pragati for girl engineering students",
        "What documents are needed for SSP Karnataka?"
      ]
    },
  ]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking, isListening]);

  // Handle initial prompt passed from Dashboard
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSend(initialPrompt);
    }
  }, [initialPrompt]);

  // Update greeting when language changes
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    const langObj = languages.find((l) => l.code === newLang) || languages[0];
    setMessages((prev) => [
      ...prev,
      {
        id: `lang-change-${Date.now()}`,
        sender: "bot",
        text: langObj.greeting,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
    if (!voiceMuted) {
      speakText(langObj.greeting, newLang);
    }
  };

  // 🔊 User-friendly Speech Synthesis
  const speakText = (text, lang = language) => {
    if (!("speechSynthesis" in window) || voiceMuted) {
      return;
    }

    try {
      window.speechSynthesis.cancel();
      // Clean speech text (strip URLs and technical formatting)
      const cleanSpeech = text
        .replace(/https?:\/\/\S+/g, "")
        .replace(/[*_#~]/g, "")
        .slice(0, 240); // Friendly, concise voice delivery

      const speech = new SpeechSynthesisUtterance(cleanSpeech);
      speech.lang = lang;
      speech.rate = 0.95; // Warm, user-friendly natural cadence
      speech.pitch = 1.05;

      // Select best voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.lang === lang || v.lang.startsWith(lang.slice(0, 2)));
      if (preferredVoice) {
        speech.voice = preferredVoice;
      }

      speech.onstart = () => setIsSpeaking(true);
      speech.onend = () => setIsSpeaking(false);
      speech.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(speech);
    } catch (err) {
      console.warn("Speech synthesis error:", err);
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // 🎙️ User-friendly Voice Recognition
  const startVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Voice input is best supported in Google Chrome, Edge, or Chromium browsers. You can also type or click any suggestion!"
      );
      return;
    }

    // Stop speaking if currently speaking
    stopSpeaking();

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = language;
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setLiveTranscript("");
      };

      recognition.onresult = (event) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setLiveTranscript(currentTranscript);

        if (event.results[0].isFinal) {
          const finalSpoken = event.results[0][0].transcript;
          setIsListening(false);
          setLiveTranscript("");
          handleSend(finalSpoken);
        }
      };

      recognition.onerror = (event) => {
        console.warn("Voice recognition error:", event.error);
        setIsListening(false);
        setLiveTranscript("");
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setIsListening(false);
    }
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
    if (liveTranscript.trim()) {
      handleSend(liveTranscript);
      setLiveTranscript("");
    }
  };

  // Extract student details from natural language query
  const extractProfileFromText = (text) => {
    const lower = text.toLowerCase();
    const updates = {};

    // Name detection (e.g., "my name is Priya", "I am Rahul")
    const nameMatch = text.match(/(?:my name is|i am|myself)\s+([A-Za-z]+)/i);
    if (nameMatch && nameMatch[1] && !["a", "studying", "student", "from"].includes(nameMatch[1].toLowerCase())) {
      updates.name = nameMatch[1];
    }

    // Income detection
    const lakhMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lpa|lac|lacs)/);
    if (lakhMatch) {
      updates.income = parseFloat(lakhMatch[1]) * 100000;
    } else {
      const numMatch = lower.match(/(?:income|salary|earn)\s*(?:is|of|around)?\s*₹?\s*(\d{4,7})/);
      if (numMatch) {
        updates.income = parseInt(numMatch[1], 10);
      }
    }

    // Course detection
    if (lower.includes("b.tech") || lower.includes("btech") || lower.includes("engineering")) {
      updates.course = "B.Tech";
    } else if (lower.includes("diploma") || lower.includes("polytechnic")) {
      updates.course = "Diploma";
    } else if (lower.includes("mbbs") || lower.includes("medical")) {
      updates.course = "MBBS";
    } else if (lower.includes("b.sc") || lower.includes("bsc")) {
      updates.course = "B.Sc";
    }

    // Gender detection
    if (lower.includes("girl") || lower.includes("female") || lower.includes("woman") || lower.includes("daughter")) {
      updates.gender = "Female";
    } else if (lower.includes("boy") || lower.includes("male") || lower.includes("son")) {
      updates.gender = "Male";
    }

    // State detection
    if (lower.includes("karnataka") || lower.includes("bangalore") || lower.includes("mysore")) {
      updates.state = "Karnataka";
    } else if (lower.includes("kerala")) {
      updates.state = "Kerala";
    } else if (lower.includes("tamil nadu") || lower.includes("chennai")) {
      updates.state = "Tamil Nadu";
    } else if (lower.includes("maharashtra") || lower.includes("mumbai") || lower.includes("pune")) {
      updates.state = "Maharashtra";
    }

    // Category detection
    if (lower.includes("obc")) updates.category = "OBC";
    if (lower.includes("sc") || lower.includes("scheduled caste")) updates.category = "SC";
    if (lower.includes("st") || lower.includes("scheduled tribe")) updates.category = "ST";
    if (lower.includes("minority") || lower.includes("muslim") || lower.includes("christian")) updates.category = "Minority";
    if (lower.includes("ews")) updates.category = "EWS";

    return updates;
  };

  // 🚀 Send message & get scholarship match
  const handleSend = async (queryText = inputMessage) => {
    if (!queryText || !queryText.trim()) return;

    const userText = queryText.trim();
    setInputMessage("");

    // Add user message
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    // Extract student profile updates
    const extracted = extractProfileFromText(userText);
    const updatedProfile = { ...studentProfile, ...extracted };
    if (onUpdateProfile && Object.keys(extracted).length > 0) {
      onUpdateProfile(updatedProfile);
    }

    let botReplyText = "";
    let matchingScholarships = [];
    let detectedIntent = "PROFILE_MATCH";
    let backendSuccess = false;

    try {
      // 1. First attempt to call the live backend with Intent-Router Architecture
      const response = await fetch(apiUrl("/api/scholarships/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          language,
          studentProfile: updatedProfile,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        botReplyText = data.reply || "";
        detectedIntent = data.intent || "PROFILE_MATCH";
        backendSuccess = true;

        if (data.extractedProfile && onUpdateProfile) {
          const ep = data.extractedProfile;
          const merged = {
            ...updatedProfile,
            income: ep.familyIncome !== null && ep.familyIncome !== undefined ? ep.familyIncome : updatedProfile.income,
            course: ep.course || updatedProfile.course,
            score: ep.percentage !== null && ep.percentage !== undefined ? ep.percentage : updatedProfile.score,
            gender: ep.gender || updatedProfile.gender,
            category: ep.category || updatedProfile.category,
            state: ep.state || updatedProfile.state
          };
          onUpdateProfile(merged);
        }

        if (data.scholarships && data.scholarships.length > 0) {
          matchingScholarships = data.scholarships.map((s) => {
            const fullMatch = SCHOLARSHIPS_DATA.find((item) => item.name === s.name || item.id === s.id);
            return fullMatch
              ? { ...fullMatch, ...s, officialUrl: s.officialLink || s.officialUrl || fullMatch.officialUrl }
              : { ...s, officialUrl: s.officialLink || s.officialUrl || s.url };
          });
        } else {
          matchingScholarships = [];
        }
      }
    } catch (backendError) {
      console.log("Backend offline or unreachable, using local intent router fallback:", backendError);
    }

    // 2. Offline / Local Fallback with Strict Intent Classification
    if (!backendSuccess) {
      const lower = userText.toLowerCase();
      const schemeAliases = [
        { keys: ["ssp", "post-matric karnataka", "karnataka post matric", "ssp karnataka", "karnataka scholarship"], id: "ssp-karnataka" },
        { keys: ["pragati", "aicte pragati", "girls engineering"], id: "aicte-pragati" },
        { keys: ["saksham", "aicte saksham", "specially-abled"], id: "aicte-saksham" },
        { keys: ["reliance", "dhirubhai"], id: "reliance-foundation-ug" },
        { keys: ["central sector", "pm-usp", "csss", "nsp"], id: "nsp-central-sector" },
        { keys: ["badhte kadam", "hdfc"], id: "hdfc-badhte-kadam" },
        { keys: ["tata trusts", "tata"], id: "tata-trusts-scholarship" },
        { keys: ["ongc"], id: "ongc-scholarship" },
        { keys: ["vidyasaarathi", "snl"], id: "vidyasaarathi-snl" },
        { keys: ["minority", "minorities"], id: "post-matric-minorities" },
        { keys: ["jindal", "sitaram"], id: "sitaram-jindal" },
        { keys: ["kvpy", "inspire"], id: "kvpy-inspire" },
        { keys: ["faea"], id: "faea-scholarship" },
        { keys: ["loreal", "l'oreal"], id: "loreal-for-women" },
      ];

      const inquiryTokens = ["document", "documents", "required", "checklist", "how to apply", "eligib", "deadline", "last date", "portal", "link", "guideline", "steps"];
      const matchedAlias = schemeAliases.find((sa) => sa.keys.some((k) => lower.includes(k)));
      const hasInquiry = inquiryTokens.some((tok) => lower.includes(tok));

      if (matchedAlias || (hasInquiry && !lower.includes("my profile") && !lower.includes("find scholarships") && !lower.includes("show scholarships"))) {
        detectedIntent = "SPECIFIC_QUERY";
        let targetScheme = matchedAlias
          ? SCHOLARSHIPS_DATA.find((s) => s.id === matchedAlias.id)
          : SCHOLARSHIPS_DATA.find((s) => s.id === "ssp-karnataka");

        if (targetScheme) {
          matchingScholarships = [targetScheme];
          const docsFormatted = (targetScheme.documents || []).map((d) => `- ✅ **${d}**`).join("\n");
          const stepsFormatted = (targetScheme.applicationSteps || []).map((st, i) => `${i + 1}. ${st}`).join("\n");
          botReplyText = `### 🏛️ ${targetScheme.name}\n` +
            `**Authority / Provider:** ${targetScheme.organization || targetScheme.provider || "Official Authority"}\n` +
            `💰 **Scholarship Grant:** ${targetScheme.amount} | 🗓️ **Application Deadline:** ${targetScheme.deadline}\n\n` +
            `${targetScheme.description}\n\n` +
            `📋 **Required Documents Checklist:**\n${docsFormatted}\n\n` +
            `📝 **Step-by-Step Application Guide:**\n${stepsFormatted}\n\n` +
            `🔗 **Official Portal:** [Apply on Official Portal](${targetScheme.officialUrl || targetScheme.officialLink})`;
        } else {
          botReplyText = `I couldn't find a verified scholarship scheme specifically matching your query in our offline database. Please ask about SSP Karnataka, AICTE Pragati, Reliance Foundation, or NSP Central Sector!`;
          matchingScholarships = [];
        }
      } else {
        detectedIntent = "PROFILE_MATCH";
        const computedMatches = matchStudentScholarships(updatedProfile);
        matchingScholarships = computedMatches.filter((s) => s.isEligible).slice(0, 4);
        if (matchingScholarships.length === 0) {
          matchingScholarships = computedMatches.slice(0, 3);
        }
        const studentDisplayName = updatedProfile.name || "Student";
        const incomeFormatted = updatedProfile.income ? `₹${Number(updatedProfile.income).toLocaleString('en-IN')}` : "your income bracket";
        botReplyText = `Hello ${studentDisplayName}! 👋 Based on family income ${incomeFormatted} and course (${updatedProfile.course || "Technical/Degree"}), SevaSathi AI matched **${matchingScholarships.length} verified scholarships** for you! Review key details and apply directly using the cards below:`;
      }
    }

    // Add bot response message with intent metadata
    const botMsg = {
      id: `bot-${Date.now()}`,
      sender: "bot",
      text: botReplyText,
      intent: detectedIntent,
      scholarships: matchingScholarships,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, botMsg]);
    setIsThinking(false);

    // Speak response
    if (!voiceMuted) {
      speakText(botReplyText, language);
    }
  };

  return (
    <div className="smartScholarContainer">
      
      {/* SmartScholar Header */}
      <div className="scholarHeaderCard">
        <div className="scholarHeaderLeft">
          <div className="aiBadgeGlow">
            <Sparkles size={16} />
            <span>AI MATCHMAKER</span>
          </div>
          <h2>SmartScholar AI Assistant</h2>
          <p>
            India's most intuitive scholarship engine. Speak or type your details to find all scholarships you qualify for in seconds!
          </p>
        </div>

        <div className="scholarHeaderControls">
          {/* Language Selector */}
          <div className="controlGroup">
            <label>Language:</label>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="styledSelect"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Voice Mute / Unmute */}
          <button
            className={`voiceMuteBtn ${voiceMuted ? "muted" : "active"}`}
            onClick={() => {
              if (!voiceMuted) stopSpeaking();
              setVoiceMuted(!voiceMuted);
            }}
            title={voiceMuted ? "Unmute Voice" : "Mute Voice"}
          >
            {voiceMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            <span>{voiceMuted ? "Voice Off" : "Voice On"}</span>
          </button>
        </div>
      </div>

      {/* Voice Recording Visualizer Overlay */}
      <VoiceRecorderVisualizer
        isListening={isListening}
        onStartListening={startVoiceInput}
        onStopListening={stopVoiceInput}
        liveTranscript={liveTranscript}
        language={language}
        isSpeaking={isSpeaking}
        onStopSpeaking={stopSpeaking}
      />

      {/* Chat Messages Window */}
      <div className="chatStreamWindow">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chatRow ${msg.sender === "user" ? "userRow" : "botRow"}`}
          >
            <div className="chatAvatar">
              {msg.sender === "user" ? <User size={18} /> : <Bot size={18} />}
            </div>

            <div className="chatBubbleWrapper">
              <div className="chatBubble">
                <div className="bubbleText">
                  {msg.sender === "bot" ? (
                    <div className="markdownContent">
                      <ReactMarkdown
                        components={{
                          a: ({ node, ...props }) => (
                            <a
                              {...props}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="chatMarkdownLink"
                            />
                          ),
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    msg.text
                  )}
                </div>

                {/* Modern Scholarship Cards Grid / Spotlight */}
                {msg.scholarships && msg.scholarships.length > 0 && (
                  <div className={`scholarshipCardsSection ${msg.intent === "SPECIFIC_QUERY" ? "spotlightSection" : "gridSection"}`}>
                    {msg.intent === "SPECIFIC_QUERY" && (
                      <div className="spotlightCardBadge">
                        <Sparkles size={13} />
                        <span>Official Scheme Spotlight</span>
                      </div>
                    )}
                    <div className={msg.intent === "SPECIFIC_QUERY" ? "singleScholarshipWrapper" : "scholarshipCardsGrid"}>
                      {msg.scholarships.map((scholarship, sIdx) => (
                        <ScholarshipCard
                          key={scholarship.id || scholarship.name || sIdx}
                          scholarship={scholarship}
                          onOpenModal={(sch) => setSelectedScholarship(sch)}
                          onApply={(sch) => {
                            const targetUrl = sch.officialLink || sch.officialUrl || sch.url;
                            if (targetUrl) window.open(targetUrl, "_blank", "noopener,noreferrer");
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Questions */}
                {msg.suggestedQuestions && (
                  <div className="bubbleSuggestions">
                    <small>Suggested prompts:</small>
                    <div className="suggestionPills">
                      {msg.suggestedQuestions.map((q, idx) => (
                        <button
                          key={idx}
                          className="promptPill"
                          onClick={() => handleSend(q)}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <span className="bubbleTimestamp">{msg.timestamp}</span>
            </div>
          </div>
        ))}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="chatRow botRow">
            <div className="chatAvatar">
              <Bot size={18} />
            </div>
            <div className="chatBubbleWrapper">
              <div className="chatBubble thinkingBubble">
                <div className="pulsingDots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span>SevaSathi AI is matching criteria & scholarships...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Quick Suggestion Chips */}
      <div className="chatSuggestionBar">
        <button
          className="quickChip"
          onClick={() => handleSend("Find all scholarships I am eligible for with my income and course")}
        >
          🎯 Match my profile
        </button>
        <button
          className="quickChip"
          onClick={() => handleSend("I am a girl studying engineering with income under 8 lakhs, which scholarships can I get?")}
        >
          👩‍🎓 Girls & Engineering Scholarships
        </button>
        <button
          className="quickChip"
          onClick={() => handleSend("What scholarships are available in Karnataka on SSP Portal?")}
        >
          🏛️ Karnataka SSP Scholarships
        </button>
        <button
          className="quickChip"
          onClick={() => handleSend("What are the mandatory documents needed so my application is not rejected?")}
        >
          📋 Required Documents
        </button>
      </div>

      {/* Input Form Area */}
      <div className="chatInputForm">
        <input
          type="text"
          className="chatInputField"
          placeholder="Ask anything (e.g. 'I am a 2nd year B.Tech student with 2.5L income from Karnataka')..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSend();
            }
          }}
        />

        {/* 🎙️ Voice Recording Button */}
        <button
          className={`micRecordBtn ${isListening ? "recordingActive" : ""}`}
          onClick={isListening ? stopVoiceInput : startVoiceInput}
          title={isListening ? "Stop listening" : "Click to speak with voice"}
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        {/* Send Button */}
        <button
          className="sendChatBtn"
          onClick={() => handleSend()}
          disabled={!inputMessage.trim() || isThinking}
        >
          <Send size={18} />
          <span>Ask</span>
        </button>
      </div>

      {/* Disclaimer */}
      <div className="chatDisclaimer">
        <Info size={14} />
        <span>
          SevaSathi AI analyzes official criteria from Central & State Scholarship Portals. Always confirm latest notification dates on official portals.
        </span>
      </div>

      {/* Scholarship Details Modal */}
      {selectedScholarship && (
        <ScholarshipModal
          scholarship={selectedScholarship}
          onClose={() => setSelectedScholarship(null)}
          onAskAI={(sch) => {
            handleSend(`Tell me more about how to apply for ${sch.name} and what documents I need.`);
          }}
        />
      )}

    </div>
  );
}