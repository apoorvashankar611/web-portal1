// AI-powered job matching and skill extraction utilities

export const extractSkillsFromText = (text: string): string[] => {
  const skillKeywords = [
    'javascript', 'typescript', 'react', 'node.js', 'python', 'java', 'c++', 'c#',
    'html', 'css', 'sql', 'mongodb', 'postgresql', 'aws', 'docker', 'kubernetes',
    'git', 'agile', 'scrum', 'machine learning', 'ai', 'blockchain', 'solana',
    'ethereum', 'web3', 'smart contracts', 'defi', 'nft', 'rust', 'solidity',
    'express', 'next.js', 'vue.js', 'angular', 'tailwind', 'bootstrap', 'figma',
    'photoshop', 'illustrator', 'ui/ux', 'design', 'marketing', 'seo', 'analytics',
    'project management', 'leadership', 'communication', 'problem solving'
  ];

  const normalizedText = text.toLowerCase();
  const foundSkills = skillKeywords.filter(skill => 
    normalizedText.includes(skill.toLowerCase())
  );

  return [...new Set(foundSkills)]; // Remove duplicates
};

export const calculateJobMatch = (
  userSkills: string[],
  jobSkills: string[],
  userBio: string,
  jobDescription: string
): { score: number; matchingSkills: string[] } => {
  // Normalize skills for comparison
  const normalizeSkill = (skill: string) => skill.toLowerCase().trim();
  
  const normalizedUserSkills = userSkills.map(normalizeSkill);
  const normalizedJobSkills = jobSkills.map(normalizeSkill);
  
  // Find matching skills
  const matchingSkills = jobSkills.filter(jobSkill =>
    normalizedUserSkills.includes(normalizeSkill(jobSkill))
  );
  
  // Calculate base score from skill matches
  let score = 0;
  if (normalizedJobSkills.length > 0) {
    score = (matchingSkills.length / normalizedJobSkills.length) * 70;
  }
  
  // Add bonus points for bio/description keyword matches
  const bioKeywords = extractSkillsFromText(userBio);
  const jobKeywords = extractSkillsFromText(jobDescription);
  
  const bioMatches = bioKeywords.filter(keyword =>
    jobKeywords.includes(keyword)
  );
  
  score += Math.min(bioMatches.length * 5, 30); // Max 30 bonus points
  
  return {
    score: Math.min(Math.round(score), 100),
    matchingSkills
  };
};

export const getJobRecommendations = (
  userSkills: string[],
  userBio: string,
  jobs: any[]
): any[] => {
  return jobs
    .map(job => {
      const match = calculateJobMatch(userSkills, job.skills, userBio, job.description);
      return {
        ...job,
        match_score: match.score,
        matching_skills: match.matchingSkills
      };
    })
    .filter(job => job.match_score > 20) // Only show jobs with >20% match
    .sort((a, b) => b.match_score - a.match_score);
};

export const suggestConnections = (
  currentUser: any,
  allUsers: any[]
): any[] => {
  return allUsers
    .filter(user => user.id !== currentUser.id)
    .map(user => {
      const commonSkills = currentUser.skills.filter((skill: string) =>
        user.skills.includes(skill)
      );
      
      const score = commonSkills.length * 20 + 
        (user.bio && currentUser.bio ? 
          extractSkillsFromText(user.bio).filter(skill =>
            extractSkillsFromText(currentUser.bio).includes(skill)
          ).length * 10 : 0);
      
      return {
        ...user,
        connection_score: score,
        common_skills: commonSkills
      };
    })
    .filter(user => user.connection_score > 10)
    .sort((a, b) => b.connection_score - a.connection_score)
    .slice(0, 5);
};