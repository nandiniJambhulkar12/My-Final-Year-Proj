import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  MessageSquare,
  Phone,
  MapPin,
  Send,
  Loader,
  CheckCircle,
  AlertCircle,
  Globe,
  Twitter,
  Linkedin,
  Github,
} from "lucide-react";

const ContactSupport: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.subject ||
      !formData.message
    ) {
      setError("Please fill in all fields");
      return;
    }

    setSending(true);
    setError(null);

    try {
      // Simulate sending email (in production, connect to backend)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const contactMethods = [
    {
      icon: Mail,
      title: "Email",
      value: "support@xaiauditor.com",
      description: "We respond within 24 hours",
      href: "mailto:support@xaiauditor.com",
    },
    {
      icon: Phone,
      title: "Phone",
      value: "+1 (555) 123-4567",
      description: "Available Mon-Fri, 9AM-6PM EST",
      href: "tel:+15551234567",
    },
    {
      icon: MessageSquare,
      title: "Live Chat",
      value: "Chat with us",
      description: "Available during business hours",
      action: () => alert("Live chat opening soon"),
    },
    {
      icon: MapPin,
      title: "Office",
      value: "xAI Auditor Inc.",
      description: "123 Tech Street, San Francisco, CA 94105",
    },
  ];

  const faqItems = [
    {
      question: "How long does code analysis take?",
      answer:
        "Most analyses complete within 5-30 seconds depending on code size and complexity. Large files may take longer.",
    },
    {
      question: "Is my code stored after analysis?",
      answer:
        "Code snippets are stored in your analysis history for reference. You can delete any analysis anytime.",
    },
    {
      question: "What programming languages are supported?",
      answer:
        "We support Python, JavaScript, Java, C++, C#, Go, Rust, and more. Check our documentation for the full list.",
    },
    {
      question: "Can I export my analysis reports?",
      answer:
        "Yes! You can download analysis reports in PDF or JSON format from your history page.",
    },
    {
      question: "How accurate are the vulnerability detections?",
      answer:
        "Our ML model has 95%+ accuracy on common vulnerabilities. We continuously improve detection capabilities.",
    },
    {
      question: "Do you offer an API for integrations?",
      answer:
        "Yes! We have a REST API for developers. Contact us for API documentation and usage limits.",
    },
  ];

  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Contact & Support
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          We're here to help! Reach out with any questions or feedback.
        </p>
      </motion.div>

      {/* Contact Methods Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-2 gap-6"
      >
        {contactMethods.map((method, index) => {
          const Icon = method.icon;
          return (
            <motion.a
              key={index}
              href={method.href}
              onClick={method.action}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="group p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
                  <Icon
                    size={24}
                    className="text-blue-600 dark:text-blue-400"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {method.title}
                  </h3>
                  <p className="text-lg font-medium text-blue-600 dark:text-blue-400 mb-1">
                    {method.value}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {method.description}
                  </p>
                </div>
              </div>
            </motion.a>
          );
        })}
      </motion.div>

      {/* Contact Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Send us a Message
        </h2>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3"
          >
            <AlertCircle size={20} className="text-red-600" />
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3"
          >
            <CheckCircle size={20} className="text-green-600" />
            <p className="text-green-600 dark:text-green-400 text-sm">
              Thank you for your message! We'll get back to you soon.
            </p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Your Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="John Doe"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Your Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john@example.com"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Subject
            </label>
            <select
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <option value="">Select a subject</option>
              <option value="bug">Report a Bug</option>
              <option value="feature">Feature Request</option>
              <option value="general">General Inquiry</option>
              <option value="account">Account Issue</option>
              <option value="billing">Billing Question</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Message
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Tell us how we can help..."
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={sending}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {sending ? (
              <>
                <Loader size={18} className="animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send size={18} />
                Send Message
              </>
            )}
          </button>
        </form>
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Frequently Asked Questions
        </h2>

        <div className="space-y-3">
          {faqItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 + index * 0.05 }}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              <button
                onClick={() =>
                  setExpandedFaq(expandedFaq === index ? null : index)
                }
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
              >
                <span className="font-semibold text-gray-900 dark:text-white">
                  {item.question}
                </span>
                <motion.div
                  animate={{ rotate: expandedFaq === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg
                    className="w-5 h-5 text-gray-600 dark:text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </motion.div>
              </button>

              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: expandedFaq === index ? "auto" : 0,
                  opacity: expandedFaq === index ? 1 : 0,
                }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
                  {item.answer}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Social Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-8 text-center"
      >
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Connect With Us
        </h3>
        <div className="flex items-center justify-center gap-6">
          <button
            type="button"
            aria-label="Visit website"
            className="p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-lg hover:scale-110 transition-all"
          >
            <Globe size={24} className="text-gray-700 dark:text-gray-300" />
          </button>
          <button
            type="button"
            aria-label="Visit Twitter"
            className="p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-lg hover:scale-110 transition-all"
          >
            <Twitter size={24} className="text-gray-700 dark:text-gray-300" />
          </button>
          <button
            type="button"
            aria-label="Visit LinkedIn"
            className="p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-lg hover:scale-110 transition-all"
          >
            <Linkedin size={24} className="text-gray-700 dark:text-gray-300" />
          </button>
          <button
            type="button"
            aria-label="Visit GitHub"
            className="p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-lg hover:scale-110 transition-all"
          >
            <Github size={24} className="text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ContactSupport;
