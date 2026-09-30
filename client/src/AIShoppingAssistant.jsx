import { useMemo, useState } from "react";

function AIShoppingAssistant({
  products = [],
  onViewProduct,
  onAddToCart,
}) {
  // =====================================================
  // BASIC STATE
  // =====================================================

  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState("");

  // =====================================================
  // LANGUAGE + VOICE STATE
  // =====================================================

  const [language, setLanguage] = useState("en");
  const [isListening, setIsListening] = useState(false);

  // =====================================================
  // LANGUAGE TEXT
  // =====================================================

  const translations = {
    en: {
      badge: "✨ SHOPMIND AI",
      title: "Your AI Shopping Assistant",
      subtitle:
        "Tell me what you need, your budget and how you plan to use it.",

      placeholder:
        "Example: I need a gaming laptop under ₹1 lakh",

      searchButton: "✨ Find for Me",
      listening: "🎤 Listening...",
      tryText: "Try:",

      aiLaptop: "AI/ML laptop",
      bestPhone: "Best phone",
      gamingLaptop: "Gaming laptop",
      headphones: "Headphones",

      clear: "Clear",
      recommendations: "✨ AI Recommendations",

      ranked:
        "Ranked using your request, budget, rating and availability.",

      yourRequest: "Your request",

      viewDetails: "View Details",
      addToCart: "🛒 Add to Cart",

      whyMatch: "Why this matches:",

      empty:
        "Tell me what you are looking for.",

      noProducts:
        "Products are not available right now.",

      noResult:
        "I couldn't find a suitable in-stock product for that request. Try changing your search.",

      voiceUnsupported:
        "Voice recognition is not supported in this browser.",

      voiceError:
        "I couldn't understand the voice input. Please try again.",
    },

    hi: {
      badge: "✨ SHOPMIND AI",
      title: "आपका AI शॉपिंग असिस्टेंट",

      subtitle:
        "बताइए आपको क्या चाहिए, आपका बजट क्या है और आप इसका उपयोग किसलिए करेंगे।",

      placeholder:
        "उदाहरण: मुझे ₹1 लाख के अंदर गेमिंग लैपटॉप चाहिए",

      searchButton: "✨ मेरे लिए खोजें",
      listening: "🎤 सुन रहा हूँ...",
      tryText: "उदाहरण:",

      aiLaptop: "AI/ML लैपटॉप",
      bestPhone: "सबसे अच्छा फोन",
      gamingLaptop: "गेमिंग लैपटॉप",
      headphones: "हेडफोन",

      clear: "साफ करें",
      recommendations: "✨ AI सुझाव",

      ranked:
        "आपकी आवश्यकता, बजट, रेटिंग और उपलब्धता के आधार पर चुना गया।",

      yourRequest: "आपकी मांग",

      viewDetails: "विवरण देखें",
      addToCart: "🛒 कार्ट में जोड़ें",

      whyMatch: "यह आपके लिए क्यों सही है:",

      empty:
        "बताइए आप क्या खरीदना चाहते हैं।",

      noProducts:
        "अभी कोई उत्पाद उपलब्ध नहीं है।",

      noResult:
        "आपकी मांग के अनुसार कोई उपयुक्त उत्पाद नहीं मिला। कृपया खोज बदलें।",

      voiceUnsupported:
        "इस ब्राउज़र में वॉइस रिकग्निशन उपलब्ध नहीं है।",

      voiceError:
        "मैं आपकी आवाज़ नहीं समझ पाया। कृपया फिर से प्रयास करें।",
    },

    or: {
      badge: "✨ SHOPMIND AI",
      title: "ଆପଣଙ୍କ AI Shopping Assistant",

      subtitle:
        "ଆପଣଙ୍କୁ କଣ ଦରକାର, ବଜେଟ୍ କେତେ ଏବଂ କେଉଁ କାମ ପାଇଁ ଦରକାର କୁହନ୍ତୁ।",

      placeholder:
        "ଉଦାହରଣ: ମୋତେ ₹1 ଲକ୍ଷ ଭିତରେ gaming laptop ଦରକାର",

      searchButton: "✨ ମୋ ପାଇଁ ଖୋଜନ୍ତୁ",
      listening: "🎤 ଶୁଣୁଛି...",
      tryText: "ଉଦାହରଣ:",

      aiLaptop: "AI/ML Laptop",
      bestPhone: "Best Phone",
      gamingLaptop: "Gaming Laptop",
      headphones: "Headphones",

      clear: "Clear",
      recommendations: "✨ AI Recommendations",

      ranked:
        "ଆପଣଙ୍କ ଆବଶ୍ୟକତା, ବଜେଟ୍, rating ଏବଂ availability ଅନୁସାରେ ବାଛାଯାଇଛି।",

      yourRequest: "ଆପଣଙ୍କ ଆବଶ୍ୟକତା",

      viewDetails: "Details ଦେଖନ୍ତୁ",
      addToCart: "🛒 Cart ରେ ଯୋଡନ୍ତୁ",

      whyMatch: "ଏହା କାହିଁକି match କରୁଛି:",

      empty:
        "ଆପଣ କଣ ଖୋଜୁଛନ୍ତି କୁହନ୍ତୁ।",

      noProducts:
        "ବର୍ତ୍ତମାନ product available ନାହିଁ।",

      noResult:
        "ଆପଣଙ୍କ requirement ଅନୁସାରେ suitable product ମିଳିଲା ନାହିଁ। Search ବଦଳାଇ ପୁଣି try କରନ୍ତୁ।",

      voiceUnsupported:
        "ଏହି browser ରେ voice recognition support ନାହିଁ।",

      voiceError:
        "ଆପଣଙ୍କ voice ବୁଝିପାରିଲି ନାହିଁ। ପୁଣି try କରନ୍ତୁ।",
    },
  };

  const t = translations[language];

  // =====================================================
  // LANGUAGE CHANGE
  // =====================================================

  const handleLanguageChange = (event) => {
    const selectedLanguage = event.target.value;

    setLanguage(selectedLanguage);
    setMessage("");
  };

  // =====================================================
  // NORMALIZE MULTILINGUAL SEARCH
  // Converts common Hindi/Odia shopping words into
  // searchable English terms used by our product engine.
  // =====================================================

  const normalizeSearchText = (text) => {
    let normalized = text.toLowerCase().trim();

    const replacements = [
      // =========================
      // HINDI
      // =========================

      ["लैपटॉप", " laptop "],
      ["लेपटॉप", " laptop "],

      ["मोबाइल", " smartphone "],
      ["फोन", " smartphone "],
      ["स्मार्टफोन", " smartphone "],

      ["हेडफोन", " headphones "],
      ["हेडफोन्स", " headphones "],
      ["ईयरफोन", " headphones "],

      ["स्मार्टवॉच", " smartwatch "],
      ["घड़ी", " smartwatch "],

      ["गेमिंग", " gaming "],

      ["सस्ता", " cheap "],
      ["सस्ती", " cheap "],
      ["सस्ते", " cheap "],

      ["बजट", " budget "],

      ["सबसे अच्छा", " best "],
      ["अच्छा", " best "],
      ["अच्छी", " best "],

      ["रेटिंग", " rating "],

      ["के अंदर", " under "],
      ["से कम", " under "],
      ["तक", " upto "],

      ["लाख", " lakh "],
      ["हजार", " thousand "],

      ["मुझे", " "],
      ["चाहिए", " "],
      ["दिखाओ", " show "],
      ["खोजो", " find "],

      // =========================
      // ODIA
      // =========================

      ["ଲାପଟପ୍", " laptop "],
      ["ଲାପଟପ", " laptop "],

      ["ମୋବାଇଲ୍", " smartphone "],
      ["ମୋବାଇଲ", " smartphone "],
      ["ଫୋନ୍", " smartphone "],
      ["ଫୋନ", " smartphone "],
      ["ସ୍ମାର୍ଟଫୋନ୍", " smartphone "],

      ["ହେଡଫୋନ୍", " headphones "],
      ["ହେଡଫୋନ", " headphones "],
      ["ଇୟରଫୋନ୍", " headphones "],

      ["ସ୍ମାର୍ଟୱାଚ୍", " smartwatch "],
      ["ଘଡ଼ି", " smartwatch "],

      ["ଗେମିଂ", " gaming "],

      ["ଶସ୍ତା", " cheap "],
      ["କମ୍ ଦାମ", " cheap "],

      ["ବଜେଟ୍", " budget "],
      ["ବଜେଟ", " budget "],

      ["ସବୁଠାରୁ ଭଲ", " best "],
      ["ଭଲ", " best "],

      ["ରେଟିଂ", " rating "],

      ["ଭିତରେ", " under "],
      ["ଠାରୁ କମ୍", " under "],
      ["ପର୍ଯ୍ୟନ୍ତ", " upto "],

      ["ଲକ୍ଷ", " lakh "],
      ["ଲକ୍ଷ୍ୟ", " lakh "],
      ["ହଜାର", " thousand "],

      ["ମୋତେ", " "],
      ["ଦରକାର", " "],
      ["ଦେଖାନ୍ତୁ", " show "],
      ["ଖୋଜନ୍ତୁ", " find "],
    ];

    replacements.forEach(([original, replacement]) => {
      normalized = normalized.split(original).join(replacement);
    });

    // ===================================================
    // HINDI NUMBERS -> ENGLISH NUMBERS
    // ===================================================

    const hindiNumbers = {
      "०": "0",
      "१": "1",
      "२": "2",
      "३": "3",
      "४": "4",
      "५": "5",
      "६": "6",
      "७": "7",
      "८": "8",
      "९": "9",
    };

    // ===================================================
    // ODIA NUMBERS -> ENGLISH NUMBERS
    // ===================================================

    const odiaNumbers = {
      "୦": "0",
      "୧": "1",
      "୨": "2",
      "୩": "3",
      "୪": "4",
      "୫": "5",
      "୬": "6",
      "୭": "7",
      "୮": "8",
      "୯": "9",
    };

    normalized = normalized
      .split("")
      .map(
        (character) =>
          hindiNumbers[character] ||
          odiaNumbers[character] ||
          character
      )
      .join("");

    return normalized
      .replace(/\s+/g, " ")
      .trim();
  };

  // =====================================================
  // FORMAT PRICE
  // =====================================================

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString("en-IN");
  };
    // =====================================================
  // EXTRACT BUDGET
  // Supports:
  // 70000
  // ₹70000
  // 70,000
  // 70k
  // 1 lakh
  // 1.5 lakh
  // Hindi/Odia text after normalization
  // =====================================================

  const extractBudget = (text) => {
    const normalized =
      normalizeSearchText(text)
        .toLowerCase()
        .replace(/,/g, "");

    // ===============================================
    // LAKH
    // Examples:
    // 1 lakh
    // 1.5 lakh
    // ===============================================

    const lakhMatch =
      normalized.match(
        /(\d+(?:\.\d+)?)\s*(?:lakh|lac)\b/i
      );

    if (lakhMatch) {
      return Math.round(
        Number(lakhMatch[1]) * 100000
      );
    }

    // ===============================================
    // THOUSAND
    // Examples:
    // 70 thousand
    // 50 thousand
    // ===============================================

    const thousandMatch =
      normalized.match(
        /(\d+(?:\.\d+)?)\s*thousand\b/i
      );

    if (thousandMatch) {
      return Math.round(
        Number(thousandMatch[1]) * 1000
      );
    }

    // ===============================================
    // K FORMAT
    // Examples:
    // 70k
    // 50k
    // ===============================================

    const kMatch =
      normalized.match(
        /(\d+(?:\.\d+)?)\s*k\b/i
      );

    if (kMatch) {
      return Math.round(
        Number(kMatch[1]) * 1000
      );
    }

    // ===============================================
    // RUPEE / NORMAL NUMBER
    // Examples:
    // ₹70000
    // under 70000
    // budget 50000
    // ===============================================

    const moneyPatterns = [
      /₹\s*(\d{4,7})/i,
      /under\s*₹?\s*(\d{4,7})/i,
      /below\s*₹?\s*(\d{4,7})/i,
      /less\s+than\s*₹?\s*(\d{4,7})/i,
      /upto\s*₹?\s*(\d{4,7})/i,
      /up\s+to\s*₹?\s*(\d{4,7})/i,
      /budget\s*(?:of|is|around)?\s*₹?\s*(\d{4,7})/i,
    ];

    for (
      const pattern of moneyPatterns
    ) {
      const match =
        normalized.match(pattern);

      if (match) {
        return Number(match[1]);
      }
    }

    // ===============================================
    // FALLBACK
    // Detect a realistic price-like number.
    // Avoid treating ratings such as 4.6 as budget.
    // ===============================================

    const numbers =
      normalized.match(/\d+/g);

    if (numbers) {
      const possibleBudgets =
        numbers
          .map(Number)
          .filter(
            (number) =>
              number >= 1000 &&
              number <= 10000000
          );

      if (
        possibleBudgets.length > 0
      ) {
        return Math.max(
          ...possibleBudgets
        );
      }
    }

    return null;
  };

  // =====================================================
  // DETECT CATEGORY
  // =====================================================

  const detectCategory = (text) => {
    const q =
      normalizeSearchText(text)
        .toLowerCase();

    // ===============================================
    // LAPTOP
    // ===============================================

    if (
      q.includes("laptop") ||
      q.includes("notebook") ||
      q.includes("macbook") ||
      q.includes("computer")
    ) {
      return "laptop";
    }

    // ===============================================
    // SMARTPHONE
    // ===============================================

    if (
      q.includes("smartphone") ||
      q.includes("mobile") ||
      q.includes("phone") ||
      q.includes("iphone")
    ) {
      return "smartphone";
    }

    // ===============================================
    // HEADPHONES
    // ===============================================

    if (
      q.includes("headphone") ||
      q.includes("headphones") ||
      q.includes("earphone") ||
      q.includes("earphones") ||
      q.includes("earbuds") ||
      q.includes("headset")
    ) {
      return "headphones";
    }

    // ===============================================
    // SMARTWATCH
    // ===============================================

    if (
      q.includes("smartwatch") ||
      q.includes("smart watch") ||
      q.includes("watch")
    ) {
      return "smartwatch";
    }

    return null;
  };

  // =====================================================
  // DETECT SHOPPING INTENT
  // =====================================================

  const detectIntent = (text) => {
    const q =
      normalizeSearchText(text)
        .toLowerCase();

    // ===============================================
    // CHEAP / BUDGET
    // ===============================================

    if (
      q.includes("cheap") ||
      q.includes("cheapest") ||
      q.includes("budget") ||
      q.includes("affordable") ||
      q.includes("low price") ||
      q.includes("lowest price")
    ) {
      return "budget";
    }

    // ===============================================
    // BEST / HIGH RATING
    // ===============================================

    if (
      q.includes("best") ||
      q.includes("top") ||
      q.includes("highest rated") ||
      q.includes("good rating") ||
      q.includes("premium")
    ) {
      return "best";
    }

    // ===============================================
    // GAMING
    // ===============================================

    if (
      q.includes("gaming") ||
      q.includes("game") ||
      q.includes("gamer")
    ) {
      return "gaming";
    }

    // ===============================================
    // AI / ML
    // ===============================================

    if (
      q.includes("ai/ml") ||
      q.includes("ai ml") ||
      q.includes("machine learning") ||
      q.includes("deep learning") ||
      q.includes("artificial intelligence") ||
      q.includes("data science")
    ) {
      return "ai";
    }

    // ===============================================
    // STUDENT
    // ===============================================

    if (
      q.includes("student") ||
      q.includes("college") ||
      q.includes("university") ||
      q.includes("study") ||
      q.includes("studying")
    ) {
      return "student";
    }

    // ===============================================
    // CODING / PROGRAMMING
    // ===============================================

    if (
      q.includes("coding") ||
      q.includes("programming") ||
      q.includes("developer") ||
      q.includes("development") ||
      q.includes("software")
    ) {
      return "coding";
    }

    // ===============================================
    // CAMERA
    // ===============================================

    if (
      q.includes("camera") ||
      q.includes("photo") ||
      q.includes("photography") ||
      q.includes("video") ||
      q.includes("vlogging")
    ) {
      return "camera";
    }

    // ===============================================
    // MUSIC
    // ===============================================

    if (
      q.includes("music") ||
      q.includes("sound") ||
      q.includes("audio") ||
      q.includes("noise cancellation")
    ) {
      return "music";
    }

    // ===============================================
    // FITNESS
    // ===============================================

    if (
      q.includes("fitness") ||
      q.includes("gym") ||
      q.includes("running") ||
      q.includes("health") ||
      q.includes("workout")
    ) {
      return "fitness";
    }

    return "general";
  };

  // =====================================================
  // DETECT PURPOSES
  // Allows more than one purpose.
  // Example:
  // "AI ML and gaming laptop"
  // -> ["ai", "gaming"]
  // =====================================================

  const detectPurposes = (text) => {
    const q =
      normalizeSearchText(text)
        .toLowerCase();

    const purposes = [];

    if (
      q.includes("gaming") ||
      q.includes("gamer") ||
      q.includes("game")
    ) {
      purposes.push("gaming");
    }

    if (
      q.includes("ai/ml") ||
      q.includes("ai ml") ||
      q.includes("machine learning") ||
      q.includes("deep learning") ||
      q.includes("artificial intelligence") ||
      q.includes("data science")
    ) {
      purposes.push("ai");
    }

    if (
      q.includes("coding") ||
      q.includes("programming") ||
      q.includes("developer") ||
      q.includes("development") ||
      q.includes("software")
    ) {
      purposes.push("coding");
    }

    if (
      q.includes("student") ||
      q.includes("college") ||
      q.includes("university") ||
      q.includes("study")
    ) {
      purposes.push("student");
    }

    if (
      q.includes("camera") ||
      q.includes("photography") ||
      q.includes("photo") ||
      q.includes("vlogging")
    ) {
      purposes.push("camera");
    }

    if (
      q.includes("music") ||
      q.includes("audio") ||
      q.includes("sound") ||
      q.includes("noise cancellation")
    ) {
      purposes.push("music");
    }

    if (
      q.includes("fitness") ||
      q.includes("gym") ||
      q.includes("running") ||
      q.includes("workout")
    ) {
      purposes.push("fitness");
    }

    return purposes;
  };

  // =====================================================
  // DETECT BUDGET DIRECTION
  // =====================================================

  const detectBudgetType = (text) => {
    const q =
      normalizeSearchText(text)
        .toLowerCase();

    if (
      q.includes("under") ||
      q.includes("below") ||
      q.includes("less than") ||
      q.includes("upto") ||
      q.includes("up to") ||
      q.includes("budget")
    ) {
      return "maximum";
    }

    if (
      q.includes("above") ||
      q.includes("more than") ||
      q.includes("over")
    ) {
      return "minimum";
    }

    return "maximum";
  };

  // =====================================================
  // BUILD SEARCH UNDERSTANDING
  // =====================================================

  const understandQuery = (text) => {
    const normalized =
      normalizeSearchText(text);

    return {
      originalText: text,
      normalizedText: normalized,

      category:
        detectCategory(text),

      budget:
        extractBudget(text),

      budgetType:
        detectBudgetType(text),

      intent:
        detectIntent(text),

      purposes:
        detectPurposes(text),
    };
  };
    // =====================================================
  // PRODUCT HELPERS
  // =====================================================

  const getProductId = (product) => {
    return product?._id || product?.id;
  };

  const getProductStock = (product) => {
    return Number(
      product?.stock ??
        product?.quantity ??
        0
    );
  };

  const getProductPrice = (product) => {
    return Number(product?.price || 0);
  };

  const getProductRating = (product) => {
    return Number(product?.rating || 0);
  };

  // =====================================================
  // CREATE SEARCHABLE PRODUCT TEXT
  // =====================================================

  const getProductSearchText = (product) => {
    return [
      product?.name,
      product?.category,
      product?.description,
      product?.brand,
      product?.features?.join?.(" "),
      product?.tags?.join?.(" "),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
  };

  // =====================================================
  // CATEGORY MATCH
  // =====================================================

  const categoryMatches = (
    product,
    requestedCategory
  ) => {
    if (!requestedCategory) {
      return true;
    }

    const text =
      getProductSearchText(product);

    if (
      requestedCategory === "laptop"
    ) {
      return (
        text.includes("laptop") ||
        text.includes("macbook") ||
        text.includes("notebook")
      );
    }

    if (
      requestedCategory ===
      "smartphone"
    ) {
      return (
        text.includes("smartphone") ||
        text.includes("phone") ||
        text.includes("mobile") ||
        text.includes("galaxy") ||
        text.includes("oneplus")
      );
    }

    if (
      requestedCategory ===
      "headphones"
    ) {
      return (
        text.includes("headphone") ||
        text.includes("headphones") ||
        text.includes("earphone") ||
        text.includes("audio")
      );
    }

    if (
      requestedCategory ===
      "smartwatch"
    ) {
      return (
        text.includes("smartwatch") ||
        text.includes("smart watch") ||
        text.includes("watch")
      );
    }

    return true;
  };

  // =====================================================
  // PURPOSE KEYWORDS
  // =====================================================

  const purposeKeywords = {
    gaming: [
      "gaming",
      "game",
      "rog",
      "gpu",
      "graphics",
      "rtx",
      "performance",
    ],

    ai: [
      "ai",
      "machine learning",
      "deep learning",
      "ml",
      "gpu",
      "neural",
      "data science",
      "performance",
    ],

    coding: [
      "coding",
      "programming",
      "developer",
      "development",
      "software",
      "performance",
      "laptop",
    ],

    student: [
      "student",
      "college",
      "study",
      "portable",
      "battery",
      "lightweight",
      "laptop",
    ],

    camera: [
      "camera",
      "photo",
      "photography",
      "video",
      "megapixel",
    ],

    music: [
      "music",
      "audio",
      "sound",
      "headphone",
      "noise cancellation",
      "anc",
    ],

    fitness: [
      "fitness",
      "health",
      "workout",
      "running",
      "watch",
    ],
  };

  // =====================================================
  // SCORE PRODUCT
  // =====================================================

  const scoreProduct = (
    product,
    understanding
  ) => {
    let score = 0;

    const reasons = [];

    const text =
      getProductSearchText(product);

    const price =
      getProductPrice(product);

    const rating =
      getProductRating(product);

    const stock =
      getProductStock(product);

    const {
      category,
      budget,
      budgetType,
      intent,
      purposes,
    } = understanding;

    // ===================================================
    // CATEGORY SCORE
    // ===================================================

    if (category) {
      if (
        categoryMatches(
          product,
          category
        )
      ) {
        score += 40;

        reasons.push(
          "category-match"
        );
      } else {
        score -= 50;
      }
    }

    // ===================================================
    // BUDGET SCORE
    // ===================================================

    if (budget) {
      if (
        budgetType ===
        "maximum"
      ) {
        if (price <= budget) {
          score += 35;

          reasons.push(
            "within-budget"
          );

          // Product closer to budget
          // gets a small relevance boost.
          const difference =
            budget - price;

          const ratio =
            difference /
            Math.max(
              budget,
              1
            );

          if (ratio <= 0.15) {
            score += 8;
          } else if (
            ratio <= 0.35
          ) {
            score += 4;
          }
        } else {
          // Penalize products over budget.
          const overBy =
            price - budget;

          const percentage =
            overBy /
            Math.max(
              budget,
              1
            );

          if (percentage <= 0.1) {
            score -= 10;
          } else {
            score -= 35;
          }
        }
      }

      if (
        budgetType ===
        "minimum"
      ) {
        if (price >= budget) {
          score += 20;
        } else {
          score -= 15;
        }
      }
    }

    // ===================================================
    // PURPOSE SCORE
    // ===================================================

    purposes.forEach(
      (purpose) => {
        const keywords =
          purposeKeywords[
            purpose
          ] || [];

        let purposeMatched =
          false;

        keywords.forEach(
          (keyword) => {
            if (
              text.includes(
                keyword
              )
            ) {
              score += 5;

              purposeMatched =
                true;
            }
          }
        );

        if (purposeMatched) {
          reasons.push(
            `${purpose}-match`
          );
        }
      }
    );

    // ===================================================
    // INTENT SCORE
    // ===================================================

    if (
      intent === "gaming" &&
      (
        text.includes("gaming") ||
        text.includes("rog") ||
        text.includes("rtx") ||
        text.includes("gpu")
      )
    ) {
      score += 25;

      reasons.push(
        "gaming-match"
      );
    }

    if (
      intent === "ai" &&
      (
        text.includes("ai") ||
        text.includes("gpu") ||
        text.includes("performance") ||
        text.includes("laptop")
      )
    ) {
      score += 20;

      reasons.push(
        "ai-match"
      );
    }

    if (
      intent === "coding" &&
      (
        text.includes("laptop") ||
        text.includes("macbook") ||
        text.includes("performance")
      )
    ) {
      score += 18;

      reasons.push(
        "coding-match"
      );
    }

    if (
      intent === "camera" &&
      text.includes("camera")
    ) {
      score += 20;

      reasons.push(
        "camera-match"
      );
    }

    if (
      intent === "music" &&
      (
        text.includes("audio") ||
        text.includes("headphone") ||
        text.includes("sound")
      )
    ) {
      score += 20;

      reasons.push(
        "music-match"
      );
    }

    if (
      intent === "fitness" &&
      (
        text.includes("fitness") ||
        text.includes("watch") ||
        text.includes("health")
      )
    ) {
      score += 20;

      reasons.push(
        "fitness-match"
      );
    }

    // ===================================================
    // RATING SCORE
    // ===================================================

    if (rating >= 4.8) {
      score += 15;

      reasons.push(
        "excellent-rating"
      );
    } else if (
      rating >= 4.5
    ) {
      score += 12;

      reasons.push(
        "high-rating"
      );
    } else if (
      rating >= 4
    ) {
      score += 8;
    }

    // ===================================================
    // STOCK SCORE
    // ===================================================

    if (stock > 0) {
      score += 10;

      reasons.push(
        "in-stock"
      );
    } else {
      score -= 100;
    }

    // ===================================================
    // BUDGET INTENT
    // ===================================================

    if (
      intent === "budget"
    ) {
      score += Math.max(
        0,
        15 -
          price / 10000
      );
    }

    // ===================================================
    // BEST PRODUCT INTENT
    // ===================================================

    if (
      intent === "best"
    ) {
      score += rating * 4;
    }

    return {
      ...product,

      aiScore: score,

      aiReasons:
        Array.from(
          new Set(reasons)
        ),
    };
  };

  // =====================================================
  // GET MATCH REASONS IN USER'S LANGUAGE
  // =====================================================

  const getReasonText = (
    reason
  ) => {
    const reasonTranslations = {
      en: {
        "category-match":
          "Matches the product type you requested",

        "within-budget":
          "Fits within your budget",

        "gaming-match":
          "Suitable for gaming",

        "ai-match":
          "Relevant for AI/ML workloads",

        "coding-match":
          "Suitable for coding and development",

        "camera-match":
          "Matches your camera requirement",

        "music-match":
          "Suitable for music and audio",

        "fitness-match":
          "Useful for fitness activities",

        "excellent-rating":
          "Excellent customer rating",

        "high-rating":
          "Highly rated",

        "in-stock":
          "Currently in stock",

        "student-match":
          "Suitable for students",
      },

      hi: {
        "category-match":
          "आपकी मांगी गई प्रोडक्ट कैटेगरी से मेल खाता है",

        "within-budget":
          "आपके बजट के अंदर है",

        "gaming-match":
          "गेमिंग के लिए उपयुक्त है",

        "ai-match":
          "AI/ML के काम के लिए उपयोगी है",

        "coding-match":
          "कोडिंग और डेवलपमेंट के लिए उपयुक्त है",

        "camera-match":
          "आपकी कैमरा आवश्यकता से मेल खाता है",

        "music-match":
          "म्यूजिक और ऑडियो के लिए उपयुक्त है",

        "fitness-match":
          "फिटनेस के लिए उपयोगी है",

        "excellent-rating":
          "बहुत अच्छी ग्राहक रेटिंग",

        "high-rating":
          "अच्छी रेटिंग वाला प्रोडक्ट",

        "in-stock":
          "अभी स्टॉक में उपलब्ध है",

        "student-match":
          "छात्रों के लिए उपयुक्त है",
      },

      or: {
        "category-match":
          "ଆପଣ ଚାହିଥିବା product category ସହିତ match କରୁଛି",

        "within-budget":
          "ଆପଣଙ୍କ budget ଭିତରେ ଅଛି",

        "gaming-match":
          "Gaming ପାଇଁ suitable",

        "ai-match":
          "AI/ML କାମ ପାଇଁ suitable",

        "coding-match":
          "Coding ଏବଂ development ପାଇଁ suitable",

        "camera-match":
          "ଆପଣଙ୍କ camera requirement ସହିତ match କରୁଛି",

        "music-match":
          "Music ଏବଂ audio ପାଇଁ suitable",

        "fitness-match":
          "Fitness ପାଇଁ useful",

        "excellent-rating":
          "ବହୁତ ଭଲ customer rating ଅଛି",

        "high-rating":
          "ଭଲ rating ଥିବା product",

        "in-stock":
          "ବର୍ତ୍ତମାନ stock ରେ available",

        "student-match":
          "Students ପାଇଁ suitable",
      },
    };

    return (
      reasonTranslations[
        language
      ]?.[reason] ||
      reason
    );
  };

  // =====================================================
  // BUILD AI RESPONSE MESSAGE
  // =====================================================

  const buildRecommendationMessage = (
    understanding,
    rankedProducts
  ) => {
    const {
      category,
      budget,
      purposes,
    } = understanding;

    if (
      rankedProducts.length ===
      0
    ) {
      return t.noResult;
    }

    const topProduct =
      rankedProducts[0];

    const productName =
      topProduct.name ||
      "this product";

    // ===================================================
    // ENGLISH
    // ===================================================

    if (language === "en") {
      let response =
        `I found ${rankedProducts.length} suitable product`;

      if (
        rankedProducts.length !== 1
      ) {
        response += "s";
      }

      response += ".";

      if (category) {
        response +=
          ` I focused on ${category} products.`;
      }

      if (budget) {
        response +=
          ` Your target budget is ₹${formatPrice(
            budget
          )}.`;
      }

      if (
        purposes.length > 0
      ) {
        response +=
          ` I also considered ${purposes.join(
            ", "
          )}.`;
      }

      response +=
        ` My top match is ${productName}.`;

      return response;
    }

    // ===================================================
    // HINDI
    // ===================================================

    if (language === "hi") {
      let response =
        `मुझे ${rankedProducts.length} उपयुक्त प्रोडक्ट मिले हैं।`;

      if (category) {
        response +=
          ` मैंने ${category} कैटेगरी पर ध्यान दिया है।`;
      }

      if (budget) {
        response +=
          ` आपका बजट ₹${formatPrice(
            budget
          )} है।`;
      }

      if (
        purposes.length > 0
      ) {
        response +=
          ` मैंने ${purposes.join(
            ", "
          )} की आवश्यकता भी ध्यान में रखी है।`;
      }

      response +=
        ` सबसे ऊपर ${productName} दिखाया गया है।`;

      return response;
    }

    // ===================================================
    // ODIA
    // ===================================================

    let response =
      `${rankedProducts.length}ଟି suitable product ମିଳିଛି।`;

    if (category) {
      response +=
        ` ${category} category କୁ priority ଦିଆଯାଇଛି।`;
    }

    if (budget) {
      response +=
        ` ଆପଣଙ୍କ budget ₹${formatPrice(
          budget
        )}।`;
    }

    if (
      purposes.length > 0
    ) {
      response +=
        ` ${purposes.join(
          ", "
        )} requirement ମଧ୍ୟ consider କରାଯାଇଛି।`;
    }

    response +=
      ` Top match ହେଉଛି ${productName}।`;

    return response;
  };

  // =====================================================
  // RANK PRODUCTS
  // =====================================================

  const rankProducts = (
    understanding
  ) => {
    if (
      !Array.isArray(products) ||
      products.length === 0
    ) {
      return [];
    }

    let candidates =
      [...products];

    // ===================================================
    // STRICT CATEGORY FILTER
    // ===================================================

    if (
      understanding.category
    ) {
      candidates =
        candidates.filter(
          (product) =>
            categoryMatches(
              product,
              understanding.category
            )
        );
    }

    // ===================================================
    // REMOVE OUT OF STOCK PRODUCTS
    // ===================================================

    candidates =
      candidates.filter(
        (product) =>
          getProductStock(
            product
          ) > 0
      );

    // ===================================================
    // STRICT BUDGET FILTER
    // For "under", "budget", etc.
    // ===================================================

    if (
      understanding.budget &&
      understanding.budgetType ===
        "maximum"
    ) {
      const withinBudget =
        candidates.filter(
          (product) =>
            getProductPrice(
              product
            ) <=
            understanding.budget
        );

      // If products actually exist
      // within budget, only show those.
      if (
        withinBudget.length > 0
      ) {
        candidates =
          withinBudget;
      }
    }

    // ===================================================
    // SCORE
    // ===================================================

    const scored =
      candidates.map(
        (product) =>
          scoreProduct(
            product,
            understanding
          )
      );

    // ===================================================
    // SORT
    // ===================================================

    scored.sort(
      (a, b) => {
        if (
          b.aiScore !==
          a.aiScore
        ) {
          return (
            b.aiScore -
            a.aiScore
          );
        }

        if (
          getProductRating(b) !==
          getProductRating(a)
        ) {
          return (
            getProductRating(b) -
            getProductRating(a)
          );
        }

        return (
          getProductPrice(a) -
          getProductPrice(b)
        );
      }
    );

    // ===================================================
    // TOP RESULTS
    // ===================================================

    return scored.slice(
      0,
      4
    );
  };

  // =====================================================
  // RUN AI SEARCH
  // =====================================================

  const runSearch = (
    searchText = query
  ) => {
    const cleanedQuery =
      String(
        searchText || ""
      ).trim();

    if (!cleanedQuery) {
      setResults([]);
      setSubmittedQuery("");
      setMessage(t.empty);

      return;
    }

    if (
      !Array.isArray(products) ||
      products.length === 0
    ) {
      setResults([]);
      setSubmittedQuery(
        cleanedQuery
      );
      setMessage(
        t.noProducts
      );

      return;
    }

    const understanding =
      understandQuery(
        cleanedQuery
      );

    const rankedProducts =
      rankProducts(
        understanding
      );

    setSubmittedQuery(
      cleanedQuery
    );

    setResults(
      rankedProducts
    );

    setMessage(
      buildRecommendationMessage(
        understanding,
        rankedProducts
      )
    );
  };

  // =====================================================
  // SUBMIT SEARCH
  // =====================================================

  const handleSubmit = (
    event
  ) => {
    event.preventDefault();

    runSearch(query);
  };

  // =====================================================
  // QUICK SEARCH
  // =====================================================

  const handleQuickSearch = (
    searchText
  ) => {
    setQuery(searchText);

    runSearch(searchText);
  };

  // =====================================================
  // CLEAR AI SEARCH
  // =====================================================

  const clearSearch = () => {
    setQuery("");
    setSubmittedQuery("");
    setResults([]);
    setMessage("");
  };

  // =====================================================
  // RESULT COUNT
  // =====================================================

  const resultCount =
    useMemo(
      () => results.length,
      [results]
    );
      // =====================================================
  // VOICE LANGUAGE
  // =====================================================

  const speechLanguageMap = {
    en: "en-IN",
    hi: "hi-IN",
    or: "or-IN",
  };

  // =====================================================
  // CHECK VOICE SUPPORT
  // =====================================================

  const getSpeechRecognition = () => {
    if (typeof window === "undefined") {
      return null;
    }

    return (
      window.SpeechRecognition ||
      window.webkitSpeechRecognition ||
      null
    );
  };

  // =====================================================
  // START VOICE SEARCH
  // =====================================================

  const startVoiceSearch = () => {
    const SpeechRecognition =
      getSpeechRecognition();

    // Browser does not support speech recognition
    if (!SpeechRecognition) {
      setMessage(t.voiceUnsupported);
      return;
    }

    // Prevent multiple recognition sessions
    if (isListening) {
      return;
    }

    try {
      const recognition =
        new SpeechRecognition();

      // =================================================
      // VOICE SETTINGS
      // =================================================

      recognition.lang =
        speechLanguageMap[language] ||
        "en-IN";

      recognition.continuous = false;

      recognition.interimResults = false;

      recognition.maxAlternatives = 1;

      // =================================================
      // START LISTENING
      // =================================================

      recognition.onstart = () => {
        setIsListening(true);

        setMessage(
          t.listening
        );
      };

      // =================================================
      // VOICE RESULT
      // =================================================

      recognition.onresult = (
        event
      ) => {
        const transcript =
          event.results?.[0]?.[0]
            ?.transcript || "";

        const cleanedTranscript =
          transcript.trim();

        if (!cleanedTranscript) {
          setMessage(
            t.voiceError
          );

          return;
        }

        // Put recognized speech
        // into search input
        setQuery(
          cleanedTranscript
        );

        // Automatically search
        runSearch(
          cleanedTranscript
        );
      };

      // =================================================
      // VOICE ERROR
      // =================================================

      recognition.onerror = (
        event
      ) => {
        console.error(
          "Voice recognition error:",
          event.error
        );

        setIsListening(false);

        // User simply stopped/cancelled
        if (
          event.error ===
            "aborted" ||
          event.error ===
            "no-speech"
        ) {
          setMessage(
            t.voiceError
          );

          return;
        }

        // Microphone permission blocked
        if (
          event.error ===
          "not-allowed" ||
          event.error ===
          "service-not-allowed"
        ) {
          if (
            language === "hi"
          ) {
            setMessage(
              "माइक्रोफोन की अनुमति नहीं मिली। कृपया ब्राउज़र में microphone permission Allow करें।"
            );
          } else if (
            language === "or"
          ) {
            setMessage(
              "Microphone permission ମିଳିଲା ନାହିଁ। Browser ରେ microphone permission Allow କରନ୍ତୁ।"
            );
          } else {
            setMessage(
              "Microphone permission was blocked. Please allow microphone access in your browser."
            );
          }

          return;
        }

        setMessage(
          t.voiceError
        );
      };

      // =================================================
      // VOICE ENDED
      // =================================================

      recognition.onend = () => {
        setIsListening(false);
      };

      // =================================================
      // START MICROPHONE
      // =================================================

      recognition.start();
    } catch (error) {
      console.error(
        "Unable to start voice recognition:",
        error
      );

      setIsListening(false);

      setMessage(
        t.voiceError
      );
    }
  };

  // =====================================================
  // LANGUAGE-SPECIFIC QUICK SEARCHES
  // =====================================================

  const quickSearches = useMemo(() => {
    if (language === "hi") {
      return [
        {
          label:
            "💻 AI/ML लैपटॉप",
          query:
            "मुझे AI ML के लिए अच्छा लैपटॉप चाहिए",
        },

        {
          label:
            "📱 सबसे अच्छा फोन",
          query:
            "मुझे सबसे अच्छा फोन चाहिए",
        },

        {
          label:
            "🎮 गेमिंग लैपटॉप",
          query:
            "मुझे गेमिंग लैपटॉप चाहिए",
        },

        {
          label:
            "🎧 हेडफोन",
          query:
            "मुझे अच्छे हेडफोन चाहिए",
        },
      ];
    }

    if (language === "or") {
      return [
        {
          label:
            "💻 AI/ML Laptop",
          query:
            "ମୋତେ AI ML ପାଇଁ ଭଲ laptop ଦରକାର",
        },

        {
          label:
            "📱 Best Phone",
          query:
            "ମୋତେ ଭଲ phone ଦରକାର",
        },

        {
          label:
            "🎮 Gaming Laptop",
          query:
            "ମୋତେ gaming ପାଇଁ laptop ଦରକାର",
        },

        {
          label:
            "🎧 Headphones",
          query:
            "ମୋତେ ଭଲ headphones ଦରକାର",
        },
      ];
    }

    return [
      {
        label:
          "💻 AI/ML Laptop",
        query:
          "I need a laptop for AI and machine learning",
      },

      {
        label:
          "📱 Best Phone",
        query:
          "Show me the best smartphone",
      },

      {
        label:
          "🎮 Gaming Laptop",
        query:
          "I need a gaming laptop",
      },

      {
        label:
          "🎧 Headphones",
        query:
          "Show me good headphones",
      },
    ];
  }, [language]);

  // =====================================================
  // VOICE BUTTON TITLE
  // =====================================================

  const getVoiceButtonTitle = () => {
    if (isListening) {
      if (language === "hi") {
        return "सुन रहा हूँ...";
      }

      if (language === "or") {
        return "ଶୁଣୁଛି...";
      }

      return "Listening...";
    }

    if (language === "hi") {
      return "आवाज़ से खोजें";
    }

    if (language === "or") {
      return "Voice ଦ୍ୱାରା search କରନ୍ତୁ";
    }

    return "Search by voice";
  };

  // =====================================================
  // LANGUAGE NAME
  // =====================================================

  const getLanguageName = () => {
    if (language === "hi") {
      return "हिंदी";
    }

    if (language === "or") {
      return "ଓଡ଼ିଆ";
    }

    return "English";
  };

  // =====================================================
  // PRODUCT IMAGE ERROR
  // =====================================================

  const handleAIImageError = (
    event
  ) => {
    const image =
      event.currentTarget;

    image.style.display =
      "none";

    const fallback =
      image.nextElementSibling;

    if (fallback) {
      fallback.style.display =
        "flex";
    }
  };
    // =====================================================
  // FINAL UI
  // =====================================================

  return (
    <section
      className="ai-shopping-assistant"
      id="ai-shopping"
    >
      <div className="ai-assistant-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="ai-assistant-header">
          <div className="ai-assistant-badge">
            {t.badge}
          </div>

          <h2>{t.title}</h2>

          <p>{t.subtitle}</p>
        </div>

        {/* =================================================
            LANGUAGE SELECTOR
        ================================================= */}

        <div className="ai-language-section">
          <div className="ai-language-label">
            <span>🌐</span>

            <span>
              Language
            </span>
          </div>

          <div className="ai-language-buttons">

            <button
              type="button"
              className={
                language === "en"
                  ? "ai-language-btn active"
                  : "ai-language-btn"
              }
              onClick={() => {
                setLanguage("en");
                setMessage("");
              }}
            >
              English
            </button>

            <button
              type="button"
              className={
                language === "hi"
                  ? "ai-language-btn active"
                  : "ai-language-btn"
              }
              onClick={() => {
                setLanguage("hi");
                setMessage("");
              }}
            >
              हिंदी
            </button>

            <button
              type="button"
              className={
                language === "or"
                  ? "ai-language-btn active"
                  : "ai-language-btn"
              }
              onClick={() => {
                setLanguage("or");
                setMessage("");
              }}
            >
              ଓଡ଼ିଆ
            </button>

          </div>

          <small className="ai-current-language">
            🌍 {getLanguageName()}
          </small>
        </div>

        {/* =================================================
            SEARCH FORM
        ================================================= */}

        <form
          className="ai-search-form"
          onSubmit={handleSubmit}
        >
          <div className="ai-search-wrapper">

            <span className="ai-search-icon">
              🔎
            </span>

            <input
              type="text"
              value={query}
              onChange={(event) => {
                setQuery(
                  event.target.value
                );

                if (message) {
                  setMessage("");
                }
              }}
              placeholder={
                t.placeholder
              }
              className="ai-search-input"
              autoComplete="off"
            />

            {/* =============================================
                MICROPHONE
            ============================================= */}

            <button
              type="button"
              className={
                isListening
                  ? "ai-mic-button listening"
                  : "ai-mic-button"
              }
              onClick={
                startVoiceSearch
              }
              title={
                getVoiceButtonTitle()
              }
              aria-label={
                getVoiceButtonTitle()
              }
              disabled={
                isListening
              }
            >
              {isListening
                ? "🔴"
                : "🎤"}
            </button>

          </div>

          <button
            type="submit"
            className="ai-search-button"
            disabled={
              !query.trim() ||
              isListening
            }
          >
            {isListening
              ? t.listening
              : t.searchButton}
          </button>
        </form>

        {/* =================================================
            LISTENING STATUS
        ================================================= */}

        {isListening && (
          <div className="ai-listening-box">

            <div className="ai-listening-animation">
              <span />
              <span />
              <span />
              <span />
            </div>

            <div>
              <strong>
                {t.listening}
              </strong>

              <p>
                {language === "or"
                  ? "ଆପଣଙ୍କ requirement କୁହନ୍ତୁ..."
                  : language === "hi"
                  ? "अपनी आवश्यकता बोलिए..."
                  : "Tell ShopMind what you need..."}
              </p>
            </div>

          </div>
        )}

        {/* =================================================
            QUICK SEARCHES
        ================================================= */}

        <div className="ai-quick-search">

          <span className="ai-try-label">
            {t.tryText}
          </span>

          <div className="ai-quick-buttons">

            {quickSearches.map(
              (item) => (
                <button
                  type="button"
                  key={item.label}
                  onClick={() =>
                    handleQuickSearch(
                      item.query
                    )
                  }
                >
                  {item.label}
                </button>
              )
            )}

          </div>

        </div>

        {/* =================================================
            CLEAR SEARCH
        ================================================= */}

        {(query ||
          submittedQuery ||
          results.length > 0) && (
          <div className="ai-clear-wrapper">

            <button
              type="button"
              className="ai-clear-button"
              onClick={
                clearSearch
              }
            >
              ✕ {t.clear}
            </button>

          </div>
        )}

        {/* =================================================
            AI MESSAGE
        ================================================= */}

        {message && (
          <div className="ai-response-box">

            <div className="ai-response-icon">
              🤖
            </div>

            <div className="ai-response-content">

              <strong>
                ShopMind AI
              </strong>

              <p>
                {message}
              </p>

            </div>

          </div>
        )}

        {/* =================================================
            USER REQUEST
        ================================================= */}

        {submittedQuery && (
          <div className="ai-request-box">

            <span>
              💬
            </span>

            <div>
              <small>
                {t.yourRequest}
              </small>

              <strong>
                {submittedQuery}
              </strong>
            </div>

          </div>
        )}

        {/* =================================================
            RECOMMENDATION HEADER
        ================================================= */}

        {results.length > 0 && (
          <div className="ai-results-header">

            <div>
              <h3>
                {t.recommendations}
              </h3>

              <p>
                {t.ranked}
              </p>
            </div>

            <span className="ai-result-count">
              {resultCount}{" "}
              {resultCount === 1
                ? "product"
                : "products"}
            </span>

          </div>
        )}

        {/* =================================================
            RECOMMENDATION GRID
        ================================================= */}

        {results.length > 0 && (
          <div className="ai-results-grid">

            {results.map(
              (product, index) => {
                const productId =
                  getProductId(
                    product
                  );

                const stock =
                  getProductStock(
                    product
                  );

                const price =
                  getProductPrice(
                    product
                  );

                const rating =
                  getProductRating(
                    product
                  );

                return (
                  <article
                    className="ai-product-card"
                    key={
                      productId ||
                      `${product.name}-${index}`
                    }
                  >

                    {/* =====================================
                        AI RANK
                    ===================================== */}

                    <div className="ai-product-rank">
                      #{index + 1}
                    </div>

                    {index === 0 && (
                      <div className="ai-best-match">
                        ✨ Best Match
                      </div>
                    )}

                    {/* =====================================
                        PRODUCT IMAGE
                    ===================================== */}

                    <div className="ai-product-image-area">

                      {product.image ? (
                        <img
                          src={
                            product.image
                          }
                          alt={
                            product.name
                          }
                          className="ai-product-image"
                          onError={
                            handleAIImageError
                          }
                        />
                      ) : null}

                      <div
                        className="ai-product-image-fallback"
                        style={{
                          display:
                            product.image
                              ? "none"
                              : "flex",
                        }}
                      >
                        <span>
                          {product.icon ||
                            "🛍️"}
                        </span>
                      </div>

                    </div>

                    {/* =====================================
                        PRODUCT DETAILS
                    ===================================== */}

                    <div className="ai-product-content">

                      <span className="ai-product-category">
                        {product.category ||
                          "Product"}
                      </span>

                      <h3>
                        {product.name}
                      </h3>

                      <div className="ai-product-rating">
                        ⭐{" "}

                        <strong>
                          {rating.toFixed(
                            1
                          )}
                        </strong>

                        <span>
                          / 5
                        </span>
                      </div>

                      <p className="ai-product-description">
                        {product.description ||
                          "Recommended by ShopMind AI based on your shopping requirements."}
                      </p>

                      <div className="ai-product-price">
                        ₹
                        {formatPrice(
                          price
                        )}
                      </div>

                      {/* ===================================
                          STOCK
                      =================================== */}

                      <div
                        className={
                          stock > 0
                            ? "ai-stock in-stock"
                            : "ai-stock out-stock"
                        }
                      >
                        {stock > 0
                          ? `✓ In Stock (${stock})`
                          : "Out of Stock"}
                      </div>

                      {/* ===================================
                          MATCH REASONS
                      =================================== */}

                      {product.aiReasons &&
                        product
                          .aiReasons
                          .length >
                          0 && (
                          <div className="ai-match-reasons">

                            <strong>
                              {t.whyMatch}
                            </strong>

                            <ul>
                              {product.aiReasons
                                .slice(
                                  0,
                                  4
                                )
                                .map(
                                  (
                                    reason
                                  ) => (
                                    <li
                                      key={
                                        reason
                                      }
                                    >
                                      ✓{" "}
                                      {getReasonText(
                                        reason
                                      )}
                                    </li>
                                  )
                                )}
                            </ul>

                          </div>
                        )}

                      {/* ===================================
                          AI MATCH SCORE
                      =================================== */}

                      <div className="ai-score-box">

                        <span>
                          AI Match
                        </span>

                        <strong>
                          {Math.max(
                            0,
                            Math.round(
                              product.aiScore
                            )
                          )}
                        </strong>

                      </div>

                      {/* ===================================
                          ACTION BUTTONS
                      =================================== */}

                      <div className="ai-product-actions">

                        <button
                          type="button"
                          className="ai-view-button"
                          onClick={() => {
                            if (
                              typeof onViewProduct ===
                              "function"
                            ) {
                              onViewProduct(
                                product
                              );
                            }
                          }}
                        >
                          👁️{" "}
                          {t.viewDetails}
                        </button>

                        <button
                          type="button"
                          className="ai-cart-button"
                          disabled={
                            stock <= 0
                          }
                          onClick={() => {
                            if (
                              typeof onAddToCart ===
                              "function"
                            ) {
                              onAddToCart(
                                product
                              );
                            }
                          }}
                        >
                          {stock <= 0
                            ? "Out of Stock"
                            : t.addToCart}
                        </button>

                      </div>

                    </div>

                  </article>
                );
              }
            )}

          </div>
        )}

        {/* =================================================
            MULTILINGUAL INFORMATION
        ================================================= */}

        <div className="ai-language-info">

          <span>
            🌐
          </span>

          <p>
            {language === "or"
              ? "ShopMind AI ସହିତ ଓଡ଼ିଆରେ type କିମ୍ବା voice ରେ ଆପଣଙ୍କ shopping requirement କୁହନ୍ତୁ।"
              : language === "hi"
              ? "ShopMind AI को हिंदी में टाइप करके या आवाज़ से अपनी खरीदारी की आवश्यकता बताएं।"
              : "Type or use your voice to tell ShopMind AI what you're looking for."}
          </p>

        </div>

      </div>
    </section>
  );
}

export default AIShoppingAssistant;