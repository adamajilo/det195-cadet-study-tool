
const SCHED = [
  { w: 1, d: "2026-10-01", t: "Test 1", f: "Det Leadership, POC Ranks, Basic Responses" },
  { w: 2, d: "2026-10-08", t: "Test 2", f: "Enlisted/Officer Ranks" },
  { w: 3, d: "2026-10-15", t: "Test 3", f: "Honor Code, Core Values, Missions, Phonetic Alphabet" },
  { w: 4, d: "2026-10-22", t: "Test 4", f: "Air Force & Space Force Songs, US Adversaries" },
  { w: 5, d: "2026-10-29", t: "MIDTERM", f: "Cumulative review of Weeks 1–4", big: 1 },
  { w: 6, d: "2026-11-05", t: "Test 6", f: "Counseling Levels, National Chain of Command" },
  { w: 7, d: "2026-11-12", t: "Test 7", f: "Foundational Competencies, Key AFIs, Code of Conduct (Art. I–III)" },
  { w: 8, d: "2026-11-19", t: "Test 8", f: "Airman's Creed" },
  { w: 0, d: "2026-11-26", t: "NO LLAB", f: "Thanksgiving Break" },
  { w: 9, d: "2026-12-03", t: "FINAL", f: "Comprehensive, all material Weeks 1–8", big: 1 }
];

const WEEKS = [1, 2, 3, 4, 6, 7, 8];

const C = [];
let TERM = "Fall";
const TERM_LABEL = { Fall: "Fall 2026", Spring: "Spring 2027" };

const add = (w, g, list, kind) =>
  list.forEach(([q, a]) => C.push({ w, g, q, a, kind: kind || "", term: TERM }));

// WEEK 1

add(1, "Det 195 Leadership", [
  ["Det 195 Commander", "Lieutenant Colonel Andrew Metelko"],
  ["Director of Operations", "Major Alec Dinh"],
  ["Operations Flight Commander", "Captain Jacob Barnhorst"],
  ["Personnel NCOIC", "Tech Sergeant Mikail Gordon"],
  ["Administration NCOIC", "Staff Sergeant Alexandria Burton"],
  ["Cadet Wing Commander (CW/CC)", "Cadet Colonel Firas Hashmi"],
  ["Cadet Vice Wing Commander (CW/CV)", "Cadet Colonel Kayla Newton"],
  ["A1 Commander / Director of Mission Support (DMS)", "Cadet Lieutenant Colonel Jeremiah So"],
  ["A3 Commander / Director of Operations (DO)", "Cadet Lieutenant Colonel Carlos Garcia"],
  ["A5 Commander / Director of Training Readiness (DTR)", "Cadet Lieutenant Colonel Brent Grafmuller"],
  ["Inspector General (IG)", "Cadet Lieutenant Colonel Mira"]
]);

add(1, "POC Ranks", [
  ["POC rank #1 (lowest)", "Cadet Second Lieutenant (C/2d Lt)"],
  ["POC rank #2", "Cadet First Lieutenant (C/1st Lt)"],
  ["POC rank #3", "Cadet Captain (C/Capt)"],
  ["POC rank #4", "Cadet Major (C/Maj)"],
  ["POC rank #5", "Cadet Lieutenant Colonel (C/Lt Col)"],
  ["POC rank #6 (highest)", "Cadet Colonel (C/Col)"]
]);

add(1, "Basic Responses", [
  ["How many basic responses are there?", "Seven"],
  ["Basic response when you have nothing to add but agreement", "Yes, Sir (Ma'am)"],
  ["Basic response that takes ownership with no explanation", "No excuse, Sir (Ma'am)"],
  ["Basic response to ask permission to speak a question", "Sir (Ma'am), may I ask a question?"],
  ["Basic response to ask permission to say something", "Sir (Ma'am), may I make a statement?"],
  ["Basic response when you didn't follow what was said", "Sir (Ma'am), I do not understand."],
  ["Basic response when you don't have the answer", "Sir (Ma'am), I do not know."]
]);

// WEEK 2

add(2, "AF Enlisted", [
  ["Air Force E-1", "Airman Basic (AB)"],
  ["Air Force E-2", "Airman (Amn)"],
  ["Air Force E-3", "Airman First Class (A1C)"],
  ["Air Force E-4", "Senior Airman (SrA)"],
  ["Air Force E-5", "Staff Sergeant (SSgt)"],
  ["Air Force E-6", "Technical Sergeant (TSgt)"],
  ["Air Force E-7", "Master Sergeant (MSgt)\n/ First Sergeant (E-7)*"],
  ["Air Force E-8", "Senior Master Sergeant (SMSgt)\n/ First Sergeant (E-8)*"],
  ["Air Force E-9", "Chief Master Sergeant (CMSgt)\n/ First Sergeant (E-9)* / Command Chief Master Sergeant (CCM)* / Chief Master Sergeant of the Air Force (CMSAF)*"]
]);

add(2, "SF Enlisted", [
  ["Space Force E-1", "Specialist 1 (Spc 1)"],
  ["Space Force E-2", "Specialist 2 (Spc 2)"],
  ["Space Force E-3", "Specialist 3 (Spc 3)"],
  ["Space Force E-4", "Specialist 4 (Spc 4)"],
  ["Space Force E-5", "Sergeant (Sgt)"],
  ["Space Force E-6", "Technical Sergeant (TSgt)"],
  ["Space Force E-7", "Master Sergeant (MSgt)"],
  ["Space Force E-8", "Senior Master Sergeant (SMSgt)"],
  ["Space Force E-9", "Chief Master Sergeant (CMSgt)\n/ Chief Master Sergeant of the Space Force (CMSSF)*"]
]);

add(2, "AF Officer", [
  ["O-1", "Second Lieutenant (2d Lt)"],
  ["O-2", "First Lieutenant (1st Lt)"],
  ["O-3", "Captain (Capt)"],
  ["O-4", "Major (Maj)"],
  ["O-5", "Lieutenant Colonel (Lt Col)"],
  ["O-6", "Colonel (Col)"],
  ["O-7", "Brigadier General (Brig Gen)"],
  ["O-8", "Major General (Maj Gen)"],
  ["O-9", "Lieutenant General (Lt Gen)"],
  ["O-10", "General (Gen)"]
]);

add(2, "SF Officer", [
  ["O-1", "Second Lieutenant (2d Lt)"],
  ["O-2", "First Lieutenant (1st Lt)"],
  ["O-3", "Captain (Capt)"],
  ["O-4", "Major (Maj)"],
  ["O-5", "Lieutenant Colonel (Lt Col)"],
  ["O-6", "Colonel (Col)"],
  ["O-7", "Brigadier General (Brig Gen)"],
  ["O-8", "Major General (Maj Gen)"],
  ["O-9", "Lieutenant General (Lt Gen)"],
  ["O-10", "General (Gen)"]
]);

// WEEK 3

add(3, "Missions", [
  ["Air Force Mission", "To fly, fight, and win… airpower, anytime, anywhere."],
  ["Holm Center Mission", "We build leaders."],
  ["Air Force ROTC Mission", "Develop Air and Space Force Leaders of Character whom we expect to fight and win our nation's wars."],
  ["Space Force Mission", "Secure our Nation's interests in, from, and to space."]
]);

add(3, "Honor Code & Core Values", [
  ["The Honor Code", "We will not lie, steal, or cheat, nor tolerate among us anyone who does."],
  ["Core Value #1", "Integrity first"],
  ["Core Value #2", "Service before self"],
  ["Core Value #3", "Excellence in all we do"]
]);

add(3, "Branch Roles", [
  ["US Army role", "Conducts land-based military operations and secures territory."],
  ["US Navy role", "Secures global maritime freedom; projects power through sea-based operations and global strike (nuclear) capabilities."],
  ["US Air Force role", "Maintains air and cyberspace superiority; provides global strike (nuclear) capabilities and strategic mobility."],
  ["US Marine Corps role", "Specializes in rapid response, expeditionary, and amphibious actions."],
  ["US Coast Guard role", "Enforces maritime law, conducts search and rescue, and maintains homeland security in coastal areas."],
  ["US Space Force role", "Manages military operations in space and protects US interests in space."]
]);

const PHONETIC = "Alpha Bravo Charlie Delta Echo Foxtrot Golf Hotel India Juliet Kilo Lima Mike November Oscar Papa Quebec Romeo Sierra Tango Uniform Victor Whiskey X-Ray Yankee Zulu".split(" ");

add(
  3,
  "Phonetic Alphabet",
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter, i) => [
    "Phonetic for " + letter,
    PHONETIC[i]
  ])
);

add(4, "Adversaries", [
  ["What regulation lists the US adversaries?", "Title 15 of the Code of Federal Regulations"],
  ["The six US adversaries listed in Title 15 CFR", "China (PRC), Russia, Iran, North Korea (DPRK), Venezuela, Cuba"],
  ["Per the 2024 Annual Estimate of the Strategic Security Environment, which adversary \"continues to dominate the strategic narrative\"?", "The People's Republic of China"],
  ["Source of the quote: China \"continues to dominate the strategic narrative\"", "The 2024 Annual Estimate of the Strategic Security Environment"]
]);

// WEEK 6

add(6, "Chain of Command", [
  ["President", "The Honorable Donald J. Trump"],
  ["Secretary of Defense", "The Honorable Pete Hegseth"],
  ["Secretary of the Air Force", "The Honorable Troy Meink"],
  ["Chairman of the Joint Chiefs of Staff", "General Dan Caine"],
  ["Chief of Staff of the Air Force", "General Kenneth S. Wilsbach"],
  ["Chief of Space Operations", "General Douglas Schiess"],
  ["Air Education and Training Command/CC", "Lieutenant General Clark J. Quinn"],
  ["Air Force Accessions Center/CC", "Major General Jeffrey W. Nelson"],
  ["Holm Center/CC", "Brigadier General Christopher Lay"],
  ["AFROTC/CC", "Colonel Michael G. Fleming"]
]);

add(6, "Counseling", [
  ["Counseling level 1 (least severe)", "Verbal Counseling (V)"],
  ["Counseling level 2", "Memorandum for Record (MFR)"],
  ["Counseling level 3", "Letter of Counseling (LOC)"],
  ["Counseling level 4", "Letter of Admonition (LOA)"],
  ["Counseling level 5 (most severe)", "Letter of Reprimand (LOR)"],
  ["Given on the spot, no paperwork required, noted in the discipline tracker", "Verbal Counseling (V)"],
  ["Cadet writes it, references the relevant AFI section(s), due one week after being assigned", "Memorandum for Record (MFR)"],
  ["Written by the supervisor for a recurring mistake; supervisor holds a face-to-face to review and approve it", "Letter of Counseling (LOC)"],
  ["Written by the IG, given in the presence of the CW/CC and/or CV", "Letter of Admonition (LOA)"],
  ["Wing Commander use only; cadet signs it at a meeting with the Ops Officer, CW/CC, CV, and IG", "Letter of Reprimand (LOR)"]
]);

add(6, "AF History", [
  ["The USAF originated as what organization (and year)?", "The Aeronautical Division of the Signal Corps, US Army, 1907"],
  ["Year the Army Air Forces formed", "1941"],
  ["Law that created the US Air Force as a separate branch", "The National Security Act of 1947"],
  ["Date the USAF became a separate branch", "September 18, 1947"],
  ["Two Cold War capabilities the USAF developed", "Nuclear deterrence and air superiority"]
]);

// WEEK 7

add(7, "Competencies", [
  ["Define competencies", "A combination of knowledge, skills, and abilities that manifest in patterns of behavior. Foundational competencies are universally applicable to all Airmen."],
  ["The four Foundational Competency categories", "Developing Self, Developing Others, Developing Ideas, Developing Organizations"]
]);

add(7, "AFIs", [
  ["AFI 36-2903", "Uniform appearance and grooming standards for Air Force personnel"],
  ["AFI 36-2905", "The USAF fitness program and how it should be implemented"],
  ["AFI 36-2618", "The USAF Enlisted force structure, including expectations/responsibilities for each rank"]
]);

add(7, "Code of Conduct", [
  ["Code of Conduct Article I", "I am an American, fighting in the forces which guard my country and our way of life. I am prepared to give my life in their defense."],
  ["Code of Conduct Article II", "I will never surrender of my own free will. If in command, I will never surrender the members of my command while they still have the means to resist."],
  ["Code of Conduct Article III", "If I am captured, I will continue to resist by all means available. I will make every effort to escape and aid others to escape. I will accept neither parole nor special favors from the enemy."]
]);

// WEEK 8

add(8, "ACE", [
  ["What is Agile Combat Employment (ACE)?", "A doctrinal strategy designed to increase the survivability and effectiveness of the USAF in highly contested environments."],
  ["The five key elements of ACE", "Disperse Operations, Rapid Mobility, Multi-Capable Airmen, Prepositioned Equipment, Command and Control Flexibility"],
  ["How does ACE complicate enemy planning?", "Principally through force decentralization, increasing survivability where traditional base operations may be at risk"]
]);

add(8, "Creed", [
  ["Airman's Creed: how does every paragraph begin?", "I am an American Airman."],
  ["Airman's Creed: \"My mission is to…\"", "fly, fight, and win."],
  ["Airman's Creed: \"My nation's sword and shield, its…\"", "sentry and avenger."],
  ["Airman's Creed: final three lines", "I will never leave an Airman behind,\nI will never falter,\nAnd I will not fail!"]
]);

// CHINESE VOCABULARY

[
  [1, [
    ["Hello", "你好", "Nǐ hǎo"],
    ["Goodbye", "再见", "Zàijiàn"],
    ["Thank you", "谢谢", "Xièxiè"],
    ["Please", "请", "Qǐng"],
    ["You're welcome (full vocab list)", "不客气", "Bú kèqi"]
  ]],
  [2, [
    ["How are you?", "你好吗？", "Nǐ hǎo ma?"],
    ["I'm fine / I'm good", "我很好", "Wǒ hěn hǎo"],
    ["Yes", "是", "Shì"],
    ["No", "不是", "Bú shì"]
  ]],
  [3, [
    ["My name is…", "我叫…", "Wǒ jiào…"],
    ["What is your name?", "你叫什么名字？", "Nǐ jiào shénme míngzi?"],
    ["Nice to meet you", "很高兴认识你", "Hěn gāoxìng rènshi nǐ"]
  ]],
  [4, [
    ["Sorry", "对不起", "Duìbùqǐ"],
    ["Excuse me", "不好意思", "Bù hǎoyìsi"],
    ["I don't understand", "我不明白", "Wǒ bù míngbái"],
    ["Good morning", "早上好", "Zǎoshang hǎo"],
    ["Good evening", "晚上好", "Wǎnshang hǎo"]
  ]],
  [6, [
    ["1", "一", "yī"],
    ["2", "二", "èr"],
    ["3", "三", "sān"],
    ["4", "四", "sì"],
    ["5", "五", "wǔ"]
  ]],
  [7, [
    ["6", "六", "liù"],
    ["7", "七", "qī"],
    ["8", "八", "bā"],
    ["9", "九", "jiǔ"],
    ["10", "十", "shí"]
  ]],
  [8, [
    ["Where is the bathroom?", "洗手间在哪里？", "Xǐshǒujiān zài nǎlǐ?"],
    ["How much is this?", "多少钱？", "Duōshǎo qián?"],
    ["Can you speak English?", "你会说英语吗？", "Nǐ huì shuō yīngyǔ ma?"],
    ["I can't speak Chinese", "我不会说中文", "Wǒ bú huì shuō zhōngwén"]
  ]]
].forEach(([w, list]) =>
  list.forEach(([en, zh, py]) =>
    C.push({
      w,
      g: "Chinese",
      q: en,
      a: zh + "\n" + py,
      kind: "zh"
    })
  )
);

// AIRCRAFT

add(8, "Aircraft", [
  ["F-15/E/EX", "Eagle / Strike Eagle / Eagle II · Air superiority/multirole"],
  ["F-16", "Fighting Falcon · Multirole"],
  ["F-22", "Raptor · Stealth air superiority"],
  ["F-35", "Lightning II · Stealth multirole"],
  ["A-10", "Thunderbolt II · Ground attack/CAS"],
  ["AC-130J", "Ghostrider · Ground attack/CAS"],
  ["B-1", "Lancer · Strategic bomber"],
  ["B-2", "Spirit · Stealth strategic bomber"],
  ["B-52", "Stratofortress · Strategic bomber"],
  ["E-3", "Sentry · AWACS"],
  ["E-4", "Nightwatch · Command and control"],
  ["EC-130H/J", "Compass Call / Commando Solo · Electronic warfare"],
  ["EA-37B", "Compass Call · Electronic warfare"],
  ["RC-135", "Rivet Joint · ISR"],
  ["U-2", "Dragon Lady · ISR"],
  ["U-28A", "Draco · ISR/transport"],
  ["MC-12W", "Liberty · ISR"],
  ["KC-46", "Pegasus · Aerial refueling"],
  ["KC-135", "Stratotanker · Aerial refueling"],
  ["HC-130J", "Super Hercules · SAR/transport/tanker"],
  ["MC-130J", "Commando · Electronic warfare/transport/tanker"],
  ["C-130H/J", "Hercules / Super Hercules · Transport/airlift"],
  ["C-17", "Globemaster III · Strategic airlift"],
  ["C-5", "Galaxy · Strategic airlift"],
  ["HH-60W", "Jolly Green II · CSAR"],
  ["UH-1N", "Huey · Utility"],
  ["CV-22B", "Osprey · Special Operations"],
  ["MQ-9", "Reaper · Multi-mission UAV"],
  ["RQ-4", "Global Hawk · ISR UAV"],
  ["RQ-170", "Sentinel · ISR UAV"]
], "ac");

// RECITATION SETS

const R = [
  {
    w: 1,
    t: "Seven Basic Responses",
    l: [
      "Yes, Sir (Ma'am)",
      "No, Sir (Ma'am)",
      "No excuse, Sir (Ma'am)",
      "Sir (Ma'am), may I ask a question?",
      "Sir (Ma'am), may I make a statement?",
      "Sir (Ma'am), I do not understand.",
      "Sir (Ma'am), I do not know."
    ]
  },
  {
    w: 1,
    t: "POC Ranks (lowest to highest)",
    l: [
      "Cadet Second Lieutenant (C/2d Lt)",
      "Cadet First Lieutenant (C/1st Lt)",
      "Cadet Captain (C/Capt)",
      "Cadet Major (C/Maj)",
      "Cadet Lieutenant Colonel (C/Lt Col)",
      "Cadet Colonel (C/Col)"
    ]
  },
  {
    w: 2,
    t: "Air Force Enlisted Ranks",
    l: C.filter(c => c.g === "AF Enlisted")
      .map(c => c.q.replace("Air Force ", "") + ": " + c.a.split("\n")[0])
  },
  {
    w: 2,
    t: "Space Force Enlisted Ranks",
    l: C.filter(c => c.g === "SF Enlisted")
      .map(c => c.q.replace("Space Force ", "") + ": " + c.a.split("\n")[0])
  },
  {
    w: 2,
    t: "Air Force Officer Ranks",
    l: C.filter(c => c.g === "AF Officer")
      .map(c => c.q + ": " + c.a)
  },
  {
    w: 2,
    t: "Space Force Officer Ranks",
    l: C.filter(c => c.g === "SF Officer")
      .map(c => c.q + ": " + c.a)
  },
  {
    w: 3,
    t: "Missions",
    l: C.filter(c => c.g === "Missions")
      .map(c => c.q + ": " + c.a)
  },
  {
    w: 3,
    t: "Honor Code",
    l: [
      "We will not lie, steal, or cheat,",
      "nor tolerate among us anyone who does."
    ]
  },
  {
    w: 3,
    t: "Core Values",
    l: [
      "Integrity first",
      "Service before self",
      "Excellence in all we do"
    ]
  },
  {
    w: 3,
    t: "NATO Phonetic Alphabet",
    l: PHONETIC
  },
  {
    w: 4,
    t: "Air Force Song (first verse)",
    l: SONGS.af
  },
  {
    w: 4,
    t: "Space Force Song",
    l: SONGS.sf
  },
  {
    w: 6,
    t: "National Chain of Command",
    l: C.filter(c => c.g === "Chain of Command")
      .map(c => c.q + ": " + c.a)
  },
  {
    w: 6,
    t: "Counseling Levels",
    l: [
      "1. Verbal Counseling (V)",
      "2. Memorandum for Record (MFR)",
      "3. Letter of Counseling (LOC)",
      "4. Letter of Admonition (LOA)",
      "5. Letter of Reprimand (LOR)"
    ]
  },
  {
    w: 7,
    t: "Code of Conduct (Articles I–III)",
    l: [
      "#Article I",
      "I am an American, fighting in the forces which guard my country and our way of life.",
      "I am prepared to give my life in their defense.",
      "#Article II",
      "I will never surrender of my own free will.",
      "If in command, I will never surrender the members of my command while they still have the means to resist.",
      "#Article III",
      "If I am captured, I will continue to resist by all means available.",
      "I will make every effort to escape and aid others to escape.",
      "I will accept neither parole nor special favors from the enemy."
    ]
  },
  {
    w: 7,
    t: "Foundational Competencies",
    l: [
      "Developing Self",
      "Developing Others",
      "Developing Ideas",
      "Developing Organizations"
    ]
  },
  {
    w: 8,
    t: "Airman's Creed",
    l: [
      "#First Paragraph",
      "I am an American Airman.",
      "I am a Warrior.",
      "I have answered my nation's call.",
      "#Second Paragraph",
      "I am an American Airman.",
      "My mission is to fly, fight, and win.",
      "I am faithful to a proud heritage,",
      "A tradition of honor,",
      "And a legacy of valor.",
      "#Third Paragraph",
      "I am an American Airman.",
      "Guardian of freedom and justice,",
      "My nation's sword and shield,",
      "Its sentry and avenger.",
      "I defend my country with my life.",
      "#Fourth Paragraph",
      "I am an American Airman.",
      "Wingman, Leader, Warrior.",
      "I will never leave an Airman behind,",
      "I will never falter,",
      "And I will not fail!"
    ]
  },
  {
    w: 8,
    t: "ACE Key Elements",
    l: [
      "Disperse Operations",
      "Rapid Mobility",
      "Multi-Capable Airmen",
      "Prepositioned Equipment",
      "Command and Control Flexibility"
    ]
  }
];

// IMAGE MAPPINGS

const IMG = {
  "Chain of Command": {
    "President": "images/nationalcoc/president.webp",
    "Secretary of Defense": "images/nationalcoc/secdef.webp",
    "Secretary of the Air Force": "images/nationalcoc/secaf.webp",
    "Chairman of the Joint Chiefs of Staff": "images/nationalcoc/cjcs.webp",
    "Chief of Staff of the Air Force": "images/nationalcoc/csaf.webp",
    "Chief of Space Operations": "images/nationalcoc/cso.webp",
    "Air Education and Training Command/CC": "images/nationalcoc/aetc.webp",
    "Air Force Accessions Center/CC": "images/nationalcoc/accessions.webp",
    "Holm Center/CC": "images/nationalcoc/holm.webp",
    "AFROTC/CC": "images/nationalcoc/afrotc.webp"
  },

  "Chinese": {
  "My name is…": "images/nato/wojiao.webp"
},

  "POC Ranks": {
    "POC rank #1 (lowest)": {
      uurp: "images/pocrank/uurp/uurpc-2dlt.webp",
      erb: "images/pocrank/erb/erb-2dlt.webp"
    },
    "POC rank #2": {
      uurp: "images/pocrank/uurp/uurpc-1stlt.webp",
      erb: "images/pocrank/erb/erb-1stlt.webp"
    },
    "POC rank #3": {
      uurp: "images/pocrank/uurp/uurpc-capt.webp",
      erb: "images/pocrank/erb/erb-capt.webp"
    },
    "POC rank #4": {
      uurp: "images/pocrank/uurp/uurpc-maj.webp",
      erb: "images/pocrank/erb/erb-maj.webp"
    },
    "POC rank #5": {
      uurp: "images/pocrank/uurp/uurpc-ltcol.webp",
      erb: "images/pocrank/erb/erb-ltcol.webp"
    },
    "POC rank #6 (highest)": {
      uurp: "images/pocrank/uurp/uurpc-col.webp",
      erb: "images/pocrank/erb/erb-col.webp"
    }
  },

  "Phonetic Alphabet": {
    "Phonetic for A": "images/nato/alpha.webp",
    "Phonetic for B": "images/nato/bravo.webp",
    "Phonetic for C": "images/nato/charlie.webp",
    "Phonetic for D": "images/nato/delta.webp",
    "Phonetic for E": "images/nato/echo.webp",
    "Phonetic for F": "images/nato/foxtrot.webp",
    "Phonetic for G": "images/nato/golf.webp",
    "Phonetic for H": "images/nato/hotel.webp",
    "Phonetic for I": "images/nato/india.webp",
    "Phonetic for J": "images/nato/juliet.webp",
    "Phonetic for K": "images/nato/kilo.webp",
    "Phonetic for L": "images/nato/lima.webp",
    "Phonetic for M": "images/nato/mike.webp",
    "Phonetic for N": "images/nato/november.webp",
    "Phonetic for O": "images/nato/oscar.webp",
    "Phonetic for P": "images/nato/papa.webp",
    "Phonetic for Q": "images/nato/quebec.webp",
    "Phonetic for R": "images/nato/romeo.webp",
    "Phonetic for S": "images/nato/sierra.webp",
    "Phonetic for T": "images/nato/tango.webp",
    "Phonetic for U": "images/nato/uniform.webp",
    "Phonetic for V": "images/nato/victor.webp",
    "Phonetic for W": "images/nato/whiskey.webp",
    "Phonetic for X": "images/nato/xray.webp",
    "Phonetic for Y": "images/nato/yankee.webp",
    "Phonetic for Z": "images/nato/zulu.webp"
  },

  "AF Enlisted": {
    "Air Force E-1": "images/airforcerank/e1.webp",
    "Air Force E-2": "images/airforcerank/e2.webp",
    "Air Force E-3": "images/airforcerank/e3.webp",
    "Air Force E-4": "images/airforcerank/e4.webp",
    "Air Force E-5": "images/airforcerank/e5.webp",
    "Air Force E-6": "images/airforcerank/e6.webp",
    "Air Force E-7": "images/airforcerank/e7.webp",
    "Air Force E-8": "images/airforcerank/e8.webp",
    "Air Force E-9": [
      ["images/airforcerank/e9-cmsgt.webp", "Chief Master Sergeant"],
      ["images/airforcerank/e9-ccm.webp", "Command Chief Master Sergeant"],
      ["images/airforcerank/e9-cmsaf.webp", "Chief Master Sergeant of the Air Force"]
    ]
  },

  "SF Enlisted": {
    "Space Force E-1": "images/spaceforcerank/e1.webp",
    "Space Force E-2": "images/spaceforcerank/e2.webp",
    "Space Force E-3": "images/spaceforcerank/e3.webp",
    "Space Force E-4": "images/spaceforcerank/e4.webp",
    "Space Force E-5": "images/spaceforcerank/e5.webp",
    "Space Force E-6": "images/spaceforcerank/e6.webp",
    "Space Force E-7": "images/spaceforcerank/e7.webp",
    "Space Force E-8": "images/spaceforcerank/e8.webp",
    "Space Force E-9": [
      ["images/spaceforcerank/e9-cmsgt.webp", "Chief Master Sergeant"],
      ["images/spaceforcerank/e9-cmssf.webp", "Chief Master Sergeant of the Space Force"],
      ["images/spaceforcerank/e9-seac.webp", "Senior Enlisted Advisor to the Chairman"]
    ]
  },

  "AF Officer": {
    "O-1": "images/airforcerank/o1.webp",
    "O-2": "images/airforcerank/o2.webp",
    "O-3": "images/airforcerank/o3.webp",
    "O-4": "images/airforcerank/o4.webp",
    "O-5": "images/airforcerank/o5.webp",
    "O-6": "images/airforcerank/o6.webp",
    "O-7": "images/airforcerank/o7.webp",
    "O-8": "images/airforcerank/o8.webp",
    "O-9": "images/airforcerank/o9.webp",
    "O-10": "images/airforcerank/o10.webp"
  },

  "SF Officer": {
    "O-1": "images/spaceforcerank/o1.webp",
    "O-2": "images/spaceforcerank/o2.webp",
    "O-3": "images/spaceforcerank/o3.webp",
    "O-4": "images/spaceforcerank/o4.webp",
    "O-5": "images/spaceforcerank/o5.webp",
    "O-6": "images/spaceforcerank/o6.webp",
    "O-7": "images/spaceforcerank/o7.webp",
    "O-8": "images/spaceforcerank/o8.webp",
    "O-9": "images/spaceforcerank/o9.webp",
    "O-10": "images/spaceforcerank/o10.webp"
  },

  "Aircraft": {
  "F-15/E/EX": "images/aircraft/f-15-e-ex.webp",
  "F-16": "images/aircraft/f-16.webp",
  "F-22": "images/aircraft/f-22.webp",
  "F-35": "images/aircraft/f-35.webp",
  "A-10": "images/aircraft/a-10.webp",
  "AC-130J": "images/aircraft/ac-130j.webp",
  "B-1": "images/aircraft/b-1.webp",
  "B-2": "images/aircraft/b-2.webp",
  "B-52": "images/aircraft/b-52.webp",
  "E-3": "images/aircraft/e-3.webp",
  "E-4": "images/aircraft/e-4.webp",
  "EC-130H/J": "images/aircraft/ec-130h-j.webp",
  "EA-37B": "images/aircraft/ea-37b.webp",
  "RC-135": "images/aircraft/rc-135.webp",
  "U-2": "images/aircraft/u-2.webp",
  "U-28A": "images/aircraft/u-28a.webp",
  "MC-12W": "images/aircraft/mc-12w.webp",
  "KC-46": "images/aircraft/kc-46.webp",
  "KC-135": "images/aircraft/kc-135.webp",
  "HC-130J": "images/aircraft/hc-130j.webp",
  "MC-130J": "images/aircraft/mc-130j.webp",
  "C-130H/J": "images/aircraft/c-130h-j.webp",
  "C-17": "images/aircraft/c-17.webp",
  "C-5": "images/aircraft/c-5.webp",
  "HH-60W": "images/aircraft/hh-60w.webp",
  "UH-1N": "images/aircraft/uh-1n.webp",
  "CV-22B": "images/aircraft/cv-22b.webp",
  "MQ-9": "images/aircraft/mq-9.webp",
  "RQ-4": "images/aircraft/rq-4.webp",
  "RQ-170": "images/aircraft/rq-170.webp"
 }
};
