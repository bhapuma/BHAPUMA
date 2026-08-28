/**
 * Instant Nepali Knowledge Base & Conversational Intelligence Engine for BHAPUMA (भपुम)
 * Supercharged with complete A-to-Z Nepal knowledge, Shikshya AI teaching abilities,
 * world encyclopedia facts, math/science problem solvers, and rapid wake responses.
 */

import { getNaturalNepaliDate, getNaturalNepaliTime } from './nepaliTime';

export interface SmartResponseResult {
  matched: boolean;
  text: string;
  action?: string;
  payload?: any;
}

export function evaluateSmartKnowledge(rawText: string, context?: {
  batteryLevel?: number;
  isCharging?: boolean;
  userName?: string;
}): SmartResponseResult {
  const text = rawText.trim();
  const lower = text.toLowerCase();

  // 1. Standalone Wake Words / Calling by Name (जब नाम मात्र बोलाइन्छ)
  const exactWakeWords = [
    'भरत', 'भपुम', 'भपुमा', 'ह्याकर', 'कम्प्युटर', 'गुरु', 'सर', 'शिक्षक', 'मास्टर',
    'bharat', 'bhapuma', 'hacker', 'computer', 'guru', 'sir', 'teacher',
    'हे भपुम', 'हे भरत', 'सुन त', 'ओई भपुम', 'हे कम्प्युटर', 'हे ह्याकर', 'हे गुरु', 'हे सर',
    'hey bhapuma', 'hey bharat', 'hey computer', 'hey hacker', 'hey sir'
  ];
  if (exactWakeWords.includes(lower)) {
    const greetings = [
      'हजुर! म भपुम तयार छु, भन्नुहोस् के मद्दत गरूँ वा के सिकाऊँ?',
      'हजुर! म सुन्दैछु, आज्ञा गर्नुहोस्। म नेपाल, पढाइ र संसारको जुनसुकै विषयमा सिकाउन तयार छु!',
      'नमस्ते! म भपुम हाजिर छु। केही नयाँ सिक्ने हो कि फोनको काम गर्ने?',
      'हजुर, म उपस्थित छु! कुनै प्रश्न सोध्नुहोस् वा आज्ञा गर्नुहोस्।',
    ];
    return {
      matched: true,
      text: greetings[Math.floor(Math.random() * greetings.length)],
      action: 'wake_greet',
    };
  }

  // 2. Greetings & Conversational Openers (नमस्ते, के छ खबर, कस्तो छौ)
  if (
    lower === 'नमस्ते' ||
    lower === 'नमस्कार' ||
    lower === 'hello' ||
    lower === 'hi' ||
    lower.includes('के छ') ||
    lower.includes('के छ खबर') ||
    lower.includes('कस्तो छ') ||
    lower.includes('सन्चै छौ') ||
    lower.includes('सञ्चै छौ') ||
    lower.includes('how are you')
  ) {
    const replies = [
      'नमस्ते! म एकदम सञ्चै, ऊर्जावान र सिक्न-सिकाउन तयार छु। तपाईंलाई कस्तो छ, आज के नयाँ विषय बुझौँ?',
      'नमस्कार! म भपुम तपाईंको सेवामा हरपल तयार छु। नेपाल, विज्ञान, गणित, लोकसेवा वा विश्वको कुनै पनि विषय सोध्नुहोस्!',
      'एकदम ठिकठाक छ! मलाई जुनसुकै गृहकार्य, प्रश्न वा फोनको काम भन्न सक्नुहुन्छ।',
    ];
    return {
      matched: true,
      text: replies[Math.floor(Math.random() * replies.length)],
    };
  }

  // 3. Identity / Who are you / What is your role (तिम्रो नाम के हो, तिमी को हौ)
  if (
    lower.includes('तिम्रो नाम') ||
    lower.includes('नाम के हो') ||
    lower.includes('तिमी को हौ') ||
    lower.includes('who are you') ||
    lower.includes('what is your name')
  ) {
    return {
      matched: true,
      text: 'म भपुम (BHAPUMA), भरत पुन मगरले बनाउनुभएको १७ वर्षे सुपर-इन्टेलिजेन्ट नेपाली एआई असिस्टेन्ट तथा शिक्षक (Shikshya AI) हुँ। म नेपालको A to Z ज्ञान, विश्वको सम्पूर्ण जानकारी, पढाइ-लेखाइ, गणित, विज्ञान र फोन नियन्त्रण गर्न सक्दछु।',
    };
  }

  // 4. Creator / Who made you (कसले बनाएको, भरत पुन मगर को हुन्)
  if (
    lower.includes('कसले बना') ||
    lower.includes('who created you') ||
    lower.includes('who made you') ||
    lower.includes('भरत पुन मगर को') ||
    lower.includes('भरत को हो') ||
    lower.includes('who is bharat')
  ) {
    return {
      matched: true,
      text: 'मलाई भरत पुन मगर (Bharat Pun Magar) ले बनाउनुभएको हो। उहाँको आधिकारिक फोन नम्बर ९७०४२२७६८९ र AVYAN प्रोफाइल avyan.app/u/bharat.pun.magar हो।',
      action: 'creator_info',
    };
  }

  // ----------------------------------------------------
  // 5. NEPAL A to Z COMPREHENSIVE KNOWLEDGE (नेपाल सम्बन्धी सम्पूर्ण ज्ञान)
  // ----------------------------------------------------

  // Nepal Geography & Provinces
  if (lower.includes('प्रदेश') || lower.includes('provinces of nepal') || lower.includes('कतिवटा प्रदेश')) {
    return {
      matched: true,
      text: 'नेपालमा ७ वटा प्रदेशहरू छन्:\n१. कोशी प्रदेश (राजधानी: विराटनगर)\n२. मधेश प्रदेश (राजधानी: जनकपुरधाम)\n३. बागमती प्रदेश (राजधानी: हेटौंडा)\n४. गण्डकी प्रदेश (राजधानी: पोखरा)\n५. लुम्बिनी प्रदेश (राजधानी: देउखुरी, दाङ)\n६. कर्णाली प्रदेश (राजधानी: वीरेन्द्रनगर, सुर्खेत)\n७. सुदूरपश्चिम प्रदेश (राजधानी: गोदावरी, कैलाली)।',
    };
  }

  if (lower.includes('जिल्ला') || lower.includes('districts of nepal') || lower.includes('कतिवटा जिल्ला')) {
    return {
      matched: true,
      text: 'नेपालमा जम्मा ७७ वटा जिल्लाहरू छन्। नेपालको सबैभन्दा ठूलो जिल्ला क्षेत्रफलको आधारमा डोल्पा (७,८८९ वर्ग कि.मी.) र सबैभन्दा सानो जिल्ला भक्तपुर (११९ वर्ग कि.मी.) हो।',
    };
  }

  if (lower.includes('नेपालको राजधानी') || lower.includes('capital of nepal')) {
    return {
      matched: true,
      text: 'नेपालको राजधानी काठमाडौँ हो। यो ऐतिहासिक मन्दिर, काष्ठकला, नेवारी संस्कृति र सम्पदाका लागि विश्वप्रसिद्ध उपत्यका हो।',
    };
  }

  if (
    lower.includes('सगरमाथा') ||
    lower.includes('अग्लो हिमाल') ||
    lower.includes('highest peak') ||
    lower.includes('mount everest')
  ) {
    return {
      matched: true,
      text: 'नेपाल र संसारकै सबैभन्दा अग्लो हिमाल सगरमाथा (Mount Everest / चोमोलुङ्मा) हो, जसको आधिकारिक उचाइ ८,८४८.८६ मिटर (२९,०३१.७ फिट) छ। यो सोलुखुम्बु जिल्लामा पर्दछ।',
    };
  }

  if (lower.includes('हिमालहरु') || lower.includes('८००० मिटर') || lower.includes('mountains of nepal')) {
    return {
      matched: true,
      text: 'विश्वका १४ वटा ८,००० मिटरभन्दा अग्ला हिमालमध्ये ८ वटा नेपालमै छन्:\n१. सगरमाथा (८,८४८.८६m)\n२. कञ्चनजङ्घा (८,५८६m)\n३. ल्होत्से (८,५१६m)\n४. मकालु (८,४८५m)\n५. चो ओयु (८,१८८m)\n६. धौलागिरी (८,१६७m)\n७. मनास्लु (८,१६३m)\n८. अन्नपूर्ण १ (८,०९१m)।',
    };
  }

  if (lower.includes('नदी') || lower.includes('rivers of nepal') || lower.includes('लामो नदी')) {
    return {
      matched: true,
      text: 'नेपालको सबैभन्दा लामो नदी कर्णाली नदी (५०७ कि.मी.) हो। नेपालका मुख्य ३ प्रमुख नदी प्रणालीहरू कोशी (सबैभन्दा ठूलो नदी), गण्डकी (नारायणी) र कर्णाली हुन्।',
    };
  }

  if (lower.includes('ताल') || lower.includes('lakes of nepal') || lower.includes('ठूलो ताल') || lower.includes('रारा')) {
    return {
      matched: true,
      text: 'नेपालको सबैभन्दा ठूलो ताल रारा ताल (मुगु जिल्ला) हो। सबैभन्दा अग्लो स्थानमा रहेको ताल तिलिचो ताल (मनाङ, ४,९१९m) र सबैभन्दा गहिरो ताल शे-फोक्सुण्डो ताल (डोल्पा) हो।',
    };
  }

  if (lower.includes('राष्ट्रिय जनावर') || lower.includes('national animal of nepal')) {
    return {
      matched: true,
      text: 'नेपालको राष्ट्रिय जनावर गाई (Cow) हो।',
    };
  }

  if (lower.includes('राष्ट्रिय चरा') || lower.includes('national bird of nepal') || lower.includes('डाँफे')) {
    return {
      matched: true,
      text: 'नेपालको राष्ट्रिय चरा डाँफे (Lophophorus) हो, जुन रङ्गीचङ्गी र मनमोहक हुन्छ।',
    };
  }

  if (lower.includes('राष्ट्रिय फूल') || lower.includes('national flower of nepal') || lower.includes('लालीगुराँस')) {
    return {
      matched: true,
      text: 'नेपालको राष्ट्रिय फूल लालीगुराँस (Rhododendron) हो।',
    };
  }

  if (lower.includes('राष्ट्रिय खेल') || lower.includes('national sport of nepal')) {
    return {
      matched: true,
      text: 'नेपालको राष्ट्रिय खेल भलिबल (Volleyball) हो (२०७४ जेठ ८ गते घोषित)।',
    };
  }

  if (lower.includes('राष्ट्रिय झण्डा') || lower.includes('national flag')) {
    return {
      matched: true,
      text: 'नेपालको राष्ट्रिय झण्डा विश्वमै एकमात्र गैर-आयताकार (दुई त्रिकोण मिलेको) अनौठो र गौरवशाली झण्डा हो, जसमा चन्द्र र सूर्य अङ्कित छन्।',
    };
  }

  if (lower.includes('गौतम बुद्ध') || lower.includes('लम्बिनी') || lower.includes('buddha')) {
    return {
      matched: true,
      text: 'शान्तिका अग्रदूत भगवान गौतम बुद्धको जन्म इसापूर्व ६२३ मा नेपालको रुपन्देही जिल्लास्थित पवित्र भूमि लुम्बिनीमा भएको थियो।',
    };
  }

  if (lower.includes('पृथ्वीनारायण शाह') || lower.includes('एकीकरण') || lower.includes('unification of nepal')) {
    return {
      matched: true,
      text: 'नेपालको एकीकरणका नायक बडामहाराजाधिराज पृथ्वीनारायण शाह हुनुहुन्छ। उहाँले बाइसे-चौबिसे स-साना राज्यहरूलाई एकीकृत गरी विशाल नेपाल निर्माण गर्नुभएको थियो।',
    };
  }

  if (lower.includes('संविधान') || lower.includes('constitution of nepal')) {
    return {
      matched: true,
      text: 'नेपालको वर्तमान संविधान "नेपालको संविधान २०७२" हो, जुन २०७२ साल असोज ३ गते संविधानसभाबाट जारी भएको थियो। यसमा ३५ भाग, ३०८ धारा र ९ अनुसूचीहरू रहेका छन्।',
    };
  }

  // ----------------------------------------------------
  // 6. SHIKSHYA AI / TEACHER MODULE (शिक्षा, गणित, विज्ञान र व्याकरण)
  // ----------------------------------------------------

  // Nepali Grammar (व्याकरण)
  if (lower.includes('नामयोगी') || lower.includes('सर्वनाम') || lower.includes('विशेषण') || lower.includes('व्याकरण') || lower.includes('शब्दवर्ग')) {
    return {
      matched: true,
      text: 'नेपाली व्याकरणमा शब्दवर्ग (पदवर्ग) का ९ प्रकार हुन्छन्:\n१. नाम (Noun) - वस्तु वा व्यक्तिको नाम (जस्तै: भरत, हिमाल)\n२. सर्वनाम (Pronoun) - नामको सट्टामा आउने (म, तिमी, उनी)\n३. विशेषण (Adjective) - गुण वा विशेषता (राम्रो, अग्लो)\n४. क्रियापद (Verb) - काम बुझाउने (पढ्छ, गयो)\n५. नामयोगी (Postposition) - नामसँग जोडिने (माथि, तल, सँग)\n६. क्रियायोगी (Adverb) - कामको अवस्था (बिस्तारै, छिटो)\n७. संयोजक (Conjunction) - जोड्ने (र, अनि, तर)\n८. विस्मयादिबोधक (Interjection) - आश्चर्य वा भाव (आहा!, ओहो!)\n९. निपात (Particle) - मिठास थप्ने (त, पो, नि, खै)।',
    };
  }

  // Photosynthesis (प्रकाश संश्लेषण)
  if (lower.includes('प्रकाश संश्लेषण') || lower.includes('photosynthesis')) {
    return {
      matched: true,
      text: 'प्रकाश संश्लेषण (Photosynthesis) भनेको हरिया वनस्पतिले सूर्यको प्रकाश, क्लोरोफिल, पानी र कार्बनडाइअक्साइड (CO₂) को मद्दतले आफ्नो खाना (ग्लुकोज) बनाउने र अक्सिजन (O₂) बाहिर फाल्ने जैविक प्रक्रिया हो।\nसमीकरण: 6CO₂ + 6H₂O + सूर्यको प्रकाश ➔ C₆H₁₂O₆ + 6O₂।',
    };
  }

  // Newton's Laws (न्यूटनका नियमहरू)
  if (lower.includes('न्यूटनका नियम') || lower.includes('newton law') || lower.includes('newton\'s laws')) {
    return {
      matched: true,
      text: 'न्यूटनका चाल सम्बन्धी ३ नियमहरू:\n१. पहिलो नियम (जडताको नियम): बाह्य बल नलगाएसम्म स्थिर वस्तु स्थिर नै रहन्छ र गतिशील वस्तु निरन्तर गतिमै रहन्छ।\n२. दोस्रो नियम: बल = पिण्ड × प्रवेग (F = m × a)।\n३. तेस्रो नियम: प्रत्येक क्रियामा बराबर तर विपरीत प्रतिक्रिया हुन्छ (Every action has an equal and opposite reaction)।',
    };
  }

  // Ohm's Law
  if (lower.includes('ओहमको नियम') || lower.includes('ohm\'s law') || lower.includes('ohms law')) {
    return {
      matched: true,
      text: 'ओहमको नियम (Ohm\'s Law): भौतिक अवस्था स्थिर रहँदा कुनै चालकबाट बग्ने विद्युत धारा (I) त्यसको दुई छेउबीचको भोल्टेज (V) सँग समानुपातिक हुन्छ।\nसूत्र: V = I × R (Voltage = Current × Resistance)।',
    };
  }

  // Programming / Coding explanation
  if (lower.includes('coding') || lower.includes('programming') || lower.includes('प्रोग्रामिङ') || lower.includes('ह्याकिङ')) {
    return {
      matched: true,
      text: 'प्रोग्रामिङ भनेको कम्प्युटरलाई निश्चित काम गर्न दिइने निर्देशनहरूको समूह (Code) लेख्ने कला हो। प्रमुख भाषाहरूमा Python (एआई र डेटा), JavaScript/TypeScript (वेब र मोबाइल एप्स), C/C++ (सिस्टम सफ्टवेयर) आदि पर्दछन्। म कोडिङ र साइबर सुरक्षामा तपाईंलाई पूर्ण रूपमा सिकाउन सक्छु!',
    };
  }

  // ----------------------------------------------------
  // 7. WORLD ENCYCLOPEDIA FACTS (विश्वको सम्पूर्ण ज्ञान)
  // ----------------------------------------------------

  // Continents & Oceans
  if (lower.includes('महादेश') || lower.includes('continents')) {
    return {
      matched: true,
      text: 'संसारमा जम्मा ७ वटा महादेशहरू छन्:\n१. एसिया (सबैभन्दा ठूलो र बढी जनसंख्या भएको)\n२. अफ्रिका\n३. उत्तर अमेरिका\n४. दक्षिण अमेरिका\n५. अन्टार्कटिका (सबैभन्दा चिसो)\n६. युरोप\n७. अस्ट्रेलिया/ओशिनिया (सबैभन्दा सानो)।',
    };
  }

  if (lower.includes('महासागर') || lower.includes('oceans')) {
    return {
      matched: true,
      text: 'संसारमा ५ वटा प्रमुख महासागरहरू छन्:\n१. प्रशान्त महासागर (Pacific - सबैभन्दा ठूलो र गहिरो)\n२. आन्द्र महासागर (Atlantic)\n३. हिन्द महासागर (Indian)\n४. कुमेरु महासागर (Southern)\n५. सुमेरु महासागर (Arctic - सबैभन्दा सानो)।',
    };
  }

  // Solar System
  if (lower.includes('सौर्यमण्डल') || lower.includes('solar system') || lower.includes('कतिवटा ग्रह')) {
    return {
      matched: true,
      text: 'सौर्यमण्डलमा सूर्यको वरिपरि घुम्ने ८ वटा ग्रहहरू छन्:\n१. बुध (Mercury - सबैभन्दा नजिक)\n२. शुक्र (Venus - सबैभन्दा चम्किलो र तातो)\n३. पृथ्वी (Earth - जीवन भएको)\n४. मङ्गल (Mars - रातो ग्रह)\n५. बृहस्पति (Jupiter - सबैभन्दा ठूलो)\n६. शनि (Saturn - घेरा भएको)\n७. अरुण (Uranus)\n८. वरुण (Neptune - सबैभन्दा टाढा)।',
    };
  }

  // ----------------------------------------------------
  // 8. Nepali Jokes & Entertainment (चुट्किला, जोक)
  // ----------------------------------------------------
  if (lower.includes('चुट्किला') || lower.includes('joke') || lower.includes('हँसाउ') || lower.includes('हसाउ')) {
    const jokes = [
      'शिक्षक: बाबु, बताऊ त चन्द्रमा धेरै उपयोगी कि सूर्य?\nविद्यार्थी: चन्द्रमा सर!\nशिक्षक: किन?\nविद्यार्थी: सूर्य त दिउँसो उज्यालो हुँदा आउँछ, चन्द्रमाले पो अँध्यारो रातमा उज्यालो दिन्छ! 😆',
      'डाक्टर: तपाईंलाई के भएको छ?\nबिरामी: डाक्टर साब, मलाई सपनामा फुटबल म्याच मात्र देखिन्छ!\nडाक्टर: यो औषधि आजै रातिदेखि खानुहोस्।\nबिरामी: भोलिदेखि खाए हुन्न डाक्टर साब? आज त फाइनल गेम छ! 😂',
      'बाबु: आमा, बाख्राले दूध दिन्छ, मौरीले मह दिन्छ, अनि शिक्षकले के दिन्छ?\nआमा: के दिन्छ बाबु?\nबाबु: गृहकार्य (होमवर्क) दिन्छ आमा! 😜',
      'इन्जिनियर: हाम्रो एआईले अब मान्छे जस्तै सोच्न सक्छ!\nसाथी: मान्छे जस्तै? त्यसो भए यसले पनि काम नगरी अल्छी गर्छ त? 🤣',
    ];
    return {
      matched: true,
      text: jokes[Math.floor(Math.random() * jokes.length)],
    };
  }

  // 9. Songs / Poetry (गीत गाउ, कविता)
  if (lower.includes('गीत गा') || lower.includes('sing a song') || lower.includes('कविता सुना')) {
    return {
      matched: true,
      text: '🎶 रातो र चन्द्र सूर्य, जङ्गी निशान हाम्रो... 🇳🇵\nजिउँदो सहिदको रगतले, सिँगारिएको हाम्रो!\nजय जय नेपाल, जय जय शान्तिको देश!',
    };
  }

  // 10. Math Calculation Evaluator (e.g. 5 + 5, 10 * 20, 100/4, algebra, power)
  const mathRegex = /^(\d+(\.\d+)?)\s*([\+\-\*\/xX÷\^])\s*(\d+(\.\d+)?)$/;
  const mathMatch = text.replace(/कति हुन्छ|\?/g, '').trim().match(mathRegex);
  if (mathMatch) {
    const num1 = parseFloat(mathMatch[1]);
    let op = mathMatch[3];
    const num2 = parseFloat(mathMatch[4]);
    let result = 0;
    if (op === '+') result = num1 + num2;
    else if (op === '-') result = num1 - num2;
    else if (op === '*' || op === 'x' || op === 'X') result = num1 * num2;
    else if (op === '/' || op === '÷') result = num2 !== 0 ? num1 / num2 : NaN;
    else if (op === '^') result = Math.pow(num1, num2);

    if (!isNaN(result)) {
      return {
        matched: true,
        text: `${num1} ${op} ${num2} बराबर ${result} हुन्छ। गणितको कुनै पनि अन्य हिसाब भए सोध्न सक्नुहुन्छ!`,
      };
    }
  }

  // 11. Time & Date Questions
  if (lower.includes('time') || lower.includes('कति बज्यो') || lower.includes('समय के भयो')) {
    const timeInfo = getNaturalNepaliTime();
    return {
      matched: true,
      text: timeInfo.spokenText,
    };
  }

  if (lower.includes('date') || lower.includes('आज कति गते') || lower.includes('आज के बार') || lower.includes('मिति')) {
    const dateInfo = getNaturalNepaliDate();
    return {
      matched: true,
      text: dateInfo.spokenText,
    };
  }

  // 12. Thank you (धन्यवाद)
  if (lower.includes('धन्यवाद') || lower.includes('thank') || lower.includes('थ्यांक')) {
    return {
      matched: true,
      text: 'तपाईंलाई पनि धेरै धेरै धन्यवाद! म सधैं हजुरको सेवा, सिकाइ र मद्दतमा हाजिर छु।',
    };
  }

  return { matched: false, text: '' };
}

