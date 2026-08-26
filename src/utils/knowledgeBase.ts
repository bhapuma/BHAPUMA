/**
 * Instant Nepali Knowledge Base & Conversational Intelligence Engine for BHAPUMA
 * Provides instant (<5ms) intelligent responses for common questions, facts about Nepal,
 * math calculations, jokes, greetings, and creator details.
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

  // 1. Standalone Wake Words / Name Calls (ONLY when it's just the name with no further question)
  const exactWakeWords = [
    'भरत', 'भपुम', 'भपुमा', 'ह्याकर', 'कम्प्युटर',
    'bharat', 'bhapuma', 'hacker', 'computer',
    'हे भपुम', 'हे भरत', 'सुन त', 'ओई भपुम', 'हे कम्प्युटर', 'हे ह्याकर',
    'hey bhapuma', 'hey bharat', 'hey computer'
  ];
  if (exactWakeWords.includes(lower)) {
    const greetings = [
      'हजुर दाजु! म भपुम तयार छु, भन्नुहोस् के मद्दत गरूँ?',
      'हजुर! म सुन्दैछु, आज्ञा गर्नुहोस् दाजु।',
      'नमस्ते दाजु! म उपस्थित छु, के सहयोग गरूँ?',
    ];
    return {
      matched: true,
      text: greetings[Math.floor(Math.random() * greetings.length)],
      action: 'wake_greet',
    };
  }

  // 2. Greetings & How are you (नमस्ते, के छ खबर, कस्तो छौ)
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
      'नमस्ते दाजु! म एकदम सञ्चै र ऊर्जावान छु। तपाईंलाई कस्तो छ, के सहयोग गरूँ?',
      'नमस्कार! म भपुम तपाईंको सेवामा तयार छु। आज के नयाँ काम गर्ने दाजु?',
      'एकदम ठिकठाक छ दाजु! तपाईंलाई कस्तो छ? मलाई केही प्रश्न सोध्नुहोस् वा फोनको काम भन्नुहोस्।',
    ];
    return {
      matched: true,
      text: replies[Math.floor(Math.random() * replies.length)],
    };
  }

  // 3. Identity / Who are you / What is your name (तिम्रो नाम के हो, तिमी को हौ)
  if (
    lower.includes('तिम्रो नाम') ||
    lower.includes('नाम के हो') ||
    lower.includes('तिमी को हौ') ||
    lower.includes('who are you') ||
    lower.includes('what is your name')
  ) {
    return {
      matched: true,
      text: 'म भपुम (BHAPUMA), भरत पुन मगर दाजुले बनाउनुभएको १७ वर्षे स्मार्ट एआई भ्वाइस असिस्टेन्ट हुँ। म तपाईंलाई फोन नियन्त्रण गर्न, प्रश्नहरूको उत्तर दिन र विभिन्न डिजिटल कार्यहरूमा मद्दत गर्दछु।',
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
      text: 'मलाई भरत पुन मगर (Bharat Pun Magar) दाजुले बनाउनुभएको हो। उहाँको आधिकारिक फोन नम्बर ९७०४२२७६८९ र AVYAN प्रोफाइल avyan.app/u/bharat.pun.magar हो।',
      action: 'creator_info',
    };
  }

  // 5. Nepal Capital & Geography Facts
  if (lower.includes('नेपालको राजधानी') || lower.includes('capital of nepal')) {
    return {
      matched: true,
      text: 'नेपालको राजधानी काठमाडौँ हो। यो सुन्दर उपत्यका आफ्नो ऐतिहासिक मन्दिर, संस्कृति र सम्पदाका लागि विश्वप्रसिद्ध छ।',
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
      text: 'नेपाल र संसारकै सबैभन्दा अग्लो हिमाल सगरमाथा (Mount Everest) हो, जसको उचाइ ८,८४८.८६ मिटर (२९,०३१.७ फिट) छ।',
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
      text: 'नेपालको राष्ट्रिय चरा डाँफे (Lophophorus) हो, जुन रङ्गीचङ्गी र सुन्दर हुन्छ।',
    };
  }

  if (lower.includes('राष्ट्रिय फूल') || lower.includes('national flower of nepal') || lower.includes('लालीगुराँस')) {
    return {
      matched: true,
      text: 'नेपालको राष्ट्रिय फूल लालीगुराँस (Rhododendron) हो।',
    };
  }

  if (lower.includes('राष्ट्रिय झण्डा') || lower.includes('national flag')) {
    return {
      matched: true,
      text: 'नेपालको झण्डा विश्वमै एकमात्र गैर-आयताकार (दुई त्रिकोणात्मक) अनौठो र गौरवशाली झण्डा हो।',
    };
  }

  if (lower.includes('मुद्रा') || lower.includes('currency of nepal')) {
    return {
      matched: true,
      text: 'नेपालको आधिकारिक मुद्रा नेपाली रुपैयाँ (NPR) हो।',
    };
  }

  if (lower.includes('प्रधानमन्त्री') || lower.includes('prime minister of nepal')) {
    return {
      matched: true,
      text: 'नेपालको वर्तमान सरकार र कार्यकारी प्रमुख प्रधानमन्त्री हुनुहुन्छ। देशको प्रशासनिक कार्य उहाँकै नेतृत्वमा सञ्चालन हुन्छ।',
    };
  }

  if (lower.includes('राष्ट्रपति') || lower.includes('president of nepal')) {
    return {
      matched: true,
      text: 'नेपालको राष्ट्रप्रमुख राष्ट्रपति हुनुहुन्छ।',
    };
  }

  // 6. Nepali Jokes & Entertainment (चुट्किला, जोक)
  if (lower.includes('चुट्किला') || lower.includes('joke') || lower.includes('हँसाउ') || lower.includes('हसाउ')) {
    const jokes = [
      'शिक्षक: बाबु, बताऊ त चन्द्रमा धेरै उपयोगी कि सूर्य?\nविद्यार्थी: चन्द्रमा सर!\nशिक्षक: किन?\nविद्यार्थी: सूर्य त दिउँसो उज्यालो हुँदा आउँछ, चन्द्रमाले पो अँध्यारो रातमा उज्यालो दिन्छ! 😆',
      'डाक्टर: तपाईंलाई के भएको छ?\nबिरामी: डाक्टर साब, मलाई सपनामा फुटबल म्याच मात्र देखिन्छ!\nडाक्टर: यो औषधि आजै रातिदेखि खानुहोस्।\nबिरामी: भोलिदेखि खाए हुन्न डाक्टर साब? आज त फाइनल गेम छ! 😂',
      'बाबु: आमा, बाख्राले दूध दिन्छ, मौरीले मह दिन्छ, अनि शिक्षकले के दिन्छ?\nआमा: के दिन्छ बाबु?\nबाबु: गृहकार्य (होमवर्क) दिन्छ आमा! 😜',
    ];
    return {
      matched: true,
      text: jokes[Math.floor(Math.random() * jokes.length)],
    };
  }

  // 7. Songs / Poetry (गीत गाउ, कविता)
  if (lower.includes('गीत गा') || lower.includes('sing a song') || lower.includes('कविता सुना')) {
    return {
      matched: true,
      text: '🎶 रातो र चन्द्र सूर्य, जङ्गी निशान हाम्रो... 🇳🇵\nजिउँदो सहिदको रगतले, सिँगारिएको हाम्रो!\nजय जय नेपाल!',
    };
  }

  // 8. Math Calculation Evaluator (e.g. 5 + 5, 10 * 20, 100/4)
  const mathRegex = /^(\d+(\.\d+)?)\s*([\+\-\*\/xX÷])\s*(\d+(\.\d+)?)$/;
  const mathMatch = text.replace(/कति हुन्छ|\?/g, '').trim().match(mathRegex);
  if (mathMatch) {
    const num1 = parseFloat(mathMatch[1]);
    let op = mathMatch[3];
    const num2 = parseFloat(mathMatch[4]);
    let result = 0;
    if (op === '+' ) result = num1 + num2;
    else if (op === '-') result = num1 - num2;
    else if (op === '*' || op === 'x' || op === 'X') result = num1 * num2;
    else if (op === '/' || op === '÷') result = num2 !== 0 ? num1 / num2 : NaN;

    if (!isNaN(result)) {
      return {
        matched: true,
        text: `${num1} ${op} ${num2} बराबर ${result} हुन्छ।`,
      };
    }
  }

  // 9. Time & Date Questions
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

  // 10. Thank you (धन्यवाद)
  if (lower.includes('धन्यवाद') || lower.includes('thank') || lower.includes('थ्यांक')) {
    return {
      matched: true,
      text: 'तपाईंलाई पनि धेरै धेरै धन्यवाद दाजु! म सधैं हजुरको सेवामा हाजिर छु।',
    };
  }

  return { matched: false, text: '' };
}
