import { FaInstagram, FaLinkedin, FaCodepen, FaStackOverflow, FaAws, FaPython, FaHtml5, FaCss3Alt, FaJs, FaReact, FaNodeJs, FaDocker, FaGit } from "react-icons/fa";
import { SiMongodb, SiMysql, SiTypescript } from "react-icons/si";
import { motion } from "framer-motion";

export function About() {
  const socialLinks = [
    { name: 'Instagram', url: 'https://instagram.com/its_ur_musuuu', color: 'bg-pink-600 hover:bg-pink-700', icon: <FaInstagram size={20} /> },
    { name: 'LinkedIn', url: 'https://www.linkedin.com/in/mustafa-pinjari-287625256/', color: 'bg-blue-600 hover:bg-blue-700', icon: <FaLinkedin size={20} /> },
    { name: 'Stack Overflow', url: 'https://stackoverflow.com/users/26745237/mustafapinjari', color: 'bg-orange-600 hover:bg-orange-700', icon: <FaStackOverflow size={20} /> },
    { name: 'CodePen', url: 'https://codepen.io/-MUSTAFA-', color: 'bg-gray-700 hover:bg-gray-600', icon: <FaCodepen size={20} /> },
  ];

  const techStack = [
    { name: "JavaScript", icon: <FaJs size={24} className="text-yellow-500" /> },
    { name: "React", icon: <FaReact size={24} className="text-blue-500" /> },
    { name: "TypeScript", icon: <SiTypescript size={24} className="text-blue-400" /> },
    { name: "HTML5", icon: <FaHtml5 size={24} className="text-red-500" /> },
    { name: "CSS3", icon: <FaCss3Alt size={24} className="text-blue-500" /> },
    { name: "Python", icon: <FaPython size={24} className="text-yellow-400" /> },
    { name: "Node.js", icon: <FaNodeJs size={24} className="text-green-500" /> },
    { name: "MongoDB", icon: <SiMongodb size={24} className="text-green-400" /> },
    { name: "MySQL", icon: <SiMysql size={24} className="text-blue-600" /> },
    { name: "Git", icon: <FaGit size={24} className="text-orange-500" /> },
    { name: "Docker", icon: <FaDocker size={24} className="text-blue-400" /> },
    { name: "AWS", icon: <FaAws size={24} className="text-yellow-600" /> },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Status Bar */}
      <div className="h-11 bg-black flex items-center justify-center">
        <div className="text-white text-sm font-medium">
          {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false })}
        </div>
      </div>

      <div className="px-4 pb-28">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="pt-4 pb-6"
        >
          <h1 className="text-2xl font-bold text-white mb-1">
            Profile
          </h1>
          <p className="text-gray-400">
            About the developer
          </p>
        </motion.div>

        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-gray-900 rounded-3xl p-6 mb-6 border border-gray-800"
        >
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">MP</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Mustafa Pinjari
            </h2>
            <p className="text-gray-400 text-sm">
              Frontend Developer & UI/UX Enthusiast
            </p>
          </div>
          
          <p className="text-gray-300 text-sm leading-relaxed text-center">
            Passionate about creating beautiful, intuitive apps that make everyday tasks easier. 
            This tiffin tracker was built with care to help you manage your daily meals effortlessly.
          </p>
        </motion.div>

        {/* Connect Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gray-900 rounded-3xl p-6 mb-6 border border-gray-800"
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            Connect with Me
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {socialLinks.map((link) => (
              <motion.a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-3 ${link.color} text-white p-3 rounded-2xl transition-all font-medium text-sm`}
              >
                {link.icon}
                <span>{link.name}</span>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Tech Stack */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-gray-900 rounded-3xl p-6 mb-6 border border-gray-800"
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            Built With
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {techStack.slice(0, 8).map((tech) => (
              <motion.div 
                key={tech.name} 
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center bg-gray-800/50 p-3 rounded-2xl"
              >
                {tech.icon}
                <span className="mt-2 text-gray-300 text-xs text-center">{tech.name}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* App Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gray-900 rounded-3xl p-6 border border-gray-800"
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            About This App
          </h3>
          <div className="space-y-3 text-sm text-gray-300">
            <p>
              <span className="text-white font-medium">Version:</span> 1.0.0
            </p>
            <p>
              <span className="text-white font-medium">Purpose:</span> Track your daily tiffin orders with ease
            </p>
            <p>
              <span className="text-white font-medium">Features:</span> Order tracking, history, analytics
            </p>
            <p className="text-xs text-gray-500 pt-2">
              Made with ❤️ for better meal management
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}