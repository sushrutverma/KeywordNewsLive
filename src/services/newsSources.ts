export interface NewsSource {
  name: string;
  url: string;
  category: string; // Mapped to Topic ID
  isIndian: boolean; // Flag to identify region (India vs World)
  richContent: boolean; // Flag to identify long-form/editorial analytical content
}

export interface Topic {
  id: string;
  name: string;
  description: string;
}

export const topics: Topic[] = [
  {
    id: "daily-news",
    name: "Daily News",
    description: "Top headlines, national, regional, and international stories."
  },
  {
    id: "upsc-policy",
    name: "UPSC & Policy",
    description: "Editorials, current affairs, policy analysis, economics, and environmental updates."
  },
  {
    id: "tech-design",
    name: "Tech & Design",
    description: "Tech policy, hardware, developer updates, and web design articles."
  },
  {
    id: "mens-style",
    name: "Men's Style",
    description: "Classic menswear, tailoring guides, grooming tips, and fragrance news."
  },
  {
    id: "running-fitness",
    name: "Running & Fitness",
    description: "Running gear, marathon training, physiology, and sports tech."
  },
  {
    id: "photography-video",
    name: "Photography & Video",
    description: "Camera hardware reviews, editing workflows, and filmmaking gear."
  },
  {
    id: "sports-auto",
    name: "Sports & Auto",
    description: "Cricket coverage, automotive news, and motorcycle reviews."
  }
];

export const news_sources: NewsSource[] = [
  // 1. Daily News (Mainstream news publications)
  {
    name: "The Hindu",
    url: "https://www.thehindu.com/feeder/default.rss",
    category: "daily-news",
    isIndian: true,
    richContent: true
  },
  {
    name: "Times of India",
    url: "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
    category: "daily-news",
    isIndian: true,
    richContent: false
  },
  {
    name: "The Indian Express",
    url: "https://indianexpress.com/feed/",
    category: "daily-news",
    isIndian: true,
    richContent: true
  },
  {
    name: "Dainik Bhaskar",
    url: "https://www.bhaskar.com/rss-v1/category/1012.xml",
    category: "daily-news",
    isIndian: true,
    richContent: false
  },
  {
    name: "The Guardian",
    url: "https://www.theguardian.com/world/rss",
    category: "daily-news",
    isIndian: false,
    richContent: true
  },
  {
    name: "NDTV News",
    url: "https://feeds.feedburner.com/ndtvnews-top-stories",
    category: "daily-news",
    isIndian: true,
    richContent: false
  },
  {
    name: "Aaj Tak",
    url: "https://www.aajtak.in/rssfeeds/?id=home",
    category: "daily-news",
    isIndian: true,
    richContent: false
  },

  // 2. UPSC & Policy (Analytical & Policy updates)
  {
    name: "Press Information Bureau (PIB)",
    url: "https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3",
    category: "upsc-policy",
    isIndian: true,
    richContent: false
  },
  {
    name: "PRS Legislative Research",
    url: "https://prsindia.org/rss.xml",
    category: "upsc-policy",
    isIndian: true,
    richContent: true
  },
  {
    name: "IPRD Bihar",
    url: "https://iprdbihar.blogspot.com/feeds/posts/default",
    category: "upsc-policy",
    isIndian: true,
    richContent: false
  },
  {
    name: "Scroll.in",
    url: "https://scroll.in/feed",
    category: "upsc-policy",
    isIndian: true,
    richContent: true
  },
  {
    name: "The Wire",
    url: "https://thewire.in/rss",
    category: "upsc-policy",
    isIndian: true,
    richContent: true
  },
  {
    name: "The Print",
    url: "https://theprint.in/feed/",
    category: "upsc-policy",
    isIndian: true,
    richContent: true
  },
  {
    name: "The Economist",
    url: "https://www.economist.com/latest/rss.xml",
    category: "upsc-policy",
    isIndian: false,
    richContent: true
  },
  {
    name: "South Asia Monitor",
    url: "https://southasiamonitor.org/rss.xml",
    category: "upsc-policy",
    isIndian: true,
    richContent: true
  },
  {
    name: "MP-IDSA",
    url: "https://www.idsa.in/rss.xml",
    category: "upsc-policy",
    isIndian: true,
    richContent: true
  },
  {
    name: "Observer Research Foundation (ORF)",
    url: "https://www.orfonline.org/feed",
    category: "upsc-policy",
    isIndian: true,
    richContent: true
  },
  {
    name: "The Diplomat - South Asia",
    url: "https://thediplomat.com/regions/south-asia/feed/",
    category: "upsc-policy",
    isIndian: true,
    richContent: true
  },
  {
    name: "Institute of Peace and Conflict Studies (IPCS)",
    url: "http://www.ipcs.org/rss.xml",
    category: "upsc-policy",
    isIndian: true,
    richContent: true
  },
  {
    name: "Down To Earth Magazine",
    url: "https://www.downtoearth.org.in/rss/latest",
    category: "upsc-policy",
    isIndian: true,
    richContent: true
  },
  {
    name: "Economic and Political Weekly (EPW)",
    url: "https://www.epw.in/rss/epw_rss.xml",
    category: "upsc-policy",
    isIndian: true,
    richContent: true
  },
  {
    name: "Ideas for India (I4I)",
    url: "https://www.ideasforindia.in/rss.xml",
    category: "upsc-policy",
    isIndian: true,
    richContent: true
  },

  // 3. Tech & Design
  {
    name: "Ars Technica",
    url: "https://feeds.arstechnica.com/arstechnica/index",
    category: "tech-design",
    isIndian: false,
    richContent: true
  },
  {
    name: "The Verge",
    url: "https://www.theverge.com/rss/index.xml",
    category: "tech-design",
    isIndian: false,
    richContent: true
  },
  {
    name: "Hacker News",
    url: "https://hnrss.org/frontpage",
    category: "tech-design",
    isIndian: false,
    richContent: false
  },
  {
    name: "Smashing Magazine",
    url: "https://www.smashingmagazine.com/feed/",
    category: "tech-design",
    isIndian: false,
    richContent: true
  },

  // 4. Men's Style
  {
    name: "Permanent Style",
    url: "https://www.permanentstyle.com/feed",
    category: "mens-style",
    isIndian: false,
    richContent: true
  },
  {
    name: "Dappered",
    url: "https://dappered.com/feed/",
    category: "mens-style",
    isIndian: false,
    richContent: true
  },
  {
    name: "Ape to Gentleman",
    url: "https://www.apetogentleman.com/feed/",
    category: "mens-style",
    isIndian: false,
    richContent: true
  },
  {
    name: "Fragrantica News",
    url: "https://www.fragrantica.com/feed/",
    category: "mens-style",
    isIndian: false,
    richContent: true
  },

  // 5. Running & Fitness
  {
    name: "DC Rainmaker",
    url: "https://www.dcrainmaker.com/feed",
    category: "running-fitness",
    isIndian: false,
    richContent: true
  },
  {
    name: "Believe in the Run",
    url: "https://believeintherun.com/feed/",
    category: "running-fitness",
    isIndian: false,
    richContent: true
  },
  {
    name: "Runner's World",
    url: "https://www.runnersworld.com/rss/all.xml/",
    category: "running-fitness",
    isIndian: false,
    richContent: true
  },
  {
    name: "Stronger by Science",
    url: "https://www.strongerbyscience.com/feed/",
    category: "running-fitness",
    isIndian: false,
    richContent: true
  },

  // 6. Photography & Video
  {
    name: "PetaPixel",
    url: "https://petapixel.com/feed/",
    category: "photography-video",
    isIndian: false,
    richContent: true
  },
  {
    name: "DPReview",
    url: "https://www.dpreview.com/feeds/news.xml",
    category: "photography-video",
    isIndian: false,
    richContent: true
  },
  {
    name: "CineD",
    url: "https://www.cined.com/feed/",
    category: "photography-video",
    isIndian: false,
    richContent: true
  },

  // 7. Sports & Auto
  {
    name: "ESPN Cricinfo",
    url: "https://www.espncricinfo.com/rss/content/story/feeds/0.xml",
    category: "sports-auto",
    isIndian: false,
    richContent: false
  },
  {
    name: "MotorBeam",
    url: "https://www.motorbeam.com/feed/",
    category: "sports-auto",
    isIndian: true,
    richContent: false
  },
  {
    name: "Autocar India",
    url: "https://www.autocarindia.com/rss/news",
    category: "sports-auto",
    isIndian: true,
    richContent: false
  }
];
