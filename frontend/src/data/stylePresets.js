export const stylePresets = [
  {
    id: 'Edu-Cartoon',
    title: 'Edu-Cartoon',
    badge: 'Playful',
    badgeClass: 'text-primary',
    description: 'Bright, playful visuals for elementary lessons and quick concept reinforcement.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBA2a6SpvEcnGeY7VuMzvBRt6d01Wn3-yVYIcYqoFHiyZR-GXhwncrweyC_EET4bhzZKY8udTC8DiRfzPHWxv8R73lhrRzn211v3IaPNxhXc8-27zvKDDbgXtFbjppIh1RQxCWZzTaO-Agl5LZHSpPF5JDj3TMdxrsz6fTbHZlDchJ5CFsw3YQht1ZTWpZ83yzUCflHp3TsPTjWW8Epc3mO-bDAepc0mnDC5kzvX4KE-muiPHxTm5hfAD_9fk5WkYuwhgyRyvaWZU5h',
  },
  {
    id: 'Technical Diagram',
    title: 'Technical Diagram',
    badge: 'Precise',
    badgeClass: 'text-secondary',
    description: 'Structured, clean diagrams for science, engineering, and process explanation.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCIcpjQBIZwZZQfp6-omQ99mtysQCVxORqC6Ruk_N5fv5T949I58udx3APlJ_Phb0rMwCW0czQYV7Tu9Mu_0T-izWzFb-Itj-AkQC7sXxluHzayC6NM9KZDDu0tPBcJYuqGaJpGZUHnxvORom8CckoIqGIP999VhQ163_jwYPhoA1TBdaPaaHD0Df5zhClu2FeFxS4B57CVH4dKRwuicBTJRDyX18kOdMZx4Wf1fKWVReI1nplJJiDpVoSYVMsXRdQs92L9IIjR4XdY',
  },
  {
    id: 'Historical Sketch',
    title: 'Historical Sketch',
    badge: 'Classic',
    badgeClass: 'text-tertiary',
    description: 'Monochrome, vintage-inspired illustrations for history, literature, and social studies.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAQvrhFhuYOTTkMy8MadXzA1c8ncdri8hz6PdEXE7w_Tuj4m5Ub0OWnAoNFGchPdNjXrOby3dFennrZco43wyFkeDXxq-TTSMHx7lHKRcIH9IIkYzqGdniif5PWxpeyRQLPPqOViwJoYgLRCqTNITK0SsRzfGnwFpnoTr_pJRD2dLqhfuJ3aT_SqnlIou7r_RRpJPu8aUoc-gefuyFfnSSJUtGE-YfCZqr74thha85LdOdlpvBK-dBb5F5LyRRQ5AMw3lubdnK0Rihm',
  },
];

export const statusCopy = {
  pending: {
    title: 'Queueing...',
    description: 'Connecting to Nalarupa AI processing engine.',
  },
  'processing-LLM': {
    title: 'Analyzing Context...',
    description: 'Identifying key educational concepts and visual requirements.',
  },
  'processing-image': {
    title: 'Synthesizing Visual...',
    description: 'Nalarupa is crafting your custom academic illustration.',
  },
  completed: {
    title: 'Completed',
    description: 'Your visual is ready and saved in the gallery.',
  },
  failed: {
    title: 'Generation failed',
    description: 'Generation stopped. You can adjust the text and try again.',
  },
};
