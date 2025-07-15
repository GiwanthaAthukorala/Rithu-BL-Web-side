import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0); // First item open by default

  const faqData = [
    {
      question: "How do I get paid for my likes?",
      answer:
        "Once you connect your social media accounts, we automatically track all likes on your content. You'll earn 80¢ for each like, and payments are processed weekly to your preferred payment method.",
    },
    {
      question: "Is it safe to connect my social media accounts?",
      answer:
        "Yes, we use industry-standard security protocols to protect your account information. We only access publicly available data and never store your passwords or personal information.",
    },
    {
      question: "Do I need a minimum number of followers to join?",
      answer:
        "No, there's no minimum follower requirement. Whether you have 10 followers or 10,000, you can start earning from your likes immediately after connecting your accounts.",
    },
    {
      question: "How soon can I start earning?",
      answer:
        "You can start earning immediately after connecting your social media accounts. Likes are tracked in real-time, and you'll see your earnings update in your dashboard within minutes.",
    },
    {
      question: "Can I connect multiple accounts from the same platform?",
      answer:
        "Yes, you can connect multiple accounts from the same platform. Each account will be tracked separately, and you'll earn from likes on all connected accounts.",
    },
    {
      question: "What payment methods do you support?",
      answer:
        "We support multiple payment methods including PayPal, bank transfers, digital wallets, and cryptocurrency. You can choose your preferred method in your account settings.",
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600">
            Get answers to common questions about our platform and how you can
            start earning.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqData.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors duration-200"
              >
                <span className="text-lg font-medium text-gray-900">
                  {item.question}
                </span>
                <div className="flex-shrink-0 ml-4">
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </button>

              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <button className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}
