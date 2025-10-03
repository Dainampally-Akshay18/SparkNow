export default function About() {
  return (
    <section className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="rounded-2xl border border-white/15 bg-gradient-to-br from-[#0f1b2e]/95 to-[#131d35]/95 backdrop-blur-xl p-8 text-white shadow-2xl shadow-black/40 ring-1 ring-white/10 mb-8">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
          {/* Profile Image */}
          <div className="relative group">
            <div className="w-48 h-48 rounded-2xl overflow-hidden border-2 border-[#19b1ff]/30 shadow-2xl shadow-[#19b1ff]/20">
              <img 
                src="https://res.cloudinary.com/dadapse5k/image/upload/v1759377580/akshay4_k1qqtn.png" 
                alt="Dainampally Akshay Kireet"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#19b1ff]/10 to-transparent pointer-events-none" />
          </div>

          {/* Header Content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#19b1ff]/20 to-[#0a78ff]/20 border border-[#19b1ff]/30 mb-4">
              <div className="w-2 h-2 bg-[#19b1ff] rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-[#19b1ff]">AI Researcher & Full-Stack Developer</span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent mb-4">
              Dainampally Akshay Kireet
            </h1>
            
            <p className="text-lg text-white/80 leading-relaxed mb-6">
              A highly motivated professional with a solid foundation in Data Structures and Algorithms (DSA) and 
              Machine Learning (ML) algorithms, capable of analyzing complex problems and developing efficient solutions.
            </p>

            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/80 text-sm">
                📚 B.Tech Graduate
              </div>
              <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#19b1ff]/20 to-[#0a78ff]/20 border border-[#19b1ff]/30 text-white text-sm">
                💼 Microsoft Intern
              </div>
              <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/80 text-sm">
                🚀 Quick Learner
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Mission & Vision Section */}
        <div className="space-y-6">
          {/* Mission */}
          <div className="rounded-2xl border border-white/15 bg-gradient-to-br from-white/5 to-white/3 backdrop-blur-lg p-6 shadow-xl ring-1 ring-white/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#19b1ff] to-[#0a78ff] flex items-center justify-center shadow-lg shadow-[#19b1ff]/30">
                <span className="text-white font-bold">🎯</span>
              </div>
              <h3 className="text-xl font-bold text-white">Mission</h3>
            </div>
            <p className="text-white/80 leading-relaxed">
              To bridge the gap between cutting-edge AI research and practical software solutions, 
              creating intelligent systems that solve real-world problems while fostering collaboration 
              and innovation in dynamic technological environments.
            </p>
          </div>

          {/* Vision */}
          <div className="rounded-2xl border border-white/15 bg-gradient-to-br from-white/5 to-white/3 backdrop-blur-lg p-6 shadow-xl ring-1 ring-white/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#19b1ff] to-[#0a78ff] flex items-center justify-center shadow-lg shadow-[#19b1ff]/30">
                <span className="text-white font-bold">🔭</span>
              </div>
              <h3 className="text-xl font-bold text-white">Vision</h3>
            </div>
            <p className="text-white/80 leading-relaxed">
              To become a leading innovator in AI-driven full-stack development, pushing the boundaries 
              of what's possible while maintaining a strong focus on ethical AI practices and sustainable 
              technological growth.
            </p>
          </div>

          {/* Microsoft Experience */}
          <div className="rounded-2xl border border-white/15 bg-gradient-to-br from-white/5 to-white/3 backdrop-blur-lg p-6 shadow-xl ring-1 ring-white/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#19b1ff] to-[#0a78ff] flex items-center justify-center shadow-lg shadow-[#19b1ff]/30">
                <span className="text-white font-bold">🏢</span>
              </div>
              <h3 className="text-xl font-bold text-white">Microsoft Intern Experience</h3>
            </div>
            <p className="text-white/80 leading-relaxed">
              Microsoft intern with a passion for technology and an insatiable curiosity for emerging innovations. 
              As a dedicated student pursuing advanced degrees, I bring hands-on experience from my internship 
              while bridging academic knowledge with real-world applications in AI and software development.
            </p>
          </div>
        </div>

        {/* Technical Skills Section */}
        <div className="rounded-2xl border border-white/15 bg-gradient-to-br from-white/5 to-white/3 backdrop-blur-lg p-6 shadow-xl ring-1 ring-white/5">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Technical Skills
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-[#19b1ff] to-[#0a78ff] rounded-full mx-auto mt-3"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Frontend */}

            <div className="group">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-[#19b1ff] rounded-full"></div>
                Artificial Intelligence
              </h4>
              <div className="flex flex-wrap gap-2">
                {['Langchain'].map((skill) => (
                  <span key={skill} className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white/80 text-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="group">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-[#19b1ff] rounded-full"></div>
                Cloud Platforms
              </h4>
              <div className="flex flex-wrap gap-2">
                {['Microsoft Azure', 'IaaS / PaaS / SaaS'].map((skill) => (
                  <span key={skill} className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white/80 text-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                    {skill}
                  </span>
                ))}
              </div>
            </div>


            

            <div className="group">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-[#19b1ff] rounded-full"></div>
                Databases
              </h4>
              <div className="flex flex-wrap gap-2">
                {['MongoDB', 'SQL'].map((skill) => (
                  <span key={skill} className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white/80 text-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="group">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-[#19b1ff] rounded-full"></div>
                Data Analysis
              </h4>
              <div className="flex flex-wrap gap-2">
                {['NumPy / Pandas', 'Matplotlib'].map((skill) => (
                  <span key={skill} className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white/80 text-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                    {skill}
                  </span>
                ))}
              </div>
            </div>



            <div className="group">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-[#19b1ff] rounded-full"></div>
                Frontend
              </h4>
              <div className="flex flex-wrap gap-2">
                {['React.js', 'HTML/CSS', 'JavaScript'].map((skill) => (
                  <span key={skill} className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white/80 text-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                    {skill}
                  </span>
                ))}
              </div>
            </div>


            {/* Backend */}
            <div className="group">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-[#19b1ff] rounded-full"></div>
                Backend
              </h4>
              <div className="flex flex-wrap gap-2">
                {['Node.js / Express.js', 'FastAPI'].map((skill) => (
                  <span key={skill} className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white/80 text-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div className="group">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-[#19b1ff] rounded-full"></div>
                Languages
              </h4>
              <div className="flex flex-wrap gap-2">
                {['Python', 'C++', 'JavaScript'].map((skill) => (
                  <span key={skill} className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white/80 text-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            

            {/* Databases */}
            

            {/* Data Analysis */}
            

            {/* Cloud Platforms */}
            
          </div>

          {/* Key Strengths */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <h4 className="text-white font-semibold mb-4 text-center">Key Strengths</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              {[
                { icon: '⚡', text: 'Fast Learner' },
                { icon: '🔍', text: 'Problem Solver' },
                { icon: '🤝', text: 'Team Player' },
                { icon: '🚀', text: 'Innovative' }
              ].map((strength, index) => (
                <div key={index} className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                  <div className="text-lg mb-1">{strength.icon}</div>
                  <div className="text-white/80 text-xs">{strength.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="mt-8 text-center">
        <div className="rounded-2xl border border-white/15 bg-gradient-to-r from-[#19b1ff]/10 to-[#0a78ff]/10 backdrop-blur-lg p-6 shadow-xl ring-1 ring-white/5">
          <h3 className="text-xl font-bold text-white mb-2">Let's Build Something Amazing Together</h3>
          <p className="text-white/70 mb-4">Ready to collaborate on innovative projects and push technological boundaries</p>
          <button className="px-6 py-3 bg-gradient-to-r from-[#19b1ff] to-[#0a78ff] text-white rounded-xl font-semibold shadow-lg shadow-[#19b1ff]/25 hover:shadow-[#19b1ff]/40 hover:scale-105 transition-all duration-300" onClick={() => window.open('https://www.linkedin.com/in/dainampallyakshay/', '_blank')}>
            Get In Touch
          </button>
        </div>
      </div>
    </section>
  );
}