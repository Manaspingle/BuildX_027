import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi' | 'mr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Brand & Taglines
    'app.name': 'Aarogyam',
    'app.tagline': 'City Blood & Organ Network',
    'app.hero_badge': 'Rapid Emergency Accident & Organ Allocation Network',
    'app.hero_title_1': 'Immediate Emergency Care &',
    'app.hero_title_2': 'Life Allocation Network',
    'app.hero_desc': 'Instant accident triage, nearby ambulance calling, live bed & doctor tracking, and real-time organ & blood matching across Mumbai, Pune, and Nagpur.',
    
    // Emergency Button & Actions
    'emergency.btn': 'EMERGENCY',
    'emergency.accident_btn': 'ACCIDENT EMERGENCY',
    'emergency.subtitle': 'Instant Help - No Login Required',
    'emergency.modal_title': '🚨 Aarogyam Emergency Accident Response',
    'emergency.modal_desc': 'Select immediate assistance. Real-time direct dispatch and bed reservation with zero login delay.',
    'emergency.tab_ambulance': 'Direct Ambulance Call',
    'emergency.tab_private': 'Nearby Private Hospitals',
    'emergency.tab_government': 'Nearby Govt Hospitals',
    'emergency.call_now': 'Call Ambulance Now',
    'emergency.call_helpline': 'Emergency Call 108',
    'emergency.filter_city': 'City Location:',
    'emergency.capacity': 'Vehicle Capacity',
    'emergency.fare': 'Standard Fare',
    'emergency.eta': 'Estimated Reach Time',
    'emergency.beds_available': 'Emergency Beds Available',
    'emergency.icu_beds': 'ICU Beds',
    'emergency.trauma_beds': 'Trauma Beds',
    'emergency.gen_beds': 'General Beds',
    'emergency.doctors_on_duty': 'Specialist Doctors on Duty',
    'emergency.maps_directions': 'Open Google Maps Navigation',
    'emergency.trigger_hospital': 'Trigger Emergency Alert to Hospital',
    'emergency.alert_sent_title': '🚨 Hospital Alert Triggered in Real Time!',
    'emergency.alert_sent_desc': 'Emergency Bay Alerted. Emergency Token generated. Trauma staff & on-call doctors have been notified to prepare the emergency OT and beds.',
    'emergency.token': 'Emergency Token ID',
    'emergency.status': 'Dispatch Status',
    'emergency.status_val': 'Trauma Bay Prepped & Awaiting Patient',
    'emergency.back': 'Back to Services',
    'emergency.close': 'Close Window',

    // Navigation & Roles
    'nav.register_donor': 'Register Donor',
    'nav.hospital_access': 'Hospital Access',
    'nav.login_signup': 'Login / Sign Up',
    'nav.dashboard': 'Dashboard',
    'nav.pledge_organ': 'Pledge Organ',
    'nav.ai_insights': 'AI Insights & Blogs',
    'nav.my_report': 'My Report',
    'nav.donor_directory': 'Donor Directory',
    'nav.nearby_hospitals': 'Nearby Hospitals',
    'nav.transparency_log': 'Transparency Log',
    'nav.sign_out': 'Sign Out',
    'nav.emergency_request': 'EMERGENCY REQUEST',

    // Landing Page Sections
    'landing.emergency_callout_title': 'Accident or Critical Emergency?',
    'landing.emergency_callout_desc': 'Seconds save lives. Direct ambulance dispatch and instant bed/doctor reservation across Mumbai, Pune, and Nagpur.',
    'landing.how_it_works': 'How Aarogyam Works',
    'landing.step1_title': 'Register or Trigger',
    'landing.step1_desc': 'Emergency accident assistance is 1-click on the landing page. Donors and hospitals register verified credentials.',
    'landing.step2_title': 'Instant AI & Location Tracking',
    'landing.step2_desc': 'Locate closest ambulances and government/private hospitals with live doctor and ICU bed counts.',
    'landing.step3_title': 'Real-Time Lifesaving Prep',
    'landing.step3_desc': 'Real-time alert informs hospital emergency rooms to prepare trauma bay and blood units before arrival.',
    'landing.stats_lives': 'Lives Saved',
    'landing.stats_donors': 'Active Donors',
    'landing.stats_hospitals': 'Connected Hospitals',
    'landing.stats_cities': 'Cities Covered',
    'landing.testimonials_title': 'Stories of Life Saved in Maharashtra',
    'landing.cta_title': 'Be a Lifesaver Today',
    'landing.cta_desc': 'Every second counts. Register as a donor, connect your hospital, or keep Aarogyam ready for roadside emergencies.',
    'landing.cta_btn_donor': 'Register as Life Donor',
    'landing.cta_btn_hospital': 'Connect Hospital Network',

    // Auth Page
    'auth.welcome_back': 'Welcome Back',
    'auth.join_aarogyam': 'Join the Aarogyam Network',
    'auth.sign_in': 'Sign In',
    'auth.register': 'Register',
    'auth.role_individual': 'Individual Donor',
    'auth.role_hospital': 'Hospital / Medical Center',
    'auth.city_select': 'Select City (Maharashtra)',
    'auth.email': 'Email Address',
    'auth.password': 'Password',
    'auth.full_name': 'Full Name',
    'auth.phone': 'Phone Number',
    'auth.blood_group': 'Blood Group',
    'auth.hospital_name': 'Hospital Name',
    'auth.registration_id': 'Medical Registration ID',
    'auth.address': 'Complete Hospital Address',
    'auth.contact_person': 'Medical Superintendent / Contact Person',
    'auth.submit_signin': 'Sign In to Account',
    'auth.submit_register': 'Complete Registration',

    // Common
    'common.language': 'Language',
    'common.english': 'English',
    'common.hindi': 'हिन्दी',
    'common.marathi': 'मराठी',
    'common.mumbai': 'Mumbai',
    'common.pune': 'Pune',
    'common.nagpur': 'Nagpur',
    'common.government': 'Government',
    'common.private': 'Private',
    'common.rating': 'Rating',
    'common.available': 'Available',
    'common.occupied': 'Occupied',
    'common.minutes': 'mins',
    'common.km': 'km',
  },

  hi: {
    // Brand & Taglines
    'app.name': 'आरोग्यम्',
    'app.tagline': 'शहर रक्त एवं अंग दान नेटवर्क',
    'app.hero_badge': 'त्वरित दुर्घटना आपातकालीन एवं जीवन रक्षक नेटवर्क',
    'app.hero_title_1': 'त्वरित आपातकालीन चिकित्सा एवं',
    'app.hero_title_2': 'जीवन आवंटन नेटवर्क',
    'app.hero_desc': 'सड़क दुर्घटना में तुरंत सहायता, निकटतम एम्बुलेंस कॉलिंग, लाइव बेड व डॉक्टर ट्रैकिंग और मुंबई, पुणे तथा नागपुर में तुरंत अंग एवं रक्त समन्वय।',

    // Emergency Button & Actions
    'emergency.btn': 'आपातकाल (EMERGENCY)',
    'emergency.accident_btn': 'दुर्घटना आपातकाल सेवा',
    'emergency.subtitle': 'तुरंत सहायता - बिना लॉगिन के उपलब्ध',
    'emergency.modal_title': '🚨 आरोग्यम् त्वरित दुर्घटना आपातकालीन सहायता',
    'emergency.modal_desc': 'तुरंत सहायता चुनें। बिना लॉगिन के सीधे एम्बुलेंस बुलाएं अथवा निकटतम अस्पताल में इमरजेंसी बेड व डॉक्टर अलर्ट भेजें।',
    'emergency.tab_ambulance': 'सीधी एम्बुलेंस कॉल',
    'emergency.tab_private': 'निकटतम निजी अस्पताल',
    'emergency.tab_government': 'निकटतम सरकारी अस्पताल',
    'emergency.call_now': 'तुरंत एम्बुलेंस को कॉल करें',
    'emergency.call_helpline': 'आपातकालीन हेल्पलाइन 108',
    'emergency.filter_city': 'शहर चुनें:',
    'emergency.capacity': 'वाहन क्षमता व सुविधा',
    'emergency.fare': 'मानक किराया',
    'emergency.eta': 'पहुंचने का अनुमानित समय',
    'emergency.beds_available': 'उपलब्ध आपातकालीन बेड',
    'emergency.icu_beds': 'आईसीयू बेड',
    'emergency.trauma_beds': 'ट्रॉमा बेड',
    'emergency.gen_beds': 'सामान्य बेड',
    'emergency.doctors_on_duty': 'ड्यूटी पर विशेषज्ञ डॉक्टर',
    'emergency.maps_directions': 'गूगल मैप्स नेविगेशन खोलें',
    'emergency.trigger_hospital': 'अस्पताल को तुरंत आपातकालीन अलर्ट भेजें',
    'emergency.alert_sent_title': '🚨 अस्पताल को रियल-टाइम अलर्ट भेजा गया!',
    'emergency.alert_sent_desc': 'इमरजेंसी वार्ड अलर्ट हो चुका है। आपातकालीन टोकन जारी किया गया है। मरीज के पहुंचने से पहले ऑपरेशन थियेटर और बेड तैयार किए जा रहे हैं।',
    'emergency.token': 'इमरजेंसी टोकन आईडी',
    'emergency.status': 'तैयारी की स्थिति',
    'emergency.status_val': 'ट्रॉमा वार्ड तैयार - डॉक्टर प्रतीक्षारत',
    'emergency.back': 'वापस सेवाओं पर जाएं',
    'emergency.close': 'खिड़की बंद करें',

    // Navigation & Roles
    'nav.register_donor': 'रक्त/अंग दाता पंजीकरण',
    'nav.hospital_access': 'अस्पताल पोर्टल',
    'nav.login_signup': 'लॉगिन / साइन अप',
    'nav.dashboard': 'डैशबोर्ड',
    'nav.pledge_organ': 'अंगदान संकल्प',
    'nav.ai_insights': 'एआई विश्लेषण व ब्लॉग',
    'nav.my_report': 'मेरी योगदान रिपोर्ट',
    'nav.donor_directory': 'दाता सूची',
    'nav.nearby_hospitals': 'निकटवर्ती अस्पताल',
    'nav.transparency_log': 'पारदर्शिता लॉग',
    'nav.sign_out': 'लॉगआउट',
    'nav.emergency_request': 'आपातकालीन मांग',

    // Landing Page Sections
    'landing.emergency_callout_title': 'सड़क दुर्घटना या गंभीर आपातकाल?',
    'landing.emergency_callout_desc': 'हर सेकंड कीमती है। बिना लॉगिन के सीधे एम्बुलेंस बुलाएं और मुंबई, पुणे व नागपुर के अस्पतालों में बेड व डॉक्टर सुरक्षित करें।',
    'landing.how_it_works': 'आरोग्यम् कैसे काम करता है',
    'landing.step1_title': 'पंजीकरण या आपातकालीन ट्रिगर',
    'landing.step1_desc': 'दुर्घटना के समय होमपेज से 1-क्लिक में तुरंत मदद। दाता और अस्पताल सत्यापित पहचान के साथ जुड़ते हैं।',
    'landing.step2_title': 'तुरंत एआई और स्थान ट्रैकिंग',
    'landing.step2_desc': 'निकटतम एम्बुलेंस और सरकारी/निजी अस्पतालों में उपलब्ध डॉक्टर और आईसीयू बेड तुरंत खोजें।',
    'landing.step3_title': 'वास्तविक समय में जीवन रक्षा',
    'landing.step3_desc': 'अस्पताल को सीधे चेतावनी संदेश जाता है ताकि मरीज के पहुंचने से पहले ट्रॉमा बे और रक्त तैयार मिले।',
    'landing.stats_lives': 'बचाई गई जानें',
    'landing.stats_donors': 'सक्रिय दाता',
    'landing.stats_hospitals': 'संबद्ध अस्पताल',
    'landing.stats_cities': 'कवर किए गए शहर',
    'landing.testimonials_title': 'महाराष्ट्र में जीवन रक्षा की सच्ची कहानियां',
    'landing.cta_title': 'आज ही जीवनदाता बनें',
    'landing.cta_desc': 'एक फैसला किसी की जान बचा सकता है। दाता बनें अथवा दुर्घटना सहायता के लिए आरोग्यम् का उपयोग करें।',
    'landing.cta_btn_donor': 'दाता के रूप में पंजीकरण करें',
    'landing.cta_btn_hospital': 'अस्पताल को नेटवर्क से जोड़ें',

    // Auth Page
    'auth.welcome_back': 'पुनः स्वागत है',
    'auth.join_aarogyam': 'आरोग्यम् नेटवर्क से जुड़ें',
    'auth.sign_in': 'साइन इन करें',
    'auth.register': 'नया पंजीकरण',
    'auth.role_individual': 'व्यक्तिगत दाता',
    'auth.role_hospital': 'अस्पताल / चिकित्सा केंद्र',
    'auth.city_select': 'शहर चुनें (महाराष्ट्र)',
    'auth.email': 'ईमेल पता',
    'auth.password': 'पासवर्ड',
    'auth.full_name': 'पूरा नाम',
    'auth.phone': 'फोन नंबर',
    'auth.blood_group': 'रक्त समूह',
    'auth.hospital_name': 'अस्पताल का नाम',
    'auth.registration_id': 'चिकित्सा पंजीकरण संख्या',
    'auth.address': 'अस्पताल का पूरा पता',
    'auth.contact_person': 'चिकित्सा अधीक्षक / संपर्क व्यक्ति',
    'auth.submit_signin': 'खाते में साइन इन करें',
    'auth.submit_register': 'पंजीकरण पूरा करें',

    // Common
    'common.language': 'भाषा',
    'common.english': 'English',
    'common.hindi': 'हिन्दी',
    'common.marathi': 'मराठी',
    'common.mumbai': 'मुंबई',
    'common.pune': 'पुणे',
    'common.nagpur': 'नागपुर',
    'common.government': 'सरकारी',
    'common.private': 'निजी',
    'common.rating': 'रेटिंग',
    'common.available': 'उपलब्ध',
    'common.occupied': 'व्यस्त',
    'common.minutes': 'मिनट',
    'common.km': 'किमी',
  },

  mr: {
    // Brand & Taglines
    'app.name': 'आरोग्यम्',
    'app.tagline': 'शहर रक्त व अवयव दान नेटवर्क',
    'app.hero_badge': 'तातडीचे अपघात आपत्कालीन व अवयव वाटप नेटवर्क',
    'app.hero_title_1': 'तातडीची आपत्कालीन वैद्यकीय मदत व',
    'app.hero_title_2': 'जीवन रक्षक नेटवर्क',
    'app.hero_desc': 'रस्ता अपघातात क्षणात मदत, जवळची रुग्णवाहिका, थेट खाटा व डॉक्टरांची उपलब्धता आणि मुंबई, पुणे व नागपूरमध्ये थेट अवयव व रक्त समन्वय.',

    // Emergency Button & Actions
    'emergency.btn': 'आपत्कालीन (EMERGENCY)',
    'emergency.accident_btn': 'अपघात आपत्कालीन मदत',
    'emergency.subtitle': 'त्वरित मदत - लॉगिनची गरज नाही',
    'emergency.modal_title': '🚨 आरोग्यम् अपघात आपत्कालीन प्रतिसाद',
    'emergency.modal_desc': 'तातडीची मदत निवडा. लॉगिनशिवाय थेट रुग्णवाहिका बोलवा किंवा जवळच्या रुग्णालयात बेड व डॉक्टरांना तात्काळ सूचना द्या.',
    'emergency.tab_ambulance': 'थेट रुग्णवाहिका कॉल',
    'emergency.tab_private': 'जवळची खाजगी रुग्णालये',
    'emergency.tab_government': 'जवळची शासकीय रुग्णालये',
    'emergency.call_now': 'आत्ताच रुग्णवाहिकेला कॉल करा',
    'emergency.call_helpline': 'आपत्कालीन हेल्पलाईन १०८',
    'emergency.filter_city': 'शहर निवडा:',
    'emergency.capacity': 'वाहनाची क्षमता व सुविधा',
    'emergency.fare': 'प्रमाणित दर',
    'emergency.eta': 'पोहोचण्याची अंदाजे वेळ',
    'emergency.beds_available': 'उपलब्ध आपत्कालीन खाटा',
    'emergency.icu_beds': 'आयसीयू खाटा',
    'emergency.trauma_beds': 'ट्रॉमा खाटा',
    'emergency.gen_beds': 'सामान्य खाटा',
    'emergency.doctors_on_duty': 'कर्तव्यावर असलेले तज्ज्ञ डॉक्टर',
    'emergency.maps_directions': 'गुगल मॅप्स मार्ग पहा',
    'emergency.trigger_hospital': 'रुग्णालयाला आपत्कालीन सूचना पाठवा',
    'emergency.alert_sent_title': '🚨 रुग्णालयाला थेट सूचना पाठवण्यात आली!',
    'emergency.alert_sent_desc': 'इमर्जन्सी वॉर्ड सतर्क झाला आहे. आपत्कालीन टोकन तयार झाले आहे. रुग्ण पोहोचण्यापूर्वी ट्रॉमा वॉर्ड आणि शस्त्रक्रिया कक्ष सज्ज होत आहे.',
    'emergency.token': 'इमर्जन्सी टोकन आयडी',
    'emergency.status': 'तयारीची स्थिती',
    'emergency.status_val': 'ट्रॉमा वॉर्ड सज्ज - डॉक्टर प्रतीक्षेत',
    'emergency.back': 'मागे सेवांवर जा',
    'emergency.close': 'खिडकी बंद करा',

    // Navigation & Roles
    'nav.register_donor': 'रक्त/अवयव दाता नोंदणी',
    'nav.hospital_access': 'रुग्णालय पोर्टल',
    'nav.login_signup': 'लॉगिन / नोंदणी',
    'nav.dashboard': 'डॅशबोर्ड',
    'nav.pledge_organ': 'अवयवदान संकल्प',
    'nav.ai_insights': 'एआय विश्लेषण व लेख',
    'nav.my_report': 'माझा सहभाग अहवाल',
    'nav.donor_directory': 'दात्यांची यादी',
    'nav.nearby_hospitals': 'जवळची रुग्णालये',
    'nav.transparency_log': 'पारदर्शकता नोंद',
    'nav.sign_out': 'लॉगआउट',
    'nav.emergency_request': 'आपत्कालीन मागणी',

    // Landing Page Sections
    'landing.emergency_callout_title': 'अपघात अथवा गंभीर आणीबाणी?',
    'landing.emergency_callout_desc': 'प्रत्येक सेकंद मोलाचा आहे. लॉगिन न करता थेट रुग्णवाहिका बोलवा आणि मुंबई, पुणे, नागपूरमधील रुग्णालयांमध्ये खाटा व डॉक्टर राखीव करा.',
    'landing.how_it_works': 'आरोग्यम् कसे कार्य करते',
    'landing.step1_title': 'नोंदणी किंवा आपत्कालीन मदत',
    'landing.step1_desc': 'अपघातात मुख्य पानावरून एका क्लिकवर मदत. रक्त/अवयव दाते आणि रुग्णालये अधिकृत नोंदणी करतात.',
    'landing.step2_title': 'त्वरित एआय व स्थान शोध',
    'landing.step2_desc': 'जवळची रुग्णवाहिका तसेच शासकीय/खाजगी रुग्णालयातील उपलब्ध डॉक्टर व आयसीयू खाटा तात्काळ शोधा.',
    'landing.step3_title': 'वेळेवर जीवन रक्षण',
    'landing.step3_desc': 'रुग्णालयाला तत्काळ इशारा जातो, जेणेकरून रुग्ण येण्यापूर्वीच शस्त्रक्रिया कक्ष व रक्त पुरवठा सज्ज राहतो.',
    'landing.stats_lives': 'वाचवलेले प्राण',
    'landing.stats_donors': 'सक्रिय दाते',
    'landing.stats_hospitals': 'संलग्न रुग्णालये',
    'landing.stats_cities': 'समाविष्ट शहरे',
    'landing.testimonials_title': 'महाराष्ट्रातील जीवन रक्षणाच्या सत्यकथा',
    'landing.cta_title': 'आजच जीवनदाता व्हा',
    'landing.cta_desc': 'एक निर्णय कोणाचे तरी प्राण वाचवू शकतो. रक्तदान व अवयवदानासाठी नोंदणी करा किंवा अपघाताच्या वेळी आरोग्यम् वापरा.',
    'landing.cta_btn_donor': 'जीवनदाता म्हणून नोंदणी करा',
    'landing.cta_btn_hospital': 'रुग्णालय नेटवर्कशी जोडा',

    // Auth Page
    'auth.welcome_back': 'पुन्हा स्वागत आहे',
    'auth.join_aarogyam': 'आरोग्यम् परिवारात सामील व्हा',
    'auth.sign_in': 'साइन इन करा',
    'auth.register': 'नवीन नोंदणी',
    'auth.role_individual': 'वैयक्तिक दाता',
    'auth.role_hospital': 'रुग्णालय / वैद्यकीय केंद्र',
    'auth.city_select': 'शहर निवडा (महाराष्ट्र)',
    'auth.email': 'ईमेल पत्ता',
    'auth.password': 'पासवर्ड',
    'auth.full_name': 'संपूर्ण नाव',
    'auth.phone': 'फोन नंबर',
    'auth.blood_group': 'रक्त गट',
    'auth.hospital_name': 'रुग्णालयाचे नाव',
    'auth.registration_id': 'वैद्यकीय नोंदणी क्रमांक',
    'auth.address': 'रुग्णालयाचा संपूर्ण पत्ता',
    'auth.contact_person': 'वैद्यकीय अधीक्षक / संपर्क व्यक्ती',
    'auth.submit_signin': 'खात्यात साइन इन करा',
    'auth.submit_register': 'नोंदणी पूर्ण करा',

    // Common
    'common.language': 'भाषा',
    'common.english': 'English',
    'common.hindi': 'हिन्दी',
    'common.marathi': 'मराठी',
    'common.mumbai': 'मुंबई',
    'common.pune': 'पुणे',
    'common.nagpur': 'नागपूर',
    'common.government': 'शासकीय',
    'common.private': 'खाजगी',
    'common.rating': 'दर्जा',
    'common.available': 'उपलब्ध',
    'common.occupied': 'भरलेले',
    'common.minutes': 'मिनिटे',
    'common.km': 'किमी',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('aarogyam_lang') as Language;
    return saved && (saved === 'en' || saved === 'hi' || saved === 'mr') ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('aarogyam_lang', lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
