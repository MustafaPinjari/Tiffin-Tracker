// import React from 'react';

export function About() {
  const socialLinks = [
    { name: 'Instagram', url: 'https://instagram.com/its_ur_musuuu', color: 'bg-pink-500' },
    { name: 'LinkedIn', url: 'https://www.linkedin.com/in/mustafa-pinjari-287625256/', color: 'bg-blue-600' },
    { name: 'LeetCode', url: 'https://leetcode.com/u/Mustafa_Pinjari/', color: 'bg-yellow-500' },
    { name: 'Stack Overflow', url: 'https://stackoverflow.com/users/26745237/mustafapinjari', color: 'bg-orange-500' },
    { name: 'CodePen', url: 'https://codepen.io/-MUSTAFA-', color: 'bg-black' },
    { name: 'Hugging Face', url: 'https://huggingface.co/MustafaPinjari', color: 'bg-yellow-400' },
    { name: 'Devfolio', url: 'https://devfolio.co/@Mustafa_Pinjari', color: 'bg-gray-900' }
  ];

  return (
    <div className="py-6 px-4 max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-8 text-white mb-8">
        <h1 className="text-3xl font-bold mb-4">About Developer</h1>
        <p className="text-lg leading-relaxed">
          Hey! I'm Mustafa Pinjari, a Frontend Developer with 4+ years of experience, passionate about creating responsive, 
          intuitive, and scalable web applications. My mission is to craft seamless user experiences while keeping 
          performance and innovation at the core.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4 text-indigo-600">Connect with Me</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {socialLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${link.color} text-white p-4 rounded-lg hover:opacity-90 transition-opacity text-center`}
            >
              {link.name}
            </a>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4 text-indigo-600">Tech Stack</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            'JavaScript', 'React', 'TypeScript', 'HTML5', 'CSS3', 'Python',
            'Node.js', 'MongoDB', 'MySQL', 'Git', 'Docker', 'AWS'
          ].map((tech) => (
            <div key={tech} className="bg-gray-100 p-3 rounded-lg text-center">
              {tech}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-indigo-600">Projects Highlight</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-indigo-600 pl-4">
            <h3 className="font-bold">Tiffin Tracker</h3>
            <p className="text-gray-600">A modern web application for managing tiffin orders and tracking expenses</p>
          </div>
          {/* Add more projects as needed */}
        </div>
      </div>
    </div>
  );
}