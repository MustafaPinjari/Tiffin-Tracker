import { FaInstagram, FaLinkedin, FaCodepen, FaStackOverflow, FaAws, FaPython, FaHtml5, FaCss3Alt, FaJs, FaReact, FaNodeJs, FaDocker, FaGit } from "react-icons/fa";
import { SiMongodb, SiMysql, SiTypescript } from "react-icons/si";
import { motion } from "framer-motion";

export function About() {
  const socialLinks = [
    { name: 'Instagram', url: 'https://instagram.com/its_ur_musuuu', color: 'from-pink-500 to-pink-600', icon: <FaInstagram size={24} /> },
    { name: 'LinkedIn', url: 'https://www.linkedin.com/in/mustafa-pinjari-287625256/', color: 'from-blue-600 to-blue-700', icon: <FaLinkedin size={24} /> },
    { name: 'Stack Overflow', url: 'https://stackoverflow.com/users/26745237/mustafapinjari', color: 'from-orange-500 to-orange-600', icon: <FaStackOverflow size={24} /> },
    { name: 'CodePen', url: 'https://codepen.io/-MUSTAFA-', color: 'from-gray-900 to-black', icon: <FaCodepen size={24} /> },
  ];

  const techStack = [
    { name: "JavaScript", icon: <FaJs size={28} className="text-yellow-500" /> },
    { name: "React", icon: <FaReact size={28} className="text-blue-500" /> },
    { name: "TypeScript", icon: <SiTypescript size={28} className="text-blue-400" /> },
    { name: "HTML5", icon: <FaHtml5 size={28} className="text-red-500" /> },
    { name: "CSS3", icon: <FaCss3Alt size={28} className="text-blue-500" /> },
    { name: "Python", icon: <FaPython size={28} className="text-yellow-400" /> },
    { name: "Node.js", icon: <FaNodeJs size={28} className="text-green-500" /> },
    { name: "MongoDB", icon: <SiMongodb size={28} className="text-green-400" /> },
    { name: "MySQL", icon: <SiMysql size={28} className="text-blue-600" /> },
    { name: "Git", icon: <FaGit size={28} className="text-orange-500" /> },
    { name: "Docker", icon: <FaDocker size={28} className="text-blue-400" /> },
    { name: "AWS", icon: <FaAws size={28} className="text-yellow-600" /> },
  ];

  const projects = [
    { name: "Tiffin Tracker", image: "/porfolio.png" },
    { name: "AI Resume Builder", image: "porfolio.png" },
    { name: "Portfolio Website", image: "porfolio.png" },
    { name: "Finance Tracker", image: "porfolio.png" },
  ];

  return (
    <div className="py-10 px-6 max-w-5xl mx-auto bg-gray-900 min-h-screen text-gray-100">
      {/* About Developer Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-indigo-700 to-purple-700 rounded-xl p-8 mb-10 shadow-lg hover:shadow-2xl transition-shadow backdrop-blur-sm bg-opacity-20"
      >
        <h1 className="text-4xl font-bold mb-6">About Developer</h1>
        <p className="text-lg leading-relaxed text-gray-200">
          Hey! I'm Mustafa Pinjari, a Frontend Developer with 4+ years of experience, passionate about creating responsive,
          intuitive, and scalable web applications. My mission is to craft seamless user experiences while keeping
          performance and innovation at the core.
        </p>
      </motion.div>

      {/* Connect with Me Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gray-800 rounded-xl shadow-lg p-6 mb-10 backdrop-blur-sm bg-opacity-20"
      >
        <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
          Connect with Me
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {socialLinks.map((link) => (
            <motion.a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center justify-center gap-3 bg-gradient-to-r ${link.color} text-white p-4 rounded-lg hover:shadow-lg transition-all font-medium`}
            >
              {link.icon} {link.name}
            </motion.a>
          ))}
        </div>
      </motion.div>

      {/* Tech Stack Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-gray-800 rounded-xl shadow-lg p-6 mb-10 backdrop-blur-sm bg-opacity-20"
      >
        <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
          Tech Stack
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {techStack.map((tech) => (
            <motion.div 
              key={tech.name} 
              whileHover={{ scale: 1.1 }}
              className="flex flex-col items-center bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-colors"
            >
              {tech.icon}
              <span className="mt-2 text-gray-100">{tech.name}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Projects Highlight - Bento Grid Layout */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-gray-800 rounded-xl shadow-lg p-6 pb-10 backdrop-blur-sm bg-opacity-20"
      >
        <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
          Projects Highlight
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <motion.div 
              key={project.name} 
              whileHover={{ scale: 1.05 }}
              className="relative group overflow-hidden rounded-lg shadow-lg"
            >
              <img src={project.image} alt={project.name} className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <h3 className="text-xl font-semibold text-white">{project.name}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}